const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Open database connection
const db = new sqlite3.Database(dbPath);

console.log('Starting script to check activity assignments...');

// First, get all mentors
db.all(
  `SELECT id, name FROM users WHERE role = 'mentor'`,
  (err, mentors) => {
    if (err) {
      console.error('Error fetching mentors:', err);
      db.close();
      return;
    }

    console.log(`Found ${mentors.length} mentors in the database\n`);

    // For each mentor, get their assigned students
    mentors.forEach(mentor => {
      console.log(`=== Mentor: ${mentor.name} (${mentor.id}) ===`);
      
      // Get assigned students for this mentor
      db.all(
        `SELECT 
          s.id as student_id, 
          s.name as student_name 
         FROM mentor_student_assignments msa
         JOIN users s ON msa.student_id = s.id
         WHERE msa.mentor_id = ?`,
        [mentor.id],
        (err, students) => {
          if (err) {
            console.error(`Error fetching assigned students for mentor ${mentor.name}:`, err);
            return;
          }
          
          console.log(`- Assigned students (${students.length}): ${students.map(s => s.student_name).join(', ')}`);
          
          if (students.length === 0) {
            console.log('- No assigned students, so no activities to view');
            if (mentor.id === mentors[mentors.length - 1].id) {
              db.close();
            }
            return;
          }
          
          // Get list of student IDs
          const studentIds = students.map(s => s.student_id);
          
          // Get activities for these students
          const placeholders = studentIds.map(() => '?').join(',');
          db.all(
            `SELECT 
              a.id, 
              a.title, 
              a.student_id,
              u.name as student_name,
              a.status,
              av.verification_status
            FROM activities a
            JOIN users u ON a.student_id = u.id
            LEFT JOIN activity_verifications av ON a.id = av.activity_id
            WHERE a.student_id IN (${placeholders})
            ORDER BY a.created_at DESC`,
            studentIds,
            (err, activities) => {
              if (err) {
                console.error(`Error fetching activities for mentor ${mentor.name}:`, err);
                return;
              }
              
              console.log(`- Activities for assigned students (${activities.length}):`);
              
              if (activities.length === 0) {
                console.log('  No activities found for assigned students');
              } else {
                // Group activities by student
                const activitiesByStudent = {};
                
                activities.forEach(activity => {
                  if (!activitiesByStudent[activity.student_name]) {
                    activitiesByStudent[activity.student_name] = [];
                  }
                  activitiesByStudent[activity.student_name].push(activity);
                });
                
                // Display activities by student
                Object.keys(activitiesByStudent).forEach(studentName => {
                  const studentActivities = activitiesByStudent[studentName];
                  console.log(`  Student "${studentName}" (${studentActivities.length} activities):`);
                  
                  studentActivities.forEach(activity => {
                    console.log(`    - [ID: ${activity.id}] ${activity.title} (Status: ${activity.verification_status || activity.status})`);
                  });
                });
              }
              
              console.log('\n');
              
              // If this is the last mentor, close the database connection
              if (mentor.id === mentors[mentors.length - 1].id) {
                db.close();
              }
            }
          );
        }
      );
    });
  }
);

// Now check the activities table to see if there are any assigned_by values
db.all(
  `SELECT DISTINCT a.assigned_by, u.name as assigned_by_name, COUNT(*) as activity_count
   FROM activities a
   LEFT JOIN users u ON a.assigned_by = u.id
   WHERE a.assigned_by IS NOT NULL
   GROUP BY a.assigned_by`,
  (err, results) => {
    if (err) {
      console.error('Error checking assigned_by values:', err);
      return;
    }
    
    console.log('=== Activities Assigned By ===');
    if (results.length === 0) {
      console.log('No activities have been assigned by anyone (all assigned_by values are NULL)');
    } else {
      results.forEach(result => {
        console.log(`- ${result.assigned_by_name || 'Unknown'} (${result.assigned_by}): ${result.activity_count} activities`);
      });
    }
    console.log('\n');
  }
); 
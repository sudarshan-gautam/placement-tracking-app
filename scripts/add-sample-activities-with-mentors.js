const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the database
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Open database connection
const db = new sqlite3.Database(dbPath);

console.log('Starting script to add sample activities assigned by mentors...');

// Get mentor-student assignments
db.all(
  `SELECT 
    m.id as mentor_id, 
    m.name as mentor_name, 
    s.id as student_id, 
    s.name as student_name 
   FROM mentor_student_assignments msa
   JOIN users m ON msa.mentor_id = m.id
   JOIN users s ON msa.student_id = s.id
   WHERE m.role = 'mentor' AND s.role = 'student'`,
  (err, assignments) => {
    if (err) {
      console.error('Error fetching mentor-student assignments:', err);
      db.close();
      return;
    }

    console.log(`Found ${assignments.length} mentor-student assignments`);

    // Define sample activity templates
    const activityTemplates = [
      {
        title: 'Lesson Planning Workshop',
        description: 'Workshop focusing on creating effective lesson plans for different learning styles',
        activity_type: 'workshop',
        date_completed: '2025-05-01',
        duration_minutes: 120,
        evidence_url: 'https://example.com/evidence/lesson_planning',
        status: 'submitted'
      },
      {
        title: 'Teaching Demonstration',
        description: 'Conducted a teaching demonstration for a small group of students',
        activity_type: 'coursework',
        date_completed: '2025-05-15',
        duration_minutes: 60,
        evidence_url: 'https://example.com/evidence/teaching_demo',
        status: 'submitted'
      },
      {
        title: 'Educational Psychology Seminar',
        description: 'Attended a seminar on educational psychology and its application in classroom management',
        activity_type: 'research',
        date_completed: '2025-04-20',
        duration_minutes: 180,
        evidence_url: 'https://example.com/evidence/psych_seminar',
        status: 'submitted'
      },
      {
        title: 'Parent Communication Exercise',
        description: 'Practiced effective communication techniques for parent-teacher meetings',
        activity_type: 'project',
        date_completed: '2025-05-10',
        duration_minutes: 90,
        evidence_url: 'https://example.com/evidence/parent_comm',
        status: 'submitted'
      },
      {
        title: 'Classroom Observation Session',
        description: 'Observed an experienced teacher conducting a class',
        activity_type: 'other',
        date_completed: '2025-04-25',
        duration_minutes: 120,
        evidence_url: 'https://example.com/evidence/observation',
        status: 'submitted'
      }
    ];

    // Create an activity for each mentor-student pair
    let completedCount = 0;
    let totalToAdd = assignments.length;

    assignments.forEach((assignment, index) => {
      // Select a template for this activity
      const template = activityTemplates[index % activityTemplates.length];
      
      // Create a unique ID for the activity
      const activityId = uuidv4();

      // Insert the activity
      db.run(
        `INSERT INTO activities (
          id, 
          student_id, 
          title, 
          description, 
          activity_type, 
          date_completed, 
          duration_minutes, 
          evidence_url, 
          status, 
          assigned_by,
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          activityId,
          assignment.student_id,
          template.title,
          template.description,
          template.activity_type,
          template.date_completed,
          template.duration_minutes,
          template.evidence_url,
          template.status,
          assignment.mentor_id,
          // Last two parameters (created_at and updated_at) are handled by the SQL
        ],
        function(err) {
          if (err) {
            console.error(`Error adding activity for ${assignment.student_name} with mentor ${assignment.mentor_name}:`, err);
          } else {
            console.log(`Added activity "${template.title}" for student ${assignment.student_name} assigned by mentor ${assignment.mentor_name}`);
          }
          
          completedCount++;
          if (completedCount === totalToAdd) {
            console.log('All sample activities have been added!');
            // Add another batch of activities with admin as the assigner
            addAdminActivities();
          }
        }
      );
    });
  }
);

// Function to add activities assigned by admin
function addAdminActivities() {
  db.all(
    `SELECT id, name FROM users WHERE role = 'student'`,
    (err, students) => {
      if (err) {
        console.error('Error fetching students:', err);
        db.close();
        return;
      }

      // Get an admin ID
      db.get(
        `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
        (err, admin) => {
          if (err || !admin) {
            console.error('Error fetching admin:', err);
            db.close();
            return;
          }

          console.log(`Adding admin-assigned activities using admin ID: ${admin.id}`);
          let completedCount = 0;
          let totalToAdd = Math.min(3, students.length); // Add up to 3 admin activities

          // Define admin activity template
          const adminActivity = {
            title: 'Mandatory Professional Development',
            description: 'Required institutional professional development training',
            activity_type: 'research',
            date_completed: '2025-05-30',
            duration_minutes: 240,
            evidence_url: 'https://example.com/evidence/pro_dev',
            status: 'submitted'
          };

          // Add admin activities for a few students
          for (let i = 0; i < totalToAdd; i++) {
            const student = students[i];
            const activityId = uuidv4();

            db.run(
              `INSERT INTO activities (
                id, 
                student_id, 
                title, 
                description, 
                activity_type, 
                date_completed, 
                duration_minutes, 
                evidence_url, 
                status, 
                assigned_by,
                created_at, 
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [
                activityId,
                student.id,
                adminActivity.title,
                adminActivity.description,
                adminActivity.activity_type,
                adminActivity.date_completed,
                adminActivity.duration_minutes,
                adminActivity.evidence_url,
                adminActivity.status,
                admin.id
              ],
              function(err) {
                if (err) {
                  console.error(`Error adding admin activity for ${student.name}:`, err);
                } else {
                  console.log(`Added admin activity for student ${student.name}`);
                }
                
                completedCount++;
                if (completedCount === totalToAdd) {
                  console.log('All admin activities have been added!');
                  console.log('Script completed successfully!');
                  db.close();
                }
              }
            );
          }
        }
      );
    }
  );
} 
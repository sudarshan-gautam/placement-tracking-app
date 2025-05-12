const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the database
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Open database connection
const db = new sqlite3.Database(dbPath);

console.log('Starting script to add sample sessions...');

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

    // Define sample session templates
    const sessionTemplates = [
      {
        title: 'Teaching Strategy Workshop',
        description: 'Workshop to develop and refine teaching strategies for different learning styles',
        date: '2025-06-10',
        start_time: '09:00',
        end_time: '10:30',
        location: 'Room 202, Education Building',
        status: 'planned'
      },
      {
        title: 'Classroom Management Session',
        description: 'Discussion on effective classroom management techniques',
        date: '2025-06-15',
        start_time: '14:00',
        end_time: '15:30',
        location: 'Virtual Meeting',
        status: 'planned'
      },
      {
        title: 'Curriculum Planning Meeting',
        description: 'Planning session for upcoming curriculum development',
        date: '2025-05-20',
        start_time: '10:00',
        end_time: '11:30',
        location: 'Department Meeting Room',
        status: 'completed',
        reflection: 'The curriculum planning was productive. We identified key areas to focus on for the next semester.'
      },
      {
        title: 'Student Assessment Review',
        description: 'Review of assessment strategies and feedback methods',
        date: '2025-05-05',
        start_time: '13:00',
        end_time: '14:00',
        location: 'Faculty Office',
        status: 'completed',
        reflection: 'We discussed various assessment techniques and how to provide constructive feedback.'
      },
      {
        title: 'Technology Integration Workshop',
        description: 'Hands-on workshop for integrating technology in teaching',
        date: '2025-06-22',
        start_time: '15:00',
        end_time: '17:00',
        location: 'Computer Lab',
        status: 'planned'
      }
    ];

    // Create a session for each mentor-student pair
    let completedCount = 0;
    let totalToAdd = assignments.length;

    assignments.forEach((assignment, index) => {
      // Select a template for this session
      const template = sessionTemplates[index % sessionTemplates.length];
      
      // Create a unique ID for the session
      const sessionId = uuidv4();

      // Insert the session
      db.run(
        `INSERT INTO sessions (
          id, 
          student_id, 
          title, 
          description, 
          date, 
          start_time, 
          end_time, 
          location, 
          status, 
          reflection, 
          assigned_by, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          sessionId,
          assignment.student_id,
          template.title,
          template.description,
          template.date,
          template.start_time,
          template.end_time,
          template.location,
          template.status,
          template.reflection || null,
          assignment.mentor_id,
          // Last two parameters (created_at and updated_at) are handled by the SQL
        ],
        function(err) {
          if (err) {
            console.error(`Error adding session for ${assignment.student_name} with mentor ${assignment.mentor_name}:`, err);
          } else {
            console.log(`Added session "${template.title}" for student ${assignment.student_name} assigned by mentor ${assignment.mentor_name}`);
          }
          
          completedCount++;
          if (completedCount === totalToAdd) {
            console.log('All sample sessions have been added!');
            // Add another batch of sessions with admin as the assigner
            addAdminSessions();
          }
        }
      );
    });
  }
);

// Function to add sessions assigned by admin
function addAdminSessions() {
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

          console.log(`Adding admin-assigned sessions using admin ID: ${admin.id}`);
          let completedCount = 0;
          let totalToAdd = Math.min(5, students.length); // Add up to 5 admin sessions

          // Define admin session template
          const adminSession = {
            title: 'Mandatory Training Session',
            description: 'Required institutional training on educational policies and procedures',
            date: '2025-06-30',
            start_time: '09:00',
            end_time: '12:00',
            location: 'Main Auditorium',
            status: 'planned'
          };

          // Add admin sessions for a few students
          for (let i = 0; i < totalToAdd; i++) {
            const student = students[i];
            const sessionId = uuidv4();

            db.run(
              `INSERT INTO sessions (
                id, 
                student_id, 
                title, 
                description, 
                date, 
                start_time, 
                end_time, 
                location, 
                status, 
                assigned_by, 
                created_at, 
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [
                sessionId,
                student.id,
                adminSession.title,
                adminSession.description,
                adminSession.date,
                adminSession.start_time,
                adminSession.end_time,
                adminSession.location,
                adminSession.status,
                admin.id
              ],
              function(err) {
                if (err) {
                  console.error(`Error adding admin session for ${student.name}:`, err);
                } else {
                  console.log(`Added admin session for student ${student.name}`);
                }
                
                completedCount++;
                if (completedCount === totalToAdd) {
                  console.log('All admin sessions have been added!');
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
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function updateSchema() {
  try {
    console.log('Opening database connection...');
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    console.log('Checking sessions table structure...');
    
    // Get existing columns
    const sessionColumns = await db.all("PRAGMA table_info(sessions)");
    const columnNames = sessionColumns.map(col => col.name);
    
    // Check if mentor_id column exists
    if (!columnNames.includes('mentor_id')) {
      console.log('Adding mentor_id column to sessions table...');
      
      await db.exec(`
        ALTER TABLE sessions 
        ADD COLUMN mentor_id TEXT 
        REFERENCES users(id)
      `);
      
      console.log('mentor_id column added successfully.');
      
      // Assign a default mentor to all sessions
      const mentors = await db.all(`
        SELECT id FROM users 
        WHERE role = 'mentor' 
        LIMIT 1
      `);
      
      if (mentors.length > 0) {
        const mentorId = mentors[0].id;
        console.log(`Updating existing sessions with default mentor_id: ${mentorId}`);
        
        await db.run(`
          UPDATE sessions 
          SET mentor_id = ?
          WHERE mentor_id IS NULL
        `, mentorId);
        
        console.log('Sessions updated with default mentor.');
      }
    } else {
      console.log('mentor_id column already exists in sessions table.');
    }
    
    // Fix the session_enrollments table if needed
    console.log('Checking session_enrollments table...');
    const enrollmentTableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='session_enrollments'
    `);
    
    if (enrollmentTableExists) {
      console.log('Dropping and recreating session_enrollments table to fix schema issues...');
      await db.exec('DROP TABLE session_enrollments');
    }
    
    console.log('Creating session_enrollments table with proper schema...');
    await db.exec(`
      CREATE TABLE session_enrollments (
        session_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id, student_id),
        FOREIGN KEY (session_id) REFERENCES sessions(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);
    
    console.log('session_enrollments table created successfully.');
    
    // Check if there are any enrollments
    const enrollmentsCount = await db.get(`
      SELECT COUNT(*) as count FROM session_enrollments
    `);
    
    if (enrollmentsCount.count === 0) {
      console.log('No enrollments found, creating sample enrollments...');
      
      // Get all sessions and students
      const sessions = await db.all('SELECT id FROM sessions LIMIT 10');
      const students = await db.all('SELECT id FROM users WHERE role = "student" LIMIT 5');
      
      if (sessions.length > 0 && students.length > 0) {
        let enrollmentCount = 0;
        
        // Create 1-3 enrollments for each session
        for (const session of sessions) {
          const numEnrollments = Math.floor(Math.random() * 3) + 1;
          const sessionStudents = students.slice(0, numEnrollments);
          
          for (const student of sessionStudents) {
            try {
              await db.run(`
                INSERT INTO session_enrollments (session_id, student_id, enrolled_at)
                VALUES (?, ?, datetime('now'))
              `, [session.id, student.id]);
              
              enrollmentCount++;
            } catch (error) {
              console.log(`Error enrolling student ${student.id} in session ${session.id}: ${error.message}`);
            }
          }
        }
        
        console.log(`Created ${enrollmentCount} sample enrollments.`);
      } else {
        console.log('Not enough sessions or students to create sample enrollments.');
      }
    } else {
      console.log(`Found ${enrollmentsCount.count} existing enrollments.`);
    }
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

// Run the function
updateSchema(); 
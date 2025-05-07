const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function main() {
  try {
    console.log('Opening database connection...');
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    console.log('Checking sessions table structure...');
    
    // First check if sessions table exists
    const sessionTable = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='sessions'
    `);

    if (!sessionTable) {
      console.log('Sessions table does not exist, creating it...');
      // Create sessions table
      await db.exec(`
        CREATE TABLE sessions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          location TEXT,
          status TEXT NOT NULL DEFAULT 'planned',
          student_id TEXT,
          mentor_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (mentor_id) REFERENCES users(id)
        )
      `);
      console.log('Sessions table created successfully.');
    } else {
      console.log('Sessions table already exists.');
      
      // Check for approval_status column and remove it if it exists
      const hasApprovalStatus = await db.get(`
        PRAGMA table_info(sessions);
      `).then(info => 
        info && info.some(column => column.name === 'approval_status')
      ).catch(() => false);
      
      if (hasApprovalStatus) {
        console.log('Removing approval_status and rejection_reason columns from sessions table...');
        
        // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
        // First, create a temporary table
        await db.exec(`
          CREATE TABLE sessions_temp (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            location TEXT,
            status TEXT NOT NULL DEFAULT 'planned',
            student_id TEXT,
            mentor_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (mentor_id) REFERENCES users(id)
          )
        `);
        
        // Copy data to the temporary table without the approval columns
        await db.exec(`
          INSERT INTO sessions_temp (id, title, description, date, location, status, student_id, mentor_id, created_at, updated_at)
          SELECT id, title, description, date, location, status, student_id, mentor_id, created_at, updated_at
          FROM sessions
        `);
        
        // Drop the original table
        await db.exec(`DROP TABLE sessions`);
        
        // Rename the temporary table
        await db.exec(`ALTER TABLE sessions_temp RENAME TO sessions`);
        
        console.log('Sessions table restructured successfully.');
      }
    }
    
    // Now check for or create session_enrollments table
    const enrollmentsTable = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='session_enrollments'
    `);
    
    if (!enrollmentsTable) {
      console.log('Creating session_enrollments table...');
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
      console.log('session_enrollments table created successfully');
    } else {
      console.log('session_enrollments table already exists');
    }
    
    // Check if users table exists and has sample data
    const usersTable = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    if (!usersTable) {
      console.log('Creating users table with sample data...');
      await db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'mentor', 'student')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert sample users
      const sampleUsers = [
        { id: uuidv4(), name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: uuidv4(), name: 'Jane Smith', email: 'jane@example.com', role: 'mentor' },
        { id: uuidv4(), name: 'John Doe', email: 'john@example.com', role: 'student' },
        { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com', role: 'student' },
        { id: uuidv4(), name: 'Bob Wilson', email: 'bob@example.com', role: 'student' },
        { id: uuidv4(), name: 'Charlie Brown', email: 'charlie@example.com', role: 'student' }
      ];
      
      for (const user of sampleUsers) {
        await db.run(
          'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)',
          [user.id, user.name, user.email, user.role]
        );
      }
      
      console.log('Created sample users.');
    }
    
    // Check if sessions table has data
    const sessionsCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    
    if (!sessionsCount || sessionsCount.count === 0) {
      console.log('Adding sample sessions...');
      
      // Get user IDs for reference
      const students = await db.all('SELECT id, name FROM users WHERE role = ?', 'student');
      const mentors = await db.all('SELECT id, name FROM users WHERE role = ?', 'mentor');
      
      if (students.length > 0 && mentors.length > 0) {
        const studentId = students[0].id;
        const mentorId = mentors[0].id;
        
        // Sample sessions
        const sampleSessions = [
          {
            id: uuidv4(),
            title: 'Art Workshop - Professional',
            description: 'A 120-minute online workshop on art techniques',
            date: '2025-04-13',
            location: 'Virtual Classroom',
            status: 'planned',
            student_id: studentId,
            mentor_id: mentorId
          },
          {
            id: uuidv4(),
            title: 'Mathematics for Grade 5',
            description: 'Introduction to multiplication and division',
            date: '2023-09-15',
            location: 'Main Classroom',
            status: 'completed',
            student_id: studentId,
            mentor_id: mentorId
          },
          {
            id: uuidv4(),
            title: 'Science Experiment',
            description: 'Simple chemical reactions demonstration',
            date: '2023-09-20',
            location: 'Science Lab',
            status: 'completed',
            student_id: students[1] ? students[1].id : studentId,
            mentor_id: mentorId
          },
          {
            id: uuidv4(),
            title: 'History Virtual Tour',
            description: 'Ancient Egypt exploration',
            date: '2023-09-25',
            location: 'Computer Lab',
            status: 'planned',
            student_id: students[2] ? students[2].id : studentId,
            mentor_id: mentorId
          },
          {
            id: uuidv4(),
            title: 'Reading Assistance',
            description: 'Guided reading for struggling readers',
            date: '2023-09-18',
            location: 'Library',
            status: 'completed',
            student_id: students[1] ? students[1].id : studentId,
            mentor_id: mentorId
          },
          {
            id: uuidv4(),
            title: 'Art Workshop',
            description: 'Painting techniques for beginners',
            date: '2023-09-28',
            location: 'Art Room',
            status: 'planned',
            student_id: students[2] ? students[2].id : studentId,
            mentor_id: mentorId
          }
        ];
        
        for (const session of sampleSessions) {
          await db.run(
            'INSERT INTO sessions (id, title, description, date, location, status, student_id, mentor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [session.id, session.title, session.description, session.date, session.location, session.status, session.student_id, session.mentor_id]
          );
        }
        
        console.log('Added sample sessions.');
        
        // Add sample enrollments
        console.log('Adding sample enrollments...');
        
        // Get all sessions
        const sessions = await db.all('SELECT id FROM sessions');
        
        // Enroll some students in sessions
        let totalEnrollmentCount = 0;
        for (let i = 0; i < sessions.length; i++) {
          const sessionId = sessions[i].id;
          
          // Enroll 1-3 students in each session
          const enrollmentCount = Math.floor(Math.random() * 3) + 1;
          for (let j = 0; j < enrollmentCount && j < students.length; j++) {
            try {
              await db.run(
                'INSERT INTO session_enrollments (session_id, student_id) VALUES (?, ?)',
                [sessionId, students[j].id]
              );
              totalEnrollmentCount++;
            } catch (error) {
              // Ignore duplicate primary key errors
              console.log(`Enrollment for session ${sessionId} and student ${students[j].id} already exists.`);
            }
          }
        }
        
        console.log(`Added ${totalEnrollmentCount} sample enrollments.`);
      } else {
        console.log('No students or mentors found to create sample sessions.');
      }
    } else {
      console.log(`Found ${sessionsCount.count} existing sessions in the database.`);
    }
    
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  }
}

main();

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function updateSchema() {
  try {
    // Open the database
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    console.log('Checking if sessions table exists...');
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'"
    );

    if (tableExists) {
      console.log('Sessions table already exists. Checking for missing columns...');
      
      // Get existing columns
      const tableInfo = await db.all("PRAGMA table_info(sessions)");
      const columns = tableInfo.map(col => col.name);
      
      // Check for approval status column
      if (!columns.includes('approval_status')) {
        console.log('Adding approval_status column...');
        await db.run('ALTER TABLE sessions ADD COLUMN approval_status TEXT DEFAULT "pending"');
        console.log('approval_status column added.');
      }
      
      // Check for rejection_reason column
      if (!columns.includes('rejection_reason')) {
        console.log('Adding rejection_reason column...');
        await db.run('ALTER TABLE sessions ADD COLUMN rejection_reason TEXT');
        console.log('rejection_reason column added.');
      }
      
      // Check for updated_at column
      if (!columns.includes('updated_at')) {
        console.log('Adding updated_at column...');
        await db.run('ALTER TABLE sessions ADD COLUMN updated_at TEXT');
        console.log('updated_at column added.');
      }
      
      console.log('Sessions table has been updated with all required columns.');
    } else {
      console.log('Creating sessions table...');
      await db.exec(`
        CREATE TABLE sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          student_id INTEGER NOT NULL,
          mentor_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          location TEXT,
          status TEXT DEFAULT 'planned',
          approval_status TEXT DEFAULT 'pending',
          rejection_reason TEXT,
          created_at TEXT,
          updated_at TEXT,
          FOREIGN KEY (student_id) REFERENCES users (id),
          FOREIGN KEY (mentor_id) REFERENCES users (id)
        )
      `);
      console.log('Sessions table created successfully.');
    }

    // Add some sample data if the table is empty
    const count = await db.get('SELECT COUNT(*) as count FROM sessions');
    if (count.count === 0) {
      console.log('Adding sample session data...');
      
      // First, ensure we have some users
      const adminExists = await db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      const mentorExists = await db.get('SELECT id FROM users WHERE role = "mentor" LIMIT 1');
      const studentExists = await db.get('SELECT id FROM users WHERE role = "student" LIMIT 1');
      
      let adminId = adminExists ? adminExists.id : null;
      let mentorId = mentorExists ? mentorExists.id : null;
      let studentId = studentExists ? studentExists.id : null;
      
      // Create users if they don't exist
      if (!adminId) {
        const adminResult = await db.run(
          'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
          ['Admin User', 'admin@example.com', 'admin']
        );
        adminId = adminResult.lastID;
        console.log(`Created admin user with ID ${adminId}`);
      }
      
      if (!mentorId) {
        const mentorResult = await db.run(
          'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
          ['Mentor User', 'mentor@example.com', 'mentor']
        );
        mentorId = mentorResult.lastID;
        console.log(`Created mentor user with ID ${mentorId}`);
      }
      
      if (!studentId) {
        const studentResult = await db.run(
          'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
          ['Student User', 'student@example.com', 'student']
        );
        studentId = studentResult.lastID;
        console.log(`Created student user with ID ${studentId}`);
      }
      
      // Add sample sessions with various approval statuses
      const now = new Date().toISOString();
      
      // Session 1: Approved session by admin
      await db.run(`
        INSERT INTO sessions (
          title, 
          description, 
          student_id, 
          mentor_id, 
          date, 
          location, 
          status, 
          approval_status, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Mathematics Workshop', 
        'Introduction to algebra and calculus', 
        studentId, 
        adminId, 
        '2023-10-15', 
        'Room 101', 
        'completed', 
        'approved', 
        now
      ]);
      
      // Session 2: Pending session by mentor
      await db.run(`
        INSERT INTO sessions (
          title, 
          description, 
          student_id, 
          mentor_id, 
          date, 
          location, 
          status, 
          approval_status, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Science Experiment', 
        'Chemistry lab session on reactions', 
        studentId, 
        mentorId, 
        '2023-10-25', 
        'Science Lab', 
        'planned', 
        'pending', 
        now
      ]);
      
      // Session 3: Rejected session
      await db.run(`
        INSERT INTO sessions (
          title, 
          description, 
          student_id, 
          mentor_id, 
          date, 
          location, 
          status, 
          approval_status, 
          rejection_reason,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'History Field Trip', 
        'Visit to the local museum', 
        studentId, 
        mentorId, 
        '2023-09-10', 
        'City Museum', 
        'cancelled', 
        'rejected', 
        'Field trip requires additional planning and safety measures', 
        now
      ]);
      
      // Session 4: Another approved session
      await db.run(`
        INSERT INTO sessions (
          title, 
          description, 
          student_id, 
          mentor_id, 
          date, 
          location, 
          status, 
          approval_status, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Literature Discussion', 
        'Analysis of Shakespeare works', 
        studentId, 
        mentorId, 
        '2023-11-05', 
        'Library', 
        'planned', 
        'approved', 
        now
      ]);
      
      console.log('Sample session data added successfully.');
    }

    console.log('Database schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

// Run the update
updateSchema(); 
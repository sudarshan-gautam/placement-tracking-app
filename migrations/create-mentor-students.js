/**
 * Migration: Create Mentor Students Table
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist!');
  process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error('Could not connect to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Create mentor_students table
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  
  // Check if table already exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mentor_students'", (err, row) => {
    if (err) {
      console.error('Error checking for table:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      console.log('mentor_students table already exists, skipping creation');
      addSampleData();
      return;
    }
    
    // Create the table
    db.run(`
      CREATE TABLE mentor_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(mentor_id, student_id)
      )
    `, err => {
      if (err) {
        console.error('Error creating table:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('Successfully created mentor_students table');
      addSampleData();
    });
  });
});

function addSampleData() {
  // Get users for sample data
  db.all("SELECT id, role FROM users", (err, users) => {
    if (err) {
      console.error('Error getting users:', err.message);
      db.close();
      process.exit(1);
    }
    
    const mentors = users.filter(user => user.role === 'mentor');
    const students = users.filter(user => user.role === 'student');
    
    if (mentors.length === 0 || students.length === 0) {
      console.log('No mentors or students found, skipping sample data');
      db.close();
      process.exit(0);
    }
    
    // Check if we already have sample data
    db.get("SELECT COUNT(*) as count FROM mentor_students", (err, result) => {
      if (err) {
        console.error('Error checking for sample data:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (result.count > 0) {
        console.log('Sample data already exists, skipping insertion');
        db.close();
        console.log('Migration completed successfully');
        process.exit(0);
        return;
      }
      
      // Insert sample data - assign each student to a mentor
      console.log('Adding sample mentor-student assignments...');
      const stmt = db.prepare("INSERT INTO mentor_students (mentor_id, student_id) VALUES (?, ?)");
      
      students.forEach((student, index) => {
        const mentorIndex = index % mentors.length;
        stmt.run(mentors[mentorIndex].id, student.id, err => {
          if (err) {
            console.error('Error inserting assignment:', err.message);
          }
        });
      });
      
      stmt.finalize(err => {
        if (err) {
          console.error('Error finalizing statement:', err.message);
          db.close();
          process.exit(1);
        }
        
        console.log('Successfully added sample mentor-student assignments');
        db.close();
        console.log('Migration completed successfully');
        process.exit(0);
      });
    });
  });
} 
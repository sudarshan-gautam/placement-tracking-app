/**
 * Migration: Drop redundant mentor_students table
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

// Drop mentor_students table if it exists
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  
  // Check if table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mentor_students'", (err, row) => {
    if (err) {
      console.error('Error checking for table:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (!row) {
      console.log('mentor_students table does not exist, nothing to drop');
      db.close();
      process.exit(0);
      return;
    }
    
    // First check if there's any data in the mentor_students table that should be migrated
    db.all("SELECT mentor_id, student_id FROM mentor_students", (err, rows) => {
      if (err) {
        console.error('Error querying mentor_students table:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (rows && rows.length > 0) {
        console.log(`Found ${rows.length} relationships in mentor_students table to check`);
        
        // For each relationship in mentor_students, check if it already exists in mentor_student_assignments
        const insertStmt = db.prepare("INSERT OR IGNORE INTO mentor_student_assignments (mentor_id, student_id, notes) VALUES (?, ?, 'Migrated from mentor_students table')");
        
        let migrated = 0;
        for (const row of rows) {
          insertStmt.run(row.mentor_id, row.student_id, (err) => {
            if (!err) migrated++;
          });
        }
        
        insertStmt.finalize(() => {
          if (migrated > 0) {
            console.log(`Migrated ${migrated} relationships to mentor_student_assignments table`);
          } else {
            console.log('No new relationships needed to be migrated');
          }
          
          // Now drop the redundant table
          dropTable();
        });
      } else {
        console.log('No data found in mentor_students table');
        // Drop the table directly
        dropTable();
      }
    });
  });
});

function dropTable() {
  db.run("DROP TABLE mentor_students", err => {
    if (err) {
      console.error('Error dropping mentor_students table:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('Successfully dropped mentor_students table');
    db.close();
    process.exit(0);
  });
} 
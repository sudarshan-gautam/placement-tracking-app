/**
 * Migration: Consolidate Mentor-Student Tables
 * 
 * This script removes the duplicate mentor_students table and updates
 * any existing code references to use the original mentor_student_assignments table
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

// Execute consolidation
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  
  // Check if both tables exist
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mentor_students'", (err, mentorStudentsExists) => {
    if (err) {
      console.error('Error checking for mentor_students table:', err.message);
      db.close();
      process.exit(1);
    }
    
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mentor_student_assignments'", (err, mentorAssignmentsExists) => {
      if (err) {
        console.error('Error checking for mentor_student_assignments table:', err.message);
        db.close();
        process.exit(1);
      }
      
      // Only proceed if both tables exist
      if (mentorStudentsExists && mentorAssignmentsExists) {
        console.log('Both mentor-student relationship tables exist, beginning consolidation...');
        
        // First, ensure data is migrated from mentor_students to mentor_student_assignments
        db.all("SELECT mentor_id, student_id FROM mentor_students", (err, rows) => {
          if (err) {
            console.error('Error retrieving data from mentor_students:', err.message);
            db.close();
            process.exit(1);
          }
          
          console.log(`Found ${rows.length} relationships in mentor_students table`);
          
          if (rows.length > 0) {
            // For each relationship in mentor_students, check if it already exists in mentor_student_assignments
            const stmt = db.prepare("INSERT OR IGNORE INTO mentor_student_assignments (mentor_id, student_id, assigned_date, notes) VALUES (?, ?, datetime('now'), 'Migrated from mentor_students table')");
            
            let migrated = 0;
            
            rows.forEach(row => {
              stmt.run(row.mentor_id, row.student_id, function(err) {
                if (err) {
                  console.error(`Error migrating relationship: ${row.mentor_id} - ${row.student_id}`, err.message);
                } else if (this.changes > 0) {
                  migrated++;
                }
              });
            });
            
            stmt.finalize(err => {
              if (err) {
                console.error('Error finalizing migration:', err.message);
              } else {
                console.log(`Successfully migrated ${migrated} unique relationships to mentor_student_assignments`);
              }
              
              // Now drop the mentor_students table
              dropMentorStudentsTable();
            });
          } else {
            // No data to migrate, proceed to drop table
            dropMentorStudentsTable();
          }
        });
      } else {
        if (!mentorStudentsExists) {
          console.log('mentor_students table does not exist, nothing to consolidate');
          updateInitDatabaseScript();
        } else if (!mentorAssignmentsExists) {
          console.error('mentor_student_assignments table does not exist, cannot proceed with consolidation');
        }
        db.close();
        process.exit(0);
      }
    });
  });
});

// Function to drop the mentor_students table
function dropMentorStudentsTable() {
  db.run("DROP TABLE IF EXISTS mentor_students", err => {
    if (err) {
      console.error('Error dropping mentor_students table:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('Successfully dropped mentor_students table');
    
    // Update the init-database.js script to remove references to mentor_students
    updateInitDatabaseScript();
  });
}

// Function to update init-database.js
function updateInitDatabaseScript() {
  const initDbPath = path.join(__dirname, '..', 'scripts', 'init-database.js');
  
  // Check if the file exists
  if (!fs.existsSync(initDbPath)) {
    console.error('init-database.js script not found');
    db.close();
    process.exit(1);
  }
  
  try {
    // Read the file
    const content = fs.readFileSync(initDbPath, 'utf8');
    
    // Find the list of tables to keep
    const tableListRegex = /WHERE type='table' AND name NOT IN \(([^)]+)\)/;
    const match = content.match(tableListRegex);
    
    if (!match) {
      console.error('Could not find the list of tables in init-database.js');
      db.close();
      process.exit(1);
    }
    
    // Current list of tables
    const currentList = match[1];
    
    // Remove mentor_students from the list
    const updatedList = currentList.replace(", 'mentor_students'", "");
    
    // Replace the list in the content
    const updatedContent = content.replace(tableListRegex, `WHERE type='table' AND name NOT IN (${updatedList})`);
    
    // Write the updated content back to the file
    fs.writeFileSync(initDbPath, updatedContent, 'utf8');
    
    console.log('Successfully updated init-database.js script');
    db.close();
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating init-database.js:', error.message);
    db.close();
    process.exit(1);
  }
} 
/**
 * Migration: Add feedback column to qualifications table
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

// Check if the qualifications table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='qualifications'", (err, row) => {
  if (err) {
    console.error('Error checking for qualifications table:', err.message);
    db.close();
    process.exit(1);
  }
  
  if (!row) {
    console.error('Qualifications table does not exist');
    db.close();
    process.exit(1);
  }
  
  // Check if feedback column already exists
  db.all("PRAGMA table_info(qualifications)", (err, columns) => {
    if (err) {
      console.error('Error checking table structure:', err.message);
      db.close();
      process.exit(1);
    }
    
    const feedbackColumn = columns.find(column => column.name === 'feedback');
    
    if (feedbackColumn) {
      console.log('Feedback column already exists in qualifications table');
      db.close();
      process.exit(0);
    }
    
    // Add feedback column
    db.run("ALTER TABLE qualifications ADD COLUMN feedback TEXT", err => {
      if (err) {
        console.error('Error adding feedback column:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('Successfully added feedback column to qualifications table');
      db.close();
      process.exit(0);
    });
  });
}); 
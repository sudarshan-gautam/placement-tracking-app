/**
 * Migration: Remove Activity Verifications
 * 
 * Since activities are now only created by mentors and admins,
 * verification is no longer needed, so we're removing the activity_verifications table.
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

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Drop the activity_verifications table
const dropActivityVerifications = async () => {
  return new Promise((resolve, reject) => {
    // First check if the table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_verifications'", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        console.log('Table activity_verifications does not exist, skipping drop');
        resolve();
        return;
      }
      
      // Drop the table
      db.run('DROP TABLE activity_verifications', err => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log('Successfully dropped activity_verifications table');
        resolve();
      });
    });
  });
};

// Run migration
async function runMigration() {
  try {
    await dropActivityVerifications();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

// Execute migration
runMigration(); 
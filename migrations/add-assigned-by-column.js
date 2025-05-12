const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Starting migration to add assigned_by column to activities table...');

// Check if the assigned_by column already exists
db.all("PRAGMA table_info(activities)", (err, rows) => {
  if (err) {
    console.error('Error checking table structure:', err);
    db.close();
    process.exit(1);
  }

  // Check if assigned_by column exists
  const columnExists = rows && Array.isArray(rows) && rows.some(row => row.name === 'assigned_by');
  
  if (columnExists) {
    console.log('The assigned_by column already exists in the activities table. No migration needed.');
    db.close();
    process.exit(0);
  }

  // Add the assigned_by column
  db.run('ALTER TABLE activities ADD COLUMN assigned_by TEXT REFERENCES users(id)', err => {
    if (err) {
      console.error('Error adding assigned_by column:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('Successfully added assigned_by column to activities table');
    
    // Create index for better query performance
    db.run('CREATE INDEX IF NOT EXISTS idx_activities_assigned_by ON activities(assigned_by)', err => {
      if (err) {
        console.error('Error creating index on assigned_by column:', err);
      } else {
        console.log('Successfully created index on assigned_by column');
      }
      
      // Update existing activities to set student_id as assigned_by (assuming self-created)
      db.run('UPDATE activities SET assigned_by = student_id WHERE assigned_by IS NULL', err => {
        if (err) {
          console.error('Error updating existing activities:', err);
        } else {
          console.log('Successfully updated existing activities with assigned_by values');
        }
        
        console.log('Migration completed successfully');
        db.close();
      });
    });
  });
}); 
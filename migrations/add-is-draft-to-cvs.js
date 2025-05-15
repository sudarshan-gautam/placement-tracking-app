/**
 * Migration to add is_draft column to student_cvs table
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Check if the is_draft column exists
  db.all("PRAGMA table_info(student_cvs)", (err, rows) => {
    if (err) {
      console.error("Error checking table schema:", err);
      return;
    }
    
    // Add the is_draft column if it doesn't exist
    const hasIsDraftColumn = rows && Array.isArray(rows) && rows.some(row => row.name === 'is_draft');
    
    if (!hasIsDraftColumn) {
      console.log('Adding is_draft column to student_cvs table...');
      db.run(`
        ALTER TABLE student_cvs 
        ADD COLUMN is_draft INTEGER DEFAULT 1
      `, (err) => {
        if (err) {
          console.error("Error adding is_draft column:", err);
        } else {
          console.log('Successfully added is_draft column.');
          
          // Set the initial value based on is_ats_optimized
          db.run(`
            UPDATE student_cvs 
            SET is_draft = CASE WHEN is_ats_optimized = 1 THEN 0 ELSE 1 END
          `, (err) => {
            if (err) {
              console.error("Error setting initial is_draft values:", err);
            } else {
              console.log('Successfully set initial is_draft values.');
            }
          });
        }
      });
    } else {
      console.log('is_draft column already exists in student_cvs table.');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err);
  } else {
    console.log('Migration completed.');
  }
}); 
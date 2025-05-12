const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create verification logs table
const createVerificationLogsTable = () => {
  return new Promise((resolve, reject) => {
    console.log('Creating activity verification logs table...');
    
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_verification_logs (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) NOT NULL,
        feedback TEXT,
        verified_by TEXT NOT NULL,
        admin_override INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating activity verification logs table:', err);
        reject(err);
        return;
      }

      console.log('Activity verification logs table created successfully');
      resolve();
    });
  });
};

// Run the migration
const runMigration = async () => {
  try {
    await createVerificationLogsTable();
    console.log('Migration completed successfully');
    db.close();
  } catch (error) {
    console.error('Migration failed:', error);
    db.close();
    process.exit(1);
  }
};

runMigration();

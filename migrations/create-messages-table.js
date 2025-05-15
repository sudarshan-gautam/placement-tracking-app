/**
 * Migration: Create Messages Table
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

// Create messages table
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  
  // Check if table already exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'", (err, row) => {
    if (err) {
      console.error('Error checking for table:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      console.log('messages table already exists, skipping creation');
      createTrigger();
      return;
    }
    
    // Create the table
    db.run(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, err => {
      if (err) {
        console.error('Error creating table:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('Successfully created messages table');
      createTrigger();
    });
  });
});

function createTrigger() {
  // Check if trigger already exists
  db.get("SELECT name FROM sqlite_master WHERE type='trigger' AND name='messages_updated_at'", (err, row) => {
    if (err) {
      console.error('Error checking for trigger:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      console.log('messages_updated_at trigger already exists, skipping creation');
      db.close();
      console.log('Migration completed successfully');
      process.exit(0);
      return;
    }
    
    // Create the trigger
    db.run(`
      CREATE TRIGGER IF NOT EXISTS messages_updated_at AFTER UPDATE ON messages
      BEGIN
          UPDATE messages SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
    `, err => {
      if (err) {
        console.error('Error creating trigger:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('Successfully created messages_updated_at trigger');
      db.close();
      console.log('Migration completed successfully');
      process.exit(0);
    });
  });
} 
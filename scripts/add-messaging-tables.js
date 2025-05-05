const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('SQLite connection successful');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create messages table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) {
    console.error('Error creating messages table:', err.message);
    return;
  }
  console.log('Messages table created successfully');
  
  // Create an index on sender_id and receiver_id to optimize message retrieval
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
    ON messages(sender_id, receiver_id)
  `, (err) => {
    if (err) {
      console.error('Error creating message index:', err.message);
    } else {
      console.log('Message index created successfully');
    }
    
    // Create a separate index for unread messages
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_messages_receiver_read 
      ON messages(receiver_id, read)
    `, (err) => {
      if (err) {
        console.error('Error creating unread messages index:', err.message);
      } else {
        console.log('Unread messages index created successfully');
      }
      
      console.log('Successfully set up messaging tables');
      db.close();
    });
  });
}); 
/**
 * Migration to remove bio column from users table 
 * and ensure all bio data is moved to biography field in user_profiles
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // First copy any existing bio data to biography in user_profiles
  db.run(`
    UPDATE user_profiles 
    SET biography = (
      SELECT bio 
      FROM users 
      WHERE users.id = user_profiles.user_id AND users.bio IS NOT NULL
    )
    WHERE EXISTS (
      SELECT 1 
      FROM users 
      WHERE users.id = user_profiles.user_id AND users.bio IS NOT NULL
    )
    AND (biography IS NULL OR biography = '')
  `);

  // Then remove the bio column from users table
  // SQLite doesn't support DROP COLUMN directly, so we need to:
  // 1. Create a new table without the bio column
  // 2. Copy the data
  // 3. Drop the old table
  // 4. Rename the new table

  // Create new temporary table without bio column
  db.run(`
    CREATE TABLE users_new (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'mentor', 'student')) NOT NULL,
      name TEXT NOT NULL,
      profileImage TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Copy data from the original table to the new one
  db.run(`
    INSERT INTO users_new
    SELECT id, email, password, role, name, profileImage, created_at, updated_at
    FROM users
  `);

  // Drop the original table
  db.run(`DROP TABLE users`);

  // Rename the new table to the original name
  db.run(`ALTER TABLE users_new RENAME TO users`);

  console.log('Migration completed: bio column removed from users table');
});

db.close(); 
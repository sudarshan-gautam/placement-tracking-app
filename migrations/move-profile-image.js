/**
 * Migration to move profileImage column from users table to user_profiles table
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // First add profileImage column to user_profiles if it doesn't exist
  db.run(`
    ALTER TABLE user_profiles ADD COLUMN profileImage TEXT;
  `);

  // Copy profile image data from users to user_profiles
  db.run(`
    UPDATE user_profiles 
    SET profileImage = (
      SELECT profileImage 
      FROM users 
      WHERE users.id = user_profiles.user_id AND users.profileImage IS NOT NULL
    )
    WHERE EXISTS (
      SELECT 1 
      FROM users 
      WHERE users.id = user_profiles.user_id AND users.profileImage IS NOT NULL
    )
  `);

  // Remove profileImage from users table
  // SQLite doesn't support DROP COLUMN directly, so we need to:
  // 1. Create a new table without the profileImage column
  // 2. Copy the data
  // 3. Drop the old table
  // 4. Rename the new table

  // Create new temporary table without profileImage column
  db.run(`
    CREATE TABLE users_new (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'mentor', 'student')) NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Copy data from the original table to the new one
  db.run(`
    INSERT INTO users_new
    SELECT id, email, password, role, name, created_at, updated_at
    FROM users
  `);

  // Drop the original table
  db.run(`DROP TABLE users`);

  // Rename the new table to the original name
  db.run(`ALTER TABLE users_new RENAME TO users`);

  console.log('Migration completed: profileImage column moved from users table to user_profiles table');
});

db.close(); 
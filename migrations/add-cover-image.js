/**
 * Migration to add coverImage column to user_profiles table
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Add coverImage column to user_profiles
  db.run(`
    ALTER TABLE user_profiles ADD COLUMN coverImage TEXT;
  `);

  // Set default coverImage for all existing profiles
  db.run(`
    UPDATE user_profiles 
    SET coverImage = '/placeholder-cover.jpg' 
    WHERE coverImage IS NULL;
  `);

  console.log('Migration completed: coverImage column added to user_profiles table');
});

db.close(); 
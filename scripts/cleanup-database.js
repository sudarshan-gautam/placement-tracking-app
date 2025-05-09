const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Check which tables exist
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('sqlite_sequence')");
    console.log('Existing tables:', tables.map(t => t.name).join(', '));
    
    // Check if users table exists
    const usersExists = tables.some(t => t.name === 'users');
    const jobsExists = tables.some(t => t.name === 'jobs');
    
    // Create fresh tables without preserving data
    console.log('Dropping all tables...');
    for (const table of tables) {
      console.log(`Dropping table: ${table.name}`);
      await db.run(`DROP TABLE IF EXISTS "${table.name}"`);
    }
    
    // Create new users table
    console.log('Creating new users table...');
    await db.run(`
      CREATE TABLE users (
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
    
    // Create new jobs table
    console.log('Creating new jobs table...');
    await db.run(`
      CREATE TABLE jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        salary_range TEXT,
        location TEXT,
        deadline TEXT,
        status TEXT CHECK(status IN ('active', 'closed', 'draft')) DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    
    // Add sample data
    console.log('Adding sample users...');
    await db.run(`
      INSERT INTO users (id, email, password, role, name) VALUES
      (lower(hex(randomblob(16))), 'admin@example.com', 'admin123', 'admin', 'Admin User'),
      (lower(hex(randomblob(16))), 'student@example.com', 'student123', 'student', 'Student User'),
      (lower(hex(randomblob(16))), 'mentor@example.com', 'mentor123', 'mentor', 'Mentor User')
    `);
    
    console.log('Adding sample jobs...');
    await db.run(`
      INSERT INTO jobs (id, title, description, location, requirements, salary_range, deadline, status)
      VALUES 
      (lower(hex(randomblob(16))), 'Primary School Teacher', 'Looking for passionate primary education teachers with experience in modern teaching methods.', 
       'London', 'Bachelor degree in Education', '£28,000 - £35,000', datetime('now', '+30 days'), 'active'),
      
      (lower(hex(randomblob(16))), 'Special Education Assistant', 'Join our team supporting students with special educational needs. Training provided.', 
       'Manchester', 'Experience with special needs education', '£22,000 - £26,000', datetime('now', '+15 days'), 'active'),
      
      (lower(hex(randomblob(16))), 'Mathematics Tutor', 'Experienced mathematics tutor needed for evening sessions with secondary school students.',
       'Remote', 'Strong mathematics background', '£20/hour', datetime('now', '+10 days'), 'active')
    `);
    
    // Verify the tables were created correctly
    const newTables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('sqlite_sequence')");
    console.log('New tables:', newTables.map(t => t.name).join(', '));
    
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`Users count: ${userCount.count}`);
    
    const jobCount = await db.get("SELECT COUNT(*) as count FROM jobs");
    console.log(`Jobs count: ${jobCount.count}`);
    
    await db.close();
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
}

// Run the cleanup function
cleanupDatabase(); 
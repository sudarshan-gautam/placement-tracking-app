/**
 * Migration: Create Verification Tables
 * This script adds all the necessary verification tables required by the app
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

// Create verification tables
const tables = [
  // Sessions table
  {
    name: 'sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        status TEXT CHECK(status IN ('planned', 'completed', 'cancelled')) DEFAULT 'planned',
        reflection TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
  },
  
  // Activities table
  {
    name: 'activities',
    sql: `
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        activity_type TEXT CHECK(activity_type IN ('workshop', 'research', 'project', 'coursework', 'other')) NOT NULL,
        date_completed TEXT NOT NULL,
        duration_minutes INTEGER,
        evidence_url TEXT,
        status TEXT CHECK(status IN ('draft', 'submitted', 'completed')) DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
  },
  
  // Competencies table
  {
    name: 'competencies',
    sql: `
      CREATE TABLE IF NOT EXISTS competencies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `
  },
  
  // Student competencies table
  {
    name: 'student_competencies',
    sql: `
      CREATE TABLE IF NOT EXISTS student_competencies (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        competency_id TEXT NOT NULL,
        level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) NOT NULL,
        evidence_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE
      )
    `
  },
  
  // Session verifications table
  {
    name: 'session_verifications',
    sql: `
      CREATE TABLE IF NOT EXISTS session_verifications (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        verified_by TEXT,
        feedback TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `
  },
  
  // Activity verifications table
  {
    name: 'activity_verifications',
    sql: `
      CREATE TABLE IF NOT EXISTS activity_verifications (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL,
        verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        verified_by TEXT,
        feedback TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `
  },
  
  // Competency verifications table
  {
    name: 'competency_verifications',
    sql: `
      CREATE TABLE IF NOT EXISTS competency_verifications (
        id TEXT PRIMARY KEY,
        student_competency_id TEXT NOT NULL,
        verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        verified_by TEXT,
        feedback TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_competency_id) REFERENCES student_competencies(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `
  },
  
  // Profile verifications table
  {
    name: 'profile_verifications',
    sql: `
      CREATE TABLE IF NOT EXISTS profile_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_url TEXT,
        verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
        verified_by TEXT,
        feedback TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `
  }
];

// Create tables
async function createTables() {
  return new Promise((resolve, reject) => {
    let completed = 0;
    
    tables.forEach(table => {
      // Check if table exists
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table.name}'`, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          console.log(`Table ${table.name} already exists, skipping creation`);
          completed++;
          if (completed === tables.length) {
            resolve();
          }
        } else {
          // Create table
          db.run(table.sql, (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            console.log(`Successfully created table ${table.name}`);
            completed++;
            if (completed === tables.length) {
              resolve();
            }
          });
        }
      });
    });
  });
}

// Add some sample data
async function addSampleData() {
  // First check if we have users
  return new Promise((resolve, reject) => {
    db.all("SELECT id, role FROM users", (err, users) => {
      if (err) {
        reject(err);
        return;
      }
      
      const students = users.filter(user => user.role === 'student');
      
      if (students.length === 0) {
        console.log('No students found, skipping sample data');
        resolve();
        return;
      }
      
      // Add sample competencies if none exist
      db.get("SELECT COUNT(*) as count FROM competencies", (err, result) => {
        if (err || result.count > 0) {
          // Skip if error or if competencies already exist
          resolve();
          return;
        }
        
        const competencies = [
          { id: generateId(), name: 'Curriculum Design', category: 'Education' },
          { id: generateId(), name: 'Classroom Management', category: 'Education' },
          { id: generateId(), name: 'Technology Integration', category: 'Technology' },
          { id: generateId(), name: 'Student Assessment', category: 'Education' },
          { id: generateId(), name: 'Inclusive Teaching', category: 'Education' }
        ];
        
        let insertedCount = 0;
        competencies.forEach(competency => {
          db.run(
            "INSERT INTO competencies (id, name, category) VALUES (?, ?, ?)",
            [competency.id, competency.name, competency.category],
            err => {
              if (err) {
                console.error('Error inserting competency:', err.message);
              } else {
                insertedCount++;
                if (insertedCount === competencies.length) {
                  console.log('Added sample competencies');
                  resolve();
                }
              }
            }
          );
        });
      });
    });
  });
}

// Helper function to generate ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Run the migration
async function runMigration() {
  try {
    await createTables();
    await addSampleData();
    console.log('All verification tables created successfully');
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('Error creating verification tables:', err.message);
    db.close();
    process.exit(1);
  }
}

runMigration(); 
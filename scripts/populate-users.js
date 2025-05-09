const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Sample users to add to the database
const SAMPLE_USERS = [
  {
    email: 'admin1@example.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Manager'
  },
  {
    email: 'admin2@example.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Director'
  },
  {
    email: 'mentor1@example.com',
    password: 'mentor123',
    role: 'mentor',
    name: 'John Smith'
  },
  {
    email: 'mentor2@example.com',
    password: 'mentor123',
    role: 'mentor',
    name: 'Emily Johnson'
  },
  {
    email: 'mentor3@example.com',
    password: 'mentor123',
    role: 'mentor',
    name: 'David Brown'
  },
  {
    email: 'mentor4@example.com',
    password: 'mentor123',
    role: 'mentor',
    name: 'Sarah Davis'
  },
  {
    email: 'student1@example.com',
    password: 'student123',
    role: 'student',
    name: 'Alex Wilson'
  },
  {
    email: 'student2@example.com',
    password: 'student123',
    role: 'student',
    name: 'Jessica Lee'
  },
  {
    email: 'student3@example.com',
    password: 'student123',
    role: 'student',
    name: 'Michael Taylor'
  },
  {
    email: 'student4@example.com',
    password: 'student123',
    role: 'student',
    name: 'Emma Clark'
  },
  {
    email: 'student5@example.com',
    password: 'student123',
    role: 'student',
    name: 'James Martin'
  },
  {
    email: 'student6@example.com',
    password: 'student123',
    role: 'student',
    name: 'Olivia Wright'
  },
  {
    email: 'student7@example.com',
    password: 'student123',
    role: 'student',
    name: 'William Harris'
  }
];

async function populateUsers() {
  try {
    console.log('Starting user population...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Check current user count
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`Current users count: ${userCount.count}`);
    
    // Add sample users
    console.log('Adding sample users...');
    const insertStmt = `
      INSERT INTO users (
        id, 
        email, 
        password, 
        role, 
        name, 
        created_at, 
        updated_at
      ) VALUES (
        lower(hex(randomblob(16))), 
        ?, ?, ?, ?, 
        datetime('now'), 
        datetime('now')
      )
    `;
    
    let addedCount = 0;
    for (const user of SAMPLE_USERS) {
      try {
        // Check if user with same email already exists
        const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [user.email]);
        if (existingUser) {
          console.log(`User with email ${user.email} already exists, skipping`);
          continue;
        }
        
        await db.run(insertStmt, [
          user.email,
          user.password,
          user.role,
          user.name
        ]);
        addedCount++;
      } catch (err) {
        console.error(`Error adding user "${user.name}":`, err);
      }
    }
    
    // Verify new user count
    const newUserCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`New users count: ${newUserCount.count}`);
    console.log(`Successfully added ${addedCount} users`);
    
    await db.close();
    console.log('User population completed successfully!');
    
  } catch (error) {
    console.error('Error populating users:', error);
  }
}

// Run the populate function
populateUsers(); 
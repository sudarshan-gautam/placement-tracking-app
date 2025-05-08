const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization and fixes...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // ===== USERS TABLE =====
    console.log('\n=== Checking users table ===');
    const usersTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    
    if (!usersTableCheck) {
      console.log('Creating users table...');
      await db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          role TEXT NOT NULL DEFAULT 'student',
          status TEXT NOT NULL DEFAULT 'active',
          profile_image TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Successfully created users table');
      
      // Add sample users
      console.log('Adding sample users...');
      await db.run(`
        INSERT INTO users (id, name, email, role, status, created_at)
        VALUES 
        (1, 'Admin User', 'admin@example.com', 'admin', 'active', datetime('now')),
        (2, 'Mentor User', 'mentor@example.com', 'mentor', 'active', datetime('now')),
        (3, 'Student User', 'student@example.com', 'student', 'active', datetime('now')),
        (4, 'Emma Wilson', 'emma.wilson@student.edu', 'student', 'active', datetime('now')),
        (5, 'David Roberts', 'david.roberts@mentor.edu', 'mentor', 'active', datetime('now'))
      `);
      console.log('Added sample users');
    } else {
      console.log('Users table already exists');
      
      // Check if we have sample users
      const userCount = await db.get("SELECT COUNT(*) as count FROM users");
      
      if (userCount.count === 0) {
        console.log('Adding sample users...');
        await db.run(`
          INSERT INTO users (id, name, email, role, status, created_at)
          VALUES 
          (1, 'Admin User', 'admin@example.com', 'admin', 'active', datetime('now')),
          (2, 'Mentor User', 'mentor@example.com', 'mentor', 'active', datetime('now')),
          (3, 'Student User', 'student@example.com', 'student', 'active', datetime('now')),
          (4, 'Emma Wilson', 'emma.wilson@student.edu', 'student', 'active', datetime('now')),
          (5, 'David Roberts', 'david.roberts@mentor.edu', 'mentor', 'active', datetime('now'))
        `);
        console.log('Added sample users');
      } else {
        console.log('Sample users already exist');
      }
    }
    
    // ===== PROFILE TABLE =====
    console.log('\n=== Checking profiles table ===');
    const profilesTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'");
    
    if (!profilesTableCheck) {
      console.log('Creating profiles table...');
      await db.run(`
        CREATE TABLE profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          phone TEXT,
          address TEXT,
          date_of_birth TEXT,
          institution TEXT,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      console.log('Successfully created profiles table');
      
      // Add sample profiles
      console.log('Adding sample profiles...');
      await db.run(`
        INSERT INTO profiles (user_id, phone, address, date_of_birth, institution, bio)
        VALUES 
        (3, '555-123-4567', '123 Student St, College Town', '1998-05-15', 'State University', 'Education student focusing on primary education'),
        (4, '555-234-5678', '456 Campus Ave, College Town', '1997-08-22', 'State University', 'Education student focusing on special education'),
        (5, '555-345-6789', '789 Faculty Rd, College Town', '1975-03-10', 'State University', 'Professor with 15 years of teaching experience')
      `);
      console.log('Added sample profiles');
    } else {
      console.log('Profiles table already exists');
    }
    
    // ===== PROFILE VERIFICATIONS TABLE =====
    console.log('\n=== Checking profile_verifications table ===');
    const profileVerificationsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_verifications'");
    
    if (!profileVerificationsTableCheck) {
      console.log('Creating profile_verifications table...');
      await db.run(`
        CREATE TABLE profile_verifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          student_id INTEGER,
          verification_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP,
          verified_by TEXT,
          notes TEXT,
          document_url TEXT,
          rejection_reason TEXT
        )
      `);
      console.log('Successfully created profile_verifications table');
      
      // Add sample data
      console.log('Adding sample verification data...');
      await db.run(`
        INSERT INTO profile_verifications (user_id, verification_type, status, document_url, notes, rejection_reason)
        VALUES 
        ('3', 'identity', 'pending', 'https://example.com/documents/id1.pdf', 'Waiting for verification', NULL),
        ('4', 'qualification', 'approved', 'https://example.com/documents/certificate1.pdf', 'Verified on May 5', NULL),
        ('5', 'experience', 'rejected', 'https://example.com/documents/resume1.pdf', 'Experience verification rejected', 'Insufficient evidence of claimed experience')
      `);
      console.log('Added sample verification data');
    } else {
      // Check and add missing columns
      const columnInfo = await db.all("PRAGMA table_info(profile_verifications)");
      
      const columnChecks = {
        'document_url': false,
        'rejection_reason': false,
        'student_id': false
      };
      
      // Check which columns exist
      columnInfo.forEach(column => {
        if (columnChecks.hasOwnProperty(column.name)) {
          columnChecks[column.name] = true;
        }
      });
      
      // Add missing columns
      for (const [columnName, exists] of Object.entries(columnChecks)) {
        if (!exists) {
          console.log(`Adding ${columnName} column to profile_verifications table...`);
          await db.run(`ALTER TABLE profile_verifications ADD COLUMN ${columnName} ${columnName === 'student_id' ? 'INTEGER' : 'TEXT'}`);
          console.log(`Successfully added ${columnName} column to profile_verifications table`);
        } else {
          console.log(`${columnName} column already exists in profile_verifications table`);
        }
      }
    }
    
    // ===== ACTIVITIES TABLE =====
    console.log('\n=== Checking activities table ===');
    const activitiesTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='activities'");
    
    if (!activitiesTableCheck) {
      console.log('Creating activities table...');
      await db.run(`
        CREATE TABLE activities (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
        )
      `);
      console.log('Successfully created activities table');
      
      // Add some sample activity data
      console.log('Adding sample activity data...');
      await db.run(`
        INSERT INTO activities (id, user_id, type, action, details, time)
        VALUES 
        ('act1', 1, 'User', 'Login', 'User logged in', datetime('now', '-1 day')),
        ('act2', 1, 'Profile', 'Update', 'Updated profile information', datetime('now', '-6 hours')),
        ('act3', 2, 'Teaching', 'New Session', 'Added new teaching session', datetime('now', '-2 hours')),
        ('act4', 3, 'Job', 'Application', 'Applied for teaching position', datetime('now', '-1 hours')),
        ('act5', 4, 'Qualification', 'New', 'Added new qualification', datetime('now', '-30 minutes'))
      `);
      console.log('Added sample activity data');
    } else {
      console.log('Activities table already exists');
    }
    
    // ===== MESSAGING TABLES =====
    console.log('\n=== Checking messaging tables ===');
    const conversationsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'");
    
    if (!conversationsTableCheck) {
      console.log('Creating conversations table...');
      await db.run(`
        CREATE TABLE conversations (
          id TEXT PRIMARY KEY,
          title TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Successfully created conversations table');
      
      console.log('Creating conversation_participants table...');
      await db.run(`
        CREATE TABLE conversation_participants (
          conversation_id TEXT,
          user_id INTEGER,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (conversation_id, user_id),
          FOREIGN KEY (conversation_id) REFERENCES conversations(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      console.log('Successfully created conversation_participants table');
      
      console.log('Creating messages table...');
      await db.run(`
        CREATE TABLE messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT,
          sender_id INTEGER,
          content TEXT,
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id),
          FOREIGN KEY (sender_id) REFERENCES users(id)
        )
      `);
      console.log('Successfully created messages table');
      
      // Add sample conversations and messages
      console.log('Adding sample conversations and messages...');
      
      // Create a conversation between student and mentor
      const conversationId = uuidv4();
      await db.run(`
        INSERT INTO conversations (id, title) 
        VALUES (?, 'Teaching Placement Discussion')
      `, [conversationId]);
      
      // Add participants
      await db.run(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES 
        (?, 3),
        (?, 2)
      `, [conversationId, conversationId]);
      
      // Add messages
      await db.run(`
        INSERT INTO messages (id, conversation_id, sender_id, content, sent_at)
        VALUES 
        (?, ?, 2, 'Hello, I wanted to discuss your upcoming teaching placement', datetime('now', '-2 days')),
        (?, ?, 3, 'Hi, I would love to discuss. What details do you need?', datetime('now', '-2 days', '+30 minutes')),
        (?, ?, 2, 'Please prepare your lesson plans and reference materials', datetime('now', '-1 day')),
        (?, ?, 3, 'I have started working on them. Will share by tomorrow', datetime('now', '-1 day', '+15 minutes'))
      `, [
        uuidv4(), conversationId,
        uuidv4(), conversationId,
        uuidv4(), conversationId,
        uuidv4(), conversationId
      ]);
      
      console.log('Added sample conversations and messages');
    } else {
      console.log('Messaging tables already exist');
    }
    
    // ===== JOB POSTS TABLE =====
    console.log('\n=== Checking job_posts table ===');
    const jobPostsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='job_posts'");
    
    if (!jobPostsTableCheck) {
      console.log('Creating job_posts table...');
      await db.run(`
        CREATE TABLE job_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          location TEXT,
          company TEXT,
          contact_email TEXT,
          salary TEXT,
          job_type TEXT,
          posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deadline TIMESTAMP,
          status TEXT DEFAULT 'active'
        )
      `);
      console.log('Successfully created job_posts table');
      
      // Add sample job posts
      console.log('Adding sample job posts...');
      await db.run(`
        INSERT INTO job_posts (title, description, location, company, contact_email, salary, job_type, deadline, status)
        VALUES 
        ('Primary School Teacher', 'Looking for passionate primary education teachers with experience in modern teaching methods.', 
         'London', 'Greenfield Primary School', 'hiring@greenfield.edu', '£28,000 - £35,000', 'Full-time', datetime('now', '+30 days'), 'active'),
        
        ('Special Education Assistant', 'Join our team supporting students with special educational needs. Training provided.', 
         'Manchester', 'Inclusive Education Centers', 'jobs@inclusive-ed.org', '£22,000 - £26,000', 'Part-time', datetime('now', '+15 days'), 'active'),
        
        ('Mathematics Tutor', 'Experienced mathematics tutor needed for evening sessions with secondary school students.',
         'Remote', 'Learning Tree Tutors', 'tutors@learningtree.com', '£20/hour', 'Contract', datetime('now', '+10 days'), 'active')
      `);
      console.log('Added sample job posts');
    } else {
      console.log('Job posts table already exists');
    }
    
    // ===== APPLICATIONS TABLE =====
    console.log('\n=== Checking applications table ===');
    const applicationsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='applications'");
    
    if (!applicationsTableCheck) {
      console.log('Creating applications table...');
      await db.run(`
        CREATE TABLE applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_post_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          cover_letter TEXT,
          resume_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_post_id) REFERENCES job_posts(id),
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      console.log('Successfully created applications table');
      
      // Add sample applications
      console.log('Adding sample applications...');
      await db.run(`
        INSERT INTO applications (job_post_id, student_id, status, cover_letter, resume_url)
        VALUES 
        (1, 3, 'pending', 'I am very interested in this position and believe my experience makes me a good fit.', 'https://example.com/resumes/student1.pdf'),
        (2, 4, 'pending', 'My background in special education makes me an ideal candidate for this role.', 'https://example.com/resumes/student2.pdf')
      `);
      console.log('Added sample applications');
    } else {
      console.log('Applications table already exists');
    }
    
    // ===== SESSIONS TABLE =====
    console.log('\n=== Checking sessions table ===');
    const sessionsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'");
    
    if (!sessionsTableCheck) {
      console.log('Creating sessions table...');
      await db.run(`
        CREATE TABLE sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          duration INTEGER, 
          location TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      console.log('Successfully created sessions table');
      
      // Add sample sessions
      console.log('Adding sample sessions...');
      await db.run(`
        INSERT INTO sessions (student_id, title, description, date, duration, location, notes)
        VALUES 
        (3, 'Primary Mathematics', 'Teaching addition and subtraction to Year 2', '2023-06-10', 60, 'Greenfield Primary School', 'Students were engaged and responsive'),
        (4, 'Reading Workshop', 'Reading comprehension session with Year 3', '2023-06-12', 45, 'Sunshine Elementary School', 'Need to bring more visual aids next time')
      `);
      console.log('Added sample sessions');
    } else {
      console.log('Sessions table already exists');
    }
    
    // ===== APPROVALS TABLE =====
    console.log('\n=== Checking approvals table ===');
    const approvalsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='approvals'");
    
    if (!approvalsTableCheck) {
      console.log('Creating approvals table...');
      await db.run(`
        CREATE TABLE approvals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          item_type TEXT NOT NULL,
          student_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          feedback TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Successfully created approvals table');
      
      // Add sample approvals
      console.log('Adding sample approvals...');
      await db.run(`
        INSERT INTO approvals (item_id, item_type, student_id, status, feedback)
        VALUES 
        (1, 'session', 3, 'pending', NULL),
        (2, 'session', 4, 'pending', NULL)
      `);
      console.log('Added sample approvals');
    } else {
      console.log('Approvals table already exists');
    }
    
    await db.close();
    console.log('\nDatabase initialization and fixes completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization function
initializeDatabase(); 
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
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
      console.log('Successfully created users table');
      
      // Add sample users with plain text passwords
      console.log('Adding sample users...');
      await db.run(`
        INSERT INTO users (id, email, password, role, name) VALUES
        (lower(hex(randomblob(16))), 'admin@example.com', 'admin123', 'admin', 'Admin User'),
        (lower(hex(randomblob(16))), 'student@example.com', 'student123', 'student', 'Student User'),
        (lower(hex(randomblob(16))), 'mentor@example.com', 'mentor123', 'mentor', 'Mentor User')
      `);
      console.log('Added sample users');
    } else {
      console.log('Users table already exists');
      
      // Check if we have sample users
      const userCount = await db.get("SELECT COUNT(*) as count FROM users");
      
      if (userCount.count === 0) {
        console.log('Adding sample users...');
        await db.run(`
          INSERT INTO users (id, email, password, role, name) VALUES
          (lower(hex(randomblob(16))), 'admin@example.com', 'admin123', 'admin', 'Admin User'),
          (lower(hex(randomblob(16))), 'student@example.com', 'student123', 'student', 'Student User'),
          (lower(hex(randomblob(16))), 'mentor@example.com', 'mentor123', 'mentor', 'Mentor User')
        `);
        console.log('Added sample users');
      } else {
        console.log('Sample users already exist');
      }
    }
    
    // ===== JOBS TABLE =====
    console.log('\n=== Checking jobs table ===');
    const jobsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='jobs'");
    
    if (!jobsTableCheck) {
      console.log('Creating jobs table...');
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
      console.log('Successfully created jobs table');
      
      // Add sample jobs
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
      console.log('Added sample jobs');
    } else {
      console.log('Jobs table already exists');
    }
    
    // ===== JOB SKILLS TABLE =====
    console.log('\n=== Checking job_skills table ===');
    const jobSkillsTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='job_skills'");
    
    if (!jobSkillsTableCheck) {
      console.log('Creating job_skills table...');
      await db.run(`
        CREATE TABLE job_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT NOT NULL,
          skill TEXT NOT NULL,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);
      console.log('Successfully created job_skills table');
      
      // Get the IDs of the three sample jobs we've created
      const jobs = await db.all("SELECT id, title FROM jobs LIMIT 3");
      
      if (jobs.length > 0) {
        console.log('Adding sample job skills...');
        
        // Primary School Teacher skills
        if (jobs[0]) {
          await db.run(`
            INSERT INTO job_skills (job_id, skill) VALUES 
            (?, 'Classroom Management'),
            (?, 'Curriculum Planning'),
            (?, 'Assessment'),
            (?, 'Communication')
          `, jobs[0].id, jobs[0].id, jobs[0].id, jobs[0].id);
        }
        
        // Special Education Assistant skills
        if (jobs[1]) {
          await db.run(`
            INSERT INTO job_skills (job_id, skill) VALUES 
            (?, 'Special Education'),
            (?, 'Inclusive Education'),
            (?, 'Behavior Management'),
            (?, 'Differentiated Instruction')
          `, jobs[1].id, jobs[1].id, jobs[1].id, jobs[1].id);
        }
        
        // Mathematics Tutor skills
        if (jobs[2]) {
          await db.run(`
            INSERT INTO job_skills (job_id, skill) VALUES 
            (?, 'Mathematics'),
            (?, 'Tutoring'),
            (?, 'Assessment'),
            (?, 'Secondary Education')
          `, jobs[2].id, jobs[2].id, jobs[2].id, jobs[2].id);
        }
        
        console.log('Added sample job skills');
      }
    } else {
      console.log('Job_skills table already exists');
    }
    
    // ===== MENTOR STUDENT ASSIGNMENTS TABLE =====
    console.log('\n=== Checking mentor_student_assignments table ===');
    const mentorStudentTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mentor_student_assignments'");
    
    if (!mentorStudentTableCheck) {
      console.log('Creating mentor_student_assignments table...');
      await db.run(`
        CREATE TABLE mentor_student_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          assigned_date DATETIME DEFAULT (datetime('now')),
          notes TEXT,
          FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(student_id)
        )
      `);
      console.log('Successfully created mentor_student_assignments table');
      
      // Add sample mentor-student assignments if we have users
      const mentors = await db.all("SELECT id FROM users WHERE role = 'mentor' LIMIT 1");
      const students = await db.all("SELECT id FROM users WHERE role = 'student' LIMIT 1");
      
      if (mentors.length > 0 && students.length > 0) {
        console.log('Adding sample mentor-student assignment...');
        await db.run(`
          INSERT INTO mentor_student_assignments (mentor_id, student_id, notes) 
          VALUES (?, ?, 'Initial sample assignment')
        `, mentors[0].id, students[0].id);
        console.log('Added sample mentor-student assignment');
      }
    } else {
      console.log('Mentor_student_assignments table already exists');
    }
    
    // ===== USER EDUCATION TABLE =====
    console.log('\n=== Checking user_education table ===');
    const userEducationTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_education'");
    
    if (!userEducationTableCheck) {
      console.log('Creating user_education table...');
      await db.run(`
        CREATE TABLE user_education (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          institution TEXT NOT NULL,
          degree TEXT NOT NULL,
          field_of_study TEXT,
          start_date TEXT,
          end_date TEXT,
          description TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Successfully created user_education table');
    } else {
      console.log('User_education table already exists');
    }
    
    // ===== USER EXPERIENCE TABLE =====
    console.log('\n=== Checking user_experience table ===');
    const userExperienceTableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_experience'");
    
    if (!userExperienceTableCheck) {
      console.log('Creating user_experience table...');
      await db.run(`
        CREATE TABLE user_experience (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT,
          start_date TEXT,
          end_date TEXT,
          current BOOLEAN DEFAULT 0,
          description TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Successfully created user_experience table');
    } else {
      console.log('User_experience table already exists');
    }
    
    // Check for any other tables and drop them if not in the allowed list
    console.log('\n=== Cleaning up unnecessary tables ===');
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('users', 'jobs', 'user_skills', 'user_profiles', 'saved_jobs', 'job_applications', 'job_skills', 'mentor_student_assignments', 'sqlite_sequence', 'user_education', 'user_experience', 'qualifications', 'sessions', 'activities', 'competencies', 'student_competencies', 'session_verifications', 'activity_verifications', 'competency_verifications', 'profile_verifications')");
    
    for (const table of tables) {
      console.log(`Dropping unnecessary table: ${table.name}`);
      await db.run(`DROP TABLE IF EXISTS "${table.name}"`);
    }
    
    await db.close();
    console.log('\nDatabase initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization function
initializeDatabase(); 
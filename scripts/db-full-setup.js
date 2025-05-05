const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Connect to the SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Database connection
let db;

// Function to run a query and return a promise
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Function to get all rows from a query
function getAllRows(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Generate a UUID
function generateUUID() {
  return uuidv4().replace(/-/g, '');
}

// Main function to setup the database
async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Ask user if they want to reset the database
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Do you want to reset the database? This will delete all existing data. (y/n) ', async (answer) => {
      readline.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Remove existing database if it exists
        if (fs.existsSync(dbPath)) {
          console.log('Removing existing database...');
          fs.unlinkSync(dbPath);
        }
      }
      
      // Connect to database
      db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('Could not connect to database', err);
          process.exit(1);
        }
        console.log('SQLite connection successful');
        
        // Enable foreign keys
        await runQuery('PRAGMA foreign_keys = ON');
        
        try {
          // Initialize steps
          await createTables();
          await createAdditionalTables();
          await insertSampleUsers();
          await insertSampleData();
          await addMessagingTables();
          
          console.log('Database setup completed successfully!');
        } catch (error) {
          console.error('Error setting up database:', error);
        } finally {
          db.close();
        }
      });
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    if (db) db.close();
  }
}

// Create base tables from schema
async function createTables() {
  console.log('Creating base tables...');
  
  // Users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
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
  
  // Companies table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      logo TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // Job Posts table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS job_posts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT,
      salary_range TEXT,
      location TEXT,
      deadline TEXT,
      status TEXT CHECK(status IN ('active', 'closed', 'draft')) DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  
  // Applications table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_post_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')) DEFAULT 'pending',
      resume_url TEXT,
      cover_letter TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Student Profiles table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course TEXT NOT NULL,
      graduation_year INTEGER,
      cgpa REAL,
      skills TEXT,
      projects TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Qualifications table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS qualifications (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      issuing_organization TEXT NOT NULL,
      description TEXT,
      date_obtained TEXT NOT NULL,
      expiry_date TEXT,
      certificate_url TEXT,
      type TEXT CHECK(type IN ('degree', 'certificate', 'license', 'course', 'other')) NOT NULL,
      verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
      verified_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Teaching Sessions table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      location TEXT,
      session_type TEXT CHECK(session_type IN ('classroom', 'online', 'one-on-one', 'group', 'other')) NOT NULL,
      learner_age_group TEXT,
      subject TEXT,
      objectives TEXT,
      reflection TEXT,
      feedback TEXT,
      status TEXT CHECK(status IN ('planned', 'completed', 'cancelled')) DEFAULT 'planned',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Approvals table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      mentor_id TEXT,
      item_type TEXT CHECK(item_type IN ('qualification', 'session', 'activity', 'application', 'other')) NOT NULL,
      item_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Notifications table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
      read BOOLEAN DEFAULT FALSE,
      action_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Activity logs
  await runQuery(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT,
      item_type TEXT CHECK(item_type IN ('qualification', 'session', 'application', 'other')) NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create triggers
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS users_updated_at AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS companies_updated_at AFTER UPDATE ON companies
    BEGIN
      UPDATE companies SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS job_posts_updated_at AFTER UPDATE ON job_posts
    BEGIN
      UPDATE job_posts SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS applications_updated_at AFTER UPDATE ON applications
    BEGIN
      UPDATE applications SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS student_profiles_updated_at AFTER UPDATE ON student_profiles
    BEGIN
      UPDATE student_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS qualifications_updated_at AFTER UPDATE ON qualifications
    BEGIN
      UPDATE qualifications SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS sessions_updated_at AFTER UPDATE ON sessions
    BEGIN
      UPDATE sessions SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS approvals_updated_at AFTER UPDATE ON approvals
    BEGIN
      UPDATE approvals SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  console.log('Base tables created successfully');
}

// Create additional tables
async function createAdditionalTables() {
  console.log('Creating additional tables...');
  
  // Mentor-Student relationship table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS mentor_student (
      id TEXT PRIMARY KEY,
      mentor_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      assigned_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Student Activities table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS student_activities (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      activity_type TEXT CHECK(activity_type IN ('workshop', 'project', 'internship', 'certification', 'seminar', 'other')) NOT NULL,
      date_completed TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Events table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      location TEXT,
      event_type TEXT CHECK(event_type IN ('workshop', 'seminar', 'career_fair', 'other')) NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  // Event Registrations table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      registration_date TEXT DEFAULT (datetime('now')),
      attendance_status TEXT CHECK(attendance_status IN ('registered', 'attended', 'cancelled', 'no_show')) DEFAULT 'registered',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create triggers for additional tables
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS mentor_student_updated_at AFTER UPDATE ON mentor_student
    BEGIN
      UPDATE mentor_student SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS student_activities_updated_at AFTER UPDATE ON student_activities
    BEGIN
      UPDATE student_activities SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS events_updated_at AFTER UPDATE ON events
    BEGIN
      UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  await runQuery(`
    CREATE TRIGGER IF NOT EXISTS event_registrations_updated_at AFTER UPDATE ON event_registrations
    BEGIN
      UPDATE event_registrations SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
  
  console.log('Additional tables created successfully');
}

// Insert sample users
async function insertSampleUsers() {
  console.log('Inserting sample users...');
  
  // Check if users already exist
  const existingUsers = await getAllRows('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) {
    console.log(`Found ${existingUsers[0].count} existing users, skipping sample user creation`);
    return;
  }
  
  // Admin users
  const adminUsers = [
    { email: 'admin@example.com', password: 'admin123', name: 'Admin User' },
    { email: 'admin2@example.com', password: 'admin123', name: 'System Admin' }
  ];
  
  // Mentor users
  const mentorUsers = [
    { email: 'mentor@example.com', password: 'mentor123', name: 'Mentor User' },
    { email: 'john.mentor@example.com', password: 'mentor123', name: 'John Mentor' },
    { email: 'sarah.smith@example.com', password: 'mentor123', name: 'Sarah Smith' },
    { email: 'michael.taylor@example.com', password: 'mentor123', name: 'Michael Taylor' },
    { email: 'david.wilson@example.com', password: 'mentor123', name: 'David Wilson' }
  ];
  
  // Student users
  const studentUsers = [
    { email: 'student@example.com', password: 'student123', name: 'Student User' },
    { email: 'jane.doe@example.com', password: 'student123', name: 'Jane Doe' },
    { email: 'john.smith@example.com', password: 'student123', name: 'John Smith' },
    { email: 'alex.johnson@example.com', password: 'student123', name: 'Alex Johnson' },
    { email: 'emma.brown@example.com', password: 'student123', name: 'Emma Brown' },
    { email: 'james.wilson@example.com', password: 'student123', name: 'James Wilson' },
    { email: 'olivia.davis@example.com', password: 'student123', name: 'Olivia Davis' },
    { email: 'william.jones@example.com', password: 'student123', name: 'William Jones' },
    { email: 'sophia.miller@example.com', password: 'student123', name: 'Sophia Miller' },
    { email: 'lucas.martin@example.com', password: 'student123', name: 'Lucas Martin' },
    { email: 'lily.taylor@example.com', password: 'student123', name: 'Lily Taylor' },
    { email: 'noah.anderson@example.com', password: 'student123', name: 'Noah Anderson' },
    { email: 'ava.thomas@example.com', password: 'student123', name: 'Ava Thomas' }
  ];
  
  // Insert admin users
  for (const admin of adminUsers) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [generateUUID(), admin.email, admin.password, 'admin', admin.name]
    );
  }
  
  // Insert mentor users
  for (const mentor of mentorUsers) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [generateUUID(), mentor.email, mentor.password, 'mentor', mentor.name]
    );
  }
  
  // Insert student users
  for (const student of studentUsers) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [generateUUID(), student.email, student.password, 'student', student.name]
    );
  }
  
  console.log(`Added ${adminUsers.length} admin users, ${mentorUsers.length} mentor users, and ${studentUsers.length} student users`);
}

// Insert sample data
async function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Get all users by role
  const students = await getAllRows(`SELECT id, name FROM users WHERE role = 'student'`);
  const mentors = await getAllRows(`SELECT id, name FROM users WHERE role = 'mentor'`);
  
  if (students.length === 0 || mentors.length === 0) {
    console.log('No students or mentors found, cannot add sample data');
    return;
  }
  
  console.log(`Found ${students.length} students and ${mentors.length} mentors`);
  
  // Insert companies and job posts
  await insertCompanies();
  await insertJobPosts();
  
  // Assign mentors to students
  await assignMentorsToStudents(mentors, students);
  
  // Add student activities
  await insertStudentActivities(students);
  
  // Add sessions (teaching activities)
  await insertSessions(students);
  
  // Add events
  await insertEvents();
  
  // Add verifications
  await insertVerifications(students, mentors);
  
  console.log('Sample data inserted successfully');
}

// Insert companies
async function insertCompanies() {
  console.log('Inserting companies...');
  
  const companies = [
    {
      name: 'Sunshine Elementary School',
      description: 'A vibrant elementary school focused on early childhood education',
      website: 'https://sunshine-elementary.edu',
      logo: 'sunshine_logo.png'
    },
    {
      name: 'Westfield High School',
      description: 'A leading high school with strong academic and extracurricular programs',
      website: 'https://westfield-hs.edu',
      logo: 'westfield_logo.png'
    },
    {
      name: 'Global Education Group',
      description: 'An international education company managing schools across multiple countries',
      website: 'https://globaledugroup.com',
      logo: 'global_edu_logo.png'
    },
    {
      name: 'TechLearn Academy',
      description: 'An innovative school specializing in STEM education',
      website: 'https://techlearn.edu',
      logo: 'techlearn_logo.png'
    },
    {
      name: 'Riverdale School District',
      description: 'A public school district serving multiple communities',
      website: 'https://riverdaledistrict.edu',
      logo: 'riverdale_logo.png'
    }
  ];
  
  for (const company of companies) {
    await runQuery(
      `INSERT INTO companies (id, name, description, website, logo)
       VALUES (?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        company.name,
        company.description,
        company.website,
        company.logo
      ]
    );
  }
  
  console.log(`Inserted ${companies.length} companies`);
}

// Insert job posts
async function insertJobPosts() {
  console.log('Inserting job posts...');
  
  // Get all companies
  const companies = await getAllRows('SELECT id, name FROM companies');
  
  if (companies.length === 0) {
    console.log('No companies found, skipping job post creation');
    return;
  }
  
  const jobPostsPerCompany = 2;
  const jobTypes = [
    { 
      title: 'Elementary School Teacher',
      description: 'Looking for passionate elementary school teachers to inspire young minds.',
      requirements: 'Bachelor\'s degree in Education, state teaching license, minimum 2 years experience.'
    },
    { 
      title: 'High School Math Teacher',
      description: 'Join our team to teach algebra, geometry, and calculus to high school students.',
      requirements: 'Bachelor\'s degree in Mathematics or Education, state teaching license, experience with advanced math curriculum.'
    },
    { 
      title: 'Special Education Teacher',
      description: 'Work with students with diverse learning needs in an inclusive environment.',
      requirements: 'Special Education certification, experience with IEPs, patient and adaptable teaching style.'
    },
    { 
      title: 'School Counselor',
      description: 'Guide students through academic and personal challenges with compassion and expertise.',
      requirements: 'Master\'s degree in School Counseling, state certification, excellent communication skills.'
    },
    { 
      title: 'Art Teacher',
      description: 'Inspire creativity and artistic expression in students of all ages.',
      requirements: 'Bachelor\'s degree in Art Education, portfolio of work, experience teaching multiple art forms.'
    },
    { 
      title: 'Physical Education Teacher',
      description: 'Promote health, fitness, and teamwork through engaging physical education programs.',
      requirements: 'Degree in Physical Education, CPR certification, experience coaching sports teams a plus.'
    },
    { 
      title: 'Music Teacher',
      description: 'Teach vocal and instrumental music to students and direct school performances.',
      requirements: 'Degree in Music Education, proficiency in multiple instruments, choral or band direction experience.'
    },
    { 
      title: 'Science Teacher',
      description: 'Bring science to life through hands-on experiments and engaging curriculum.',
      requirements: 'Degree in Science or Science Education, lab safety certification, innovative teaching methods.'
    },
    { 
      title: 'English Language Arts Teacher',
      description: 'Develop students\' reading, writing, and critical thinking skills.',
      requirements: 'English or Language Arts degree, strong writing skills, experience with diverse literature.'
    },
    { 
      title: 'Technology Integration Specialist',
      description: 'Support teachers in implementing technology in their classrooms effectively.',
      requirements: 'Education degree with technology focus, experience with educational software and hardware.'
    }
  ];
  
  // Random locations
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA'
  ];
  
  // Random salary ranges
  const salaryRanges = [
    '$45,000 - $55,000', '$50,000 - $60,000', '$55,000 - $65,000',
    '$60,000 - $70,000', '$65,000 - $75,000', '$70,000 - $80,000'
  ];
  
  // Random statuses
  const statuses = ['active', 'active', 'active', 'closed', 'draft']; // weighted towards active
  
  // Generate future dates for deadlines
  const generateFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };
  
  let jobCount = 0;
  
  // For each company
  for (const company of companies) {
    // Create 2 job posts per company
    for (let i = 0; i < jobPostsPerCompany; i++) {
      // Pick a random job type
      const jobIndex = Math.floor(Math.random() * jobTypes.length);
      const job = jobTypes[jobIndex];
      
      // Random location, salary range, and status
      const location = locations[Math.floor(Math.random() * locations.length)];
      const salaryRange = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random deadline 10-60 days in the future
      const deadline = generateFutureDate(10 + Math.floor(Math.random() * 50));
      
      await runQuery(
        `INSERT INTO job_posts (
          id, company_id, title, description, requirements, 
          salary_range, location, deadline, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          company.id,
          job.title,
          job.description,
          job.requirements,
          salaryRange,
          location,
          deadline,
          status
        ]
      );
      
      jobCount++;
    }
  }
  
  console.log(`Inserted ${jobCount} job posts`);
}

// Add messaging tables
async function addMessagingTables() {
  console.log('Adding messaging tables...');
  
  // Create messages table
  await runQuery(`
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
  `);
  
  // Create an index on sender_id and receiver_id to optimize message retrieval
  await runQuery(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
    ON messages(sender_id, receiver_id)
  `);
  
  // Create a separate index for unread messages
  await runQuery(`
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_read 
    ON messages(receiver_id, read)
  `);
  
  console.log('Messaging tables created successfully');
}

// Assign students to mentors (5 students per mentor)
async function assignMentorsToStudents(mentors, students) {
  console.log('Assigning students to mentors...');
  
  // First, clear existing mentor-student relationships
  await runQuery('DELETE FROM mentor_student');
  
  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    const studentsForMentor = [];
    
    // Assign 5 students to this mentor
    for (let j = 0; j < 5; j++) {
      // Get a student from the array using modulo to wrap around if needed
      const studentIndex = (i * 5 + j) % students.length;
      studentsForMentor.push(students[studentIndex]);
    }
    
    // Insert mentor-student relationships
    for (const student of studentsForMentor) {
      // Date between 1 and 90 days ago
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const assignedDate = new Date();
      assignedDate.setDate(assignedDate.getDate() - daysAgo);
      
      await runQuery(
        `INSERT INTO mentor_student (id, mentor_id, student_id, assigned_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          mentor.id,
          student.id,
          assignedDate.toISOString().split('T')[0],
          `${mentor.name} is mentoring ${student.name} for their placement.`
        ]
      );
    }
    
    console.log(`Assigned 5 students to mentor: ${mentor.name}`);
  }
}

// Insert student activities
async function insertStudentActivities(students) {
  console.log('Adding student activities...');
  
  // Sample activities
  const activities = [
    // Workshops
    { title: 'React.js Workshop', type: 'workshop', description: 'Participated in a workshop on building React components and understanding React hooks.' },
    { title: 'Python for Education', type: 'workshop', description: 'Attended workshop on using Python for educational tools and assessments.' },
    { title: 'Inclusive Teaching Practices', type: 'workshop', description: 'Workshop focused on creating inclusive classroom environments.' },
    { title: 'Digital Assessment Tools', type: 'workshop', description: 'Hands-on workshop exploring digital assessment tools for the classroom.' },
    { title: 'EdTech Implementation', type: 'workshop', description: 'Workshop on implementing technology in educational settings.' },
    
    // Projects
    { title: 'Lesson Plan Development', type: 'project', description: 'Created a series of lesson plans for primary science education.' },
    { title: 'Educational Game Design', type: 'project', description: 'Designed and developed an educational game for teaching mathematics.' },
    { title: 'Classroom Management System', type: 'project', description: 'Created a digital system for managing classroom activities and student progress.' },
    { title: 'Curriculum Development Project', type: 'project', description: 'Contributed to developing a new English curriculum for secondary education.' },
    { title: 'Learning Resource Creation', type: 'project', description: 'Created learning resources for students with diverse learning needs.' },
    
    // Internships
    { title: 'Primary School Teaching Practicum', type: 'internship', description: 'Completed teaching practicum at Lincoln Primary School.' },
    { title: 'Secondary School Teaching Activity', type: 'internship', description: 'Led a series of classes at Washington Secondary School.' },
    { title: 'Online Teaching Experience', type: 'internship', description: 'Conducted online teaching sessions for remote learners.' },
    { title: 'Special Education Experience', type: 'internship', description: 'Worked with special education students at Jefferson School.' },
    { title: 'ESL Teaching Experience', type: 'internship', description: 'Taught English as a Second Language to international students.' },
    
    // Certifications
    { title: 'First Aid Certification', type: 'certification', description: 'Obtained certification in First Aid and CPR for educators.' },
    { title: 'Digital Learning Certification', type: 'certification', description: 'Completed certification program in digital learning strategies.' },
    { title: 'Educational Psychology Certificate', type: 'certification', description: 'Obtained certificate in Educational Psychology fundamentals.' },
    { title: 'TEFL Certification', type: 'certification', description: 'Completed Teaching English as a Foreign Language certification.' },
    { title: 'Special Education Certification', type: 'certification', description: 'Certified in specialized teaching methods for special education.' },
    
    // Seminars
    { title: 'Modern Teaching Methods Seminar', type: 'seminar', description: 'Attended seminar on modern teaching methods and approaches.' },
    { title: 'Education Technology Seminar', type: 'seminar', description: 'Participated in seminar about latest educational technologies.' },
    { title: 'Student Assessment Seminar', type: 'seminar', description: 'Seminar focusing on effective student assessment techniques.' },
    { title: 'Classroom Diversity Seminar', type: 'seminar', description: 'Attended seminar on managing diverse classrooms and inclusive teaching.' },
    { title: 'Educational Leadership Seminar', type: 'seminar', description: 'Seminar on developing leadership skills in educational settings.' }
  ];
  
  // Statuses with distribution
  const statuses = [
    { value: 'pending', weight: 0.4 },   // 40% pending
    { value: 'approved', weight: 0.5 },  // 50% approved
    { value: 'rejected', weight: 0.1 }   // 10% rejected
  ];
  
  // Helper function to select a status based on weights
  function selectStatus() {
    const random = Math.random();
    let sum = 0;
    for (const status of statuses) {
      sum += status.weight;
      if (random < sum) {
        return status.value;
      }
    }
    return statuses[0].value; // Fallback to first status
  }
  
  // Insert activities for each student
  for (const student of students) {
    // Each student gets 4-8 random activities
    const numActivities = 4 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numActivities; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const status = selectStatus();
      
      // Date between 1 and 120 days ago
      const daysAgo = Math.floor(Math.random() * 120) + 1;
      const dateCompleted = new Date();
      dateCompleted.setDate(dateCompleted.getDate() - daysAgo);
      
      await runQuery(
        `INSERT INTO student_activities (id, student_id, title, description, activity_type, date_completed, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          generateUUID(),
          student.id,
          activity.title,
          activity.description,
          activity.type,
          dateCompleted.toISOString().split('T')[0],
          status
        ]
      );
    }
  }
  
  console.log(`Added activities for ${students.length} students`);
}

// Insert sessions (teaching activities)
async function insertSessions(students) {
  console.log('Adding teaching sessions...');
  
  const sessionTypes = ['classroom', 'online', 'one-on-one', 'group', 'other'];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'Art', 'Physical Education'];
  const ageGroups = ['Primary (5-11)', 'Secondary (11-16)', 'College (16-18)', 'University', 'Adult Education'];
  const sessionStatuses = ['planned', 'completed', 'cancelled'];
  
  // Number of sessions to create (about 3-5 per student)
  const totalSessions = students.length * (3 + Math.floor(Math.random() * 3));
  let sessionCount = 0;
  
  // Distribute sessions among students
  for (let i = 0; i < totalSessions; i++) {
    const studentIndex = i % students.length;
    const student = students[studentIndex];
    
    const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
    
    // Random status weighted towards completed
    const status = Math.random() < 0.6 ? 
                 'completed' : // 60% chance of completed
                 sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)]; // 40% chance of any status
    
    // Session dates - mixture of past and future
    let sessionDate;
    if (status === 'planned') {
      // Future date for planned sessions
      const daysAhead = Math.floor(Math.random() * 30) + 1;
      sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + daysAhead);
    } else {
      // Past date for completed or cancelled
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - daysAgo);
    }
    
    // Random duration between 30 and 120 minutes
    const duration = (Math.floor(Math.random() * 4) + 1) * 30;
    
    // Location based on type
    let location;
    if (type === 'online') {
      location = ['Zoom', 'Microsoft Teams', 'Google Meet'][Math.floor(Math.random() * 3)];
    } else if (type === 'classroom') {
      location = ['Room 101', 'Room 203', 'Lab 3', 'Auditorium', 'Gymnasium'][Math.floor(Math.random() * 5)];
    } else {
      location = ['School Library', 'Community Center', 'University Campus', 'Meeting Room 4'][Math.floor(Math.random() * 4)];
    }
    
    // Reflection and feedback only for completed sessions
    let reflection = null;
    let feedback = null;
    
    if (status === 'completed') {
      reflection = `I found this session to be ${['very effective', 'challenging but rewarding', 'a good learning experience', 'instructive', 'well received by students'][Math.floor(Math.random() * 5)]}. Next time I would ${['incorporate more group activities', 'allow more time for questions', 'prepare additional examples', 'use more visual aids', 'include a practical exercise'][Math.floor(Math.random() * 5)]}.`;
      
      feedback = `${['Good job! ', 'Well done. ', 'Excellent work! ', 'Nice effort. '][Math.floor(Math.random() * 4)]}${['Students were engaged', 'Clear explanations provided', 'Good classroom management', 'Effective use of resources', 'Well-structured lesson'][Math.floor(Math.random() * 5)]}. ${['Consider adding more interactive elements', 'Try to involve quieter students more', 'Could benefit from more real-world examples', 'Good pacing throughout', 'Excellent questioning techniques'][Math.floor(Math.random() * 5)]}.`;
    }
    
    const title = `${subject} ${['Lesson', 'Tutorial', 'Workshop', 'Lecture', 'Seminar'][Math.floor(Math.random() * 5)]} - ${['Introduction to', 'Advanced', 'Exploring', 'Fundamentals of', 'Practical'][Math.floor(Math.random() * 5)]} ${subject}`;
    
    await runQuery(
      `INSERT INTO sessions (
        id, student_id, title, description, date, duration, 
        location, session_type, learner_age_group, subject, objectives,
        reflection, feedback, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )`,
      [
        generateUUID(),
        student.id,
        title,
        `A ${duration}-minute ${type} session focusing on ${subject} concepts appropriate for ${ageGroup} learners.`,
        sessionDate.toISOString().split('T')[0],
        duration,
        location,
        type,
        ageGroup,
        subject,
        `Students will be able to demonstrate understanding of key ${subject} concepts through ${['discussion', 'practice exercises', 'project work', 'collaborative activities'][Math.floor(Math.random() * 4)]}.`,
        reflection,
        feedback,
        status
      ]
    );
    sessionCount++;
  }
  
  console.log(`Added ${sessionCount} teaching sessions`);
}

// Insert events
async function insertEvents() {
  console.log('Adding events...');
  
  const events = [
    {
      title: 'New Teacher Orientation',
      description: 'Orientation session for new teachers joining this semester',
      eventType: 'seminar',
      location: 'Main Conference Hall'
    },
    {
      title: 'Educational Technology Workshop',
      description: 'Learn about the latest educational technology tools and how to integrate them into your classroom',
      eventType: 'workshop',
      location: 'Computer Lab 3'
    },
    {
      title: 'Spring Education Career Fair',
      description: 'Connect with schools and educational institutions looking to hire teachers and staff',
      eventType: 'career_fair',
      location: 'University Gymnasium'
    },
    {
      title: 'Special Education Best Practices',
      description: 'Seminar on best practices for special education and inclusive classrooms',
      eventType: 'seminar',
      location: 'Room 205'
    },
    {
      title: 'Classroom Management Strategies',
      description: 'Workshop on effective classroom management techniques for all age groups',
      eventType: 'workshop',
      location: 'Multipurpose Room'
    },
    {
      title: 'Education Innovation Conference',
      description: 'Annual conference on innovations in teaching and learning',
      eventType: 'other',
      location: 'City Convention Center'
    },
    {
      title: 'Digital Assessment Tools Workshop',
      description: 'Hands-on workshop exploring digital assessment tools for the classroom',
      eventType: 'workshop',
      location: 'Tech Lab'
    },
    {
      title: 'Summer Teaching Opportunities Fair',
      description: 'Find summer teaching positions and programs',
      eventType: 'career_fair',
      location: 'School Cafeteria'
    }
  ];
  
  // Generate future and past dates for events
  const generateEventDate = () => {
    const date = new Date();
    // 50% chance of past event, 50% chance of future event
    if (Math.random() < 0.5) {
      // Past event (1-60 days ago)
      date.setDate(date.getDate() - (1 + Math.floor(Math.random() * 60)));
    } else {
      // Future event (1-60 days ahead)
      date.setDate(date.getDate() + (1 + Math.floor(Math.random() * 60)));
    }
    return date.toISOString().split('T')[0];
  };
  
  // Generate time strings (HH:MM)
  const generateTimeString = (startHour) => {
    return `${startHour.toString().padStart(2, '0')}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`;
  };
  
  for (const event of events) {
    const eventDate = generateEventDate();
    
    // Random start time between 8 AM and 5 PM
    const startHour = 8 + Math.floor(Math.random() * 10);
    const startTime = generateTimeString(startHour);
    
    // End time 1-4 hours after start
    const endHour = startHour + 1 + Math.floor(Math.random() * 4);
    const endTime = generateTimeString(Math.min(endHour, 22)); // Cap at 10 PM
    
    await runQuery(
      `INSERT INTO events (id, title, description, event_date, start_time, end_time, location, event_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        event.title,
        event.description,
        eventDate,
        startTime,
        endTime,
        event.location,
        event.eventType
      ]
    );
  }
  
  console.log(`Added ${events.length} events`);
}

// Insert verifications
async function insertVerifications(students, mentors) {
  console.log('Adding verification requests...');
  
  // Get activities and sessions to verify
  const activities = await getAllRows('SELECT id, student_id, title FROM student_activities LIMIT 20');
  const sessions = await getAllRows('SELECT id, student_id, title FROM sessions LIMIT 20');
  
  if (activities.length === 0 && sessions.length === 0) {
    console.log('No activities or sessions to verify, skipping verification creation');
    return;
  }
  
  let verificationCount = 0;
  const totalVerifications = 30; // Aim for 30 verification requests
  
  // Create verification requests
  for (let i = 0; i < totalVerifications; i++) {
    // Choose random type of item to verify
    const itemTypeRoll = Math.random();
    let itemType, itemId, studentId, title;
    
    if (itemTypeRoll < 0.5 && activities.length > 0) {
      // Verify an activity
      const activityIndex = i % activities.length;
      itemType = 'activity';
      itemId = activities[activityIndex].id;
      studentId = activities[activityIndex].student_id;
      title = activities[activityIndex].title;
    } else if (sessions.length > 0) {
      // Verify a session
      const sessionIndex = i % sessions.length;
      itemType = 'session';
      itemId = sessions[sessionIndex].id;
      studentId = sessions[sessionIndex].student_id;
      title = sessions[sessionIndex].title;
    } else {
      // Skip if we don't have items of this type
      continue;
    }
    
    // Find an assigned mentor for this student
    const assignedMentors = await getAllRows(
      `SELECT mentor_id FROM mentor_student WHERE student_id = ?`,
      [studentId]
    );
    
    let mentorId;
    if (assignedMentors.length === 0) {
      // Use any mentor if no assigned mentor is found
      const mentorIndex = i % mentors.length;
      mentorId = mentors[mentorIndex].id;
    } else {
      // Use an assigned mentor
      const assignedMentorIndex = Math.floor(Math.random() * assignedMentors.length);
      mentorId = assignedMentors[assignedMentorIndex].mentor_id;
    }
    
    // Random status with distribution: 40% pending, 40% approved, 20% rejected
    let status;
    const statusRoll = Math.random();
    if (statusRoll < 0.4) {
      status = 'pending';
    } else if (statusRoll < 0.8) {
      status = 'approved';
    } else {
      status = 'rejected';
    }
    
    // Random feedback based on status
    let feedback = null;
    if (status === 'approved') {
      feedback = [
        'Excellent work! All requirements met.',
        'Verified and approved. Well done!',
        'Meets all expectations. Approved.',
        'Good job. Happy to approve this.',
        'Verified with supporting evidence.'
      ][Math.floor(Math.random() * 5)];
    } else if (status === 'rejected') {
      feedback = [
        'Missing required documentation. Please resubmit with complete evidence.',
        'Information provided is insufficient. More details needed.',
        'Could not verify authenticity. Please provide original certificate.',
        'Requirements not met. Please review criteria and resubmit.',
        'Incomplete submission. Please add more supporting evidence.'
      ][Math.floor(Math.random() * 5)];
    }
    
    await runQuery(
      `INSERT INTO approvals (id, student_id, mentor_id, item_type, item_id, status, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        studentId,
        mentorId,
        itemType,
        itemId,
        status,
        feedback
      ]
    );
    verificationCount++;
  }
  
  console.log(`Added ${verificationCount} verification requests`);
}

// Run the setup function
setupDatabase(); 
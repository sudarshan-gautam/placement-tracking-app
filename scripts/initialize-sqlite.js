const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Connect to the SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  console.log('Removing existing database...');
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('SQLite connection successful');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Read SQLite schema
const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schema.split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

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

// Main function to initialize the database
async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables one by one
    await createTables();
    console.log('Schema created successfully');

    // Create additional tables needed by the application
    await createAdditionalTables();

    // Check if users already exist
    const existingUsers = await getAllRows('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log(`Found ${existingUsers[0].count} existing users, skipping user creation`);
    } else {
      // Insert sample users
      await insertSampleUsers();
    }
    
    // Insert additional sample data
    await insertSampleData();

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    db.close();
  }
}

// Create base tables
async function createTables() {
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
      item_type TEXT CHECK(item_type IN ('qualification', 'session', 'competency', 'application', 'other')) NOT NULL,
      item_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL
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
}

// Create additional tables needed by the application
async function createAdditionalTables() {
  console.log('Creating additional tables...');

  // Create student_activities table
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS student_activities (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        activity_type TEXT CHECK(activity_type IN ('workshop', 'project', 'internship', 'certification', 'seminar', 'other')) NOT NULL,
        date_completed TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        verified_by TEXT,
        verification_date TEXT,
        evidence_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('Created student_activities table');
    
    // Create trigger for student_activities
    await runQuery(`
      CREATE TRIGGER IF NOT EXISTS student_activities_updated_at AFTER UPDATE ON student_activities
      BEGIN
          UPDATE student_activities SET updated_at = datetime('now') WHERE id = NEW.id;
      END
    `);
  } catch (error) {
    console.error('Error creating student_activities table:', error);
  }

  // Create events table
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        event_type TEXT CHECK(event_type IN ('workshop', 'seminar', 'career_fair', 'interview', 'other')) NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('Created events table');
    
    // Create trigger for events
    await runQuery(`
      CREATE TRIGGER IF NOT EXISTS events_updated_at AFTER UPDATE ON events
      BEGIN
          UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
      END
    `);
  } catch (error) {
    console.error('Error creating events table:', error);
  }

  // Create mentor_student table for tracking mentor-student relationships if not exists
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS mentor_student (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        assigned_date TEXT DEFAULT (datetime('now')),
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(mentor_id, student_id)
      )
    `);
    console.log('Created mentor_student table');
    
    // Create trigger for mentor_student
    await runQuery(`
      CREATE TRIGGER IF NOT EXISTS mentor_student_updated_at AFTER UPDATE ON mentor_student
      BEGIN
          UPDATE mentor_student SET updated_at = datetime('now') WHERE id = NEW.id;
      END
    `);
  } catch (error) {
    console.error('Error creating mentor_student table:', error);
  }

  console.log('Additional tables created successfully');
}

// Insert sample users
async function insertSampleUsers() {
  console.log('Inserting sample users...');

  // Admin users
  const admins = [
    { name: 'Admin User', email: 'admin@gmail.com', password: 'admin123' },
    { name: 'Jane Admin', email: 'jane.admin@university.edu', password: 'password123' }
  ];

  // Mentor users
  const mentors = [
    { name: 'Mentor User', email: 'mentor@gmail.com', password: 'mentor123' },
    { name: 'John Mentor', email: 'john.mentor@university.edu', password: 'password123' },
    { name: 'Sarah Smith', email: 'sarah.smith@university.edu', password: 'password123' },
    { name: 'Michael Taylor', email: 'michael.taylor@university.edu', password: 'password123' },
    { name: 'David Wilson', email: 'david.wilson@university.edu', password: 'password123' }
  ];

  // Student users
  const students = [
    { name: 'Student User', email: 'student@gmail.com', password: 'student123' },
    { name: 'Emma Johnson', email: 'emma.johnson@students.edu', password: 'password123' },
    { name: 'Noah Williams', email: 'noah.williams@students.edu', password: 'password123' },
    { name: 'Olivia Brown', email: 'olivia.brown@students.edu', password: 'password123' },
    { name: 'Liam Jones', email: 'liam.jones@students.edu', password: 'password123' },
    { name: 'Ava Miller', email: 'ava.miller@students.edu', password: 'password123' },
    { name: 'Sophia Davis', email: 'sophia.davis@students.edu', password: 'password123' },
    { name: 'Jackson Garcia', email: 'jackson.garcia@students.edu', password: 'password123' },
    { name: 'Isabella Rodriguez', email: 'isabella.rodriguez@students.edu', password: 'password123' },
    { name: 'Aiden Martinez', email: 'aiden.martinez@students.edu', password: 'password123' },
    { name: 'Mia Wilson', email: 'mia.wilson@students.edu', password: 'password123' },
    { name: 'Lucas Anderson', email: 'lucas.anderson@students.edu', password: 'password123' },
    { name: 'Charlotte Thomas', email: 'charlotte.thomas@students.edu', password: 'password123' }
  ];

  // Insert admins
  for (const admin of admins) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)`,
      [generateUUID(), admin.email, admin.password, 'admin', admin.name]
    );
  }

  // Insert mentors
  for (const mentor of mentors) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)`,
      [generateUUID(), mentor.email, mentor.password, 'mentor', mentor.name]
    );
  }

  // Insert students
  for (const student of students) {
    await runQuery(
      `INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)`,
      [generateUUID(), student.email, student.password, 'student', student.name]
    );
  }

  console.log(`Inserted ${admins.length} admins, ${mentors.length} mentors, and ${students.length} students`);
}

// Insert various sample data
async function insertSampleData() {
  console.log('Inserting sample data...');
  
  const students = await getAllRows(`SELECT id, name FROM users WHERE role = 'student'`);
  const mentors = await getAllRows(`SELECT id, name FROM users WHERE role = 'mentor'`);
  
  if (students.length === 0 || mentors.length === 0) {
    console.log('No students or mentors found, skipping sample data insertion');
    return;
  }

  console.log(`Found ${students.length} students and ${mentors.length} mentors`);

  // Insert companies
  await insertCompanies();
  
  // Insert job posts
  await insertJobPosts();

  // Assign mentors to students
  await assignMentorsToStudents(mentors, students);
  
  // Insert student activities
  await insertStudentActivities(students);
  
  // Insert events
  await insertEvents();

  // Insert sessions (now considered activities)
  await insertSessions(students);

  console.log('All sample data inserted successfully');
}

// Insert companies
async function insertCompanies() {
  console.log('Inserting sample companies...');
  
  const companies = [
    { name: 'Tech Solutions Inc.', description: 'A leading technology company', website: 'https://techsolutions.example.com', logo: '/images/companies/tech-solutions.png' },
    { name: 'Global Innovations', description: 'Pioneering innovative solutions for global markets', website: 'https://globalinnovations.example.com', logo: '/images/companies/global-innovations.png' },
    { name: 'Future Systems', description: 'Building the systems of tomorrow', website: 'https://futuresystems.example.com', logo: '/images/companies/future-systems.png' },
    { name: 'Creative Digital', description: 'Digital solutions with a creative twist', website: 'https://creativedigital.example.com', logo: '/images/companies/creative-digital.png' },
    { name: 'Advance Education', description: 'Advancing education through technology', website: 'https://advanceeducation.example.com', logo: '/images/companies/advance-education.png' }
  ];
  
  for (const company of companies) {
    await runQuery(
      `INSERT INTO companies (id, name, description, website, logo) VALUES (?, ?, ?, ?, ?)`,
      [generateUUID(), company.name, company.description, company.website, company.logo]
    );
  }
  
  console.log(`Inserted ${companies.length} companies`);
}

// Insert job posts
async function insertJobPosts() {
  console.log('Inserting sample job posts...');
  
  const companies = await getAllRows(`SELECT id, name FROM companies`);
  
  if (companies.length === 0) {
    console.log('No companies found, skipping job posts insertion');
    return;
  }
  
  const jobTitles = [
    'Software Developer',
    'Data Analyst',
    'UX Designer',
    'Project Manager',
    'Systems Architect',
    'QA Engineer',
    'DevOps Specialist',
    'Front-end Developer',
    'Back-end Developer',
    'Full-stack Developer',
    'Mobile App Developer',
    'Database Administrator',
    'Network Engineer',
    'IT Support Specialist',
    'Cybersecurity Analyst'
  ];
  
  const locations = [
    'Remote',
    'New York, NY',
    'San Francisco, CA',
    'London, UK',
    'Toronto, Canada',
    'Sydney, Australia',
    'Berlin, Germany',
    'Singapore',
    'Hybrid - London/Remote',
    'Hybrid - New York/Remote'
  ];
  
  const salaryRanges = [
    '$50,000 - $70,000',
    '$70,000 - $90,000',
    '$90,000 - $110,000',
    '$110,000 - $130,000',
    '$130,000 - $150,000',
    '$150,000+',
    'Competitive',
    'Negotiable based on experience'
  ];
  
  const statuses = ['active', 'closed', 'draft'];
  
  for (let i = 0; i < 20; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const description = `This is a fantastic opportunity to join ${company.name} as a ${title}. You will be working on cutting-edge projects in a collaborative environment.`;
    const requirements = 'Bachelor\'s degree in Computer Science or related field. 3+ years of relevant experience. Strong problem-solving skills.';
    const location = locations[Math.floor(Math.random() * locations.length)];
    const salaryRange = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
    
    // Random deadline between now and 60 days in the future
    const daysAhead = Math.floor(Math.random() * 60) + 1;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysAhead);
    
    // Mostly active jobs
    const status = Math.random() < 0.7 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];
    
    await runQuery(
      `INSERT INTO job_posts (id, company_id, title, description, requirements, salary_range, location, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        company.id,
        title,
        description,
        requirements,
        salaryRange,
        location,
        deadline.toISOString().split('T')[0],
        status
      ]
    );
  }
  
  console.log('Inserted 20 job posts');
}

// Assign mentors to students
async function assignMentorsToStudents(mentors, students) {
  console.log('Assigning mentors to students...');
  
  // Each mentor gets approximately the same number of students
  const studentsPerMentor = Math.ceil(students.length / mentors.length);
  
  for (let i = 0; i < mentors.length; i++) {
    const mentor = mentors[i];
    const startIndex = i * studentsPerMentor;
    const endIndex = Math.min(startIndex + studentsPerMentor, students.length);
    
    // This mentor's students
    const mentorStudents = students.slice(startIndex, endIndex);
    
    for (const student of mentorStudents) {
      // Start date between 30 and 180 days ago
      const daysAgo = Math.floor(Math.random() * 150) + 30;
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
          `${mentor.name} was assigned to ${student.name} as part of the placement program.`
        ]
      );
    }
    
    console.log(`Assigned ${mentorStudents.length} students to mentor: ${mentor.name}`);
  }
}

// Insert student activities
async function insertStudentActivities(students) {
  console.log('Inserting student activities...');
  
  // Sample activities
  const activities = [
    { title: 'Web Development Workshop', type: 'workshop', description: 'Attended a workshop on React.js' },
    { title: 'Database Design Project', type: 'project', description: 'Created a database schema for a retail application' },
    { title: 'Summer Internship at Tech Co', type: 'internship', description: 'Completed a 3-month internship' },
    { title: 'AWS Cloud Practitioner', type: 'certification', description: 'Obtained AWS certification' },
    { title: 'Career Development Seminar', type: 'seminar', description: 'Attended a seminar on job search strategies' },
    { title: 'Python Programming Course', type: 'certification', description: 'Completed advanced Python course' },
    { title: 'UI/UX Design Workshop', type: 'workshop', description: 'Learned principles of user interface design' },
    { title: 'Data Science Bootcamp', type: 'certification', description: 'Intensive 2-week data science program' },
    { title: 'Web Accessibility Conference', type: 'seminar', description: 'Conference on making web content accessible' },
    { title: 'Mobile App Development Project', type: 'project', description: 'Created a cross-platform mobile application' }
  ];
  
  // Insert activities for each student
  for (const student of students) {
    // Each student gets 2-5 random activities
    const numActivities = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numActivities; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
      const daysAgo = Math.floor(Math.random() * 90);
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
  
  console.log(`Inserted activities for ${students.length} students`);
}

// Insert events
async function insertEvents() {
  console.log('Inserting sample events...');
  
  const events = [
    { title: 'Resume Building Workshop', type: 'workshop', description: 'Learn how to create an effective resume' },
    { title: 'Industry Expert Talk', type: 'seminar', description: 'Talk by leading industry professionals' },
    { title: 'Campus Recruitment Drive', type: 'career_fair', description: 'Major companies hiring for various positions' },
    { title: 'Interview Preparation Session', type: 'workshop', description: 'Mock interviews and feedback' },
    { title: 'Networking Event', type: 'other', description: 'Connect with industry professionals' },
    { title: 'Tech Talk: AI and Machine Learning', type: 'seminar', description: 'Exploring the latest trends in AI' },
    { title: 'Job Search Strategies Workshop', type: 'workshop', description: 'Effective strategies for job hunting' },
    { title: 'Annual Career Fair', type: 'career_fair', description: 'Over 50 employers attending' }
  ];
  
  for (const event of events) {
    // Random date in the next 60 days
    const daysAhead = Math.floor(Math.random() * 60);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysAhead);
    
    // Random start time between 9 AM and 3 PM
    const hour = 9 + Math.floor(Math.random() * 6);
    const startTime = `${hour}:00`;
    const endTime = `${hour + 2}:00`;
    
    await runQuery(
      `INSERT INTO events (id, title, description, event_date, start_time, end_time, location, event_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUUID(),
        event.title,
        event.description,
        eventDate.toISOString().split('T')[0],
        startTime,
        endTime,
        'Campus Auditorium',
        event.type
      ]
    );
  }
  
  console.log(`Inserted ${events.length} events`);
}

// Insert teaching sessions
async function insertSessions(students) {
  console.log('Inserting teaching sessions...');
  
  const sessionTypes = ['classroom', 'online', 'one-on-one', 'group', 'other'];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science', 'Art', 'Physical Education'];
  const ageGroups = ['Primary (5-11)', 'Secondary (11-16)', 'College (16-18)', 'University', 'Adult Education'];
  const sessionStatuses = ['planned', 'completed', 'cancelled'];
  
  let sessionCount = 0;
  
  for (const student of students) {
    // 2-5 sessions per student
    const sessionsCount = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < sessionsCount; i++) {
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
  }
  
  console.log(`Inserted ${sessionCount} teaching sessions`);
}

// Run the initialization
initializeDatabase().catch(console.error); 
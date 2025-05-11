const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function addQualificationsTable() {
  try {
    console.log('Starting migration: adding qualifications table...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Check if the qualifications table already exists
    const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='qualifications'");
    
    if (!tableCheck) {
      console.log('Creating qualifications table...');
      await db.run(`
        CREATE TABLE qualifications (
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
      
      // Create a trigger to automatically update the updated_at timestamp
      await db.run(`
        CREATE TRIGGER IF NOT EXISTS qualifications_updated_at AFTER UPDATE ON qualifications
        BEGIN
          UPDATE qualifications SET updated_at = datetime('now') WHERE id = NEW.id;
        END;
      `);
      
      console.log('Successfully created qualifications table');
    } else {
      console.log('Qualifications table already exists, skipping creation');
    }
    
    // Check if qualifications table is empty
    const qualificationCount = await db.get("SELECT COUNT(*) as count FROM qualifications");
    
    if (qualificationCount && qualificationCount.count === 0) {
      console.log('Qualifications table is empty, adding sample data');
      
      // Add sample qualifications data
      await addSampleQualifications(db);
    } else if (qualificationCount && qualificationCount.count < 5) {
      console.log('Qualifications table has limited data, adding more sample data');
      
      // First clear existing data
      await db.run("DELETE FROM qualifications");
      
      // Add fresh sample data
      await addSampleQualifications(db);
    } else {
      console.log('Qualifications table already has data, skipping sample data insertion');
    }
    
    // Add qualifications table to the allowed tables list in init-database.js
    console.log('Updating init-database.js to include qualifications table in allowed tables list...');
    
    await db.close();
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

async function addSampleQualifications(db) {
  console.log('Adding sample qualifications data...');
  
  // Get all students and mentors
  const students = await db.all("SELECT id FROM users WHERE role = 'student' ORDER BY id LIMIT 8");
  const mentors = await db.all("SELECT id FROM users WHERE role = 'mentor' LIMIT 5");
  
  if (students.length === 0) {
    console.log('No students found, skipping sample qualifications');
    return;
  }
  
  if (mentors.length === 0) {
    console.log('No mentors found, verification data will be incomplete');
  }
  
  const mentor1Id = mentors.length > 0 ? mentors[0].id : null;
  const mentor2Id = mentors.length > 1 ? mentors[1].id : mentor1Id;
  
  // First student (multiple qualifications with different statuses)
  if (students.length > 0) {
    console.log(`Adding qualifications for student 1: ${students[0].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Bachelor of Education', 'University of Education', 
       'Bachelor degree in primary education with specialization in early childhood development. Graduated with honors.', 
       '2020-06-15', NULL, '/certificates/sample1.pdf', 
       'degree', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'First Aid Certificate', 'Red Cross', 
       'Basic first aid training covering emergency response, CPR, and wound management', 
       '2022-03-10', '2024-03-10', '/certificates/sample2.pdf', 
       'certificate', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Teaching English as a Foreign Language', 'TEFL Academy', 
       'TEFL Certification Course - 120 hour comprehensive training in teaching English to non-native speakers', 
       '2021-09-20', NULL, '/certificates/sample3.pdf', 
       'certificate', 'pending', NULL),
       
      (lower(hex(randomblob(16))), ?, 'Classroom Management Masterclass', 'Education Excellence Institute', 
       'Advanced strategies for effective classroom management and creating a positive learning environment', 
       '2022-11-05', NULL, '/certificates/sample4.pdf', 
       'course', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Special Education Teaching License', 'State Board of Education', 
       'License to teach special education in primary and secondary schools with focus on learning disabilities', 
       '2021-04-18', '2026-04-18', '/certificates/sample5.pdf', 
       'license', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Digital Learning Tools Certificate', 'EdTech Solutions', 
       'Training in implementing digital tools and technologies in the classroom to enhance student engagement', 
       '2023-01-22', NULL, '/certificates/sample6.pdf', 
       'certificate', 'rejected', ?),
       
      (lower(hex(randomblob(16))), ?, 'Mental Health First Aid', 'National Mental Health Association', 
       'Training to identify, understand and respond to signs of mental health issues and substance use disorders', 
       '2022-07-30', '2024-07-30', NULL, 
       'certificate', 'pending', NULL),
       
      (lower(hex(randomblob(16))), ?, 'Master of Science in Educational Psychology', 'State University', 
       'Advanced degree focusing on learning processes, educational interventions, and assessment methods', 
       '2023-05-15', NULL, NULL, 
       'degree', 'pending', NULL)
    `, 
    students[0].id, mentor1Id,
    students[0].id, mentor1Id,
    students[0].id,
    students[0].id, mentor1Id,
    students[0].id, mentor1Id,
    students[0].id, mentor2Id,
    students[0].id,
    students[0].id);
  }
  
  // Second student
  if (students.length > 1) {
    console.log(`Adding qualifications for student 2: ${students[1].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Bachelor of Arts in Education', 'National University', 
       'Undergraduate degree in education with focus on secondary education and literature', 
       '2019-05-20', NULL, '/certificates/sample7.pdf', 
       'degree', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Google Certified Educator', 'Google for Education', 
       'Level 1 certification for implementing Google tools in the classroom effectively', 
       '2022-06-12', '2024-06-12', '/certificates/sample8.pdf', 
       'certificate', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Positive Behavior Intervention Training', 'Behavioral Institute', 
       'Strategies for promoting positive behavior and managing challenging behaviors in the classroom', 
       '2023-03-15', NULL, NULL, 
       'course', 'pending', NULL)
    `, 
    students[1].id, mentor1Id,
    students[1].id, mentor1Id,
    students[1].id);
  }
  
  // Third student
  if (students.length > 2) {
    console.log(`Adding qualifications for student 3: ${students[2].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Mathematics Teaching Certificate', 'Mathematics Education Board', 
       'Specialized certification for teaching advanced mathematics in secondary education', 
       '2021-08-10', NULL, '/certificates/sample9.pdf', 
       'certificate', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Child Development Associate', 'Council for Professional Recognition', 
       'Credential focusing on early childhood education and development milestones', 
       '2022-11-30', '2025-11-30', '/certificates/sample10.pdf', 
       'license', 'rejected', ?),
       
      (lower(hex(randomblob(16))), ?, 'Educational Leadership Workshop', 'Leadership Academy', 
       'Professional development in educational leadership and school administration', 
       '2023-01-25', NULL, NULL, 
       'course', 'pending', NULL)
    `, 
    students[2].id, mentor2Id,
    students[2].id, mentor2Id,
    students[2].id);
  }
  
  // Fourth student
  if (students.length > 3) {
    console.log(`Adding qualifications for student 4: ${students[3].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Special Needs Education Certificate', 'Special Education Institute', 
       'Advanced training in supporting students with special educational needs and disabilities', 
       '2022-02-15', '2025-02-15', '/certificates/sample11.pdf', 
       'certificate', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Master of Arts in Curriculum Development', 'Education University', 
       'Graduate degree focusing on curriculum design and educational program development', 
       '2021-06-30', NULL, '/certificates/sample12.pdf', 
       'degree', 'pending', NULL)
    `, 
    students[3].id, mentor2Id,
    students[3].id);
  }
  
  // Fifth student
  if (students.length > 4) {
    console.log(`Adding qualifications for student 5: ${students[4].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Language Teaching Certification', 'International Language Institute', 
       'Certification for teaching multiple languages in educational settings with modern methodologies', 
       '2020-11-12', '2023-11-12', '/certificates/sample13.pdf', 
       'certificate', 'rejected', ?),
       
      (lower(hex(randomblob(16))), ?, 'Educational Technology Certificate', 'Digital Learning Academy', 
       'Certification in implementing and managing educational technology in classroom settings', 
       '2021-09-05', NULL, NULL, 
       'certificate', 'pending', NULL)
    `, 
    students[4].id, mentor1Id,
    students[4].id);
  }
  
  // Sixth student
  if (students.length > 5) {
    console.log(`Adding qualifications for student 6: ${students[5].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Doctorate in Educational Leadership', 'National Education University', 
       'PhD focused on educational policy, leadership, and organizational change in educational institutions', 
       '2022-12-15', NULL, '/certificates/sample14.pdf', 
       'degree', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Arts Integration in Education', 'Creative Education Foundation', 
       'Training on incorporating arts and creative expression into standard curriculum', 
       '2023-02-25', NULL, NULL, 
       'course', 'pending', NULL)
    `, 
    students[5].id, mentor2Id,
    students[5].id);
  }
  
  // Seventh student
  if (students.length > 6) {
    console.log(`Adding qualifications for student 7: ${students[6].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Physical Education Certificate', 'Sports Education Academy', 
       'Certification for teaching physical education and organizing sports programs in schools', 
       '2021-04-10', '2024-04-10', '/certificates/sample15.pdf', 
       'certificate', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Early Childhood Development', 'Child Development Institute', 
       'Specialized training in early childhood education and developmental psychology', 
       '2022-08-22', NULL, '/certificates/sample16.pdf', 
       'course', 'rejected', ?)
    `, 
    students[6].id, mentor1Id,
    students[6].id, mentor2Id);
  }
  
  // Eighth student
  if (students.length > 7) {
    console.log(`Adding qualifications for student 8: ${students[7].id}`);
    await db.run(`
      INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description, 
        date_obtained, expiry_date, certificate_url, type, verification_status, verified_by
      )
      VALUES 
      (lower(hex(randomblob(16))), ?, 'Master of Education in School Counseling', 'Counseling University', 
       'Graduate degree preparing educational professionals for school counseling roles', 
       '2020-05-18', NULL, '/certificates/sample17.pdf', 
       'degree', 'verified', ?),
       
      (lower(hex(randomblob(16))), ?, 'Dyslexia Teaching Specialist', 'Reading Education Center', 
       'Specialized training for teaching students with dyslexia and other reading difficulties', 
       '2021-10-08', '2024-10-08', '/certificates/sample18.pdf', 
       'license', 'pending', NULL)
    `, 
    students[7].id, mentor1Id,
    students[7].id);
  }
  
  console.log('Added sample qualifications for students');
}

// Run the migration
addQualificationsTable(); 
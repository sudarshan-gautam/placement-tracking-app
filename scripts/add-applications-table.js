const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Connect to the SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('SQLite connection successful');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create applications table if it doesn't exist
db.run(`
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
`, (err) => {
  if (err) {
    console.error('Error creating applications table:', err.message);
    return;
  }
  console.log('Applications table created successfully');
  
  // Create an index on student_id to optimize student-based queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_applications_student 
    ON applications(student_id)
  `, (err) => {
    if (err) {
      console.error('Error creating application student index:', err.message);
    } else {
      console.log('Application student index created successfully');
    }
    
    // Create an index on job_post_id
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_applications_job 
      ON applications(job_post_id)
    `, (err) => {
      if (err) {
        console.error('Error creating application job index:', err.message);
      } else {
        console.log('Application job index created successfully');
      }
      
      // Create an index on status for filtering
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_applications_status 
        ON applications(status)
      `, (err) => {
        if (err) {
          console.error('Error creating application status index:', err.message);
        } else {
          console.log('Application status index created successfully');
        }
        
        // Check if we need to add sample data
        db.get('SELECT COUNT(*) as count FROM applications', (err, result) => {
          if (err) {
            console.error('Error checking applications count:', err.message);
            db.close();
            return;
          }
          
          if (result.count === 0) {
            console.log('No applications found, adding sample data...');
            addSampleApplications();
          } else {
            console.log(`Found ${result.count} existing applications, no sample data needed`);
            db.close();
          }
        });
      });
    });
  });
});

// Function to add sample applications
function addSampleApplications() {
  // First, get some students
  db.all('SELECT id FROM users WHERE role = "student" LIMIT 5', (err, students) => {
    if (err || !students || students.length === 0) {
      console.error('Error or no students found:', err?.message || 'No students found');
      db.close();
      return;
    }
    
    // Then, get some job posts
    db.all('SELECT id FROM job_posts LIMIT 5', (err, jobs) => {
      if (err || !jobs || jobs.length === 0) {
        console.error('Error or no job posts found:', err?.message || 'No job posts found');
        
        // If no job posts, create a sample job post
        if (!jobs || jobs.length === 0) {
          createSampleJobPost((jobId) => {
            if (jobId) {
              insertApplicationsForStudents(students, [{ id: jobId }]);
            } else {
              db.close();
            }
          });
        } else {
          db.close();
        }
        return;
      }
      
      insertApplicationsForStudents(students, jobs);
    });
  });
}

// Function to create a sample job post if none exists
function createSampleJobPost(callback) {
  // First check if companies table exists and has entries
  db.get('SELECT COUNT(*) as count FROM companies', (err, result) => {
    if (err) {
      console.error('Error checking companies:', err.message);
      callback(null);
      return;
    }
    
    // If no companies, create one
    if (result.count === 0) {
      const companyId = uuidv4();
      db.run(`
        INSERT INTO companies (id, name, description, website)
        VALUES (?, ?, ?, ?)
      `, [companyId, 'Sample Company', 'A sample company for testing', 'https://example.com'], (err) => {
        if (err) {
          console.error('Error creating sample company:', err.message);
          callback(null);
          return;
        }
        
        createJobWithCompany(companyId, callback);
      });
    } else {
      // Get an existing company
      db.get('SELECT id FROM companies LIMIT 1', (err, company) => {
        if (err || !company) {
          console.error('Error getting company:', err?.message || 'No company found');
          callback(null);
          return;
        }
        
        createJobWithCompany(company.id, callback);
      });
    }
  });
}

// Helper to create job with a company ID
function createJobWithCompany(companyId, callback) {
  const jobId = uuidv4();
  db.run(`
    INSERT INTO job_posts (id, company_id, title, description, requirements, location, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    jobId, 
    companyId, 
    'Software Developer Intern', 
    'Entry-level software development internship position',
    'JavaScript, React, Node.js experience',
    'London',
    'active'
  ], (err) => {
    if (err) {
      console.error('Error creating sample job post:', err.message);
      callback(null);
    } else {
      console.log('Created sample job post');
      callback(jobId);
    }
  });
}

// Function to insert applications for students
function insertApplicationsForStudents(students, jobs) {
  const statuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
  let completed = 0;
  let total = 0;
  
  // For each student, create 1-3 random applications
  students.forEach(student => {
    const numApplications = Math.floor(Math.random() * 3) + 1;
    total += numApplications;
    
    for (let i = 0; i < numApplications; i++) {
      const jobIndex = Math.floor(Math.random() * jobs.length);
      const statusIndex = Math.floor(Math.random() * statuses.length);
      
      const applicationId = uuidv4();
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
      
      db.run(`
        INSERT INTO applications (
          id, job_post_id, student_id, status, resume_url, cover_letter, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime(?), datetime(?))
      `, [
        applicationId,
        jobs[jobIndex].id,
        student.id,
        statuses[statusIndex],
        'https://example.com/resume.pdf',
        'I am very interested in this position and believe my skills align well with the requirements.',
        createdDate.toISOString(),
        createdDate.toISOString()
      ], (err) => {
        if (err) {
          console.error('Error inserting application:', err.message);
        } else {
          console.log(`Inserted application ${applicationId} for student ${student.id}`);
        }
        
        completed++;
        if (completed === total) {
          console.log(`Completed inserting ${total} applications`);
          db.close();
        }
      });
    }
  });
} 
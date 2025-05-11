/**
 * Migration: Add Verification Tables
 * This script creates tables for sessions, activities, competencies, and their verification tables
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Connect to the database
const db = new sqlite3.Database(
  path.join(__dirname, '..', 'database.sqlite'),
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error('Failed to connect to the database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the database');
  }
);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) {
    console.error('Failed to enable foreign keys:', err.message);
    process.exit(1);
  }
});

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    // Create sessions table if it doesn't exist
    db.run(`
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
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Create trigger for sessions updated_at
      db.run(`
        CREATE TRIGGER IF NOT EXISTS sessions_updated_at AFTER UPDATE ON sessions
        BEGIN
          UPDATE sessions SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create activities table if it doesn't exist
        db.run(`
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
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Create trigger for activities updated_at
          db.run(`
            CREATE TRIGGER IF NOT EXISTS activities_updated_at AFTER UPDATE ON activities
            BEGIN
              UPDATE activities SET updated_at = datetime('now') WHERE id = NEW.id;
            END
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Create competencies table if it doesn't exist
            db.run(`
              CREATE TABLE IF NOT EXISTS competencies (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
              )
            `, (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              // Create trigger for competencies updated_at
              db.run(`
                CREATE TRIGGER IF NOT EXISTS competencies_updated_at AFTER UPDATE ON competencies
                BEGIN
                  UPDATE competencies SET updated_at = datetime('now') WHERE id = NEW.id;
                END
              `, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Create student_competencies table for competency claims
                db.run(`
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
                `, (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  
                  // Create trigger for student_competencies updated_at
                  db.run(`
                    CREATE TRIGGER IF NOT EXISTS student_competencies_updated_at AFTER UPDATE ON student_competencies
                    BEGIN
                      UPDATE student_competencies SET updated_at = datetime('now') WHERE id = NEW.id;
                    END
                  `, (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }

                    // Create session_verifications table
                    db.run(`
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
                    `, (err) => {
                      if (err) {
                        reject(err);
                        return;
                      }
                      
                      // Create trigger for session_verifications updated_at
                      db.run(`
                        CREATE TRIGGER IF NOT EXISTS session_verifications_updated_at AFTER UPDATE ON session_verifications
                        BEGIN
                          UPDATE session_verifications SET updated_at = datetime('now') WHERE id = NEW.id;
                        END
                      `, (err) => {
                        if (err) {
                          reject(err);
                          return;
                        }

                        // Create activity_verifications table
                        db.run(`
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
                        `, (err) => {
                          if (err) {
                            reject(err);
                            return;
                          }
                          
                          // Create trigger for activity_verifications updated_at
                          db.run(`
                            CREATE TRIGGER IF NOT EXISTS activity_verifications_updated_at AFTER UPDATE ON activity_verifications
                            BEGIN
                              UPDATE activity_verifications SET updated_at = datetime('now') WHERE id = NEW.id;
                            END
                          `, (err) => {
                            if (err) {
                              reject(err);
                              return;
                            }

                            // Create competency_verifications table
                            db.run(`
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
                            `, (err) => {
                              if (err) {
                                reject(err);
                                return;
                              }
                              
                              // Create trigger for competency_verifications updated_at
                              db.run(`
                                CREATE TRIGGER IF NOT EXISTS competency_verifications_updated_at AFTER UPDATE ON competency_verifications
                                BEGIN
                                  UPDATE competency_verifications SET updated_at = datetime('now') WHERE id = NEW.id;
                                END
                              `, (err) => {
                                if (err) {
                                  reject(err);
                                  return;
                                }

                                // Create profile_verifications table
                                db.run(`
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
                                `, (err) => {
                                  if (err) {
                                    reject(err);
                                    return;
                                  }
                                  
                                  // Create trigger for profile_verifications updated_at
                                  db.run(`
                                    CREATE TRIGGER IF NOT EXISTS profile_verifications_updated_at AFTER UPDATE ON profile_verifications
                                    BEGIN
                                      UPDATE profile_verifications SET updated_at = datetime('now') WHERE id = NEW.id;
                                    END
                                  `, (err) => {
                                    if (err) {
                                      reject(err);
                                      return;
                                    }
                                    
                                    resolve();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Insert sample data
const insertSampleData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get student and mentor IDs from the existing users table
      const getUsers = () => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT id, name, role FROM users`,
            (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              
              const students = rows.filter(row => row.role === 'student');
              const mentors = rows.filter(row => row.role === 'mentor');
              const admins = rows.filter(row => row.role === 'admin');
              
              if (students.length === 0 || mentors.length === 0) {
                console.warn('No students or mentors found in the database. Sample data will not be inserted.');
                resolve({ students: [], mentors: [], admins: [] });
                return;
              }
              
              resolve({ students, mentors, admins });
            }
          );
        });
      };
      
      const { students, mentors, admins } = await getUsers();
      
      if (students.length === 0 || mentors.length === 0) {
        resolve();
        return;
      }
      
      console.log(`Found ${students.length} students and ${mentors.length} mentors for sample data`);
      
      // Insert sample competencies
      const competencies = [
        { id: uuidv4(), name: 'Curriculum Design', category: 'Education', description: 'Ability to design comprehensive curricula aligned with educational standards' },
        { id: uuidv4(), name: 'Classroom Management', category: 'Education', description: 'Skills in managing student behavior and creating a positive learning environment' },
        { id: uuidv4(), name: 'Assessment Design', category: 'Education', description: 'Creating valid and reliable assessment tools to measure student learning' },
        { id: uuidv4(), name: 'Technology Integration', category: 'Technology', description: 'Incorporating digital tools and platforms into educational experiences' },
        { id: uuidv4(), name: 'Collaborative Teaching', category: 'Professional Skills', description: 'Working effectively with other educators to enhance student learning' }
      ];
      
      for (const competency of competencies) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR IGNORE INTO competencies (id, name, category, description) VALUES (?, ?, ?, ?)`,
            [competency.id, competency.name, competency.category, competency.description],
            (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            }
          );
        });
      }
      
      console.log('Inserted sample competencies');
      
      // For each student, create sample data
      for (const student of students.slice(0, 2)) { // Limit to first 2 students for sample data
        // Create sample sessions
        const sessions = [
          { 
            id: uuidv4(), 
            title: 'Initial Mentoring Session', 
            description: 'Get to know session with mentor to discuss goals and expectations',
            date: '2023-10-10',
            start_time: '10:00',
            end_time: '11:00',
            status: 'completed'
          },
          { 
            id: uuidv4(), 
            title: 'Mid-term Progress Review', 
            description: 'Review progress and adjust goals as needed',
            date: '2023-11-15',
            start_time: '14:00',
            end_time: '15:00',
            status: 'completed'
          },
          { 
            id: uuidv4(), 
            title: 'Final Term Planning', 
            description: 'Plan for the final term and discuss placement opportunities',
            date: '2024-01-05',
            start_time: '09:30',
            end_time: '10:30',
            status: 'planned'
          }
        ];
        
        for (const session of sessions) {
          const sessionId = session.id;
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT OR IGNORE INTO sessions (id, student_id, title, description, date, start_time, end_time, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [sessionId, student.id, session.title, session.description, session.date, 
               session.start_time, session.end_time, session.status],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                // Create session verification for completed sessions
                if (session.status === 'completed') {
                  const verificationId = uuidv4();
                  const mentorId = mentors[Math.floor(Math.random() * mentors.length)].id;
                  
                  // Random verification status: 70% pending, 20% verified, 10% rejected
                  const rand = Math.random();
                  let verificationStatus = 'pending';
                  let feedback = null;
                  
                  if (rand < 0.2) {
                    verificationStatus = 'verified';
                    feedback = 'Session verified. Good work!';
                  } else if (rand < 0.3) {
                    verificationStatus = 'rejected';
                    feedback = 'Please provide more details about the session outcomes.';
                  }
                  
                  db.run(
                    `INSERT OR IGNORE INTO session_verifications (id, session_id, verification_status, verified_by, feedback)
                     VALUES (?, ?, ?, ?, ?)`,
                    [verificationId, sessionId, verificationStatus, mentorId, feedback],
                    (err) => {
                      if (err) {
                        reject(err);
                        return;
                      }
                      resolve();
                    }
                  );
                } else {
                  resolve();
                }
              }
            );
          });
        }
        
        console.log(`Inserted sample sessions for student ${student.name}`);
        
        // Create sample activities
        const activities = [
          { 
            id: uuidv4(), 
            title: 'Teaching Observation', 
            description: 'Observed a seasoned teacher delivering a lesson on advanced mathematics',
            activity_type: 'workshop',
            date_completed: '2023-09-20',
            duration_minutes: 120,
            status: 'completed'
          },
          { 
            id: uuidv4(), 
            title: 'Curriculum Development Workshop', 
            description: 'Participated in a workshop on developing inclusive curriculum materials',
            activity_type: 'workshop',
            date_completed: '2023-10-25',
            duration_minutes: 180,
            status: 'completed'
          },
          { 
            id: uuidv4(), 
            title: 'Research on Student Engagement', 
            description: 'Conducting research on factors affecting student engagement in virtual classrooms',
            activity_type: 'research',
            date_completed: '2023-12-05',
            duration_minutes: 300,
            status: 'submitted'
          }
        ];
        
        for (const activity of activities) {
          const activityId = activity.id;
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT OR IGNORE INTO activities (id, student_id, title, description, activity_type, date_completed, duration_minutes, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [activityId, student.id, activity.title, activity.description, activity.activity_type, 
               activity.date_completed, activity.duration_minutes, activity.status],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                // Create activity verification for completed or submitted activities
                if (activity.status === 'completed' || activity.status === 'submitted') {
                  const verificationId = uuidv4();
                  const mentorId = mentors[Math.floor(Math.random() * mentors.length)].id;
                  
                  // Random verification status
                  const rand = Math.random();
                  let verificationStatus = 'pending';
                  let feedback = null;
                  
                  if (rand < 0.2) {
                    verificationStatus = 'verified';
                    feedback = 'Activity verified. Well done!';
                  } else if (rand < 0.3) {
                    verificationStatus = 'rejected';
                    feedback = 'Please provide more evidence of your participation in this activity.';
                  }
                  
                  db.run(
                    `INSERT OR IGNORE INTO activity_verifications (id, activity_id, verification_status, verified_by, feedback)
                     VALUES (?, ?, ?, ?, ?)`,
                    [verificationId, activityId, verificationStatus, mentorId, feedback],
                    (err) => {
                      if (err) {
                        reject(err);
                        return;
                      }
                      resolve();
                    }
                  );
                } else {
                  resolve();
                }
              }
            );
          });
        }
        
        console.log(`Inserted sample activities for student ${student.name}`);
        
        // Create sample student competencies
        for (let i = 0; i < 3; i++) {
          const competency = competencies[Math.floor(Math.random() * competencies.length)];
          const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
          const level = levels[Math.floor(Math.random() * levels.length)];
          const studentCompetencyId = uuidv4();
          
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT OR IGNORE INTO student_competencies (id, student_id, competency_id, level) 
               VALUES (?, ?, ?, ?)`,
              [studentCompetencyId, student.id, competency.id, level],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                // Create competency verification
                const verificationId = uuidv4();
                const mentorId = mentors[Math.floor(Math.random() * mentors.length)].id;
                
                // Random verification status
                const rand = Math.random();
                let verificationStatus = 'pending';
                let feedback = null;
                
                if (rand < 0.2) {
                  verificationStatus = 'verified';
                  feedback = 'Competency level verified. Keep up the good work!';
                } else if (rand < 0.3) {
                  verificationStatus = 'rejected';
                  feedback = 'Please provide more evidence to support this competency level claim.';
                }
                
                db.run(
                  `INSERT OR IGNORE INTO competency_verifications (id, student_competency_id, verification_status, verified_by, feedback)
                   VALUES (?, ?, ?, ?, ?)`,
                  [verificationId, studentCompetencyId, verificationStatus, mentorId, feedback],
                  (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve();
                  }
                );
              }
            );
          });
        }
        
        console.log(`Inserted sample competencies for student ${student.name}`);
        
        // Create sample profile verification
        await new Promise((resolve, reject) => {
          const verificationId = uuidv4();
          const mentorId = mentors[Math.floor(Math.random() * mentors.length)].id;
          
          // Random verification status
          const rand = Math.random();
          let verificationStatus = 'pending';
          let feedback = null;
          
          if (rand < 0.2) {
            verificationStatus = 'verified';
            feedback = 'Profile verified. All documentation is in order.';
          } else if (rand < 0.3) {
            verificationStatus = 'rejected';
            feedback = 'Please provide an official ID document for profile verification.';
          }
          
          db.run(
            `INSERT OR IGNORE INTO profile_verifications (id, user_id, verification_status, verified_by, feedback)
             VALUES (?, ?, ?, ?, ?)`,
            [verificationId, student.id, verificationStatus, mentorId, feedback],
            (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            }
          );
        });
        
        console.log(`Inserted profile verification for student ${student.name}`);
      }
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Run the migration
const runMigration = async () => {
  try {
    console.log('Starting migration to add verification tables...');
    await createTables();
    console.log('Tables created successfully');
    await insertSampleData();
    console.log('Sample data inserted successfully');
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

// Run the migration
runMigration(); 
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const db = new sqlite3.Database(path.resolve(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// Setup mentor-student relationships
const setupMentorStudentRelationships = () => {
  // First get all mentors and students
  db.all(`SELECT id, name, email, role FROM users WHERE role = 'mentor'`, [], (err, mentors) => {
    if (err) {
      console.error('Error fetching mentors:', err.message);
      return;
    }
    
    db.all(`SELECT id, name, email, role FROM users WHERE role = 'student'`, [], (err, students) => {
      if (err) {
        console.error('Error fetching students:', err.message);
        return;
      }
      
      if (mentors.length === 0 || students.length === 0) {
        console.log('No mentors or students found in the database.');
        return;
      }
      
      // Create mentor_students table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS mentor_students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          assigned_date TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (mentor_id) REFERENCES users (id),
          FOREIGN KEY (student_id) REFERENCES users (id),
          UNIQUE(mentor_id, student_id)
        )
      `, [], (err) => {
        if (err) {
          console.error('Error creating mentor_students table:', err.message);
          return;
        }
        
        // Distribute students among mentors
        let mentorIndex = 0;
        const assignments = [];
        
        students.forEach((student, index) => {
          // Round-robin assignment to mentors
          const mentorId = mentors[mentorIndex % mentors.length].id;
          
          assignments.push({
            mentorId,
            studentId: student.id,
            assignedDate: new Date().toISOString(),
            notes: `Assigned to mentor during initialization`
          });
          
          mentorIndex++;
        });
        
        // Insert assignments
        const insertAssignment = db.prepare(`
          INSERT OR REPLACE INTO mentor_students (mentor_id, student_id, assigned_date, notes)
          VALUES (?, ?, ?, ?)
        `);
        
        assignments.forEach(assignment => {
          insertAssignment.run(
            assignment.mentorId,
            assignment.studentId,
            assignment.assignedDate,
            assignment.notes,
            (err) => {
              if (err) {
                console.error(`Error assigning student ${assignment.studentId} to mentor ${assignment.mentorId}:`, err.message);
              }
            }
          );
        });
        
        insertAssignment.finalize();
        console.log(`${assignments.length} mentor-student relationships established.`);
      });
    });
  });
};

// Add sample activities
const addSampleActivities = () => {
  // Create activities table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER,
      location TEXT,
      status TEXT DEFAULT 'pending',
      evidence_url TEXT,
      reflection TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, [], (err) => {
    if (err) {
      console.error('Error creating activities table:', err.message);
      return;
    }
    
    // Get all students to assign activities to
    db.all(`SELECT id, name, email FROM users WHERE role = 'student'`, [], (err, students) => {
      if (err) {
        console.error('Error fetching students:', err.message);
        return;
      }
      
      if (students.length === 0) {
        console.log('No students found in the database.');
        return;
      }
      
      // Sample activity types
      const activityTypes = [
        'Classroom Observation',
        'Teaching Lesson',
        'Professional Development',
        'Mentorship Meeting',
        'Workshop Attendance',
        'Research Project',
        'Curriculum Development',
        'Assessment Design',
        'Parent-Teacher Meeting',
        'Staff Meeting'
      ];
      
      // Sample locations
      const locations = [
        'Main Campus',
        'Downtown Learning Center',
        'Virtual/Online',
        'Community Center',
        'Partner School',
        'University Library',
        'Conference Hall',
        'Science Lab',
        'Art Studio',
        'Resource Room'
      ];
      
      // Generate sample activity titles
      const generateTitle = (type) => {
        const topics = [
          'Mathematics', 
          'Science', 
          'Language Arts', 
          'Social Studies', 
          'Physical Education',
          'Technology Integration',
          'Special Education',
          'Early Childhood',
          'Career Development',
          'Student Wellness'
        ];
        
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        switch (type) {
          case 'Classroom Observation':
            return `Observed ${randomTopic} class for Grade ${Math.floor(Math.random() * 12) + 1}`;
          case 'Teaching Lesson':
            return `Taught ${randomTopic} lesson on ${['Basic Concepts', 'Advanced Techniques', 'Practical Applications', 'Theoretical Frameworks'][Math.floor(Math.random() * 4)]}`;
          case 'Professional Development':
            return `${randomTopic} professional development workshop`;
          case 'Mentorship Meeting':
            return `Mentorship session focused on ${randomTopic} strategies`;
          case 'Workshop Attendance':
            return `${randomTopic} workshop: Best Practices`;
          case 'Research Project':
            return `Research on ${randomTopic} teaching methods`;
          case 'Curriculum Development':
            return `Developed ${randomTopic} curriculum unit`;
          case 'Assessment Design':
            return `Created assessments for ${randomTopic}`;
          case 'Parent-Teacher Meeting':
            return `Parent-Teacher conference discussing ${randomTopic}`;
          case 'Staff Meeting':
            return `Staff meeting on ${randomTopic} integration`;
          default:
            return `${type} activity: ${randomTopic}`;
        }
      };
      
      // Generate sample descriptions
      const generateDescription = (type, title) => {
        switch (type) {
          case 'Classroom Observation':
            return `Observed teaching strategies, student engagement, and classroom management techniques. Noted effective practices and areas for potential implementation in own teaching.`;
          case 'Teaching Lesson':
            return `Planned and delivered a complete lesson, including differentiated instruction strategies and assessment components. Received feedback from supervising teacher.`;
          case 'Professional Development':
            return `Participated in professional development session to enhance knowledge and skills. Topics included latest research findings and practical classroom applications.`;
          case 'Mentorship Meeting':
            return `Met with mentor to discuss progress, challenges, and professional growth strategies. Reviewed recent activities and set goals for upcoming weeks.`;
          case 'Workshop Attendance':
            return `Attended interactive workshop focused on practical skills development. Participated in group activities and discussions on implementation strategies.`;
          case 'Research Project':
            return `Conducted research on effective teaching strategies or student learning outcomes. Gathered data, analyzed findings, and prepared report with practical applications.`;
          case 'Curriculum Development':
            return `Collaborated on developing or revising curriculum materials. Focused on alignment with standards, engagement strategies, and assessment components.`;
          case 'Assessment Design':
            return `Created formative or summative assessments to measure student learning. Designed rubrics and feedback mechanisms to support student growth.`;
          case 'Parent-Teacher Meeting':
            return `Participated in or led meetings with parents/guardians to discuss student progress, challenges, and support strategies. Developed communication skills.`;
          case 'Staff Meeting':
            return `Attended staff meeting focused on school-wide initiatives, policies, or collaborative planning. Contributed to discussions and planning activities.`;
          default:
            return `Completed ${type} activity to enhance professional development and teaching practice.`;
        }
      };
      
      // Generate random date within the past 6 months
      const generateRandomDate = () => {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
        return new Date(randomTimestamp).toISOString();
      };
      
      // Generate reflection based on activity type
      const generateReflection = (type) => {
        const reflections = [
          `This activity gave me valuable insights into how to better approach ${type.toLowerCase()} in the future. I noticed that my strengths were in organization and preparation, while I could improve on time management and flexibility.`,
          `During this ${type.toLowerCase()}, I learned the importance of adapting to unexpected situations. Next time, I will prepare alternative approaches in advance to better handle similar challenges.`,
          `I found this ${type.toLowerCase()} particularly valuable for developing my professional skills. The feedback I received will help me focus on specific areas for improvement in my practice.`,
          `This experience helped me identify gaps in my knowledge about ${type.toLowerCase()}. I plan to seek additional resources and mentorship to strengthen these areas before my next similar activity.`,
          `The most valuable aspect of this ${type.toLowerCase()} was seeing the direct impact on student engagement and learning. I will incorporate these strategies into my future teaching practice.`
        ];
        
        return reflections[Math.floor(Math.random() * reflections.length)];
      };
      
      // Prepare activity insertion
      const activities = [];
      const statuses = ['pending', 'approved', 'rejected', 'in progress', 'completed'];
      
      // Create 20 sample activities distributed among students
      for (let i = 0; i < 20; i++) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const title = generateTitle(randomType);
        const activityDate = generateRandomDate();
        const createdDate = new Date(new Date(activityDate).getTime() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString(); // Up to 2 weeks before activity
        const updatedDate = new Date(new Date(createdDate).getTime() + Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(); // Up to 1 week after creation
        
        activities.push({
          userId: randomStudent.id,
          title: title,
          description: generateDescription(randomType, title),
          type: randomType,
          date: activityDate,
          duration: Math.floor(Math.random() * 180) + 30, // 30 to 210 minutes
          location: locations[Math.floor(Math.random() * locations.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          evidenceUrl: Math.random() > 0.7 ? `https://example.com/evidence/activity-${i + 1}` : null,
          reflection: Math.random() > 0.5 ? generateReflection(randomType) : null,
          createdAt: createdDate,
          updatedAt: updatedDate
        });
      }
      
      // Insert activities
      const insertActivity = db.prepare(`
        INSERT INTO activities (
          user_id, title, description, type, date, duration, location, 
          status, evidence_url, reflection, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      activities.forEach(activity => {
        insertActivity.run(
          activity.userId,
          activity.title,
          activity.description,
          activity.type,
          activity.date,
          activity.duration,
          activity.location,
          activity.status,
          activity.evidenceUrl,
          activity.reflection,
          activity.createdAt,
          activity.updatedAt,
          (err) => {
            if (err) {
              console.error(`Error inserting activity for user ${activity.userId}:`, err.message);
            }
          }
        );
      });
      
      insertActivity.finalize();
      console.log(`${activities.length} sample activities added successfully.`);
    });
  });
};

// Execute the initialization
console.log('Setting up mentor-student relationships...');
setupMentorStudentRelationships();

console.log('Adding sample activities...');
addSampleActivities();

// Close the database connection when done
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database connection:', err.message);
      return;
    }
    console.log('Database connection closed.');
  });
}, 5000); // Allow time for async operations to complete 
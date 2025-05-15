/**
 * Script to add sample messages between users
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

// Check if messages table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'", (err, row) => {
  if (err) {
    console.error('Error checking for messages table:', err.message);
    db.close();
    process.exit(1);
  }
  
  if (!row) {
    console.error('Messages table does not exist. Please run migrations first.');
    db.close();
    process.exit(1);
  }
  
  // Check if there are already messages
  db.get("SELECT COUNT(*) as count FROM messages", (err, result) => {
    if (err) {
      console.error('Error checking for existing messages:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (result.count > 0) {
      console.log('Sample messages already exist. Skipping insertion.');
      db.close();
      process.exit(0);
    }
    
    console.log('Adding sample messages...');
    addSampleMessages();
  });
});

function addSampleMessages() {
  // Get users
  db.all(`
    SELECT u.id, u.role, u.name
    FROM users u
    ORDER BY u.role
  `, [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (users.length < 3) {
      console.error('Not enough users in the database. Need at least one admin, one mentor, and one student.');
      db.close();
      process.exit(1);
    }
    
    // Get mentor-student assignments
    db.all(`
      SELECT msa.mentor_id, msa.student_id
      FROM mentor_student_assignments msa
    `, [], (err, assignments) => {
      if (err) {
        console.error('Error fetching mentor-student assignments:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (assignments.length === 0) {
        console.error('No mentor-student assignments found. Please set up assignments first.');
        db.close();
        process.exit(1);
      }
      
      // Find admin, mentors, and students
      const admins = users.filter(user => user.role === 'admin');
      const mentors = users.filter(user => user.role === 'mentor');
      const students = users.filter(user => user.role === 'student');
      
      if (admins.length === 0 || mentors.length === 0 || students.length === 0) {
        console.error('Missing users of specific roles. Need at least one of each role.');
        db.close();
        process.exit(1);
      }
      
      // Create sample messages
      const messages = [];
      
      // Admin to all users
      users.forEach(receiver => {
        if (receiver.id !== admins[0].id) {
          messages.push({
            id: uuidv4(),
            sender_id: admins[0].id,
            receiver_id: receiver.id,
            content: `Hello ${receiver.name}, this is an admin message. Welcome to the placement tracking system!`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            read: Math.random() > 0.5 ? 1 : 0
          });
        }
      });
      
      // Mentor to assigned students
      assignments.forEach(assignment => {
        const mentor = mentors.find(m => m.id === assignment.mentor_id);
        const student = students.find(s => s.id === assignment.student_id);
        
        if (mentor && student) {
          // Mentor to student
          messages.push({
            id: uuidv4(),
            sender_id: mentor.id,
            receiver_id: student.id,
            content: `Hello ${student.name}, please update your activities for this week.`,
            timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
            read: Math.random() > 0.5 ? 1 : 0
          });
          
          // Student to mentor reply
          messages.push({
            id: uuidv4(),
            sender_id: student.id,
            receiver_id: mentor.id,
            content: `Hi ${mentor.name}, I will update my activities today. Thanks for reminding me!`,
            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
            read: Math.random() > 0.5 ? 1 : 0
          });
          
          // Another mentor to student message
          messages.push({
            id: uuidv4(),
            sender_id: mentor.id,
            receiver_id: student.id,
            content: `Great! I'll review them once you've submitted them.`,
            timestamp: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: Math.random() > 0.7 ? 1 : 0
          });
        }
      });
      
      // Insert all messages
      const stmt = db.prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, content, timestamp, read, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      let inserted = 0;
      messages.forEach(message => {
        stmt.run(
          message.id,
          message.sender_id,
          message.receiver_id,
          message.content,
          message.timestamp,
          message.read,
          err => {
            if (err) {
              console.error('Error inserting message:', err.message);
            } else {
              inserted++;
            }
            
            // Close when all are done
            if (inserted === messages.length) {
              stmt.finalize();
              console.log(`Successfully added ${inserted} sample messages`);
              db.close();
              process.exit(0);
            }
          }
        );
      });
    });
  });
} 
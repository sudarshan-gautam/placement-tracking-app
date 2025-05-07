const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function main() {
  try {
    console.log('Opening database connection...');
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Check sessions table
    console.log('\n--- Sessions Table Structure ---');
    const sessionColumns = await db.all(`PRAGMA table_info(sessions)`);
    console.log(sessionColumns.map(col => `${col.name} (${col.type})`).join(', '));

    // Count sessions
    const sessionsCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    console.log(`\nFound ${sessionsCount.count} sessions in the database.`);

    // Get sample sessions
    console.log('\n--- First 5 Sessions ---');
    const sessions = await db.all(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.location, 
        s.status,
        u.name as student_name,
        m.name as mentor_name,
        (SELECT COUNT(*) FROM session_enrollments WHERE session_id = s.id) as enrolled_count
      FROM sessions s
      LEFT JOIN users u ON s.student_id = u.id
      LEFT JOIN users m ON s.mentor_id = m.id
      LIMIT 5
    `);
    
    sessions.forEach((session, index) => {
      console.log(`\n[Session ${index + 1}]`);
      console.log(`ID: ${session.id}`);
      console.log(`Title: ${session.title}`);
      console.log(`Student: ${session.student_name}`);
      console.log(`Mentor: ${session.mentor_name}`);
      console.log(`Date: ${session.date}`);
      console.log(`Status: ${session.status}`);
      console.log(`Enrolled Students: ${session.enrolled_count}`);
    });

    // Check enrollments table
    console.log('\n--- Session Enrollments ---');
    const enrollmentsCount = await db.get('SELECT COUNT(*) as count FROM session_enrollments');
    console.log(`Found ${enrollmentsCount.count} enrollments in the database.`);

    // Get session enrollments for the first session
    if (sessions.length > 0) {
      const firstSessionId = sessions[0].id;
      console.log(`\n--- Enrollments for session "${sessions[0].title}" ---`);
      const enrollments = await db.all(`
        SELECT 
          se.session_id,
          se.student_id,
          u.name as student_name,
          se.enrolled_at
        FROM session_enrollments se
        JOIN users u ON se.student_id = u.id
        WHERE se.session_id = ?
      `, firstSessionId);
      
      if (enrollments.length === 0) {
        console.log('No enrollments found for this session.');
      } else {
        enrollments.forEach((enrollment, index) => {
          console.log(`[Enrollment ${index + 1}]`);
          console.log(`Student: ${enrollment.student_name} (${enrollment.student_id})`);
          console.log(`Enrolled at: ${enrollment.enrolled_at}`);
        });
      }
    }

    console.log('\nDatabase check completed.');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

main(); 
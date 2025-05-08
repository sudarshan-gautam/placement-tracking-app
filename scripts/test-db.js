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
    
    console.log('Connected to SQLite database.');
    
    // Test sessions table
    console.log('\nTesting sessions table:');
    const sessionCount = await db.get('SELECT COUNT(*) as count FROM sessions');
    console.log(`Total sessions in database: ${sessionCount.count}`);
    
    const sessions = await db.all(`
      SELECT 
        s.id, 
        s.title, 
        s.date, 
        s.status,
        u.name as student_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      LIMIT 3
    `);
    
    console.log('Sample sessions:');
    sessions.forEach(session => {
      console.log(`- "${session.title}" by ${session.student_name} (${session.date}) - Status: ${session.status}`);
    });
    
    // Test users table
    console.log('\nTesting users table:');
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    console.log(`Total users in database: ${userCount.count}`);
    
    const users = await db.all(`
      SELECT id, name, email, role
      FROM users
      LIMIT 5
    `);
    
    console.log('Sample users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    await db.close();
    console.log('\nDatabase connection closed successfully.');
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

main(); 
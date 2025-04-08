const mysql = require('mysql2/promise');

async function main() {
  try {
    // Create connection with database selected
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678',
      database: 'placement_tracking'
    });
    
    console.log('Connected to placement_tracking database');
    
    // Update the passwords with the correct hashes
    // These are hardcoded password hashes for: admin123, student123, mentor123
    await connection.query(`
      UPDATE users 
      SET password = '$2b$10$864VLRtHZ5KDE68oUymnaesPcEY6.I85bwRI9kQeDRa4H/eC57586'
      WHERE email = 'admin@gmail.com'
    `);
    
    await connection.query(`
      UPDATE users 
      SET password = '$2b$10$MlxnN8rXUaouMLMtBKvks.y//QghLHKPp/ve3653CYyum6wzN1vQS'
      WHERE email = 'student@gmail.com'
    `);
    
    await connection.query(`
      UPDATE users 
      SET password = '$2b$10$Pae6vFwnnqc8kPL.nX/ScewIjKHkLH6v3Ki6f2VZXQisJNQVcV0gG'
      WHERE email = 'mentor@gmail.com'
    `);
    
    console.log('Passwords updated successfully');
    
    // Output the updated users
    const [users] = await connection.query('SELECT id, email, role, password FROM users LIMIT 5');
    console.log('Updated users in database:');
    console.log(users);
    
    await connection.end();
    console.log('Password update completed successfully');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

main().catch(console.error); 
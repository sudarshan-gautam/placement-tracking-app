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
    
    // Ensure the status column exists
    try {
      // Check if status column exists
      const [statusColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'placement_tracking' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'status'
      `);
      
      if (statusColumns.length === 0) {
        // Add status column
        await connection.query(`
          ALTER TABLE users 
          ADD COLUMN status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active'
        `);
        console.log('Added status column to users table');
      } else {
        console.log('Status column already exists');
      }
    } catch (error) {
      console.error('Error checking/adding status column:', error);
    }
    
    // Check for profile_image vs profileImage inconsistency
    try {
      const [profileImageColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'placement_tracking' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'profile_image'
      `);
      
      if (profileImageColumns.length > 0) {
        // Rename profile_image to profileImage for consistency
        await connection.query(`
          ALTER TABLE users 
          CHANGE COLUMN profile_image profileImage VARCHAR(255)
        `);
        console.log('Renamed profile_image column to profileImage');
      } else {
        console.log('No need to rename profile_image column');
      }
    } catch (error) {
      console.error('Error checking/renaming profile_image column:', error);
    }
    
    // Output the updated schema
    const [tableInfo] = await connection.query('DESCRIBE users');
    console.log('Updated users table schema:');
    console.log(tableInfo);
    
    await connection.end();
    console.log('Schema update completed successfully');
    
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

main().catch(console.error); 
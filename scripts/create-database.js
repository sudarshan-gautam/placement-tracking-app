const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function main() {
  try {
    // Create connection without database selection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678'
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS placement_tracking
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    
    console.log('Database created or already exists');
    
    // Close the connection and reconnect with database selected
    await connection.end();
    
    // Create a new connection with the database selected
    const dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678',
      database: 'placement_tracking'
    });
    
    console.log('Connected to placement_tracking database');
    
    // Create users table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'mentor', 'student') NOT NULL,
        name VARCHAR(255) NOT NULL,
        profileImage VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Users table created or already exists');

    // Check if users already exist
    const [rows] = await dbConnection.query('SELECT COUNT(*) as count FROM users');
    
    if (rows[0].count === 0) {
      // Insert default users with correct password hashes
      // These are hardcoded password hashes for: admin123, student123, mentor123
      await dbConnection.query(`
        INSERT INTO users (id, email, password, role, name) VALUES 
        (UUID(), 'admin@gmail.com', '$2b$10$864VLRtHZ5KDE68oUymnaesPcEY6.I85bwRI9kQeDRa4H/eC57586', 'admin', 'Admin User'),
        (UUID(), 'student@gmail.com', '$2b$10$MlxnN8rXUaouMLMtBKvks.y//QghLHKPp/ve3653CYyum6wzN1vQS', 'student', 'Student User'),
        (UUID(), 'mentor@gmail.com', '$2b$10$Pae6vFwnnqc8kPL.nX/ScewIjKHkLH6v3Ki6f2VZXQisJNQVcV0gG', 'mentor', 'Mentor User')
      `);
      
      console.log('Default users inserted');
    } else {
      console.log('Users already exist, skipping insertion');
    }
    
    // Output a few sample users
    const [users] = await dbConnection.query('SELECT id, email, role, password FROM users LIMIT 5');
    console.log('Sample users in database:');
    console.log(users);
    
    await dbConnection.end();
    console.log('Database setup completed successfully');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main().catch(console.error); 
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function ensureEnrollmentsTable() {
  try {
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Check if table exists
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='session_enrollments'
    `);

    if (!tableExists) {
      console.log('Creating session_enrollments table');
      // Create the table
      await db.exec(`
        CREATE TABLE session_enrollments (
          session_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          enrolled_at DATETIME NOT NULL,
          PRIMARY KEY (session_id, student_id),
          FOREIGN KEY (session_id) REFERENCES sessions(id),
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);
      
      console.log('session_enrollments table created successfully');
    } else {
      console.log('session_enrollments table already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring session_enrollments table:', error);
    return false;
  }
}

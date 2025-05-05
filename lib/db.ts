// SQLite database interface for user authentication
import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

// User types
export type UserRole = 'admin' | 'mentor' | 'student';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  profileImage?: string;
}

// Mock the getPool function for compatibility with MySQL code
// This allows us to keep the same API while using SQLite underneath
export async function getPool() {
  // Return an object that mimics a MySQL pool but uses our SQLite functions
  return {
    query: async (sql: string, params: any[] = []) => {
      if (sql.toLowerCase().startsWith('select')) {
        const results = await getAll(sql, params);
        return [results, []];
      } else {
        const result = await runQuery(sql, params);
        return [result, []];
      }
    }
  };
}

// Database singleton
let db: sqlite3.Database | null = null;

// Function to get the database connection
export function getDb(): sqlite3.Database {
  if (!db) {
    try {
      // Enable verbose mode in development
      if (process.env.NODE_ENV === 'development') {
        sqlite3.verbose();
      }
      
      // Create or connect to the SQLite database
      const dbPath = path.join(process.cwd(), 'database.sqlite');
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Could not connect to database', err);
        } else {
          console.log('SQLite connection successful');
          // Enable foreign keys
          db?.run('PRAGMA foreign_keys = ON');
        }
      });
    } catch (error) {
      console.error('Error connecting to SQLite database:', error);
      throw new Error('Database connection failed');
    }
  }
  return db;
}

// Helper to promisify database queries
export function runQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDb().run(query, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Helper to get a single row
export function getOne<T>(query: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    getDb().get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T || null);
    });
  });
}

// Helper to get multiple rows
export function getAll<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    getDb().all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[] || []);
    });
  });
}

// Function to find a user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    return await getOne<User>('SELECT * FROM users WHERE email = ?', [email]);
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

// Function to validate user credentials
export async function validateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return null;
    }
    
    console.log(`Found user: ${user.email}, role: ${user.role}`);
    
    // Simple string comparison instead of bcrypt
    const isValid = user.password === password;
    console.log(`Password validation result: ${isValid}`);
    
    if (!isValid) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

// Function to close the database connection
export function closeDb() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
    db = null;
  }
}

// Export the database functions
export default {
  getDb,
  findUserByEmail,
  validateUser,
  closeDb,
  runQuery,
  getOne,
  getAll
}; 
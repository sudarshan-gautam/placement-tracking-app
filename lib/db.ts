// SQLite database interface for user authentication
import sqlite3 from 'sqlite3';
import path from 'path';

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

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  deadline?: string;
  status: 'active' | 'closed' | 'draft';
  created_at?: string;
  updated_at?: string;
}

// Database singleton
let db: sqlite3.Database | null = null;

// MySQL-like connection pool emulator for SQLite
// This makes the code compatible with MySQL-based code using the same interface
export async function getPool() {
  // Ensure the database is initialized
  getDb();
  
  // Return an object that mimics a MySQL pool interface
  return {
    query: (sql: string, params: any[] = []): Promise<[any[], any]> => {
      return new Promise((resolve, reject) => {
        getDb().all(sql, params, (err, rows) => {
          if (err) return reject(err);
          // Return in format similar to MySQL's [rows, fields]
          resolve([rows || [], {}]);
        });
      });
    },
    execute: (sql: string, params: any[] = []): Promise<[any, any]> => {
      return new Promise((resolve, reject) => {
        getDb().run(sql, params, function(err) {
          if (err) return reject(err);
          // Return in format similar to MySQL's [result, fields]
          resolve([{ insertId: this.lastID, affectedRows: this.changes }, {}]);
        });
      });
    },
    // Add other MySQL pool methods as needed
    end: () => {
      // No-op for SQLite, but matches MySQL pool API
      return Promise.resolve();
    }
  };
}

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

// Function to find a user by ID
export async function findUserById(id: string): Promise<User | null> {
  try {
    return await getOne<User>('SELECT * FROM users WHERE id = ?', [id]);
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
    
    // Get profile data including profileImage from user_profiles table
    try {
      const userProfile = await getOne<{user_id: string, profileImage?: string}>(
        'SELECT * FROM user_profiles WHERE user_id = ?', 
        [user.id]
      );
      
      if (userProfile && userProfile.profileImage) {
        // Add profileImage to user object
        user.profileImage = userProfile.profileImage;
      }
    } catch (profileError) {
      console.error('Error fetching user profile data:', profileError);
      // Continue with login even if profile fetch fails
    }
    
    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

// Function to get all jobs
export async function getAllJobs(): Promise<Job[]> {
  try {
    return await getAll<Job>('SELECT * FROM jobs');
  } catch (error) {
    console.error('Error getting all jobs:', error);
    return [];
  }
}

// Function to get job by ID
export async function getJobById(id: string): Promise<Job | null> {
  try {
    return await getOne<Job>('SELECT * FROM jobs WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error getting job by ID:', error);
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
export const database = {
  getDb,
  findUserByEmail,
  findUserById,
  validateUser,
  getAllJobs,
  getJobById,
  closeDb,
  runQuery,
  getOne,
  getAll
};

export default database; 
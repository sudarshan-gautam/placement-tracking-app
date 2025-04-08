// Mock database for user authentication
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

// User types
export type UserRole = 'admin' | 'mentor' | 'student';

export interface User {
  id: string | number;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  profileImage?: string;
}

let pool: mysql.Pool;

// Function to get or create the pool
export async function getPool() {
  if (!pool) {
    try {
      // Configure the database connection
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '12345678',
        database: process.env.MYSQL_DATABASE || 'placement_tracking',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      // Test the connection
      const [result] = await pool.query('SELECT 1');
      console.log('MySQL connection successful');
    } catch (error) {
      console.error('Error creating MySQL pool:', error);
      console.error('Please make sure your MySQL server is running and credentials are correct.');
    }
  }
  return pool;
}

// Initialize the pool
getPool();

// Function to find a user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getPool();
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    
    if (users.length === 0) {
      return null;
    }
    
    // Convert numeric ID to string if needed
    const user = users[0];
    if (typeof user.id === 'number') {
      user.id = user.id.toString();
    }
    
    return user;
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
    
    console.log(`Found user: ${user.email}, password hash: ${user.password.substring(0, 10)}...`);
    
    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password);
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

// Export the pool accessor
export default {
  getPool,
  findUserByEmail,
  validateUser
}; 
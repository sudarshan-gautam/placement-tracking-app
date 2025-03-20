// Mock database for user authentication
import bcrypt from 'bcrypt';

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

// Mock users database
const users: User[] = [
  {
    id: '1',
    email: 'admin@gmail.com',
    // This would be hashed in a real application
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'mentor@gmail.com',
    // This would be hashed in a real application
    password: 'mentor123',
    role: 'mentor',
    name: 'Mentor User'
  },
  {
    id: '3',
    email: 'student@gmail.com',
    // This would be hashed in a real application
    password: 'student123',
    role: 'student',
    name: 'Student User'
  }
];

// Function to find a user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const user = users.find(u => u.email === email);
  return user || null;
}

// Function to validate user credentials
export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // In a real application, we would use bcrypt.compare
  // const isValid = await bcrypt.compare(password, user.password);
  const isValid = password === user.password;
  
  if (!isValid) {
    return null;
  }
  
  return user;
} 
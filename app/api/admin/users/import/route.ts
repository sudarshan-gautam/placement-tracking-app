import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface ImportedUser {
  name: string;
  email: string;
  role: string;
  status?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request data
    const data = await request.json();
    const users: ImportedUser[] = data.users;

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No valid users to import' }, { status: 400 });
    }

    // Get database connection
    const pool = await getPool();
    
    // Process results
    const results = {
      success: 0,
      errors: 0,
      duplicates: 0,
      details: [] as Array<{ email: string; status: string; message?: string }>
    };

    // Check for existing emails to avoid duplicates
    const existingEmails = new Set<string>();
    const [existingUsers] = await pool.query('SELECT email FROM users');
    
    (existingUsers as any[]).forEach((user: any) => {
      existingEmails.add(user.email.toLowerCase());
    });

    // Process each user
    for (const user of users) {
      try {
        // Validate required fields
        if (!user.name || !user.email || !user.role) {
          results.errors++;
          results.details.push({
            email: user.email || 'unknown',
            status: 'error',
            message: 'Missing required fields'
          });
          continue;
        }

        // Validate role
        const role = user.role.toLowerCase();
        if (!['admin', 'mentor', 'student'].includes(role)) {
          results.errors++;
          results.details.push({
            email: user.email,
            status: 'error',
            message: 'Invalid role: must be admin, mentor, or student'
          });
          continue;
        }

        // Check for duplicate emails in the database
        if (existingEmails.has(user.email.toLowerCase())) {
          results.duplicates++;
          results.details.push({
            email: user.email,
            status: 'duplicate',
            message: 'User with this email already exists'
          });
          continue;
        }

        // Check for duplicates within the import data
        if (results.details.some(detail => 
          detail.email.toLowerCase() === user.email.toLowerCase() && 
          detail.status === 'success'
        )) {
          results.duplicates++;
          results.details.push({
            email: user.email,
            status: 'duplicate',
            message: 'Duplicate email in import data'
          });
          continue;
        }

        // Set default values
        const status = (user.status && ['active', 'pending', 'inactive'].includes(user.status.toLowerCase()))
          ? user.status.toLowerCase()
          : 'pending';
          
        // Generate a password if not provided
        const password = user.password || 'changeme';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate a unique ID
        const id = uuidv4();

        // Insert the user
        await pool.query(
          'INSERT INTO users (id, name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [id, user.name, user.email, hashedPassword, role, status]
        );

        results.success++;
        results.details.push({
          email: user.email,
          status: 'success'
        });
        
        // Add to existing emails to prevent duplicates in the same import
        existingEmails.add(user.email.toLowerCase());
      } catch (error: any) {
        console.error('Error importing user:', error);
        results.errors++;
        results.details.push({
          email: user.email || 'unknown',
          status: 'error',
          message: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success} users, ${results.errors} errors, ${results.duplicates} duplicates`,
      results
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Error importing users' }, { status: 500 });
  }
} 
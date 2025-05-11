import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { roleMiddleware } from '@/lib/auth-middleware';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// GET endpoint to retrieve all students assigned to a mentor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow mentors to access their own assigned students, or admins to view any
    if (user.role === 'mentor' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Open database connection
    const db = await openDb();

    // Fetch assigned students with their details
    const students = await db.all(`
      SELECT u.id, u.name, u.email, u.role, msa.assigned_date
      FROM mentor_student_assignments msa
      JOIN users u ON msa.student_id = u.id
      WHERE msa.mentor_id = ? AND u.role = 'student'
      ORDER BY u.name
    `, params.id);

    // Close database connection
    await db.close();

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned students' },
      { status: 500 }
    );
  }
} 
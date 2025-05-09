import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all students for a specific mentor
export async function GET(
  request: Request,
  { params }: { params: { mentor_id: string } }
) {
  try {
    const mentorId = params.mentor_id;

    if (!mentorId) {
      return NextResponse.json({ 
        error: 'Missing mentor ID',
        details: 'Mentor ID is required' 
      }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if the mentor exists and has the correct role
    const mentor = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [mentorId, 'mentor']);
    if (!mentor) {
      return NextResponse.json({ 
        error: 'Invalid mentor',
        details: 'The specified mentor ID does not exist or is not a mentor' 
      }, { status: 400 });
    }

    // Get all students assigned to this mentor
    const students = await db.all(`
      SELECT 
        msa.id as assignment_id,
        msa.student_id,
        u.name as student_name,
        u.email as student_email,
        u.role as student_role,
        msa.assigned_date,
        msa.notes
      FROM mentor_student_assignments msa
      JOIN users u ON msa.student_id = u.id
      WHERE msa.mentor_id = ?
      ORDER BY u.name
    `, [mentorId]);

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch students',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 
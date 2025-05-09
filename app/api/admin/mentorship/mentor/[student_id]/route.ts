import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get the mentor for a specific student
export async function GET(
  request: Request,
  { params }: { params: { student_id: string } }
) {
  try {
    const studentId = params.student_id;

    if (!studentId) {
      return NextResponse.json({ 
        error: 'Missing student ID',
        details: 'Student ID is required' 
      }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Check if the student exists and has the correct role
    const student = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
    if (!student) {
      return NextResponse.json({ 
        error: 'Invalid student',
        details: 'The specified student ID does not exist or is not a student' 
      }, { status: 400 });
    }

    // Get the mentor assigned to this student
    const mentor = await db.get(`
      SELECT 
        msa.id as assignment_id,
        msa.mentor_id,
        u.name as mentor_name,
        u.email as mentor_email,
        u.role as mentor_role,
        msa.assigned_date,
        msa.notes
      FROM mentor_student_assignments msa
      JOIN users u ON msa.mentor_id = u.id
      WHERE msa.student_id = ?
    `, [studentId]);

    if (!mentor) {
      return NextResponse.json({ 
        mentor: null,
        message: 'No mentor assigned to this student' 
      });
    }

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error fetching student mentor:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch mentor',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 
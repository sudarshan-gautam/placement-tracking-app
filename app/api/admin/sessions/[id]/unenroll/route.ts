import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureEnrollmentsTable } from '../../create-enrollments-table';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the enrollments table exists
    await ensureEnrollmentsTable();
    
    // Check authentication - disabled for development
    // const session = await getServerSession(authOptions);
    // if (!session || (session.user.role !== 'admin' && session.user.role !== 'mentor')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Check if session exists
    const sessionExists = await db.get('SELECT id FROM sessions WHERE id = ?', sessionId);
    if (!sessionExists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if enrollment exists
    const enrollmentExists = await db.get(
      'SELECT session_id FROM session_enrollments WHERE session_id = ? AND student_id = ?',
      [sessionId, studentId]
    );

    if (!enrollmentExists) {
      return NextResponse.json({ error: 'Student is not enrolled in this session' }, { status: 400 });
    }

    // Remove enrollment
    await db.run(
      'DELETE FROM session_enrollments WHERE session_id = ? AND student_id = ?',
      [sessionId, studentId]
    );

    // Get all remaining enrolled students for the session
    const enrolledStudents = await db.all(`
      SELECT u.id, u.name
      FROM users u
      JOIN session_enrollments se ON u.id = se.student_id
      WHERE se.session_id = ?
    `, sessionId);

    return NextResponse.json({
      message: 'Student removed from session successfully',
      enrolledStudents
    });
  } catch (error) {
    console.error('Error removing student from session:', error);
    return NextResponse.json({ error: 'Failed to remove student from session' }, { status: 500 });
  }
} 
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

    // Check if student exists
    const studentExists = await db.get('SELECT id FROM users WHERE id = ? AND role = "student"', studentId);
    if (!studentExists) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if enrollment already exists
    const enrollmentExists = await db.get(
      'SELECT session_id FROM session_enrollments WHERE session_id = ? AND student_id = ?',
      [sessionId, studentId]
    );

    if (enrollmentExists) {
      return NextResponse.json({ error: 'Student is already enrolled in this session' }, { status: 400 });
    }

    // Create enrollment
    await db.run(
      'INSERT INTO session_enrollments (session_id, student_id, enrolled_at) VALUES (?, ?, datetime("now"))',
      [sessionId, studentId]
    );

    // Get enrolled student details
    const student = await db.get('SELECT id, name FROM users WHERE id = ?', studentId);

    // Get all enrolled students for the session
    const enrolledStudents = await db.all(`
      SELECT u.id, u.name
      FROM users u
      JOIN session_enrollments se ON u.id = se.student_id
      WHERE se.session_id = ?
    `, sessionId);

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student,
      enrolledStudents
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json({ error: 'Failed to enroll student' }, { status: 500 });
  }
} 
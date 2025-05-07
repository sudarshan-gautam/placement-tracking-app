import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureEnrollmentsTable } from '../create-enrollments-table';

// Get a specific session by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure the enrollments table exists
    await ensureEnrollmentsTable();
    
    // Check authentication
    // const session = await getServerSession(authOptions);
    // if (!session || (session.user.role !== 'mentor' && session.user.role !== 'admin')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    // Fetch session details
    const session = await db.get(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.location, 
        s.status,
        u.id as student_id, 
        u.name as student_name,
        m.id as mentor_id,
        m.name as mentor_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      LEFT JOIN users m ON s.mentor_id = m.id
      WHERE s.id = ?
    `, sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch enrolled students
    const enrolledStudents = await db.all(`
      SELECT u.id, u.name
      FROM users u
      JOIN session_enrollments se ON u.id = se.student_id
      WHERE se.session_id = ?
    `, sessionId);

    // Format the response
    const formattedSession = {
      id: session.id,
      title: session.title,
      description: session.description,
      date: session.date,
      location: session.location,
      status: session.status,
      student: {
        id: session.student_id,
        name: session.student_name
      },
      mentor: session.mentor_id ? {
        id: session.mentor_id,
        name: session.mentor_name
      } : undefined,
      enrolledStudents: enrolledStudents
    };

    return NextResponse.json({ session: formattedSession });
  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json({ error: 'Failed to fetch session details' }, { status: 500 });
  }
}

// Update a session
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - disabled for development
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { title, description, studentId, date, location, status, approvalStatus } = body;

    // Validate required fields
    if (!title || !studentId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Update session
    await db.run(`
      UPDATE sessions SET 
        title = ?, 
        description = ?, 
        student_id = ?, 
        date = ?, 
        location = ?, 
        status = ?,
        approval_status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [title, description, studentId, date, location, status, approvalStatus || 'approved', sessionId]);

    // Fetch the updated session
    const updatedSession = await db.get(`
      SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.date, 
        s.location, 
        s.status,
        s.approval_status as approvalStatus,
        u.id as student_id, 
        u.name as student_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      WHERE s.id = ?
    `, sessionId);

    // Format the response
    const formattedSession = {
      id: updatedSession.id,
      title: updatedSession.title,
      description: updatedSession.description,
      date: updatedSession.date,
      location: updatedSession.location,
      status: updatedSession.status,
      approvalStatus: updatedSession.approvalStatus,
      student: {
        id: updatedSession.student_id,
        name: updatedSession.student_name
      }
    };

    return NextResponse.json({ 
      message: 'Session updated successfully', 
      session: formattedSession 
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// Delete a session
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - disabled for development
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
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

    // Delete the session
    await db.run('DELETE FROM sessions WHERE id = ?', sessionId);

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
} 
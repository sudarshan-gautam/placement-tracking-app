import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Update session approval status
    await db.run(
      'UPDATE sessions SET approval_status = ?, updated_at = datetime("now") WHERE id = ?',
      ['approved', sessionId]
    );

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
        u.name as student_name,
        m.id as mentor_id,
        m.name as mentor_name
      FROM sessions s
      JOIN users u ON s.student_id = u.id
      JOIN users m ON s.mentor_id = m.id
      WHERE s.id = ?
    `, sessionId);

    if (!updatedSession) {
      return NextResponse.json({ error: 'Failed to retrieve updated session' }, { status: 500 });
    }

    // Format the session for the response
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
      },
      mentor: {
        id: updatedSession.mentor_id,
        name: updatedSession.mentor_name
      }
    };

    return NextResponse.json({
      message: 'Session approved successfully',
      session: formattedSession
    });
  } catch (error) {
    console.error('Error approving session:', error);
    return NextResponse.json({ error: 'Failed to approve session' }, { status: 500 });
  }
} 
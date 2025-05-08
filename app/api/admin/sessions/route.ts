import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    console.log('API: Auth headers received:', { 
      roleHeader,
      userId
    });
    
    // Basic authorization check
    if (roleHeader !== 'admin') {
      console.log('API: Unauthorized access attempt to sessions API - not admin role');
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required',
        roleProvided: roleHeader 
      }, { status: 401 });
    }
    
    console.log('API: User authorized as admin, fetching sessions');
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    try {
      // Fetch all sessions with short numeric IDs for display purposes
      const sessions = await db.all(`
        SELECT 
          s.id, 
          s.rowid as display_id,
          s.title, 
          s.description, 
          s.date, 
          s.location,
          s.duration,
          s.session_type, 
          s.status,
          s.feedback,
          s.reflection,
          s.learner_age_group,
          s.subject,
          u.id as student_id, 
          u.name as student_name
        FROM sessions s
        JOIN users u ON s.student_id = u.id
        ORDER BY s.rowid DESC
      `);

      // Transform data structure to match the frontend expectations
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        displayId: session.display_id, 
        title: session.title,
        description: session.description || '',
        date: session.date,
        location: session.location || '',
        duration: session.duration,
        sessionType: session.session_type,
        status: session.status || 'planned',
        feedback: session.feedback,
        learnerAgeGroup: session.learner_age_group,
        subject: session.subject,
        student: {
          id: session.student_id,
          name: session.student_name
        }
      }));

      console.log(`API: Fetched ${formattedSessions.length} sessions from database`);
      return NextResponse.json({ sessions: formattedSessions });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
} 
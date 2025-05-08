import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET(req: NextRequest) {
  console.log('GET /api/activities - Request received');
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    console.log('API: Auth headers received:', { 
      roleHeader,
      userId
    });
    
    if (!roleHeader) {
      console.log('API: Unauthorized access attempt - no role specified');
      return NextResponse.json({ 
        error: 'Unauthorized - Role is required',
        roleProvided: roleHeader 
      }, { status: 401 });
    }
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });

    try {
      // Build the query based on user role
      let query = `
        SELECT 
          a.id, 
          a.title, 
          a.type,
          a.status,
          a.date,
          a.duration,
          a.description,
          a.reflection,
          a.rejection_reason,
          a.activity_type,
          a.location,
          a.learning_outcomes,
          a.feedback_comments,
          s.id as student_id,
          s.name as student_name,
          m.id as mentor_id,
          m.name as mentor_name
        FROM activities a
        LEFT JOIN users s ON a.student_id = s.id
        LEFT JOIN users m ON a.mentor_id = m.id
      `;
      
      const params = [];
      
      // Filter by role-specific criteria
      if (roleHeader === 'student' && userId) {
        query += ' WHERE a.student_id = ?';
        params.push(userId);
      } else if (roleHeader === 'mentor' && userId) {
        query += ' WHERE a.mentor_id = ? OR a.status = "pending"';
        params.push(userId);
      }
      
      // Add ordering
      query += ' ORDER BY a.date DESC';
      
      console.log('API: Executing query:', query);
      console.log('API: With params:', params);
      
      // Fetch activities
      const activities = await db.all(query, params);
      
      // Transform data for the frontend
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        type: activity.type,
        status: activity.status || 'pending',
        date: activity.date,
        duration: activity.duration,
        description: activity.description || '',
        reflection: activity.reflection || '',
        rejectionReason: activity.rejection_reason || '',
        activityType: activity.activity_type || activity.type,
        location: activity.location || '',
        learningOutcomes: activity.learning_outcomes || '',
        feedbackComments: activity.feedback_comments || '',
        student: {
          id: activity.student_id,
          name: activity.student_name
        },
        mentor: {
          id: activity.mentor_id,
          name: activity.mentor_name || 'Unassigned'
        }
      }));

      console.log(`API: Fetched ${formattedActivities.length} activities`);
      return NextResponse.json({ 
        activities: formattedActivities,
        total: formattedActivities.length
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
} 
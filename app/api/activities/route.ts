import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// GET a list of activities or a single activity
export async function GET(req: NextRequest) {
  console.log('GET /api/activities - Request received');
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    // Extract the activity ID from the URL if present
    const url = new URL(req.url);
    const activityId = url.pathname.match(/\/api\/activities\/(\d+)/)?.[1];
    const studentId = url.searchParams.get('studentId');
    
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
      // If activityId is provided, fetch just that activity
      if (activityId) {
        console.log('API: Fetching single activity with ID:', activityId);
        
        // Build the query for a single activity
        const query = `
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
          WHERE a.id = ?
        `;
        
        // Fetch the activity
        const activity = await db.get(query, [activityId]);
        
        if (!activity) {
          return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }
        
        // Check authorization - users can only access their own activities unless admin
        if (roleHeader !== 'admin' && 
            roleHeader === 'student' && 
            activity.student_id.toString() !== userId?.toString()) {
          return NextResponse.json({ error: 'Unauthorized - You can only access your own activities' }, { status: 403 });
        }
        
        // Format the activity
        const formattedActivity = {
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
        };
        
        return NextResponse.json({ activity: formattedActivity });
      }
      
      // Build the query based on user role for listing activities
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
      if (studentId) {
        // Admin wants to see a specific student's activities
        query += ' WHERE a.student_id = ?';
        params.push(studentId);
      } else if (roleHeader === 'student' && userId) {
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

// POST a new activity
export async function POST(req: NextRequest) {
  console.log('POST /api/activities - Request received');
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    if (!roleHeader || !userId) {
      return NextResponse.json({ 
        error: 'Unauthorized - Authentication required' 
      }, { status: 401 });
    }
    
    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.date || !data.type || !data.description) {
      return NextResponse.json({ 
        error: 'Bad Request - Missing required fields' 
      }, { status: 400 });
    }
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    try {
      // Insert new activity
      const result = await db.run(
        `INSERT INTO activities (
          title, 
          date, 
          duration, 
          type,
          status,
          description,
          student_id,
          mentor_id,
          location,
          learning_outcomes,
          feedback_comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.date,
          data.duration || '1 hour',
          data.type,
          data.status || 'pending',
          data.description,
          roleHeader === 'student' ? userId : data.student?.id,
          data.mentor?.id || null,
          data.location || '',
          data.learningOutcomes || '',
          data.feedbackComments || ''
        ]
      );
      
      if (!result.lastID) {
        throw new Error('Failed to insert activity');
      }
      
      // Fetch the newly created activity
      const activity = await db.get(
        `SELECT 
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
        WHERE a.id = ?`,
        [result.lastID]
      );
      
      // Format the activity
      const formattedActivity = {
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
      };
      
      return NextResponse.json({ 
        message: 'Activity created successfully',
        activity: formattedActivity 
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

// PATCH an existing activity
export async function PATCH(req: NextRequest) {
  console.log('PATCH /api/activities - Request received');
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    if (!roleHeader || !userId) {
      return NextResponse.json({ 
        error: 'Unauthorized - Authentication required' 
      }, { status: 401 });
    }
    
    // Extract the activity ID from the URL
    const url = new URL(req.url);
    const activityId = url.pathname.match(/\/api\/activities\/(\d+)/)?.[1];
    
    if (!activityId) {
      return NextResponse.json({ 
        error: 'Bad Request - Activity ID is required' 
      }, { status: 400 });
    }
    
    // Parse request body
    const data = await req.json();
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    try {
      // First, fetch the activity to check permissions
      const existingActivity = await db.get(
        `SELECT * FROM activities WHERE id = ?`,
        [activityId]
      );
      
      if (!existingActivity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
      
      // Check authorization - students can only update their own activities
      if (roleHeader === 'student' && 
          existingActivity.student_id.toString() !== userId?.toString()) {
        return NextResponse.json({ 
          error: 'Unauthorized - You can only update your own activities' 
        }, { status: 403 });
      }
      
      // Build update query based on provided fields
      const updateFields = [];
      const updateValues = [];
      
      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(data.title);
      }
      
      if (data.date !== undefined) {
        updateFields.push('date = ?');
        updateValues.push(data.date);
      }
      
      if (data.duration !== undefined) {
        updateFields.push('duration = ?');
        updateValues.push(data.duration);
      }
      
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }
      
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      
      if (data.reflection !== undefined) {
        updateFields.push('reflection = ?');
        updateValues.push(data.reflection);
      }
      
      if (data.rejectionReason !== undefined) {
        updateFields.push('rejection_reason = ?');
        updateValues.push(data.rejectionReason);
      }
      
      if (data.location !== undefined) {
        updateFields.push('location = ?');
        updateValues.push(data.location);
      }
      
      if (data.learningOutcomes !== undefined) {
        updateFields.push('learning_outcomes = ?');
        updateValues.push(data.learningOutcomes);
      }
      
      if (data.feedbackComments !== undefined) {
        updateFields.push('feedback_comments = ?');
        updateValues.push(data.feedbackComments);
      }
      
      // Only update if there are fields to update
      if (updateFields.length === 0) {
        return NextResponse.json({ 
          error: 'Bad Request - No fields to update' 
        }, { status: 400 });
      }
      
      // Add activityId to the end of update values
      updateValues.push(activityId);
      
      // Execute update query
      await db.run(
        `UPDATE activities SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // Fetch the updated activity
      const updatedActivity = await db.get(
        `SELECT 
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
        WHERE a.id = ?`,
        [activityId]
      );
      
      // Format the activity
      const formattedActivity = {
        id: updatedActivity.id,
        title: updatedActivity.title,
        type: updatedActivity.type,
        status: updatedActivity.status || 'pending',
        date: updatedActivity.date,
        duration: updatedActivity.duration,
        description: updatedActivity.description || '',
        reflection: updatedActivity.reflection || '',
        rejectionReason: updatedActivity.rejection_reason || '',
        activityType: updatedActivity.activity_type || updatedActivity.type,
        location: updatedActivity.location || '',
        learningOutcomes: updatedActivity.learning_outcomes || '',
        feedbackComments: updatedActivity.feedback_comments || '',
        student: {
          id: updatedActivity.student_id,
          name: updatedActivity.student_name
        },
        mentor: {
          id: updatedActivity.mentor_id,
          name: updatedActivity.mentor_name || 'Unassigned'
        }
      };
      
      return NextResponse.json({ 
        message: 'Activity updated successfully',
        activity: formattedActivity 
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

// DELETE an activity
export async function DELETE(req: NextRequest) {
  console.log('DELETE /api/activities - Request received');
  try {
    // Check authentication using custom headers
    const roleHeader = req.headers.get('X-User-Role');
    const userId = req.headers.get('X-User-ID');
    
    if (!roleHeader || !userId) {
      return NextResponse.json({ 
        error: 'Unauthorized - Authentication required' 
      }, { status: 401 });
    }
    
    // Extract the activity ID from the URL
    const url = new URL(req.url);
    const activityId = url.pathname.match(/\/api\/activities\/(\d+)/)?.[1];
    
    if (!activityId) {
      return NextResponse.json({ 
        error: 'Bad Request - Activity ID is required' 
      }, { status: 400 });
    }
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
    
    try {
      // First, fetch the activity to check permissions
      const existingActivity = await db.get(
        `SELECT * FROM activities WHERE id = ?`,
        [activityId]
      );
      
      if (!existingActivity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }
      
      // Check authorization
      // Only admins and the activity owner can delete activities
      if (roleHeader !== 'admin' && 
          (roleHeader === 'student' && existingActivity.student_id.toString() !== userId?.toString())) {
        return NextResponse.json({ 
          error: 'Unauthorized - You can only delete your own activities' 
        }, { status: 403 });
      }
      
      // Delete the activity
      await db.run(
        `DELETE FROM activities WHERE id = ?`,
        [activityId]
      );
      
      return NextResponse.json({ 
        message: 'Activity deleted successfully'
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('API: Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth-service';
import { getAll, runQuery, getOne } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/experience/[userId]
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Authentication check
    const authResult = await authenticateAndAuthorize(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get user ID from params
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // For security: users can only access their own data unless they're an admin
    // Get user info from token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Check if user has permission to access this data
    if (decoded.id !== userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to access this data' },
        { status: 403 }
      );
    }
    
    // Get experience entries for this user from the database
    const experience = await getAll(
      'SELECT * FROM user_experience WHERE user_id = ? ORDER BY current DESC, end_date DESC, start_date DESC',
      [userId]
    );
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching user experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/experience/[userId]
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Authentication check
    const authResult = await authenticateAndAuthorize(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get user ID from params
    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get experience data from request
    const experienceData = await request.json();
    
    // Validate required fields
    if (!experienceData.company || !experienceData.title) {
      return NextResponse.json(
        { error: 'Company and title are required fields' },
        { status: 400 }
      );
    }
    
    // If this is marked as current job and end_date is null, set current to true
    const currentJob = experienceData.current || 
                      (experienceData.end_date === null || experienceData.end_date === '') ? 1 : 0;
    
    // Insert experience entry
    const result = await runQuery(
      `INSERT INTO user_experience 
      (id, user_id, title, company, location, start_date, end_date, current, description, created_at, updated_at) 
      VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        userId,
        experienceData.title,
        experienceData.company,
        experienceData.location || null,
        experienceData.start_date || null,
        experienceData.end_date || null,
        currentJob,
        experienceData.description || null
      ]
    );
    
    // Get the inserted experience entry
    const newExperience = await getOne(
      'SELECT * FROM user_experience WHERE id = last_insert_rowid()',
      []
    );
    
    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error('Error adding experience:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/experience/[userId]/[experienceId]
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string, experienceId: string } }
) {
  try {
    // Authentication check
    const authResult = await authenticateAndAuthorize(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get user ID and experience ID from params
    const { userId, experienceId } = params;
    if (!userId || !experienceId) {
      return NextResponse.json(
        { error: 'User ID and Experience ID are required' },
        { status: 400 }
      );
    }
    
    // Delete experience entry
    await runQuery(
      'DELETE FROM user_experience WHERE id = ? AND user_id = ?',
      [experienceId, userId]
    );
    
    return NextResponse.json(
      { message: 'Experience entry deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting experience entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/experience/[userId]/[experienceId]
export async function PUT(
  request: Request,
  { params }: { params: { userId: string, experienceId: string } }
) {
  try {
    // Authentication check
    const authResult = await authenticateAndAuthorize(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get user ID and experience ID from params
    const { userId, experienceId } = params;
    if (!userId || !experienceId) {
      return NextResponse.json(
        { error: 'User ID and Experience ID are required' },
        { status: 400 }
      );
    }
    
    // Get experience data from request
    const experienceData = await request.json();
    
    // Validate required fields
    if (!experienceData.company || !experienceData.title) {
      return NextResponse.json(
        { error: 'Company and title are required fields' },
        { status: 400 }
      );
    }
    
    // If this is marked as current job and end_date is null, set current to true
    const currentJob = experienceData.current || 
                      (experienceData.end_date === null || experienceData.end_date === '') ? 1 : 0;
    
    // Update experience entry
    await runQuery(
      `UPDATE user_experience SET 
      company = ?, 
      title = ?, 
      location = ?, 
      start_date = ?, 
      end_date = ?, 
      current = ?,
      description = ?,
      updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
      [
        experienceData.company,
        experienceData.title,
        experienceData.location || null,
        experienceData.start_date || null,
        experienceData.end_date || null,
        currentJob,
        experienceData.description || null,
        experienceId,
        userId
      ]
    );
    
    // Get the updated experience entry
    const updatedExperience = await getOne(
      'SELECT * FROM user_experience WHERE id = ?',
      [experienceId]
    );
    
    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth-service';
import { getAll, runQuery, getOne } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/education/[userId]
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
    
    // Get education entries for this user from the database
    const education = await getAll(
      'SELECT * FROM user_education WHERE user_id = ? ORDER BY end_date DESC, start_date DESC',
      [userId]
    );
    
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error fetching user education:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/education/[userId]
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
    
    // Get education data from request
    const educationData = await request.json();
    
    // Validate required fields
    if (!educationData.institution || !educationData.degree) {
      return NextResponse.json(
        { error: 'Institution and degree are required fields' },
        { status: 400 }
      );
    }
    
    // Insert education entry
    const result = await runQuery(
      `INSERT INTO user_education 
      (user_id, institution, degree, field_of_study, start_date, end_date, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        educationData.institution,
        educationData.degree,
        educationData.field_of_study || null,
        educationData.start_date || null,
        educationData.end_date || null,
        educationData.description || null
      ]
    );
    
    // Get the inserted education entry
    const newEducation = await getOne(
      'SELECT * FROM user_education WHERE id = ?',
      [result.lastID]
    );
    
    return NextResponse.json(newEducation, { status: 201 });
  } catch (error) {
    console.error('Error adding education:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/education/[userId]/[educationId]
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string, educationId: string } }
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
    
    // Get user ID and education ID from params
    const { userId, educationId } = params;
    if (!userId || !educationId) {
      return NextResponse.json(
        { error: 'User ID and Education ID are required' },
        { status: 400 }
      );
    }
    
    // Delete education entry
    await runQuery(
      'DELETE FROM user_education WHERE id = ? AND user_id = ?',
      [educationId, userId]
    );
    
    return NextResponse.json(
      { message: 'Education entry deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting education entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/education/[userId]/[educationId]
export async function PUT(
  request: Request,
  { params }: { params: { userId: string, educationId: string } }
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
    
    // Get user ID and education ID from params
    const { userId, educationId } = params;
    if (!userId || !educationId) {
      return NextResponse.json(
        { error: 'User ID and Education ID are required' },
        { status: 400 }
      );
    }
    
    // Get education data from request
    const educationData = await request.json();
    
    // Validate required fields
    if (!educationData.institution || !educationData.degree) {
      return NextResponse.json(
        { error: 'Institution and degree are required fields' },
        { status: 400 }
      );
    }
    
    // Update education entry
    await runQuery(
      `UPDATE user_education SET 
      institution = ?, 
      degree = ?, 
      field_of_study = ?, 
      start_date = ?, 
      end_date = ?, 
      description = ? 
      WHERE id = ? AND user_id = ?`,
      [
        educationData.institution,
        educationData.degree,
        educationData.field_of_study || null,
        educationData.start_date || null,
        educationData.end_date || null,
        educationData.description || null,
        educationId,
        userId
      ]
    );
    
    // Get the updated education entry
    const updatedEducation = await getOne(
      'SELECT * FROM user_education WHERE id = ?',
      [educationId]
    );
    
    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error('Error updating education entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth-service';
import { getAll, runQuery } from '@/lib/db';

// GET /api/skills/[userId]
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
    
    // Get skills for this user from the database
    const skills = await getAll(
      'SELECT * FROM user_skills WHERE user_id = ?',
      [userId]
    );
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/skills/[userId]
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
    
    // Get skill data from request
    const { skill, level, years_experience } = await request.json();
    
    // Validate inputs
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }
    
    // Valid levels
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid skill level' },
        { status: 400 }
      );
    }
    
    // Insert skill
    await runQuery(
      'INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)',
      [userId, skill, level, years_experience || 0]
    );
    
    return NextResponse.json(
      { message: 'Skill added successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding user skill:', error);
    
    // Check for duplicate constraint error
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'This skill already exists for this user' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/skills/[userId]/[skillId]
export async function PUT(
  request: Request,
  { params }: { params: { userId: string; skillId: string } }
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
    
    // Get user ID and skill ID from params
    const { userId, skillId } = params;
    if (!userId || !skillId) {
      return NextResponse.json(
        { error: 'User ID and Skill ID are required' },
        { status: 400 }
      );
    }
    
    // Get skill data from request
    const { level, years_experience } = await request.json();
    
    // Valid levels
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid skill level' },
        { status: 400 }
      );
    }
    
    // Update skill
    await runQuery(
      'UPDATE user_skills SET level = ?, years_experience = ? WHERE id = ? AND user_id = ?',
      [level, years_experience, skillId, userId]
    );
    
    return NextResponse.json(
      { message: 'Skill updated successfully' }
    );
  } catch (error: any) {
    console.error('Error updating user skill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[userId]/[skillId]
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string; skillId: string } }
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
    
    // Get user ID and skill ID from params
    const { userId, skillId } = params;
    if (!userId || !skillId) {
      return NextResponse.json(
        { error: 'User ID and Skill ID are required' },
        { status: 400 }
      );
    }
    
    // Delete skill
    await runQuery(
      'DELETE FROM user_skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );
    
    return NextResponse.json(
      { message: 'Skill deleted successfully' }
    );
  } catch (error: any) {
    console.error('Error deleting user skill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
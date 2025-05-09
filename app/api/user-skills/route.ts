import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Function to ensure database is accessible
async function getDatabase() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

// Get skills for a specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve user skills'
      }, { status: 500 });
    }

    // Check if the user exists
    const user = await db.get('SELECT id, role FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'The specified user does not exist'
      }, { status: 404 });
    }

    // Get user skills
    const skills = await db.all(
      'SELECT id, skill, level, years_experience FROM user_skills WHERE user_id = ?',
      [userId]
    );
    
    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/user-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve user skills'
    }, { status: 500 });
  }
}

// Add a new skill for a user
export async function POST(request: Request) {
  try {
    const { userId, skill, level = 'intermediate', yearsExperience = 0 } = await request.json();
    
    if (!userId || !skill) {
      return NextResponse.json({ 
        error: 'User ID and skill are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to add user skill'
      }, { status: 500 });
    }

    // Check if the user exists
    const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'The specified user does not exist'
      }, { status: 404 });
    }

    // Check if skill already exists for this user
    const existingSkill = await db.get(
      'SELECT id FROM user_skills WHERE user_id = ? AND skill = ?',
      [userId, skill]
    );
    
    if (existingSkill) {
      return NextResponse.json({ 
        error: 'Skill already exists',
        message: 'This skill is already associated with the user'
      }, { status: 400 });
    }

    // Add the skill
    const result = await db.run(
      'INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)',
      [userId, skill, level, yearsExperience]
    );
    
    const newSkillId = result.lastID;
    
    // Get the inserted skill
    const insertedSkill = await db.get(
      'SELECT id, skill, level, years_experience FROM user_skills WHERE id = ?',
      [newSkillId]
    );
    
    return NextResponse.json({
      message: 'Skill added successfully',
      skill: insertedSkill
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/user-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to add user skill'
    }, { status: 500 });
  }
}

// Update or delete user skills
export async function PUT(request: Request) {
  try {
    const { userId, skills } = await request.json();
    
    if (!userId || !Array.isArray(skills)) {
      return NextResponse.json({ 
        error: 'User ID and skills array are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to update user skills'
      }, { status: 500 });
    }

    // Check if the user exists
    const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'The specified user does not exist'
      }, { status: 404 });
    }

    // Begin transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Get existing skills
      const existingSkills = await db.all(
        'SELECT skill FROM user_skills WHERE user_id = ?',
        [userId]
      );
      
      const existingSkillNames = existingSkills.map(s => s.skill);
      
      // Skills to add
      const skillsToAdd = skills.filter(s => !existingSkillNames.includes(s));
      
      // Skills to remove
      const skillsToRemove = existingSkillNames.filter(s => !skills.includes(s));
      
      // Add new skills
      for (const skill of skillsToAdd) {
        await db.run(
          'INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)',
          [userId, skill, 'intermediate', 0]
        );
      }
      
      // Remove old skills
      if (skillsToRemove.length > 0) {
        const placeholders = skillsToRemove.map(() => '?').join(',');
        await db.run(
          `DELETE FROM user_skills WHERE user_id = ? AND skill IN (${placeholders})`,
          [userId, ...skillsToRemove]
        );
      }
      
      // Commit transaction
      await db.run('COMMIT');
      
      // Get updated skills
      const updatedSkills = await db.all(
        'SELECT id, skill, level, years_experience FROM user_skills WHERE user_id = ?',
        [userId]
      );
      
      return NextResponse.json({
        message: 'Skills updated successfully',
        added: skillsToAdd.length,
        removed: skillsToRemove.length,
        skills: updatedSkills
      }, { status: 200 });
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in PUT /api/user-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to update user skills'
    }, { status: 500 });
  }
} 
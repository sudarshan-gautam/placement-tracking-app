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

// Get skills for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve user skills'
      }, { status: 500 });
    }

    // Check if the user_skills table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='user_skills'`
    );
    
    if (!tableExists) {
      // Create user_skills table if it doesn't exist
      await db.exec(`
        CREATE TABLE user_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          skill TEXT NOT NULL,
          level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
          years_experience INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(user_id, skill)
        )
      `);
      
      // Also create a user_profile table for additional user details
      const profileTableExists = await db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'`
      );
      
      if (!profileTableExists) {
        await db.exec(`
          CREATE TABLE user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            biography TEXT,
            education TEXT,
            graduation_year INTEGER,
            preferred_job_type TEXT,
            preferred_location TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id)
          )
        `);
      }
    }

    // Get user skills
    const skills = await db.all(
      'SELECT * FROM user_skills WHERE user_id = ? ORDER BY skill',
      userId
    );
    
    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/user/skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve user skills'
    }, { status: 500 });
  }
}

// Add or update user skills
export async function POST(request: Request) {
  try {
    const { userId, skills } = await request.json();
    
    if (!userId || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ 
        error: 'User ID and skills array are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to process user skills'
      }, { status: 500 });
    }

    // Check if the user_skills table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='user_skills'`
    );
    
    if (!tableExists) {
      // Create user_skills table if it doesn't exist
      await db.exec(`
        CREATE TABLE user_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          skill TEXT NOT NULL,
          level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
          years_experience INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(user_id, skill)
        )
      `);
    }

    // Begin transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Remove existing skills for this user
      await db.run('DELETE FROM user_skills WHERE user_id = ?', userId);
      
      // Add new skills
      for (const skill of skills) {
        const { name, level = 'intermediate', yearsExperience = 0 } = skill;
        
        if (!name) continue;
        
        await db.run(
          'INSERT INTO user_skills (user_id, skill, level, years_experience) VALUES (?, ?, ?, ?)',
          [userId, name, level, yearsExperience]
        );
      }
      
      // Commit transaction
      await db.run('COMMIT');
      
      // Get updated skills
      const updatedSkills = await db.all(
        'SELECT * FROM user_skills WHERE user_id = ? ORDER BY skill',
        userId
      );
      
      return NextResponse.json({
        message: 'Skills updated successfully',
        skills: updatedSkills
      }, { status: 200 });
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to process user skills'
    }, { status: 500 });
  }
}

// Delete a user skill
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const skill = searchParams.get('skill');
    
    if (!userId || !skill) {
      return NextResponse.json({ 
        error: 'User ID and skill name are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to delete user skill'
      }, { status: 500 });
    }

    // Delete the skill
    await db.run(
      'DELETE FROM user_skills WHERE user_id = ? AND skill = ?',
      [userId, skill]
    );
    
    return NextResponse.json({
      message: 'Skill deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/user/skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to delete user skill'
    }, { status: 500 });
  }
} 
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

// Add skills for a job
export async function POST(request: Request) {
  try {
    const { jobId, skills } = await request.json();
    
    if (!jobId || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ 
        error: 'Job ID and skills array are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to save job skills'
      }, { status: 500 });
    }

    // Check if the job_skills table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='job_skills'`
    );
    
    if (!tableExists) {
      // Create job_skills table if it doesn't exist
      await db.exec(`
        CREATE TABLE job_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT NOT NULL,
          skill TEXT NOT NULL,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);
    }

    // Start a transaction to ensure all skills are added or none
    await db.exec('BEGIN TRANSACTION');
    
    try {
      for (const skill of skills) {
        await db.run(
          'INSERT INTO job_skills (job_id, skill) VALUES (?, ?)',
          [jobId, skill]
        );
      }
      
      await db.exec('COMMIT');
      
      return NextResponse.json({ 
        message: 'Job skills saved successfully',
        count: skills.length
      }, { status: 201 });
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /api/job-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to save job skills'
    }, { status: 500 });
  }
}

// Update skills for a job
export async function PUT(request: Request) {
  try {
    const { jobId, skills } = await request.json();
    
    if (!jobId || !Array.isArray(skills)) {
      return NextResponse.json({ 
        error: 'Job ID and skills array are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to update job skills'
      }, { status: 500 });
    }

    // Check if the job_skills table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='job_skills'`
    );
    
    if (!tableExists) {
      // Create job_skills table if it doesn't exist
      await db.exec(`
        CREATE TABLE job_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT NOT NULL,
          skill TEXT NOT NULL,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);
    }

    // Start a transaction to ensure all skills are updated atomically
    await db.exec('BEGIN TRANSACTION');
    
    try {
      // Delete existing skills for this job
      await db.run('DELETE FROM job_skills WHERE job_id = ?', jobId);
      
      // Add the new skills
      if (skills.length > 0) {
        for (const skill of skills) {
          await db.run(
            'INSERT INTO job_skills (job_id, skill) VALUES (?, ?)',
            [jobId, skill]
          );
        }
      }
      
      await db.exec('COMMIT');
      
      return NextResponse.json({ 
        message: 'Job skills updated successfully',
        count: skills.length
      }, { status: 200 });
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in PUT /api/job-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to update job skills'
    }, { status: 500 });
  }
}

// Get skills for a job
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve job skills'
      }, { status: 500 });
    }

    // Check if the job_skills table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='job_skills'`
    );
    
    if (!tableExists) {
      return NextResponse.json({ skills: [] }, { status: 200 });
    }

    // Get skills for this job
    const skills = await db.all(
      'SELECT skill FROM job_skills WHERE job_id = ?',
      jobId
    );
    
    return NextResponse.json({ 
      skills: skills.map(row => row.skill)
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/job-skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve job skills',
      skills: []
    }, { status: 500 });
  }
} 
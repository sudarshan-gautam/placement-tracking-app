import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

// Function to ensure database is accessible
async function getDatabase() {
  try {
    const dbPath = './database.sqlite';
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.error('Database file not found:', dbPath);
      return null;
    }
    
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Test database connection with a simple query
    await db.get('SELECT 1');
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

// Get a specific job by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve job due to database connection issues'
      }, { status: 500 });
    }

    // Get the job from database
    try {
      const query = `SELECT * FROM jobs WHERE id = ?`;
      
      const job = await db.get(query, id);
      
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      // Get skills for the job
      const skills = await db.all(`
        SELECT skill FROM job_skills 
        WHERE job_id = ?
      `, [id]);
      
      job.skills = skills.map(s => s.skill);
      
      // Calculate match percentage if userId is provided
      if (userId) {
        // Get user skills
        const userSkills = await db.all(`
          SELECT skill FROM user_skills 
          WHERE user_id = ?
        `, [userId]);
        
        const userSkillNames = userSkills.map(s => s.skill.toLowerCase());
        const jobSkillNames = job.skills.map((s: string) => s.toLowerCase());
        
        if (userSkillNames.length === 0 || jobSkillNames.length === 0) {
          job.match = 0;
        } else {
          // Count matching skills
          const matchingSkills = jobSkillNames.filter((jobSkill: string) => 
            userSkillNames.some((userSkill: string) => 
              userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
            )
          );
          
          // Calculate percentage
          job.match = Math.round((matchingSkills.length / jobSkillNames.length) * 100);
        }
      }
      
      return NextResponse.json(job, { status: 200 });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json({ 
        error: 'Database query error',
        message: 'Unable to retrieve job due to database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve job due to server error'
    }, { status: 500 });
  }
} 
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

// Get all jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userId = searchParams.get('userId');
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed' 
      }, { status: 500 });
    }
    
    try {
      // Get total count for pagination
      const totalResult = await db.get('SELECT COUNT(*) as count FROM jobs');
      const total = totalResult.count;
      
      // Get all jobs with pagination
      const jobs = await db.all(`
        SELECT * FROM jobs
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      // Fetch skills for each job
      for (const job of jobs) {
        const skills = await db.all(`
          SELECT skill FROM job_skills 
          WHERE job_id = ?
        `, [job.id]);
        
        // Extract skill strings from the query result
        job.skills = skills.map(s => s.skill);
        
        // Log the skills for each job
        console.log(`Job ${job.title} (${job.id}): Added ${job.skills.length} skills:`, job.skills);
        
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
      }
      
      return NextResponse.json({
        jobs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }, { status: 200 });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json({ 
        error: 'Database query error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Create a new job
export async function POST(request: Request) {
  try {
    const jobData = await request.json();
    
    // Validate required fields
    if (!jobData.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to create job due to database connection issues'
      }, { status: 500 });
    }

    // Build the query with proper parameter binding for security
    const query = `
      INSERT INTO jobs (
        id,
        title, 
        description, 
        location, 
        salary_range, 
        requirements, 
        deadline, 
        status
      ) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Set default values for missing fields
    const params = [
      jobData.title,
      jobData.description || '',
      jobData.location || '',
      jobData.salary_range || '',
      jobData.requirements || '',
      jobData.deadline || '',
      jobData.status || 'active'
    ];
    
    try {
      const result = await db.run(query, ...params);
      
      // Get the created job with its new ID
      const newJob = await db.get('SELECT * FROM jobs WHERE rowid = ?', result.lastID);
      
      return NextResponse.json(newJob, { status: 201 });
    } catch (queryError) {
      console.error('Database insert error:', queryError);
      return NextResponse.json({ 
        error: 'Database insert error',
        message: 'Unable to create job due to database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: 'Unable to create job due to server error'
    }, { status: 500 });
  }
}

// Update a job
export async function PATCH(request: Request) {
  try {
    const jobData = await request.json();
    
    if (!jobData.id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to update job due to database connection issues'
      }, { status: 500 });
    }

    // Check if job exists
    const existingJob = await db.get('SELECT * FROM jobs WHERE id = ?', jobData.id);
    
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Build update query dynamically based on provided fields
    const fields = [];
    const values = [];
    
    if (jobData.title) {
      fields.push('title = ?');
      values.push(jobData.title);
    }
    
    if (jobData.description !== undefined) {
      fields.push('description = ?');
      values.push(jobData.description);
    }
    
    if (jobData.location !== undefined) {
      fields.push('location = ?');
      values.push(jobData.location);
    }
    
    if (jobData.salary_range !== undefined) {
      fields.push('salary_range = ?');
      values.push(jobData.salary_range);
    }
    
    if (jobData.requirements !== undefined) {
      fields.push('requirements = ?');
      values.push(jobData.requirements);
    }
    
    if (jobData.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(jobData.deadline);
    }
    
    if (jobData.status !== undefined) {
      fields.push('status = ?');
      values.push(jobData.status);
    }
    
    // Add job ID to values array for WHERE clause
    values.push(jobData.id);
    
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    const query = `
      UPDATE jobs
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    try {
      await db.run(query, ...values);
      
      // Get updated job
      const updatedJob = await db.get('SELECT * FROM jobs WHERE id = ?', jobData.id);
      
      return NextResponse.json(updatedJob, { status: 200 });
    } catch (queryError) {
      console.error('Database update error:', queryError);
      return NextResponse.json({ 
        error: 'Database update error',
        message: 'Unable to update job due to database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PATCH /api/jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to update job due to server error'
    }, { status: 500 });
  }
}

// Delete a job
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to delete job due to database connection issues'
      }, { status: 500 });
    }
    
    // Check if job exists
    const existingJob = await db.get('SELECT * FROM jobs WHERE id = ?', id);
    
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Delete the job
    try {
      await db.run('DELETE FROM jobs WHERE id = ?', id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Job deleted successfully'
      }, { status: 200 });
    } catch (queryError) {
      console.error('Database delete error:', queryError);
      return NextResponse.json({ 
        error: 'Database delete error',
        message: 'Unable to delete job due to database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to delete job due to server error'
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all job posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Build the query
    let query = `
      SELECT 
        j.*,
        c.name as company_name,
        c.logo as company_logo,
        c.website as company_website
      FROM job_posts j
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (companyId) {
      query += ' AND j.company_id = ?';
      params.push(companyId);
    }
    
    if (status) {
      query += ' AND j.status = ?';
      params.push(status);
    }
    
    if (location) {
      query += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }
    
    query += ' ORDER BY j.created_at DESC';
    
    // Get job posts
    const jobs = await db.all(query, params);
    
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error('Error fetching job posts:', error);
    return NextResponse.json({ error: 'Failed to fetch job posts' }, { status: 500 });
  }
}

// Create a new job post
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      company_id, 
      title, 
      description, 
      requirements, 
      salary_range, 
      location, 
      deadline,
      status = 'active'
    } = data;
    
    if (!company_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields: company_id, title, and description are required' }, { status: 400 });
    }
    
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    
    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Insert the job post
    await db.run(`
      INSERT INTO job_posts (
        id, company_id, title, description, requirements, salary_range, location, deadline, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
    `, [
      id, company_id, title, description, requirements || null, salary_range || null, 
      location || null, deadline || null, status
    ]);
    
    // Get the created job post
    const newJob = await db.get(`
      SELECT 
        j.*,
        c.name as company_name,
        c.logo as company_logo,
        c.website as company_website
      FROM job_posts j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
    `, [id]);
    
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job post:', error);
    return NextResponse.json({ error: 'Failed to create job post' }, { status: 500 });
  }
}

// Update a job post
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { 
      id, 
      title, 
      description, 
      requirements, 
      salary_range, 
      location, 
      deadline,
      status
    } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing job post ID' }, { status: 400 });
    }
    
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    
    // Check if job post exists
    const existingJob = await db.get('SELECT * FROM job_posts WHERE id = ?', [id]);
    if (!existingJob) {
      return NextResponse.json({ error: 'Job post not found' }, { status: 404 });
    }
    
    // Build the update query
    let sql = 'UPDATE job_posts SET updated_at = datetime("now")';
    const params = [];
    
    if (title) {
      sql += ', title = ?';
      params.push(title);
    }
    
    if (description) {
      sql += ', description = ?';
      params.push(description);
    }
    
    if (requirements !== undefined) {
      sql += ', requirements = ?';
      params.push(requirements);
    }
    
    if (salary_range !== undefined) {
      sql += ', salary_range = ?';
      params.push(salary_range);
    }
    
    if (location !== undefined) {
      sql += ', location = ?';
      params.push(location);
    }
    
    if (deadline !== undefined) {
      sql += ', deadline = ?';
      params.push(deadline);
    }
    
    if (status) {
      sql += ', status = ?';
      params.push(status);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    // Update the job post
    await db.run(sql, params);
    
    // Get the updated job post
    const updatedJob = await db.get(`
      SELECT 
        j.*,
        c.name as company_name,
        c.logo as company_logo,
        c.website as company_website
      FROM job_posts j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = ?
    `, [id]);
    
    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error('Error updating job post:', error);
    return NextResponse.json({ error: 'Failed to update job post' }, { status: 500 });
  }
} 
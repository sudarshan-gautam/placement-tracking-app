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

// Get job applications for a student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve job applications'
      }, { status: 500 });
    }

    // Check if the job_applications table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='job_applications'`
    );
    
    if (!tableExists) {
      // Create job_applications table if it doesn't exist
      await db.exec(`
        CREATE TABLE job_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          job_id TEXT NOT NULL,
          status TEXT CHECK(status IN ('draft', 'submitted', 'reviewed', 'interview', 'offered', 'rejected')) DEFAULT 'submitted',
          date_applied TEXT DEFAULT (datetime('now')),
          cover_letter TEXT,
          additional_info TEXT,
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          UNIQUE(student_id, job_id)
        )
      `);
    }

    // Get applications with job details
    const applications = await db.all(`
      SELECT a.*, j.title as job_title
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.student_id = ?
      ORDER BY a.date_applied DESC
    `, studentId);
    
    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/student/applications:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve job applications'
    }, { status: 500 });
  }
}

// Submit a job application
export async function POST(request: Request) {
  try {
    const { studentId, jobId, coverLetter, additionalInfo } = await request.json();
    
    if (!studentId || !jobId) {
      return NextResponse.json({ 
        error: 'Student ID and Job ID are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to process job application'
      }, { status: 500 });
    }

    // Check if the job_applications table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='job_applications'`
    );
    
    if (!tableExists) {
      // Create job_applications table if it doesn't exist
      await db.exec(`
        CREATE TABLE job_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          job_id TEXT NOT NULL,
          status TEXT CHECK(status IN ('draft', 'submitted', 'reviewed', 'interview', 'offered', 'rejected')) DEFAULT 'submitted',
          date_applied TEXT DEFAULT (datetime('now')),
          cover_letter TEXT,
          additional_info TEXT,
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          UNIQUE(student_id, job_id)
        )
      `);
    }

    // Check if already applied
    const existingApplication = await db.get(
      'SELECT id, status FROM job_applications WHERE student_id = ? AND job_id = ?',
      [studentId, jobId]
    );

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'You have already applied for this job',
        applicationId: existingApplication.id,
        status: existingApplication.status
      }, { status: 400 });
    }

    // Submit the application
    const result = await db.run(
      'INSERT INTO job_applications (student_id, job_id, cover_letter, additional_info) VALUES (?, ?, ?, ?)',
      [studentId, jobId, coverLetter || '', additionalInfo || '']
    );
    
    // Get the created application
    const application = await db.get(
      'SELECT * FROM job_applications WHERE id = ?',
      result.lastID
    );
    
    return NextResponse.json({
      message: 'Application submitted successfully',
      application
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/student/applications:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to process job application'
    }, { status: 500 });
  }
}

// Update a job application
export async function PATCH(request: Request) {
  try {
    const { applicationId, status, coverLetter, additionalInfo } = await request.json();
    
    if (!applicationId) {
      return NextResponse.json({ 
        error: 'Application ID is required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to update job application'
      }, { status: 500 });
    }

    // Build update query
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (coverLetter !== undefined) {
      updates.push('cover_letter = ?');
      params.push(coverLetter);
    }
    
    if (additionalInfo !== undefined) {
      updates.push('additional_info = ?');
      params.push(additionalInfo);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ 
        error: 'No fields to update' 
      }, { status: 400 });
    }
    
    // Add applicationId to params
    params.push(applicationId);
    
    // Update the application
    await db.run(
      `UPDATE job_applications SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    // Get the updated application
    const application = await db.get(
      'SELECT * FROM job_applications WHERE id = ?',
      applicationId
    );
    
    if (!application) {
      return NextResponse.json({ 
        error: 'Application not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Application updated successfully',
      application
    }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/student/applications:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to update job application'
    }, { status: 500 });
  }
} 
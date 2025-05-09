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

// Get saved jobs for a student
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
        message: 'Unable to retrieve saved jobs'
      }, { status: 500 });
    }

    // Check if the saved_jobs table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='saved_jobs'`
    );
    
    if (!tableExists) {
      // Create saved_jobs table if it doesn't exist
      await db.exec(`
        CREATE TABLE saved_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          job_id TEXT NOT NULL,
          saved_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          UNIQUE(student_id, job_id)
        )
      `);
    }

    // Get saved jobs with job details
    const savedJobs = await db.all(`
      SELECT j.*, s.saved_at
      FROM saved_jobs s
      JOIN jobs j ON s.job_id = j.id
      WHERE s.student_id = ?
      ORDER BY s.saved_at DESC
    `, studentId);
    
    return NextResponse.json({ savedJobs }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/student/saved-jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve saved jobs'
    }, { status: 500 });
  }
}

// Save or unsave a job
export async function POST(request: Request) {
  try {
    const { studentId, jobId, action } = await request.json();
    
    if (!studentId || !jobId) {
      return NextResponse.json({ 
        error: 'Student ID and Job ID are required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to process saved job'
      }, { status: 500 });
    }

    // Check if the saved_jobs table exists
    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='saved_jobs'`
    );
    
    if (!tableExists) {
      // Create saved_jobs table if it doesn't exist
      await db.exec(`
        CREATE TABLE saved_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          job_id TEXT NOT NULL,
          saved_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          UNIQUE(student_id, job_id)
        )
      `);
    }

    // Check if already saved
    const existingSave = await db.get(
      'SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?',
      [studentId, jobId]
    );

    if (action === 'save' && !existingSave) {
      // Save the job
      await db.run(
        'INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)',
        [studentId, jobId]
      );
      
      return NextResponse.json({ 
        message: 'Job saved successfully',
        saved: true
      }, { status: 200 });
    } 
    else if (action === 'unsave' && existingSave) {
      // Unsave the job
      await db.run(
        'DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?',
        [studentId, jobId]
      );
      
      return NextResponse.json({ 
        message: 'Job unsaved successfully',
        saved: false
      }, { status: 200 });
    }
    else if (action === 'toggle') {
      if (existingSave) {
        // Unsave the job
        await db.run(
          'DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?',
          [studentId, jobId]
        );
        
        return NextResponse.json({ 
          message: 'Job unsaved successfully',
          saved: false
        }, { status: 200 });
      } else {
        // Save the job
        await db.run(
          'INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)',
          [studentId, jobId]
        );
        
        return NextResponse.json({ 
          message: 'Job saved successfully',
          saved: true
        }, { status: 200 });
      }
    }
    
    // No changes made (already in desired state)
    return NextResponse.json({ 
      message: 'No changes made',
      saved: !!existingSave
    }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/student/saved-jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to process saved job'
    }, { status: 500 });
  }
} 
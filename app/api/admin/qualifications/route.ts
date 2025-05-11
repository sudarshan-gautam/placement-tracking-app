import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { roleMiddleware } from '@/lib/auth-middleware';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// GET endpoint to retrieve all qualifications with student details
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to access this endpoint
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const studentId = searchParams.get('studentId');

    // Open database connection
    const db = await openDb();

    // Build query with optional filters
    let query = `
      SELECT q.*, 
             u.name as student_name, 
             u.email as student_email,
             v.name as verifier_name
      FROM qualifications q
      JOIN users u ON q.student_id = u.id
      LEFT JOIN users v ON q.verified_by = v.id
    `;

    const queryParams = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push('q.verification_status = ?');
      queryParams.push(status);
    }

    if (type) {
      whereConditions.push('q.type = ?');
      queryParams.push(type);
    }

    if (studentId) {
      whereConditions.push('q.student_id = ?');
      queryParams.push(studentId);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add sorting
    query += ' ORDER BY q.date_obtained DESC';

    // Execute query
    const qualifications = await db.all(query, ...queryParams);

    // Close database connection
    await db.close();

    return NextResponse.json(qualifications);
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch qualifications' },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new qualification (admin can add for any student)
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to access this endpoint
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const {
      student_id,
      title,
      issuing_organization,
      description,
      date_obtained,
      expiry_date,
      type,
      certificate_url,
      verification_status = 'pending',
      verified_by
    } = data;

    // Validate required fields
    if (!student_id || !title || !issuing_organization || !date_obtained || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Open database connection
    const db = await openDb();

    // Check if student exists
    const student = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', student_id, 'student');
    if (!student) {
      await db.close();
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if verifier exists (if provided)
    if (verified_by) {
      const verifier = await db.get('SELECT id FROM users WHERE id = ?', verified_by);
      if (!verifier) {
        await db.close();
        return NextResponse.json(
          { error: 'Verifier not found' },
          { status: 404 }
        );
      }
    }

    // Insert new qualification
    const result = await db.run(
      `INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description,
        date_obtained, expiry_date, certificate_url, type, 
        verification_status, verified_by
      ) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      student_id,
      title,
      issuing_organization,
      description || null,
      date_obtained,
      expiry_date || null,
      certificate_url || null,
      type,
      verification_status,
      verification_status === 'verified' ? (verified_by || user.id) : null
    );

    // Fetch the newly created qualification
    const qualification = await db.get(
      `SELECT * FROM qualifications WHERE rowid = ?`,
      result.lastID
    );

    // Close database connection
    await db.close();

    return NextResponse.json(qualification, { status: 201 });
  } catch (error) {
    console.error('Error adding qualification:', error);
    return NextResponse.json(
      { error: 'Failed to add qualification' },
      { status: 500 }
    );
  }
} 
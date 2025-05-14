import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { roleMiddleware } from '@/lib/auth-middleware';
import { Qualification } from '@/types/qualification';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// GET endpoint to retrieve all qualifications for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow students to view their own qualifications, or mentors/admins to view any
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Open database connection
    const db = await openDb();

    // Fetch qualifications
    const qualifications = await db.all<Qualification[]>(
      `SELECT * FROM qualifications WHERE student_id = ? ORDER BY date_obtained DESC`,
      params.id
    );

    // Close database connection
    await db.close();

    // Create a response with proper caching headers
    const response = NextResponse.json(qualifications);
    
    // Enable caching for 5 minutes (300 seconds)
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    
    return response;
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch qualifications' },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new qualification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow students to add their own qualifications, or admins to add for any student
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const {
      title,
      issuing_organization,
      description,
      date_obtained,
      expiry_date,
      type,
      certificate_url
    } = data;

    // Validate required fields
    if (!title || !issuing_organization || !date_obtained || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Open database connection
    const db = await openDb();

    // Insert new qualification
    const result = await db.run(
      `INSERT INTO qualifications (
        id, student_id, title, issuing_organization, description,
        date_obtained, expiry_date, certificate_url, type, verification_status
      ) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      params.id,
      title,
      issuing_organization,
      description || null,
      date_obtained,
      expiry_date || null,
      certificate_url || null,
      type
    );

    // Fetch the newly created qualification
    const qualification = await db.get<Qualification>(
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

// PATCH endpoint to update an existing qualification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow students to update their own qualifications, or admins to update any
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const {
      id,
      title,
      issuing_organization,
      description,
      date_obtained,
      expiry_date,
      type,
      certificate_url
    } = data;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Qualification ID is required' },
        { status: 400 }
      );
    }

    // Open database connection
    const db = await openDb();

    // Check if qualification exists and belongs to the student
    const existingQualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ? AND student_id = ?`,
      id,
      params.id
    );

    if (!existingQualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    // Only allow updating certain fields if verification status is 'pending'
    if (existingQualification.verification_status !== 'pending' && user.role !== 'admin') {
      await db.close();
      return NextResponse.json(
        { error: 'Cannot update verified or rejected qualifications' },
        { status: 403 }
      );
    }

    // Build update query
    let updateQuery = 'UPDATE qualifications SET ';
    const updateParams = [];

    if (title) {
      updateQuery += 'title = ?, ';
      updateParams.push(title);
    }
    if (issuing_organization) {
      updateQuery += 'issuing_organization = ?, ';
      updateParams.push(issuing_organization);
    }
    if (description !== undefined) {
      updateQuery += 'description = ?, ';
      updateParams.push(description || null);
    }
    if (date_obtained) {
      updateQuery += 'date_obtained = ?, ';
      updateParams.push(date_obtained);
    }
    if (expiry_date !== undefined) {
      updateQuery += 'expiry_date = ?, ';
      updateParams.push(expiry_date || null);
    }
    if (type) {
      updateQuery += 'type = ?, ';
      updateParams.push(type);
    }
    if (certificate_url !== undefined) {
      updateQuery += 'certificate_url = ?, ';
      updateParams.push(certificate_url || null);
    }

    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);

    // Add WHERE clause
    updateQuery += ' WHERE id = ? AND student_id = ?';
    updateParams.push(id, params.id);

    // Execute update
    await db.run(updateQuery, ...updateParams);

    // Fetch updated qualification
    const updatedQualification = await db.get<Qualification>(
      `SELECT * FROM qualifications WHERE id = ?`,
      id
    );

    // Close database connection
    await db.close();

    return NextResponse.json(updatedQualification);
  } catch (error) {
    console.error('Error updating qualification:', error);
    return NextResponse.json(
      { error: 'Failed to update qualification' },
      { status: 500 }
    );
  }
} 
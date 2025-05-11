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

// GET endpoint to retrieve a specific qualification
export async function GET(
  request: NextRequest,
  { params }: { params: { qualificationId: string } }
) {
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

    // Open database connection
    const db = await openDb();

    // Fetch qualification with student and verifier details
    const qualification = await db.get(
      `SELECT q.*, 
              u.name as student_name, 
              u.email as student_email,
              v.name as verifier_name
       FROM qualifications q
       JOIN users u ON q.student_id = u.id
       LEFT JOIN users v ON q.verified_by = v.id
       WHERE q.id = ?`,
      params.qualificationId
    );

    // Close database connection
    await db.close();

    if (!qualification) {
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(qualification);
  } catch (error) {
    console.error('Error fetching qualification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch qualification' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a qualification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { qualificationId: string } }
) {
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
      title,
      issuing_organization,
      description,
      date_obtained,
      expiry_date,
      type,
      certificate_url,
      verification_status,
      verified_by
    } = data;

    // Open database connection
    const db = await openDb();

    // Check if qualification exists
    const qualification = await db.get(
      'SELECT * FROM qualifications WHERE id = ?',
      params.qualificationId
    );

    if (!qualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    // Build update query
    let updateQuery = 'UPDATE qualifications SET ';
    const updateParams = [];

    if (title !== undefined) {
      updateQuery += 'title = ?, ';
      updateParams.push(title);
    }
    if (issuing_organization !== undefined) {
      updateQuery += 'issuing_organization = ?, ';
      updateParams.push(issuing_organization);
    }
    if (description !== undefined) {
      updateQuery += 'description = ?, ';
      updateParams.push(description);
    }
    if (date_obtained !== undefined) {
      updateQuery += 'date_obtained = ?, ';
      updateParams.push(date_obtained);
    }
    if (expiry_date !== undefined) {
      updateQuery += 'expiry_date = ?, ';
      updateParams.push(expiry_date);
    }
    if (type !== undefined) {
      updateQuery += 'type = ?, ';
      updateParams.push(type);
    }
    if (certificate_url !== undefined) {
      updateQuery += 'certificate_url = ?, ';
      updateParams.push(certificate_url);
    }
    if (verification_status !== undefined) {
      updateQuery += 'verification_status = ?, ';
      updateParams.push(verification_status);

      // If verifying or rejecting, update the verified_by field
      if (verification_status === 'verified' || verification_status === 'rejected') {
        updateQuery += 'verified_by = ?, ';
        updateParams.push(verified_by || user.id);
      }
    } else if (verified_by !== undefined) {
      updateQuery += 'verified_by = ?, ';
      updateParams.push(verified_by);
    }

    // Add updated_at timestamp
    updateQuery += 'updated_at = datetime("now") ';

    // Add WHERE clause
    updateQuery += 'WHERE id = ?';
    updateParams.push(params.qualificationId);

    // Execute update
    await db.run(updateQuery, ...updateParams);

    // Fetch updated qualification
    const updatedQualification = await db.get(
      `SELECT q.*, 
              u.name as student_name, 
              u.email as student_email,
              v.name as verifier_name
       FROM qualifications q
       JOIN users u ON q.student_id = u.id
       LEFT JOIN users v ON q.verified_by = v.id
       WHERE q.id = ?`,
      params.qualificationId
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

// DELETE endpoint to remove a qualification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { qualificationId: string } }
) {
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

    // Open database connection
    const db = await openDb();

    // Check if qualification exists
    const qualification = await db.get(
      'SELECT * FROM qualifications WHERE id = ?',
      params.qualificationId
    );

    if (!qualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    // Delete the qualification
    await db.run(
      'DELETE FROM qualifications WHERE id = ?',
      params.qualificationId
    );

    // Close database connection
    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting qualification:', error);
    return NextResponse.json(
      { error: 'Failed to delete qualification' },
      { status: 500 }
    );
  }
} 
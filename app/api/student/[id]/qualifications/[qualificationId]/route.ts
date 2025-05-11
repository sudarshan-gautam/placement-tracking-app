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

// DELETE endpoint to remove a qualification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; qualificationId: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow students to delete their own qualifications, or admins to delete any
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Open database connection
    const db = await openDb();

    // Check if qualification exists and belongs to the student
    const qualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ? AND student_id = ?`,
      params.qualificationId,
      params.id
    );

    if (!qualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    // Only allow deleting pending qualifications (unless you're an admin)
    if (qualification.verification_status !== 'pending' && user.role !== 'admin') {
      await db.close();
      return NextResponse.json(
        { error: 'Cannot delete verified or rejected qualifications' },
        { status: 403 }
      );
    }

    // Delete the qualification
    await db.run(
      `DELETE FROM qualifications WHERE id = ? AND student_id = ?`,
      params.qualificationId,
      params.id
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
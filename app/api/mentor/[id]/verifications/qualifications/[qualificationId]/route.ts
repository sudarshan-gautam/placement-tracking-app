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

// POST endpoint to verify or reject a qualification
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; qualificationId: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow mentors or admins to verify qualifications
    if (user.role !== 'mentor' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if mentor ID in URL matches authenticated user ID (for mentors only)
    if (user.role === 'mentor' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const data = await request.json();
    const { 
      action, // 'verify' or 'reject'
      feedback // Optional feedback or rejection reason
    } = data;

    // Validate required fields
    if (!action || (action !== 'verify' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verify" or "reject"' },
        { status: 400 }
      );
    }

    // Open database connection
    const db = await openDb();

    // Check if qualification exists
    const qualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ?`,
      params.qualificationId
    );

    if (!qualification) {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification not found' },
        { status: 404 }
      );
    }

    // Check if qualification is already verified or rejected
    if (qualification.verification_status !== 'pending') {
      await db.close();
      return NextResponse.json(
        { error: 'Qualification is already verified or rejected' },
        { status: 400 }
      );
    }

    // Check if mentor is assigned to the qualification's student (only for mentors)
    if (user.role === 'mentor') {
      const mentorAssignment = await db.get(
        `SELECT * FROM mentor_student_assignments WHERE mentor_id = ? AND student_id = ?`,
        user.id,
        qualification.student_id
      );

      if (!mentorAssignment) {
        await db.close();
        return NextResponse.json(
          { error: 'You are not assigned to this student' },
          { status: 403 }
        );
      }
    }

    // Update qualification verification status
    await db.run(
      `UPDATE qualifications SET 
        verification_status = ?, 
        verified_by = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      action === 'verify' ? 'verified' : 'rejected',
      user.id,
      params.qualificationId
    );

    // Add verification feedback if provided
    if (feedback) {
      // In a real implementation, you might add this to a separate table
      console.log(`Feedback for qualification ${params.qualificationId}: ${feedback}`);
      
      // For now, we'll just log it, but you could create a feedback table
      // and store it properly if needed for the UI
    }

    // Get updated qualification
    const updatedQualification = await db.get(
      `SELECT * FROM qualifications WHERE id = ?`,
      params.qualificationId
    );

    // Close database connection
    await db.close();

    return NextResponse.json(updatedQualification);
  } catch (error) {
    console.error('Error verifying qualification:', error);
    return NextResponse.json(
      { error: 'Failed to verify qualification' },
      { status: 500 }
    );
  }
} 
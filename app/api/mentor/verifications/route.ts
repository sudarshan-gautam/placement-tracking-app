import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    // Get pending verifications with student names and activity details
    const [pendingVerifications] = await pool.query(`
      SELECT 
        sa.id,
        u.name as student,
        sa.title as activity,
        sa.date_completed as date,
        sa.activity_type as type,
        'Low' as priority,
        sa.description
      FROM student_activities sa
      JOIN users u ON sa.student_id = u.id
      WHERE sa.status = 'pending'
      ORDER BY sa.date_completed DESC
    `);

    // Ensure we always return an array
    return NextResponse.json({ 
      pendingVerifications: Array.isArray(pendingVerifications) ? pendingVerifications : [] 
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    // Return an empty array on error, not null or undefined
    return NextResponse.json(
      { pendingVerifications: [], error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Finalize a CV (mark as not a draft)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, cv_id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if CV exists and belongs to the student
    const pool = await getPool();
    const [cvs] = await pool.query(
      `SELECT id, ats_score FROM student_cvs WHERE id = ? AND student_id = ?`,
      [params.cv_id, params.id]
    );

    if (!cvs || cvs.length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cv = cvs[0];
    
    // Mark CV as finalized
    await runQuery(
      `UPDATE student_cvs SET is_ats_optimized = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [params.cv_id]
    );

    return NextResponse.json({
      message: 'CV finalized successfully',
      ats_score: cv.ats_score
    });
  } catch (error) {
    console.error('Error finalizing CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
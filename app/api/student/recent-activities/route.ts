import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET() {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and get user data
    const userData = await verifyAuth(token.value);
    if (!userData || userData.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();

    // Get recent activities for the student
    const [recentActivities] = await pool.query(`
      SELECT 
        id,
        activity_type as type,
        title,
        date_completed as date
      FROM student_activities
      WHERE student_id = ?
      ORDER BY date_completed DESC
      LIMIT 5
    `, [userData.id]);

    return NextResponse.json({ recentActivities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
} 
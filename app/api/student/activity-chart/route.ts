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

    // Get weekly activity counts for the last 4 weeks
    const [activityData] = await pool.query(`
      SELECT 
        'Week ' || strftime('%W', date_completed) as name,
        COUNT(*) as sessions,
        strftime('%Y%W', date_completed) as week_number
      FROM student_activities
      WHERE student_id = ?
      AND date_completed >= date('now', '-28 days')
      GROUP BY strftime('%Y%W', date_completed)
      ORDER BY week_number ASC
    `, [userData.id]);

    // Remove the week_number from the response
    const formattedData = (activityData as any[]).map(({ name, sessions }) => ({
      name,
      sessions
    }));

    return NextResponse.json({ activityData: formattedData });
  } catch (error) {
    console.error('Error fetching activity chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity chart data' },
      { status: 500 }
    );
  }
} 
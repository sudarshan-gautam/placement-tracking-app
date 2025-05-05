import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    // Get upcoming events for mentors
    const [events] = await pool.query(`
      SELECT 
        id,
        title,
        event_date as date,
        start_time || ' - ' || end_time as time
      FROM events
      WHERE event_date >= date('now')
      ORDER BY event_date, start_time
      LIMIT 5
    `);

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', events: [] },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get user count
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    
    // Get active sessions (we'll use applications as proxy for active sessions for now)
    const activeSessions = await db.get('SELECT COUNT(*) as count FROM applications WHERE status = "pending" OR status = "reviewed"');
    
    // Get pending verifications (using applications with pending status)
    const pendingVerifications = await db.get('SELECT COUNT(*) as count FROM applications WHERE status = "pending"');
    
    // Get high priority items
    const highPriorityCount = await db.get('SELECT COUNT(*) as count FROM applications WHERE status = "pending" AND created_at > datetime("now", "-7 days")');
    
    // Get user growth data for chart
    const usersByMonth = await db.all(`
      SELECT 
        strftime('%m', created_at) as month,
        COUNT(*) as count
      FROM users
      GROUP BY strftime('%m', created_at)
      ORDER BY month
    `);
    
    // Get applications by status
    const applicationsByStatus = await db.all(`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications
      GROUP BY status
    `);
    
    // Get recent activities (last 5 user registrations or application status changes)
    const recentActivities = await db.all(`
      SELECT 
        'User' as type,
        'New user registered' as action,
        name || ' (' || email || ')' as details,
        created_at as time
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    // Get recent users
    const recentUsers = await db.all(`
      SELECT 
        id,
        name,
        email,
        role,
        'active' as status,
        created_at as joined
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    return NextResponse.json({
      stats: {
        totalUsers: totalUsers.count,
        activeSessions: activeSessions.count,
        pendingVerifications: pendingVerifications.count,
        highPriorityCount: highPriorityCount.count
      },
      chartData: {
        usersByMonth
      },
      applicationsByStatus,
      recentActivities,
      recentUsers,
      systemMetrics: [
        { id: 1, name: 'Response Time', value: '120ms', status: 'good' },
        { id: 2, name: 'Error Rate', value: '0.5%', status: 'good' },
        { id: 3, name: 'Server Load', value: '42%', status: 'warning' }
      ]
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Define interfaces for our query results
interface CountResult {
  count: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface ActivityData {
  type: string;
  action: string;
  details: string;
  time: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

export async function GET() {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Default values for statistics
    let totalUsers: CountResult = { count: 0 };
    let activeSessions: CountResult = { count: 0 };
    let pendingVerifications: CountResult = { count: 0 };
    let highPriorityCount: CountResult = { count: 0 };
    let usersByMonth: MonthlyData[] = [];
    let applicationsByStatus: StatusCount[] = [];
    let recentActivities: ActivityData[] = [];
    let recentUsers: UserData[] = [];

    // Get user count
    try {
      const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM users');
      if (result) totalUsers = result;
    } catch (err) {
      console.error('Error counting users:', err);
    }
    
    // Get active sessions and applications data with error handling
    try {
      const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM applications WHERE status = "pending" OR status = "reviewed"');
      if (result) activeSessions = result;
    } catch (err) {
      console.error('Error counting active sessions:', err);
      // Try an alternative if applications table doesn't exist
      try {
        const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM sessions WHERE status = "planned"');
        if (result) activeSessions = result;
      } catch (innerErr) {
        console.error('Error counting planned sessions:', innerErr);
      }
    }
    
    // Get pending verifications with error handling
    try {
      const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM applications WHERE status = "pending"');
      if (result) pendingVerifications = result;
    } catch (err) {
      console.error('Error counting pending verifications:', err);
      // Try an alternative if applications table doesn't exist
      try {
        const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM approvals WHERE status = "pending"');
        if (result) pendingVerifications = result;
      } catch (innerErr) {
        console.error('Error counting pending approvals:', innerErr);
      }
    }
    
    // Get high priority items with error handling
    try {
      const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM applications WHERE status = "pending" AND created_at > datetime("now", "-7 days")');
      if (result) highPriorityCount = result;
    } catch (err) {
      console.error('Error counting high priority items:', err);
      // Try an alternative
      try {
        const result = await db.get<CountResult>('SELECT COUNT(*) as count FROM approvals WHERE status = "pending" AND created_at > datetime("now", "-7 days")');
        if (result) highPriorityCount = result;
      } catch (innerErr) {
        console.error('Error counting high priority approvals:', innerErr);
      }
    }
    
    // Get user growth data for chart with error handling
    try {
      const result = await db.all<MonthlyData[]>(`
        SELECT 
          strftime('%m', created_at) as month,
          COUNT(*) as count
        FROM users
        GROUP BY strftime('%m', created_at)
        ORDER BY month
      `);
      if (result) usersByMonth = result;
    } catch (err) {
      console.error('Error getting user growth data:', err);
    }
    
    // Get applications by status with error handling
    try {
      const result = await db.all<StatusCount[]>(`
        SELECT 
          status,
          COUNT(*) as count
        FROM applications
        GROUP BY status
      `);
      if (result) applicationsByStatus = result;
    } catch (err) {
      console.error('Error getting applications by status:', err);
      // Try an alternative if applications table doesn't exist
      try {
        const result = await db.all<StatusCount[]>(`
          SELECT 
            status,
            COUNT(*) as count
          FROM approvals
          GROUP BY status
        `);
        if (result) applicationsByStatus = result;
      } catch (innerErr) {
        console.error('Error getting approvals by status:', innerErr);
      }
    }
    
    // Get recent activities with error handling
    try {
      const result = await db.all<ActivityData[]>(`
        SELECT 
          'User' as type,
          'New user registered' as action,
          name || ' (' || email || ')' as details,
          created_at as time
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);
      if (result) recentActivities = result;
    } catch (err) {
      console.error('Error getting recent activities:', err);
    }
    
    // Get recent users with error handling
    try {
      const result = await db.all<UserData[]>(`
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
      if (result) recentUsers = result;
    } catch (err) {
      console.error('Error getting recent users:', err);
    }
    
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
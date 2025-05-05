import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Get all verification requests
export async function GET() {
  try {
    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Get all applications with student information (as verification requests)
    const verifications = await db.all(`
      SELECT 
        a.id,
        a.status,
        a.created_at as date,
        a.resume_url as attachment,
        a.cover_letter as description,
        j.title as activity_title,
        j.location,
        j.description as job_description,
        u.name as student_name,
        u.email as student_email,
        u.id as student_id,
        CASE 
          WHEN a.created_at > datetime('now', '-3 days') THEN 'High'
          WHEN a.created_at > datetime('now', '-7 days') THEN 'Medium'
          ELSE 'Low'
        END as priority
      FROM applications a
      JOIN job_posts j ON a.job_post_id = j.id
      JOIN users u ON a.student_id = u.id
      ORDER BY 
        CASE 
          WHEN a.status = 'pending' THEN 1
          WHEN a.status = 'reviewed' THEN 2
          ELSE 3
        END,
        a.created_at DESC
    `);

    // Ensure verifications is an array
    const verificationsArray = Array.isArray(verifications) ? verifications : [];

    // Format the verifications to match the expected structure
    const formattedVerifications = verificationsArray.map(v => ({
      id: v.id,
      type: 'Application',
      title: v.activity_title,
      user: v.student_name,
      date: v.date,
      priority: v.priority,
      description: v.description,
      attachments: v.attachment ? [v.attachment] : [],
      status: v.status,
      activity: {
        title: v.activity_title,
        type: 'Application',
        location: v.location,
        description: v.job_description
      },
      student: {
        id: v.student_id,
        name: v.student_name,
        email: v.student_email
      }
    }));

    return NextResponse.json(formattedVerifications, { status: 200 });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    // Return an empty array instead of an error object
    return NextResponse.json([], { status: 500 });
  }
}

// Update a verification request
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, status, feedback } = data;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Open the database
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Update the application status
    await db.run(
      'UPDATE applications SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [status, id]
    );

    return NextResponse.json({ success: true, message: `Verification ${id} updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
} 
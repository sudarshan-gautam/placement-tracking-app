import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Function to ensure database is accessible
async function getDatabase() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
}

// Get all students with their skills
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    
    // Basic validation
    if (!mentorId) {
      return NextResponse.json({ 
        error: 'Mentor ID is required' 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to retrieve students'
      }, { status: 500 });
    }

    // First verify the user is a mentor
    const isMentor = await db.get(
      `SELECT id FROM users WHERE id = ? AND role = 'mentor'`,
      [mentorId]
    );
    
    if (!isMentor) {
      return NextResponse.json({ 
        error: 'Unauthorized access',
        message: 'Only mentors can access student data'
      }, { status: 403 });
    }

    // Get all students
    const students = await db.all(
      `SELECT u.id, u.name, u.email, u.profileImage, 
              p.biography, p.education, p.graduation_year, p.preferred_job_type, p.preferred_location
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.role = 'student'
       ORDER BY u.name ASC`
    );

    // Fetch student skills
    for (const student of students) {
      const skills = await db.all(
        `SELECT skill FROM user_skills WHERE user_id = ?`,
        [student.id]
      );
      // Convert the array of skill objects to an array of strings
      student.skills = skills.map(s => s.skill);
      // Log the skills we're adding to each student
      console.log(`Adding ${skills.length} skills to student ${student.name}:`, student.skills);
      student.skillLevels = skills;
    }
    
    // Log the complete student data being returned
    console.log(`Returning ${students.length} students with skills data`);
    
    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/mentor/students:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to retrieve student data'
    }, { status: 500 });
  }
} 
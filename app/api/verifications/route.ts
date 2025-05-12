import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Helper function to open the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });
}

// GET /api/verifications
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow mentors and admins to access verifications
    if (user.role === 'student') {
      // For students, check if they're trying to access their own data
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      
      // If a specific studentId is requested, ensure it matches the student's ID
      if (studentId && studentId !== user.id) {
        return NextResponse.json({ error: "Forbidden: Cannot access other students' data" }, { status: 403 });
      }
      
      // Allow students to view their own verification data
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");

    // Open database connection
    const db = await openDb();
    
    let result: any = { };
    
    // Get pending counts for each verification type
    const getCounts = async () => {
      // Count qualifications
      const qualificationsCount = await db.get(
        `SELECT COUNT(*) as count FROM qualifications 
         WHERE verification_status = 'pending'
         ${user.role === 'mentor' ? 
           'AND student_id IN (SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?)' : ''}`,
        user.role === 'mentor' ? [user.id] : []
      );
      
      // Count sessions
      const sessionsCount = await db.get(
        `SELECT COUNT(*) as count FROM session_verifications sv
         JOIN sessions s ON sv.session_id = s.id
         WHERE sv.verification_status = 'pending'
         ${user.role === 'mentor' ? 
           'AND s.student_id IN (SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?)' : ''}`,
        user.role === 'mentor' ? [user.id] : []
      );
      
      // Count competencies
      const competenciesCount = await db.get(
        `SELECT COUNT(*) as count FROM competency_verifications cv
         JOIN student_competencies sc ON cv.student_competency_id = sc.id
         WHERE cv.verification_status = 'pending'
         ${user.role === 'mentor' ? 
           'AND sc.student_id IN (SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?)' : ''}`,
        user.role === 'mentor' ? [user.id] : []
      );
      
      // Count profile verifications
      const profilesCount = await db.get(
        `SELECT COUNT(*) as count FROM profile_verifications
         WHERE verification_status = 'pending'
         ${user.role === 'mentor' ? 
           'AND user_id IN (SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?)' : ''}`,
        user.role === 'mentor' ? [user.id] : []
      );
      
      return {
        qualifications: qualificationsCount.count,
        sessions: sessionsCount.count,
        activities: 0, // No more activity verifications
        competencies: competenciesCount.count,
        profiles: profilesCount.count,
        total: qualificationsCount.count + sessionsCount.count + competenciesCount.count + profilesCount.count
      };
    };
    
    // Add counts to the result
    result.counts = await getCounts();

    // Fetch verification data based on type
    if (type === "all" || type === "qualifications") {
      let qualificationsQuery = `
        SELECT 
          q.id, 
          'qualification' as verification_type,
          q.title,
          q.issuing_organization,
          q.description,
          q.date_obtained,
          q.expiry_date,
          q.certificate_url,
          q.type,
          q.verification_status,
          q.feedback,
          q.student_id,
          u.name as student_name,
          u.email as student_email,
          v.name as verified_by_name
        FROM qualifications q
        JOIN users u ON q.student_id = u.id
        LEFT JOIN users v ON q.verified_by = v.id
        WHERE 1=1
      `;
      
      const qualificationParams: any[] = [];
      
      // Filter for mentors
      if (user.role === 'mentor') {
        qualificationsQuery += ` AND q.student_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        qualificationParams.push(user.id);
      }
      
      // Filter for students (they can only see their own)
      if (user.role === 'student') {
        qualificationsQuery += " AND q.student_id = ?";
        qualificationParams.push(user.id);
      }
      
      // Apply student filter if provided
      if (studentId) {
        qualificationsQuery += " AND q.student_id = ?";
        qualificationParams.push(studentId);
      }
      
      // Apply status filter if provided
      if (status) {
        qualificationsQuery += " AND q.verification_status = ?";
        qualificationParams.push(status);
      }
      
      // Add order by clause
      qualificationsQuery += " ORDER BY q.date_obtained DESC";
      
      const qualifications = await db.all(qualificationsQuery, ...qualificationParams);
      result.qualifications = qualifications;
    }
    
    if (type === "all" || type === "sessions") {
      let sessionsQuery = `
        SELECT 
          s.id,
          'session' as verification_type,
          s.title,
          s.description,
          s.date,
          s.start_time,
          s.end_time,
          s.location,
          s.status as session_status,
          s.reflection,
          s.student_id,
          u.name as student_name,
          u.email as student_email,
          sv.id as verification_id,
          sv.verification_status,
          sv.feedback,
          vm.name as verified_by_name
        FROM sessions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN session_verifications sv ON s.id = sv.session_id
        LEFT JOIN users vm ON sv.verified_by = vm.id
        WHERE s.status = 'completed'
      `;
      
      const sessionParams: any[] = [];
      
      // Filter for mentors
      if (user.role === 'mentor') {
        sessionsQuery += ` AND s.student_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        sessionParams.push(user.id);
      }
      
      // Filter for students (they can only see their own)
      if (user.role === 'student') {
        sessionsQuery += " AND s.student_id = ?";
        sessionParams.push(user.id);
      }
      
      // Apply student filter if provided
      if (studentId) {
        sessionsQuery += " AND s.student_id = ?";
        sessionParams.push(studentId);
      }
      
      // Apply status filter if provided
      if (status) {
        sessionsQuery += " AND sv.verification_status = ?";
        sessionParams.push(status);
      }
      
      // Add order by clause
      sessionsQuery += " ORDER BY s.date DESC, s.start_time DESC";
      
      const sessions = await db.all(sessionsQuery, ...sessionParams);
      result.sessions = sessions;
    }
    
    // No more activities verification section
    result.activities = [];
    
    if (type === "all" || type === "competencies") {
      let competenciesQuery = `
        SELECT 
          sc.id,
          'competency' as verification_type,
          c.name as competency_name,
          c.category as competency_category,
          c.description,
          sc.level,
          sc.evidence_url,
          sc.student_id,
          u.name as student_name,
          u.email as student_email,
          cv.id as verification_id,
          cv.verification_status,
          cv.feedback,
          vm.name as verified_by_name
        FROM student_competencies sc
        JOIN competencies c ON sc.competency_id = c.id
        JOIN users u ON sc.student_id = u.id
        LEFT JOIN competency_verifications cv ON sc.id = cv.student_competency_id
        LEFT JOIN users vm ON cv.verified_by = vm.id
        WHERE 1=1
      `;
      
      const competencyParams: any[] = [];
      
      // Filter for mentors
      if (user.role === 'mentor') {
        competenciesQuery += ` AND sc.student_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        competencyParams.push(user.id);
      }
      
      // Filter for students (they can only see their own)
      if (user.role === 'student') {
        competenciesQuery += " AND sc.student_id = ?";
        competencyParams.push(user.id);
      }
      
      // Apply student filter if provided
      if (studentId) {
        competenciesQuery += " AND sc.student_id = ?";
        competencyParams.push(studentId);
      }
      
      // Apply status filter if provided
      if (status) {
        competenciesQuery += " AND cv.verification_status = ?";
        competencyParams.push(status);
      }
      
      // Add order by clause
      competenciesQuery += " ORDER BY c.category, c.name, sc.level";
      
      const competencies = await db.all(competenciesQuery, ...competencyParams);
      result.competencies = competencies;
    }
    
    if (type === "all" || type === "profiles") {
      let profilesQuery = `
        SELECT 
          pv.id,
          'profile' as verification_type,
          pv.user_id,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role,
          pv.document_url,
          pv.verification_status,
          pv.feedback,
          vm.name as verified_by_name
        FROM profile_verifications pv
        JOIN users u ON pv.user_id = u.id
        LEFT JOIN users vm ON pv.verified_by = vm.id
        WHERE 1=1
      `;
      
      const profileParams: any[] = [];
      
      // Filter for mentors
      if (user.role === 'mentor') {
        profilesQuery += ` AND pv.user_id IN (
          SELECT student_id FROM mentor_student_assignments WHERE mentor_id = ?
        )`;
        profileParams.push(user.id);
      }
      
      // Filter for students (they can only see their own)
      if (user.role === 'student') {
        profilesQuery += " AND pv.user_id = ?";
        profileParams.push(user.id);
      }
      
      // Apply student filter if provided
      if (studentId) {
        profilesQuery += " AND pv.user_id = ?";
        profileParams.push(studentId);
      }
      
      // Apply status filter if provided
      if (status) {
        profilesQuery += " AND pv.verification_status = ?";
        profileParams.push(status);
      }
      
      // Add order by clause
      profilesQuery += " ORDER BY u.name";
      
      const profiles = await db.all(profilesQuery, ...profileParams);
      result.profiles = profiles;
    }
    
    // Close database connection
    await db.close();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
} 
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

// GET /api/verifications/[type]/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = params;

    // Open database connection
    const db = await openDb();

    let result;
    
    // Get verification details based on type
    switch (type) {
      case "qualifications":
        result = await db.get(`
          SELECT 
            q.id, 
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
            s.name as student_name,
            s.email as student_email,
            v.name as verified_by_name
          FROM qualifications q
          JOIN users s ON q.student_id = s.id
          LEFT JOIN users v ON q.verified_by = v.id
          WHERE q.id = ?
        `, id);
        break;
        
      case "sessions":
        result = await db.get(`
          SELECT 
            s.id,
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
          WHERE s.id = ?
        `, id);
        break;
        
      case "activities":
        result = await db.get(`
          SELECT 
            a.id,
            a.title,
            a.description,
            a.activity_type,
            a.date_completed,
            a.duration_minutes,
            a.evidence_url,
            a.status as activity_status,
            a.student_id,
            u.name as student_name,
            u.email as student_email,
            av.id as verification_id,
            av.verification_status,
            av.feedback,
            vm.name as verified_by_name
          FROM activities a
          JOIN users u ON a.student_id = u.id
          LEFT JOIN activity_verifications av ON a.id = av.activity_id
          LEFT JOIN users vm ON av.verified_by = vm.id
          WHERE a.id = ?
        `, id);
        break;
        
      case "competencies":
        result = await db.get(`
          SELECT 
            sc.id,
            sc.level,
            sc.evidence_url,
            sc.student_id,
            u.name as student_name,
            u.email as student_email,
            c.id as competency_id,
            c.name as competency_name,
            c.category as competency_category,
            c.description as competency_description,
            cv.id as verification_id,
            cv.verification_status,
            cv.feedback,
            vm.name as verified_by_name
          FROM student_competencies sc
          JOIN competencies c ON sc.competency_id = c.id
          JOIN users u ON sc.student_id = u.id
          LEFT JOIN competency_verifications cv ON sc.id = cv.student_competency_id
          LEFT JOIN users vm ON cv.verified_by = vm.id
          WHERE sc.id = ?
        `, id);
        break;
        
      case "profiles":
        result = await db.get(`
          SELECT 
            pv.id,
            pv.user_id,
            pv.document_url,
            pv.verification_status,
            pv.feedback,
            u.name as user_name,
            u.email as user_email,
            u.role as user_role,
            vm.name as verified_by_name
          FROM profile_verifications pv
          JOIN users u ON pv.user_id = u.id
          LEFT JOIN users vm ON pv.verified_by = vm.id
          WHERE pv.id = ?
        `, id);
        break;
        
      default:
        return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
    }

    // Close database connection
    await db.close();

    if (!result) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching verification:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification" },
      { status: 500 }
    );
  }
}

// PATCH /api/verifications/[type]/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only mentors and admins can update verifications
    if (user.role === 'student') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { type, id } = params;
    const body = await req.json();
    
    const { status, feedback } = body;
    
    // Validate status
    if (!status || !['verified', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Open database connection
    const db = await openDb();
    
    let result;
    
    // Update verification based on type
    switch (type) {
      case "qualifications":
        result = await db.run(`
          UPDATE qualifications
          SET verification_status = ?, feedback = ?, verified_by = ?
          WHERE id = ?
        `, [status, feedback || null, user.id, id]);
        break;
        
      case "sessions":
        // Check if verification exists
        const sessionVerification = await db.get(
          `SELECT id FROM session_verifications WHERE session_id = ?`, 
          id
        );
        
        if (sessionVerification) {
          // Update existing verification
          result = await db.run(`
            UPDATE session_verifications
            SET verification_status = ?, feedback = ?, verified_by = ?
            WHERE session_id = ?
          `, [status, feedback || null, user.id, id]);
        } else {
          // Create new verification
          result = await db.run(`
            INSERT INTO session_verifications 
              (session_id, student_id, verification_status, feedback, verified_by)
            SELECT id, student_id, ?, ?, ?
            FROM sessions WHERE id = ?
          `, [status, feedback || null, user.id, id]);
        }
        break;
        
      case "activities":
        // Check if verification exists
        const activityVerification = await db.get(
          `SELECT id FROM activity_verifications WHERE activity_id = ?`, 
          id
        );
        
        if (activityVerification) {
          // Update existing verification
          result = await db.run(`
            UPDATE activity_verifications
            SET verification_status = ?, feedback = ?, verified_by = ?
            WHERE activity_id = ?
          `, [status, feedback || null, user.id, id]);
        } else {
          // Create new verification
          result = await db.run(`
            INSERT INTO activity_verifications 
              (activity_id, student_id, verification_status, feedback, verified_by)
            SELECT id, student_id, ?, ?, ?
            FROM activities WHERE id = ?
          `, [status, feedback || null, user.id, id]);
        }
        break;
        
      case "competencies":
        // Check if verification exists
        const competencyVerification = await db.get(
          `SELECT id FROM competency_verifications WHERE student_competency_id = ?`, 
          id
        );
        
        if (competencyVerification) {
          // Update existing verification
          result = await db.run(`
            UPDATE competency_verifications
            SET verification_status = ?, feedback = ?, verified_by = ?
            WHERE student_competency_id = ?
          `, [status, feedback || null, user.id, id]);
        } else {
          // Create new verification
          result = await db.run(`
            INSERT INTO competency_verifications 
              (student_competency_id, student_id, verification_status, feedback, verified_by)
            SELECT id, student_id, ?, ?, ?
            FROM student_competencies WHERE id = ?
          `, [status, feedback || null, user.id, id]);
        }
        break;
        
      case "profiles":
        result = await db.run(`
          UPDATE profile_verifications
          SET verification_status = ?, feedback = ?, verified_by = ?
          WHERE id = ?
        `, [status, feedback || null, user.id, id]);
        break;
        
      default:
        return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
    }

    // Close database connection
    await db.close();

    return NextResponse.json({ 
      success: true, 
      message: `${type.slice(0, -1)} verification updated successfully` 
    });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
} 
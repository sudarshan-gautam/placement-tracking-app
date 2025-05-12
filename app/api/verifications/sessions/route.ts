import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// POST to verify or reject a session
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user
    const user = await roleMiddleware(req);
    if (!user || (user.role !== "mentor" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { session_id, verification_status, feedback } = body;

    // Validate required fields
    if (!session_id || !verification_status) {
      return NextResponse.json(
        { error: "Session ID and verification status are required" },
        { status: 400 }
      );
    }

    // Validate verification status
    if (verification_status !== "verified" && verification_status !== "rejected") {
      return NextResponse.json(
        { error: "Verification status must be 'verified' or 'rejected'" },
        { status: 400 }
      );
    }

    // For mentors, check if they are assigned to the student who owns the session
    if (user.role === "mentor") {
      const checkAssignmentSql = `
        SELECT * FROM mentor_student_assignments msa
        JOIN sessions s ON msa.student_id = s.student_id
        WHERE msa.mentor_id = ? AND s.id = ?
      `;
      const assignment = await db.getOne(checkAssignmentSql, [user.id, session_id]);
      
      if (!assignment) {
        return NextResponse.json(
          { error: "You are not authorized to verify this session" },
          { status: 403 }
        );
      }
    }

    // First, check if the session exists
    const sessionSql = `SELECT * FROM sessions WHERE id = ?`;
    const session = await db.getOne(sessionSql, [session_id]);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if a verification record already exists
    const checkSql = `SELECT * FROM session_verifications WHERE session_id = ?`;
    const existingVerification = await db.getOne(checkSql, [session_id]);

    // Generate verification ID
    const verificationId = existingVerification && typeof existingVerification === 'object' && existingVerification !== null && 'id' in existingVerification
      ? (existingVerification as { id: string }).id 
      : uuidv4();
    
    // Prepare verification data
    let sql = '';
    let params: any[] = [];
    
    if (existingVerification) {
      // Update existing verification
      sql = `
        UPDATE session_verifications
        SET verification_status = ?, feedback = ?, verified_by = ?, updated_at = datetime('now')
        WHERE session_id = ?
      `;
      params = [verification_status, feedback || null, user.id, session_id];
    } else {
      // Create new verification
      sql = `
        INSERT INTO session_verifications (id, session_id, verification_status, feedback, verified_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      params = [verificationId, session_id, verification_status, feedback || null, user.id];
    }

    // Execute verification update/insert
    await db.runQuery(sql, params);

    // Update the session status if verified
    if (verification_status === "verified") {
      const updateSessionSql = `
        UPDATE sessions
        SET status = 'completed', updated_at = datetime('now')
        WHERE id = ?
      `;
      await db.runQuery(updateSessionSql, [session_id]);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Session ${verification_status === "verified" ? "verified" : "rejected"} successfully`,
      verification_id: verificationId
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { error: "Failed to process verification" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// POST to reset a session verification status
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { session_id, reset } = body;

    // Validate required fields
    if (!session_id || reset !== true) {
      return NextResponse.json(
        { error: "Session ID and reset flag are required" },
        { status: 400 }
      );
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

    // Check if a verification record exists
    const checkSql = `SELECT * FROM session_verifications WHERE session_id = ?`;
    const existingVerification = await db.getOne(checkSql, [session_id]);

    if (!existingVerification) {
      return NextResponse.json(
        { error: "No verification record found for this session" },
        { status: 404 }
      );
    }

    // Update verification to pending status
    const updateSql = `
      UPDATE session_verifications
      SET verification_status = 'pending', feedback = NULL, updated_at = datetime('now')
      WHERE session_id = ?
    `;
    await db.runQuery(updateSql, [session_id]);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Session verification status reset to pending successfully"
    });
  } catch (error) {
    console.error("Error resetting verification status:", error);
    return NextResponse.json(
      { error: "Failed to reset verification status" },
      { status: 500 }
    );
  }
} 
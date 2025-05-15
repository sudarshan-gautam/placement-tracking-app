import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/lib/auth-middleware";
import db from "@/lib/db";

// Define interface for activity data
interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  date_completed: string;
  duration_minutes: number;
  evidence_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  assigned_by: string | null;
  student_name: string;
  assigned_by_name: string | null;
}

// GET a single activity by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the user as admin
    const user = await roleMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 });
    }

    // Extract ID from params
    const activityId = params.id;

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // Validate activityId format
    if (!/^[a-zA-Z0-9-_]+$/.test(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID format" },
        { status: 400 }
      );
    }

    // Updated query to get activity details without using activity_verifications table
    const sql = `
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.activity_type,
        a.date_completed,
        a.duration_minutes,
        a.evidence_url,
        a.status,
        a.created_at,
        a.updated_at,
        a.student_id,
        a.assigned_by,
        u.name as student_name,
        creator.name as assigned_by_name
      FROM activities a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN users creator ON a.assigned_by = creator.id
      WHERE a.id = ?
    `;

    try {
      // Execute query
      const activity = await db.getOne<Activity>(sql, [activityId]);

      // If no activity found, return 404
      if (!activity) {
        return NextResponse.json(
          { error: "Activity not found" },
          { status: 404 }
        );
      }

      // Map status to verification_status for compatibility
      const activityWithVerification = {
        ...activity,
        verification_status: activity.status === 'completed' ? 'verified' : 
                            activity.status === 'submitted' ? 'pending' : 'draft',
        feedback: null,
        verified_by_name: null
      };

      return NextResponse.json(activityWithVerification);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error while fetching activity" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
} 
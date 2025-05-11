import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth-service';
import { getStudentsForMentor } from '@/lib/mentor-student-service';

// GET /api/mentor/[id]/students
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const authResult = await authenticateAndAuthorize(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Get mentor ID from params
    const { id: mentorId } = params;
    if (!mentorId) {
      return NextResponse.json(
        { error: 'Mentor ID is required' },
        { status: 400 }
      );
    }
    
    // Only the mentor themselves or an admin can view their students
    if (authResult.userId !== mentorId && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to view this mentor\'s students' },
        { status: 403 }
      );
    }
    
    // Get students for this mentor from the database
    const students = await getStudentsForMentor(mentorId);
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth-service';
import { getAll } from '@/lib/db';

// GET /api/mentor/[id]/verifications
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
    
    // Only the mentor themselves or an admin can view their verifications
    if (authResult.userId !== mentorId && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to view this mentor\'s verifications' },
        { status: 403 }
      );
    }
    
    // For now, we'll return sample data since we don't have a verification table
    // In a real implementation, this would query the database for pending verifications
    // that belong to students assigned to this mentor
    
    const pendingVerifications = [
      {
        id: 1,
        studentId: 'student-id-1',
        studentName: 'John Doe',
        itemType: 'qualification',
        itemName: 'First Aid Certificate',
        submissionDate: '2023-06-15',
        status: 'pending'
      },
      {
        id: 2,
        studentId: 'student-id-2',
        studentName: 'Jane Smith',
        itemType: 'qualification',
        itemName: 'Teaching Qualification',
        submissionDate: '2023-06-18',
        status: 'pending'
      }
    ];
    
    return NextResponse.json(pendingVerifications);
  } catch (error) {
    console.error('Error fetching mentor verifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
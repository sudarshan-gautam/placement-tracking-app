import { NextResponse } from 'next/server';
import { getStudentQualifications } from '@/lib/db-operations';
import { roleMiddleware } from '@/middleware';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await roleMiddleware(request, ['student', 'mentor', 'admin']);
    if (user instanceof NextResponse) return user;

    // Only allow students to view their own qualifications
    // Mentors and admins can view any student's qualifications
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const qualifications = await getStudentQualifications(params.id);
    return NextResponse.json({ qualifications });
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
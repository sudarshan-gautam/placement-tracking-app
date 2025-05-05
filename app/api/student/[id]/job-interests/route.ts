import { NextResponse } from 'next/server';
import { getStudentJobInterests } from '@/lib/db-operations';
import { roleMiddleware } from '@/middleware';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await roleMiddleware(request, ['student', 'mentor', 'admin']);
    if (user instanceof NextResponse) return user;

    // Only allow students to view their own job interests
    // Mentors and admins can view any student's job interests
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const jobInterests = await getStudentJobInterests(params.id);
    return NextResponse.json({ jobInterests });
  } catch (error) {
    console.error('Error fetching job interests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { getStudentSkills } from '@/lib/db-operations';
import { roleMiddleware } from '@/middleware';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await roleMiddleware(request, ['student', 'mentor', 'admin']);
    if (user instanceof NextResponse) return user;

    // Only allow students to view their own skills
    // Mentors and admins can view any student's skills
    if (user.role === 'student' && user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const skills = await getStudentSkills(params.id);
    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
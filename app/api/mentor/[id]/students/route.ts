import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded || decoded.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await db.student.findMany({
      where: {
        mentorId: params.id
      },
      include: {
        activities: {
          select: {
            verified: true,
            pending: true,
            total: true
          }
        }
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
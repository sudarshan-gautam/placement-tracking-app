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

    const verifications = await db.activity.findMany({
      where: {
        student: {
          mentorId: params.id
        },
        status: 'PENDING'
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
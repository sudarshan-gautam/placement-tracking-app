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
    if (!decoded || decoded.id !== params.id || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await db.systemAccess.findMany({
      where: {
        adminId: params.id
      },
      orderBy: {
        lastAccessed: 'desc'
      }
    });

    return NextResponse.json({ access });
  } catch (error) {
    console.error('Error fetching system access:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
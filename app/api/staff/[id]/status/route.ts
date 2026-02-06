import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/database/models';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to comply with Next.js 15+ requirements
    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;

    const user = await User.findByPk(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    await user.update({ is_active });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        is_active: user.is_active
      }
    });

  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
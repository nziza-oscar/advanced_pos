import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/database/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { full_name, email, username, role, is_active } = body;

    const user = await User.findByPk(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Update user
    await user.update({
      full_name,
      email,
      username,
      role,
      is_active
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      }
    });

  } catch (error: any) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await User.findByPk(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // You might want to soft delete instead
    await user.update({ is_active: false });
    
    // Or hard delete:
    // await user.destroy();

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/lib/database/models/Notification';

export async function GET() {
  try {
    const notifications = await Notification.findAll({
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await Notification.update({ is_read: true }, { where: { is_read: false } });
    } else if (id) {
      await Notification.update({ is_read: true }, { where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
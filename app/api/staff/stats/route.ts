import { NextResponse } from 'next/server';
import { User, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    // Get total staff count
    const total = await User.count();

    // Get active staff count
    const active = await User.count({
      where: { is_active: true }
    });

    // Get new staff this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await User.count({
      where: {
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    return NextResponse.json({
      success: true,
      data: { total, active, newThisMonth }
    });

  } catch (error: any) {
    console.error('Staff stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff statistics' },
      { status: 500 }
    );
  }
}
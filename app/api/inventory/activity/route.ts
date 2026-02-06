import { NextRequest, NextResponse } from 'next/server';
import { StockLog, Product, User } from '@/lib/database/models';
import { Op } from 'sequelize';
import moment from 'moment';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'day';

    let startDate;
    if (range === 'week') {
      startDate = moment().subtract(7, 'days').startOf('day').toDate();
    } else if (range === 'month') {
      startDate = moment().subtract(1, 'months').startOf('day').toDate();
    } else {
      startDate = moment().subtract(24, 'hours').toDate();
    }

    const recentActivities = await StockLog.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedActivities = recentActivities.map((log:any) => ({
      id: log.id,
      product: log.product?.name || 'Unknown Product',
      user: log.user?.full_name || 'System',
      quantity: log.change_amount,
      type: log.change_amount > 0 ? 'in' : 'out',
      reason: log.reason,
      notes: log.notes,
      timestamp: log.created_at
    }));

    return NextResponse.json({
      success: true,
      data: formattedActivities
    });

  } catch (error: any) {
    console.error('Recent Activity Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { StockLog, Product, User, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivities = await StockLog.findAll({
      where: {
        created_at: {
          [Op.gte]: yesterday
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
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const formattedActivities = recentActivities.map(log => {
      const timeDiff = Date.now() - new Date(log.created_at).getTime();
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      
      let timeAgo = '';
      if (hours > 0) {
        timeAgo = `${hours}h ago`;
      } else if (minutes > 0) {
        timeAgo = `${minutes}m ago`;
      } else {
        timeAgo = 'Just now';
      }

      return {
        id: log.id,
        product: log.product?.name || 'Unknown Product',
        user: log.user?.full_name || 'System',
        quantity: log.change_amount,
        type: log.change_amount > 0 ? 'in' : 'out',
        reason: log.reason,
        time: timeAgo,
        timestamp: log.created_at
      };
    });

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
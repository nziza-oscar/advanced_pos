import { NextResponse } from 'next/server';
import { Transaction, Product, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch Today's Sales & Order Count
    const todayStats = await Transaction.findOne({
      where: {
        created_at: { [Op.gte]: today },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSales'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders']
      ],
      raw: true
    }) as any;

    // 2. Fetch Lifetime Income
    const lifetimeStats = await Transaction.findOne({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalIncome']
      ],
      raw: true
    }) as any;

    // 3. Fetch Low Stock Count (threshold < 10)
    const lowStockCount = await Product.count({
      where: {
        stock_quantity: { [Op.lt]: 10 },
        is_active: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        todaySales: parseFloat(todayStats?.totalSales || 0),
        totalOrders: parseInt(todayStats?.totalOrders || 0),
        totalIncome: parseFloat(lifetimeStats?.totalIncome || 0),
        lowStockItems: lowStockCount
      }
    });

  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { Transaction, User, sequelize } from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    const end = endDate ? new Date(endDate) : new Date();
    if (!endDate) end.setHours(23, 59, 59, 999);

    // Summary Statistics
    const currentSummary = await Transaction.findOne({
      where: {
        created_at: { [Op.between]: [start, end] },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
      ],
      raw: true
    }) as any;

    const currentRevenue = parseFloat(currentSummary?.revenue || 0);
    const currentTransactions = parseInt(currentSummary?.transactions || 0);

    // FIX: Hourly Data for MySQL
    // In MySQL we use HOUR() and DATE() instead of DATE_TRUNC
    const hourlyData = await Transaction.findAll({
      where: {
        created_at: { [Op.between]: [start, end] },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('HOUR', sequelize.col('created_at')), 'hour_val'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      group: [sequelize.fn('HOUR', sequelize.col('created_at'))],
      order: [[sequelize.fn('HOUR', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // FIX: Category Revenue for MySQL (Backticks instead of Double Quotes)
    const categoryData = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN transaction_items ti ON ti.product_id = p.id
      LEFT JOIN transactions t ON t.id = ti.transaction_id 
        AND t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      GROUP BY c.id, c.name
      HAVING revenue > 0
      ORDER BY revenue DESC
      LIMIT 5
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT
    }) as any[];

    // Format hourly data for the chart component
    const formattedHourly = hourlyData.map((item: any) => ({
      hour: `${item.hour_val}:00`,
      total: parseFloat(item.total || 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          revenue: currentRevenue,
          transactions: currentTransactions,
          avgOrderValue: currentTransactions > 0 ? currentRevenue / currentTransactions : 0,
        },
        hourly: formattedHourly,
        categories: categoryData.map(cat => ({
          name: cat.name,
          revenue: parseFloat(cat.revenue),
          percentage: currentRevenue > 0 ? Math.round((cat.revenue / currentRevenue) * 100) : 0
        }))
      }
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
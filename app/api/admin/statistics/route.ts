import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem, Product, Category, User, sequelize } from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Fix: Calculate previous period correctly
    const periodDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousPeriodStart = new Date(start);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDuration);

    // 1. Get summary statistics with better null handling
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

    const previousSummary = await Transaction.findOne({
      where: {
        created_at: { [Op.between]: [previousPeriodStart, start] },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
      ],
      raw: true
    }) as any;

    const currentRevenue = parseFloat(currentSummary?.revenue || 0);
    const previousRevenue = parseFloat(previousSummary?.revenue || 0);
    const currentTransactions = parseInt(currentSummary?.transactions || 0);
    const previousTransactions = parseInt(previousSummary?.transactions || 0);

    const revenueChange = previousRevenue > 0 ? 
      ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 
      (currentRevenue > 0 ? 100 : 0);
    
    const transactionChange = previousTransactions > 0 ?
      ((currentTransactions - previousTransactions) / previousTransactions) * 100 :
      (currentTransactions > 0 ? 100 : 0);

    const avgOrderValue = currentTransactions > 0 ? currentRevenue / currentTransactions : 0;
    const previousAvgOrder = previousTransactions > 0 ? previousRevenue / previousTransactions : 0;
    const avgOrderChange = previousAvgOrder > 0 ?
      ((avgOrderValue - previousAvgOrder) / previousAvgOrder) * 100 : 
      (avgOrderValue > 0 ? 100 : 0);

    // 2. Get active staff count - handle missing User model
    let activeStaff = 0;
    try {
      // If User model exists, use it; otherwise default to 0
      activeStaff = await User?.count?.({
        where: { 
          is_active: true,
          last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }) || 0;
    } catch (error) {
      console.warn('User model not available, defaulting active staff to 0');
    }

    // 3. Get hourly data for chart with null handling
    const hourlyData = await Transaction.findAll({
      where: {
        created_at: { [Op.between]: [start, end] },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('created_at')), 'hour'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'hour', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // 4. Get category revenue - FIXED: Handle categories without transactions
    const categoryData = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue,
        COALESCE(COUNT(DISTINCT ti.transaction_id), 0) as transaction_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN transaction_items ti ON ti.product_id = p.id
      LEFT JOIN transactions t ON t.id = ti.transaction_id 
        AND t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(ti.quantity * ti.unit_price), 0) > 0
      ORDER BY revenue DESC
      LIMIT 5
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT
    }) as any[];

    // 5. Get payment method distribution
    const paymentMethods = await Transaction.findAll({
      where: {
        created_at: { [Op.between]: [start, end] },
        status: 'completed'
      },
      attributes: [
        'payment_method',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'revenue']
      ],
      group: ['payment_method'],
      raw: true
    });

    const totalTransactions = currentTransactions;
    const paymentMethodData = paymentMethods.map((pm: any) => ({
      method: pm.payment_method,
      count: parseInt(pm.count),
      revenue: parseFloat(pm.revenue || 0),
      percentage: totalTransactions > 0 ? Math.round((parseInt(pm.count) / totalTransactions) * 100) : 0
    }));

    // 6. Get top selling products
    const topProducts = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category_name,
        COALESCE(SUM(ti.quantity), 0) as quantity,
        COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN transaction_items ti ON ti.product_id = p.id
      LEFT JOIN transactions t ON t.id = ti.transaction_id
        AND t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      GROUP BY p.id, p.name, p.category_id, c.name
      HAVING COALESCE(SUM(ti.quantity), 0) > 0
      ORDER BY revenue DESC
      LIMIT 10
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT
    }) as any[];

    // 7. Get daily sales data
    const dailyData = await sequelize.query(`
      SELECT 
        DATE(t.created_at) as date,
        COALESCE(SUM(t.total_amount), 0) as revenue,
        COALESCE(COUNT(t.id), 0) as transactions,
        COALESCE(AVG(t.total_amount), 0) as avg_order
      FROM transactions t
      WHERE t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      GROUP BY DATE(t.created_at)
      ORDER BY date ASC
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT
    }) as any[];

    // Format hourly data for chart
    const formattedHourly = hourlyData.map((hour: any) => ({
      hour: hour.hour ? new Date(hour.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
      total: parseFloat(hour.total || 0)
    }));

    // Format category data
    const totalCategoryRevenue = categoryData.reduce((sum: number, cat: any) => sum + parseFloat(cat.revenue || 0), 0);
    const formattedCategories = categoryData.map((cat: any) => ({
      name: cat.name,
      revenue: parseFloat(cat.revenue || 0),
      percentage: totalCategoryRevenue > 0 ? Math.round((parseFloat(cat.revenue || 0) / totalCategoryRevenue) * 100) : 0,
      change: 0,
      transactionCount: parseInt(cat.transaction_count || 0)
    }));

    // Format top products
    const formattedTopProducts = topProducts.map((product: any) => ({
      name: product.name,
      category: product.category_name || 'Uncategorized',
      quantity: parseInt(product.quantity || 0),
      revenue: parseFloat(product.revenue || 0)
    }));

    // Format daily data
    const formattedDailyData = dailyData.map((day: any) => ({
      date: day.date,
      revenue: parseFloat(day.revenue || 0),
      transactions: parseInt(day.transactions || 0),
      avgOrder: parseFloat(day.avg_order || 0),
      dayOfWeek: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          revenue: currentRevenue,
          transactions: currentTransactions,
          avgOrderValue,
          activeStaff,
          revenueChange: parseFloat(revenueChange.toFixed(2)),
          transactionChange: parseFloat(transactionChange.toFixed(2)),
          avgOrderChange: parseFloat(avgOrderChange.toFixed(2))
        },
        hourly: formattedHourly,
        categories: formattedCategories,
        paymentMethods: paymentMethodData,
        topProducts: formattedTopProducts,
        dailyData: formattedDailyData
      }
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
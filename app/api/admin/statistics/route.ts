import { NextRequest, NextResponse } from 'next/server';
import { Transaction, User, Product, Category, sequelize } from '@/lib/database/models';
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

    // Calculate previous period for comparison
    const previousStart = new Date(start);
    const previousEnd = new Date(start);
    previousStart.setDate(previousStart.getDate() - (end.getDate() - start.getDate() + 1));
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    // Summary Statistics - Current Period
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

    // Summary Statistics - Previous Period (for calculating changes)
    const previousSummary = await Transaction.findOne({
      where: {
        created_at: { [Op.between]: [previousStart, previousEnd] },
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
    const previousRevenue = parseFloat(previousSummary?.revenue || 0);
    const previousTransactions = parseInt(previousSummary?.transactions || 0);

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0;
    
    const transactionChange = previousTransactions > 0
      ? ((currentTransactions - previousTransactions) / previousTransactions) * 100
      : currentTransactions > 0 ? 100 : 0;

    const currentAvgOrder = currentTransactions > 0 ? currentRevenue / currentTransactions : 0;
    const previousAvgOrder = previousTransactions > 0 ? previousRevenue / previousTransactions : 0;
    const avgOrderChange = previousAvgOrder > 0
      ? ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100
      : currentAvgOrder > 0 ? 100 : 0;

    // Active Staff (users who created transactions in the period)
    const activeStaff = await User.count({
      include: [{
        model: Transaction,
        as: 'transactions',
        where: {
          created_at: { [Op.between]: [start, end] },
          status: 'completed'
        },
        required: true
      }]
    });

    // Hourly Sales Data
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

    // Category Revenue
    const categoryData = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue,
        COALESCE(
          (SELECT COALESCE(SUM(ti2.quantity * ti2.unit_price), 0)
           FROM categories c2
           LEFT JOIN products p2 ON p2.category_id = c2.id
           LEFT JOIN transaction_items ti2 ON ti2.product_id = p2.id
           LEFT JOIN transactions t2 ON t2.id = ti2.transaction_id 
             AND t2.created_at BETWEEN :prevStart AND :prevEnd
             AND t2.status = 'completed'
           WHERE c2.id = c.id
          ), 0) as previous_revenue
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
      replacements: { 
        start, 
        end, 
        prevStart: previousStart, 
        prevEnd: previousEnd 
      },
      type: QueryTypes.SELECT
    }) as any[];

    // Payment Methods Breakdown
    const paymentMethodsData = await Transaction.findAll({
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
    }) as any[];

    // Top Products
    const topProductsData = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        c.name as category,
        COALESCE(SUM(ti.quantity), 0) as quantity,
        COALESCE(SUM(ti.total_price), 0) as revenue
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN transaction_items ti ON ti.product_id = p.id
      LEFT JOIN transactions t ON t.id = ti.transaction_id
        AND t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      GROUP BY p.id, p.name, c.name
      HAVING revenue > 0
      ORDER BY revenue DESC
      LIMIT 10
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT
    }) as any[];

    // Daily Data (for potential future use)
    const dailyData = await Transaction.findAll({
      where: {
        created_at: { [Op.between]: [start, end] },
        status: 'completed'
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    }) as any[];

    // Format data for response
    const formattedHourly = hourlyData.map((item: any) => ({
      hour: `${item.hour_val}:00`,
      total: parseFloat(item.total || 0)
    }));

    const formattedCategories = categoryData.map(cat => {
      const revenue = parseFloat(cat.revenue || 0);
      const previousRevenue = parseFloat(cat.previous_revenue || 0);
      const change = previousRevenue > 0 
        ? ((revenue - previousRevenue) / previousRevenue) * 100 
        : revenue > 0 ? 100 : 0;
      
      return {
        name: cat.name,
        revenue: revenue,
        percentage: currentRevenue > 0 ? Math.round((revenue / currentRevenue) * 100) : 0,
        change: Math.round(change)
      };
    });

    const totalCount = paymentMethodsData.reduce((sum, pm) => sum + parseInt(pm.count || 0), 0);
    const totalRevenue = paymentMethodsData.reduce((sum, pm) => sum + parseFloat(pm.revenue || 0), 0);

    const formattedPaymentMethods = paymentMethodsData.map(pm => ({
      method: pm.payment_method,
      count: parseInt(pm.count || 0),
      revenue: parseFloat(pm.revenue || 0),
      percentage: totalCount > 0 ? Math.round((parseInt(pm.count || 0) / totalCount) * 100) : 0
    }));

    const formattedTopProducts = topProductsData.map(product => ({
      name: product.name,
      quantity: parseInt(product.quantity || 0),
      revenue: parseFloat(product.revenue || 0),
      category: product.category || 'Uncategorized'
    }));

    const formattedDailyData = dailyData.map(day => ({
      date: day.date,
      revenue: parseFloat(day.revenue || 0),
      transactions: parseInt(day.transactions || 0),
      avgOrder: parseInt(day.transactions || 0) > 0 
        ? parseFloat(day.revenue || 0) / parseInt(day.transactions || 0) 
        : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          revenue: currentRevenue,
          transactions: currentTransactions,
          avgOrderValue: currentAvgOrder,
          activeStaff: activeStaff,
          revenueChange: Math.round(revenueChange),
          transactionChange: Math.round(transactionChange),
          avgOrderChange: Math.round(avgOrderChange)
        },
        hourly: formattedHourly,
        categories: formattedCategories,
        paymentMethods: formattedPaymentMethods,
        topProducts: formattedTopProducts,
        dailyData: formattedDailyData
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
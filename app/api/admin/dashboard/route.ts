import { NextRequest, NextResponse } from 'next/server';
import { Transaction, Product, User} from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';
import sequelize from "@/lib/database/connection"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(startDate.getDate() - 30);
        break;
      default: // today
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(startDate.getDate() - 1);
        break;
    }

    const endDate = new Date(now);
    const previousEndDate = new Date(startDate);

    // Get current period stats
    const currentStats = await getPeriodStats(startDate, endDate);
    const previousStats = await getPeriodStats(previousStartDate, previousEndDate);

    // Calculate changes
    const revenueChange = previousStats.revenue > 0 
      ? ((currentStats.revenue - previousStats.revenue) / previousStats.revenue) * 100 
      : (currentStats.revenue > 0 ? 100 : 0);

    const transactionChange = previousStats.transactions > 0
      ? ((currentStats.transactions - previousStats.transactions) / previousStats.transactions) * 100
      : (currentStats.transactions > 0 ? 100 : 0);

    // Get active staff (logged in last 7 days)
    const activeStaff = await User.count({
      where: {
        is_active: true,
        last_login: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get low stock items
    const lowStockItems = await Product.count({
      where: {
        stock_quantity: {
          [Op.lte]: sequelize.col('min_stock_level')
        },
        is_active: true
      }
    });

    // Get pending orders
    const pendingOrders = await Transaction.count({
      where: {
        status: 'pending'
      }
    });

    // Get top categories
    const topCategories = await getTopCategories(startDate, endDate);

    // Get recent transactions
    const recentTransactions = await getRecentTransactions();

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          current: currentStats.revenue,
          previous: previousStats.revenue,
          change: parseFloat(revenueChange.toFixed(1))
        },
        transactions: {
          current: currentStats.transactions,
          previous: previousStats.transactions,
          change: parseFloat(transactionChange.toFixed(1))
        },
        avgOrderValue: currentStats.avgOrderValue,
        activeStaff,
        lowStockItems,
        pendingOrders,
        topCategories,
        recentTransactions
      }
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function getPeriodStats(startDate: Date, endDate: Date) {
  const result = await Transaction.findOne({
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
      status: 'completed'
    },
    attributes: [
      [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      [sequelize.fn('AVG', sequelize.col('total_amount')), 'avgOrder']
    ],
    raw: true
  }) as any;

  return {
    revenue: parseFloat(result?.revenue || 0),
    transactions: parseInt(result?.transactions || 0),
    avgOrderValue: parseFloat(result?.avgOrder || 0)
  };
}

async function getTopCategories(startDate: Date, endDate: Date) {
  try {
    const categories = await sequelize.query(`
      SELECT 
        c.name,
        COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue,
        0 as \`change\`
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN transactionitems ti ON ti.product_id = p.id
      LEFT JOIN transactions t ON t.id = ti.transaction_id
        AND t.created_at BETWEEN :start AND :end
        AND t.status = 'completed'
      WHERE t.id IS NOT NULL
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 5
    `, {
      replacements: { 
        start: startDate.toISOString().slice(0, 19).replace('T', ' '), 
        end: endDate.toISOString().slice(0, 19).replace('T', ' ') 
      },
      type: QueryTypes.SELECT
    }) as any[];

    return categories.map(cat => ({
      name: cat.name,
      revenue: parseFloat(cat.revenue),
      change: 0
    }));
  } catch (error) {
    console.error('Error in getTopCategories:', error);
    
    // Fallback: try alternative table names
    try {
      // Try with backticks for MySQL
      const categories = await sequelize.query(`
        SELECT 
          c.name,
          COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue,
          0 as \`change\`
        FROM \`categories\` c
        LEFT JOIN \`products\` p ON p.category_id = c.id
        LEFT JOIN \`transactionitems\` ti ON ti.product_id = p.id
        LEFT JOIN \`transactions\` t ON t.id = ti.transaction_id
          AND t.created_at BETWEEN :start AND :end
          AND t.status = 'completed'
        WHERE t.id IS NOT NULL
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
        LIMIT 5
      `, {
        replacements: { 
          start: startDate.toISOString().slice(0, 19).replace('T', ' '), 
          end: endDate.toISOString().slice(0, 19).replace('T', ' ') 
        },
        type: QueryTypes.SELECT
      }) as any[];

      return categories.map(cat => ({
        name: cat.name,
        revenue: parseFloat(cat.revenue),
        change: 0
      }));
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
}

async function getRecentTransactions() {
  const transactions = await Transaction.findAll({
    where: {
      status: { [Op.in]: ['completed', 'pending'] }
    },
    order: [['created_at', 'DESC']],
    limit: 5,
    attributes: [
      'id',
      'transaction_number',
      'total_amount',
      'payment_method',
      'status',
      'created_at'
    ],
    raw: true
  });

  return transactions.map(tx => ({
    id: tx.id,
    transaction_number: tx.transaction_number,
    total_amount: tx.total_amount,
    payment_method: tx.payment_method,
    status: tx.status,
    created_at: tx.created_at
  }));
}
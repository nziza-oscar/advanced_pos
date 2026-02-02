import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import sequelize from '@/lib/database/connection';
import { Category, Transaction, TransactionItem, Product } from '@/lib/database/models';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    const timeRange = searchParams.get('range') || 'today';
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'today':
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
    }

    const topCategories = await TransactionItem.findAll({
      attributes: [
        [sequelize.col('product.category_id'), 'category_id'],
        [sequelize.col('product.category.name'), 'category_name'],
        [sequelize.fn('SUM', sequelize.col('TransactionItem.total_price')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('TransactionItem.id')), 'transactions_count']
      ],
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: [],
          where: {
            created_at: {
              [Op.gte]: startDate
            },
            status: 'completed'
          },
          required: true
        },
        {
          model: Product,
          as: 'product',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: [],
              where: {
                name: {
                  [Op.ne]: null
                }
              },
              required: true
            }
          ]
        }
      ],
      group: ['product.category_id', 'product.category.name'],
      order: [[sequelize.literal('revenue'), 'DESC']],
      limit: limit,
      raw: true
    });

    // For comparison with previous period
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;
    
    switch (timeRange) {
      case 'week':
        previousPeriodStart = new Date(new Date().setDate(new Date().getDate() - 14));
        previousPeriodEnd = new Date(new Date().setDate(new Date().getDate() - 7));
        break;
      case 'month':
        previousPeriodStart = new Date(new Date().setMonth(new Date().getMonth() - 2));
        previousPeriodEnd = new Date(new Date().setMonth(new Date().getMonth() - 1));
        break;
      case 'today':
      default:
        previousPeriodStart = new Date(new Date().setDate(new Date().getDate() - 2));
        previousPeriodEnd = new Date(new Date().setDate(new Date().getDate() - 1));
        break;
    }

    // Get previous period data for comparison
    const previousPeriodCategories = await TransactionItem.findAll({
      attributes: [
        [sequelize.col('product.category_id'), 'category_id'],
        [sequelize.fn('SUM', sequelize.col('TransactionItem.total_price')), 'revenue']
      ],
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: [],
          where: {
            created_at: {
              [Op.between]: [previousPeriodStart, previousPeriodEnd]
            },
            status: 'completed'
          },
          required: true
        },
        {
          model: Product,
          as: 'product',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: []
            }
          ]
        }
      ],
      group: ['product.category_id'],
      raw: true
    });

    // Create a map of previous period revenues
    const previousRevenueMap = new Map();
    previousPeriodCategories.forEach((item:any) => {
      previousRevenueMap.set(item.category_id, parseFloat(item.revenue));
    });
        
    // Format the response with percentage change
    const formattedCategories = topCategories.map((item:any) => {
      const currentRevenue = parseFloat(item.revenue);
      const previousRevenue = previousRevenueMap.get(item.category_id) || 0;
      
      let change = 0;
      if (previousRevenue > 0) {
        change = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      } else if (currentRevenue > 0) {
        change = 100; // No previous data but has current revenue
      }

      return {
        name: item.category_name,
        revenue: currentRevenue,
        transactions: parseInt(item.transactions_count),
        change: parseFloat(change.toFixed(2))
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedCategories,
      period: timeRange,
      startDate,
      endDate: new Date()
    });

  } catch (error) {
    console.error('Error fetching top categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top categories' },
      { status: 500 }
    );
  }
}   
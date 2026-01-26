import { NextResponse } from 'next/server';
import { Product, Category, StockLog, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // 1. Total Products Count
    const totalProducts = await Product.count({
      where: { is_active: true }
    });

    // 2. Low Stock Count (stock < min_stock_level)
    const lowStockCount = await Product.count({
      where: {
        stock_quantity: {
          [Op.lt]: sequelize.col('min_stock_level')
        },
        is_active: true
      }
    });

    // 3. Out of Stock Count
    const outOfStockCount = await Product.count({
      where: {
        stock_quantity: 0,
        is_active: true
      }
    });

    // 4. Low Stock Alerts with details
    const lowStockAlerts = await Product.findAll({
      where: {
        stock_quantity: {
          [Op.lt]: sequelize.col('min_stock_level')
        },
        is_active: true
      },
      attributes: ['id', 'name', 'stock_quantity', 'min_stock_level'],
      limit: 10,
      order: [['stock_quantity', 'ASC']]
    });

    // 5. Total Stock Value (stock * cost_price)
    const stockValueResult = await Product.findOne({
      where: { is_active: true },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('stock_quantity * COALESCE(cost_price, price * 0.7)')), 'totalValue']
      ],
      raw: true
    }) as any;

    // 6. Category Count
    const categoryCount = await Category.count();

    // 7. Monthly Stock Movements
    const monthlyMovements = await StockLog.count({
      where: {
        created_at: {
          [Op.gte]: lastMonth
        }
      }
    });

    // 8. Low Stock Change (compared to yesterday)
    const yesterdayLowStock = await Product.count({
      where: {
        stock_quantity: {
          [Op.lt]: sequelize.col('min_stock_level')
        },
        is_active: true,
        updated_at: {
          [Op.lt]: today,
          [Op.gte]: yesterday
        }
      }
    });

    // 9. Out of Stock Change
    const yesterdayOutOfStock = await Product.count({
      where: {
        stock_quantity: 0,
        is_active: true,
        updated_at: {
          [Op.lt]: today,
          [Op.gte]: yesterday
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalStockValue: parseFloat(stockValueResult?.totalValue || 0).toFixed(2),
        categoryCount,
        monthlyMovements,
        lowStockChange: lowStockCount - yesterdayLowStock,
        outOfStockChange: outOfStockCount - yesterdayOutOfStock,
        lowStockAlerts: lowStockAlerts.map(alert => ({
          id: alert.id,
          name: alert.name,
          stock: alert.stock_quantity,
          minStock: alert.min_stock_level
        }))
      }
    });

  } catch (error: any) {
    console.error('Inventory Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}
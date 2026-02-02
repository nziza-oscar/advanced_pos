import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/lib/database/models';
import { Op } from 'sequelize';
import sequelize from "@/lib/database/connection";

export async function GET(request: NextRequest) {
  try {
    const lowStockProducts = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      where: {
        is_active: true,
        // Condition: min_stock_level >= stock_quantity
        min_stock_level: {
          [Op.gte]: sequelize.col('stock_quantity')
        }
      },
      attributes: [
        'id',
        'name',
        'stock_quantity',
        'min_stock_level',
        'barcode'
      ],
      order: [['stock_quantity', 'ASC']]
    });

    const alerts = lowStockProducts.map(product => {
      const { stock_quantity: currentStock, min_stock_level: minStock } = product;
      
      let status: 'critical' | 'low' | 'warning';
      
      if (currentStock <= 0 || currentStock <= minStock * 0.25) {
        status = 'critical';
      } else if (currentStock <= minStock * 0.75) {
        status = 'low';
      } else {
        status = 'warning';
      }

      return {
        product_id: product.id,
        product_name: product.name,
        barcode: product.barcode,
        current_stock: currentStock,
        min_stock: minStock,
        status,
        category: (product as any).category?.name || 'Uncategorized'
      };
    });

    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error: any) {
    console.error('Inventory alerts error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory alerts',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
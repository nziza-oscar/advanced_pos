import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/lib/database/models';
import { Op } from 'sequelize';
import  sequelize from "@/lib/database/connection"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseFloat(searchParams.get('threshold') || '0.5'); // 50% of min stock

    // Get products with low stock
    const lowStockProducts = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      where: {
        is_active: true,
        stock_quantity: {
          [Op.lte]: sequelize.literal(`min_stock_level * ${threshold}`)
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
      const percentage = (product.stock_quantity / product.min_stock_level) * 100;
      
      let status: 'critical' | 'low' | 'warning';
      if (percentage <= 20) {
        status = 'critical';
      } else if (percentage <= 50) {
        status = 'low';
      } else {
        status = 'warning';
      }

      return {
        product_id: product.id,
        product_name: product.name,
        barcode: product.barcode,
        current_stock: product.stock_quantity,
        min_stock: product.min_stock_level,
        percentage: parseFloat(percentage.toFixed(1)),
        status,
        category:  'Uncategorized'
      };
    });

    return NextResponse.json({
      success: true,
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
import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await Product.findAll({
      where: {
        [Op.and]: [
          { is_active: true },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${query}%` } },
              { barcode: { [Op.like]: `%${query}%` } }
            ]
          }
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      limit: 10,
      order: [['name', 'ASC']]
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('SEARCH_API_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
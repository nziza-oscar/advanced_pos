import { NextRequest, NextResponse } from 'next/server';
import Category from '@/lib/database/models/Category'; // Adjust path to your model
import { Product } from '@/lib/database/models'; // To count products
import sequelize from '@/lib/database/connection';

export async function GET() {
  try {
    // Fetch categories with a count of associated products
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
                SELECT COUNT(*)
                FROM "products" AS "product"
                WHERE "product"."category_id" = "Category"."id"
            )`),
            'product_count'
            ]
        ]
      },
      order: [['name', 'ASC']]
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, parent_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      description,
      parent_id: parent_id || null
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
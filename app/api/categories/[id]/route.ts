import { NextRequest, NextResponse } from 'next/server';
import Category from '@/lib/database/models/Category';
import { Product } from '@/lib/database/models';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const category = await Category.findByPk(id);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Update fields
    await category.update({
      name: body.name,
      description: body.description,
      parent_id: body.parent_id || null
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Business logic to prevent orphaned products
    await Product.update(
      { category_id: null },
      { where: { category_id: id } }
    );

    await category.destroy();

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Delete operation failed' }, { status: 500 });
  }
}
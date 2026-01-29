import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/lib/database/models';

// Updated interface to reflect that params is now a Promise
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params before using them
    const { id } = await params;

    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.get('id'),
        barcode: product.get('barcode'),
        name: product.get('name'),
        description: product.get('description'),
        price: product.get('price'),
        cost_price: product.get('cost_price') ? product.get('cost_price') : null,
        image_url: product.get('image_url'),
        category_id: product.get('category_id'),
        stock_quantity: product.get('stock_quantity'),
        min_stock_level: product.get('min_stock_level'),
        is_active: product.get('is_active'),
        created_at: product.get('created_at'),
        updated_at: product.get('updated_at'),
        category: product.category ? {
          id: product.category.get('id'),
          name: product.category.get('name')
        } : null
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByPk(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await product.update({
      name: body.name || product.get('name'),
      description: body.description !== undefined ? body.description : product.get('description'),
      price: body.price ? parseFloat(body.price) : product.get('price'),
      cost_price: body.cost_price !== undefined ? parseFloat(body.cost_price) : product.get('cost_price'),
      image_url: body.image_url !== undefined ? body.image_url : product.get('image_url'),
      category_id: body.category_id !== undefined ? body.category_id : product.get('category_id'),
      stock_quantity: body.stock_quantity !== undefined ? parseInt(body.stock_quantity) : product.get('stock_quantity'),
      min_stock_level: body.min_stock_level !== undefined ? parseInt(body.min_stock_level) : product.get('min_stock_level'),
      is_active: body.is_active !== undefined ? body.is_active : product.get('is_active')
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        id: product.get('id'),
        name: product.get('name'),
        price: product.get('price'),
        stock_quantity: product.get('stock_quantity')
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await Product.findByPk(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await product.update({ is_active: false });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
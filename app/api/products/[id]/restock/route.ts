import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/database/models';
import { verifyAuth } from '@/lib/auth/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const quantity = Number(body.quantity);

    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid positive quantity is required' }, 
        { status: 400 }
      );
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' }, 
        { status: 404 }
      );
    }

    const currentStock = Number(product.stock_quantity) || 0;
    const newStockTotal = currentStock + quantity;

    await product.update({
      stock_quantity: newStockTotal
    });

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        id: product.id,
        name: product.name,
        previous_stock: currentStock,
        added_quantity: quantity,
        new_total_stock: newStockTotal,
        processed_by: user.full_name
      }
    });

  } catch (error: any) {
    console.error('RESTOCK_API_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
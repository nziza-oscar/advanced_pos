import { NextRequest, NextResponse } from 'next/server';
import Product from '@/lib/database/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    // Await the params promise
    const { barcode } = await params;

    if (!barcode) {
      return NextResponse.json(
        { success: false, message: 'Barcode is required' },
        { status: 400 }
      );
    }

    // Search for product by barcode
    const product = await Product.findOne({
      where: { 
        barcode: barcode,
        is_active: true 
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        product_id: product.id,
        barcode: product.barcode,
        name: product.name,
        // Ensure price is handled as a number
        price: parseFloat(product.price as unknown as string), 
        max_quantity: product.stock_quantity,
        image_url: product.image_url,
      }
    });

  } catch (error: any) {
    console.error('Barcode Search Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
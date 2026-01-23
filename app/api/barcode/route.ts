import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/database/models';

// GET - Scan barcode (just find product)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    
    if (!barcode) {
      return NextResponse.json(
        { error: 'No barcode provided' },
        { status: 400 }
      );
    }
    
    const product = await Product.findOne({
      where: { barcode }
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
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/database/models';
import { generateBarcode } from '@/lib/utils/barcode-generator';

// POST - Create product with auto-generated barcode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Auto-generate barcode
    let barcode = generateBarcode();
    
    // Make sure barcode is unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await Product.findOne({ where: { barcode } });
      if (!existing) break;
      barcode = generateBarcode();
      attempts++;
    }
    
    // Create product
    const product = await Product.create({
      barcode,
      name: body.name,
      price: parseFloat(body.price),
      image_url: body.image_url || null,
      stock_quantity: parseInt(body.stock_quantity || '0')
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        stock_quantity: product.stock_quantity
      }
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
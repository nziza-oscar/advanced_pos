import { NextRequest, NextResponse } from 'next/server';
import Barcode from '@/lib/database/models/Barcode';

export async function GET(request: NextRequest) {
  try {
    const availableCount = await Barcode.count({
      where: { status: 'available' }
    });

    const nextBarcode = await Barcode.findOne({
      where: { status: 'available' },
      order: [['barcode_id', 'ASC']],
      attributes: ['barcode_id', 'barcode']
    });

    return NextResponse.json({
      success: true,
      data: {
        available_count: availableCount,
        next_available_barcode: nextBarcode ? {
          id: nextBarcode.barcode_id,
          barcode: nextBarcode.barcode
        } : null,
        warning_level: availableCount < 10,
        critical_level: availableCount < 3
      }
    });

  } catch (error: any) {
    console.error('Available barcodes check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check available barcodes'
      },
      { status: 500 }
    );
  }
}
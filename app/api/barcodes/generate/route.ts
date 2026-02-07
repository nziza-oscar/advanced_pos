import { NextRequest, NextResponse } from 'next/server';
import Barcode, { BarcodeStatus } from '@/lib/database/models/Barcode';

export async function POST(request: NextRequest) {
  try {
    const { count } = await request.json();
    
    // Validate count
    if (!count || count < 1 || count > 50) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Start transaction
    const transaction = await Barcode.sequelize!.transaction();
    
    try {
      // Get the last barcode_id
      const lastBarcode = await Barcode.findOne({
        order: [['barcode_id', 'DESC']],
        transaction
      });

      let startId = 1;
      if (lastBarcode) {
        startId = lastBarcode.barcode_id + 1;
      }

      // Generate barcodes array with explicit typing to satisfy the model
      const barcodes = [];
      for (let i = 0; i < count; i++) {
        const barcodeId = startId + i;
        const barcodeValue = String(barcodeId).padStart(10, '0');
        
        barcodes.push({
          barcode_id: barcodeId,
          barcode: barcodeValue,
          status: BarcodeStatus.AVAILABLE // Using the constant ensures the correct type
        });
      }

      // Bulk create
      const createdBarcodes = await Barcode.bulkCreate(barcodes, { transaction });
      
      // Commit transaction
      await transaction.commit();

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${count} barcode(s)`,
        data: createdBarcodes
      });

    } catch (error) {
      // Rollback transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Barcode generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate barcodes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
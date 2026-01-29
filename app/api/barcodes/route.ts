import { NextRequest, NextResponse } from 'next/server';
import Barcode from '@/lib/database/models/Barcode';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { barcode: { [Op.like]: `%${search}%` } },
        { barcode_id: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get barcodes with pagination
    const { count, rows } = await Barcode.findAndCountAll({
      where,
      order: [['barcode_id', 'DESC']],
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error: any) {
    console.error('Get barcodes error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch barcodes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
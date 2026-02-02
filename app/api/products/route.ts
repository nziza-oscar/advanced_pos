import { NextRequest, NextResponse } from 'next/server';
import { Product, Category, Barcode, sequelize } from '@/lib/database/models';
import { validateFile, uploadProductImage } from '@/lib/utils/file-upload';
import { Op } from 'sequelize';

/**
 * GET - Fetch all products
 * Includes category information for better organization in the UI
 */
export async function GET() {
  try {
    const products = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create product with real image upload, cost, and selling price
 * Uses the first available barcode from the Barcode table
 */
export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();
  
  try {
    const formData = await request.formData();
    
    // Extracting fields
    const name = formData.get('name') as string;
    const cost_price_raw = formData.get('cost_price') as string;
    const selling_price_raw = formData.get('selling_price') as string;
    const stock_quantity = formData.get('stock_quantity') as string;
    const category_id = formData.get('category_id') as string;
    const imageFile = formData.get('image') as File | null;

    // 1. Validation - Check for presence and valid numbers
    if (!name || !cost_price_raw || !selling_price_raw) {
      await transaction.rollback();
      return NextResponse.json(
        { 
          success: false,
          error: 'Product name, cost price, and selling price are required' 
        },
        { status: 400 }
      );
    }

    const cost_price = parseFloat(cost_price_raw) || 0;
    const selling_price = parseFloat(selling_price_raw) || 0;

    if (selling_price < cost_price) {
      await transaction.rollback();
      return NextResponse.json(
        { 
          success: false,
          error: 'Selling price cannot be lower than cost price' 
        },
        { status: 400 }
      );
    }

    // 2. Get first available barcode
    const availableBarcode = await Barcode.findOne({
      where: {
        status: 'available'
      },
      order: [['barcode_id', 'ASC']],
      lock: true,
      transaction
    });

    if (!availableBarcode) {
      await transaction.rollback();
      return NextResponse.json(
        { 
          success: false,
          error: 'No available barcodes. Please generate new barcodes before creating products.',
          errorType: 'NO_BARCODES_AVAILABLE'
        },
        { status: 400 }
      );
    }

    // 3. Image Processing
    let image_url = null;
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile);
      if (!validation.valid) {
        await transaction.rollback();
        return NextResponse.json({ 
          success: false,
          error: validation.error 
        }, { status: 400 });
      }
      
      const upload = await uploadProductImage(imageFile);
      image_url = upload.url;
    }

    // 4. Create product with the assigned barcode
    const product = await Product.create({
      barcode: availableBarcode.barcode, // Use the actual barcode value
      name,
      cost_price,
      price: selling_price, 
      image_url,
      stock_quantity: parseInt(stock_quantity || '0') || 0,
      category_id: (category_id && category_id !== "undefined") ? category_id : null,
      min_stock_level: 5
    }, { transaction });

    // 5. Update barcode status to 'used'
    await availableBarcode.update({
      status: 'used'
    }, { transaction });

    // 6. Create stock log entry
    if (parseInt(stock_quantity || '0') > 0) {
      // Assuming you have a StockLog model
      // await StockLog.create({
      //   product_id: product.id,
      //   user_id: 'system', // Or get from auth
      //   change_amount: parseInt(stock_quantity || '0'),
      //   reason: 'initial_stock',
      //   notes: 'Initial stock when product was created'
      // }, { transaction });
    }

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...product.toJSON(),
        assigned_barcode_id: availableBarcode.barcode_id,
        assigned_barcode: availableBarcode.barcode
      }
    }, { status: 201 });

  } catch (error: any) {
    await transaction.rollback();
    console.error('Create product error:', error);
    
    // Check for duplicate barcode error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Barcode already exists in system. Please try again or generate new barcodes.',
          errorType: 'BARCODE_CONFLICT'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}
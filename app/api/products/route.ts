import { NextRequest, NextResponse } from 'next/server';
import { Product, Category, Barcode, sequelize } from '@/lib/database/models';
import { validateFile, uploadProductImage } from '@/lib/utils/file-upload';
import { Op } from 'sequelize';
import { verifyAuth } from "@/lib/auth/auth-utils"

/**
 * GET - Fetch all products
 * Includes category information for better organization in the UI
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const lowStock = searchParams.get('lowStock') === 'true';
    const outOfStock = searchParams.get('outOfStock') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    
    // Search filter (name or barcode)
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Category filter
    if (category) {
      whereConditions.category_id = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Stock filters
    if (lowStock) {
      whereConditions[Op.and] = [
        ...(whereConditions[Op.and] || []),
        sequelize.where(
          sequelize.col('stock_quantity'),
          Op.lte,
          sequelize.col('min_stock_level')
        ),
        { stock_quantity: { [Op.gt]: 0 } }
      ];
    }
    
    if (outOfStock) {
      whereConditions.stock_quantity = 0;
    }
    
    // Active status filter
    if (activeOnly) {
      whereConditions.is_active = true;
    }

    // Validate sort parameters
    const validSortColumns = ['name', 'price', 'stock_quantity', 'created_at', 'updated_at'];
    const validSortOrder = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrder.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    // Get total count for pagination
    const total = await Product.count({
      where: whereConditions
    });

    // Fetch products with pagination and filters
    const products = await Product.findAll({
      where: whereConditions,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      attributes: [
        'id',
        'barcode',
        'name',
        'description',
        'price',
        'cost_price',
        'image_url',
        'stock_quantity',
        'min_stock_level',
        'is_active',
        'category_id',
        'created_at',
        'updated_at'
      ],
      order: [[sortColumn, sortDirection]],
      limit: limit,
      offset: offset
    });

    // Calculate low stock count (stock ≤ min_stock_level AND stock > 0)
    const lowStockCount = await Product.count({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.col('stock_quantity'),
            Op.lte,
            sequelize.col('min_stock_level')
          ),
          { stock_quantity: { [Op.gt]: 0 } },
          { is_active: true }
        ]
      }
    });

    // Calculate out of stock count
    const outOfStockCount = await Product.count({
      where: {
        stock_quantity: 0,
        is_active: true
      }
    });

    // Calculate active products count
    const activeCount = await Product.count({
      where: {
        is_active: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        filters: {
          search,
          category,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          lowStock,
          outOfStock,
          activeOnly
        },
        stats: {
          total,
          active: activeCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount
        }
      }
    });

  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();
  
  try {
    // Verify user authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Please login to create products.' 
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extracting required fields
    const name = formData.get('name') as string;
    const cost_price_raw = formData.get('cost_price') as string;
    const selling_price_raw = formData.get('selling_price') as string;
    const stock_quantity = formData.get('stock_quantity') as string;
    const category_id = formData.get('category_id') as string;
    const imageFile = formData.get('image') as File | null;
    
    // Extracting optional fields
    const description = formData.get('description') as string | null;
    const min_stock_level_raw = formData.get('min_stock_level') as string | null;

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
    const stock_qty = parseInt(stock_quantity || '0') || 0;
    const min_stock_level = min_stock_level_raw ? parseInt(min_stock_level_raw) || 5 : 5;

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
      stock_quantity: stock_qty,
      min_stock_level: min_stock_level,
      description: description || null,
      category_id: (category_id && category_id !== "undefined") ? category_id : null,
      is_active: true,
    }, { transaction });

    // 5. Update barcode status to 'used'
    await availableBarcode.update({
      status: 'used',
    
    }, { transaction });

    // 6. Create stock log entry (if StockLog model exists)
    if (stock_qty > 0) {
      try {
        // Check if StockLog model exists before using it
        const { StockLog } = await import('@/lib/database/models');
        if (StockLog) {
          await StockLog.create({
            product_id: product.id,
            user_id: user.id, 
            user_name: user.full_name || user.username,
            change_amount: stock_qty,
            previous_quantity: 0,
            new_quantity: stock_qty,
            reason: 'initial_stock',
            notes: `Initial stock added by ${user.full_name || user.username} during product creation`
          }, { transaction });
        }
      } catch (error) {
        console.warn('StockLog not available or error creating stock log:', error);
        // Continue without stock log if model doesn't exist
      }
    }

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...product.toJSON(),
        assigned_barcode_id: availableBarcode.barcode_id,
        assigned_barcode: availableBarcode.barcode,
        created_by: {
          id: user.id,
          name: user.full_name,
          username: user.username
        }
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




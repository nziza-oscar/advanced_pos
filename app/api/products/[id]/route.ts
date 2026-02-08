import { NextRequest, NextResponse } from 'next/server';
import { Product, Category,sequelize,StockLog } from '@/lib/database/models';
import { verifyAuth } from '@/lib/auth/auth-utils';
import { validateFile, uploadProductImage } from '@/lib/utils/file-upload';

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





export async function PATCH(request: NextRequest) {
  const transaction = await sequelize.transaction();
  
  try {
    // Verify user authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Please login to update products.' 
        },
        { status: 401 }
      );
    }

    // Extract product ID from URL path
    const pathParts = request.nextUrl.pathname.split('/');
    const productId = pathParts[pathParts.length - 1];
    
    if (!productId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Product ID is required' 
        },
        { status: 400 }
      );
    }

    // Find the product
    const product = await Product.findByPk(productId, { transaction });
    
    if (!product) {
      await transaction.rollback();
      return NextResponse.json(
        { 
          success: false,
          error: 'Product not found' 
        },
        { status: 404 }
      );
    }

    // Check content type
    const contentType = request.headers.get('content-type') || '';
    
    let updates: any = {};
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle form data
      const formData = await request.formData();
      
      // Extract fields
      const name = formData.get('name') as string | null;
      const category_id = formData.get('category_id') as string | null;
      const cost_price_raw = formData.get('cost_price') as string | null;
      const price_raw = formData.get('price') as string | null;
      const stock_quantity_raw = formData.get('stock_quantity') as string | null;
      const min_stock_level_raw = formData.get('min_stock_level') as string | null;
      const description = formData.get('description') as string | null;
      const is_active_raw = formData.get('is_active') as string | null;
      imageFile = formData.get('image') as File | null;

      // Build updates
      if (name !== null) updates.name = name;
      if (category_id !== null) updates.category_id = category_id || null;
      if (cost_price_raw !== null) updates.cost_price = parseFloat(cost_price_raw) || 0;
      if (price_raw !== null) updates.price = parseFloat(price_raw) || 0;
      if (stock_quantity_raw !== null) updates.stock_quantity = parseInt(stock_quantity_raw) || 0;
      if (min_stock_level_raw !== null) updates.min_stock_level = parseInt(min_stock_level_raw) || 5;
      if (description !== null) updates.description = description || null;
      if (is_active_raw !== null) updates.is_active = is_active_raw === 'true';
      
    } else {
      // Handle JSON data
      updates = await request.json();
    }

    // Validate price vs cost price
    if (updates.cost_price !== undefined && updates.price !== undefined) {
      const cost_price = typeof updates.cost_price === 'string' 
        ? parseFloat(updates.cost_price) 
        : updates.cost_price;
      const price = typeof updates.price === 'string' 
        ? parseFloat(updates.price) 
        : updates.price;
      
      if (price < cost_price) {
        await transaction.rollback();
        return NextResponse.json(
          { 
            success: false,
            error: 'Selling price cannot be lower than cost price' 
          },
          { status: 400 }
        );
      }
    }

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile);
      if (!validation.valid) {
        await transaction.rollback();
        return NextResponse.json({ 
          success: false,
          error: validation.error 
        }, { status: 400 });
      }
      
      try {
        const upload = await uploadProductImage(imageFile);
        updates.image_url = upload.url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without updating image
      }
    }

    // Store old stock quantity for StockLog
    const oldStockQuantity = product.stock_quantity;

    // Update the product
    await product.update(updates, { transaction });

    // Create StockLog entry if stock changed
    if (updates.stock_quantity !== undefined && updates.stock_quantity !== oldStockQuantity) {
      const changeAmount = updates.stock_quantity - oldStockQuantity;
      
      await StockLog.create({
        product_id: product.id,
        user_id: user.id,
        change_amount: changeAmount,
        previous_quantity: oldStockQuantity,
        new_quantity: updates.stock_quantity,
        reason: changeAmount > 0 ? 'manual_addition' : 'manual_reduction',
        notes: `Stock updated by ${user.full_name || user.username}`
      }, { transaction });
    }

    await transaction.commit();

    // Fetch updated product with category
    const updatedProduct = await Product.findByPk(productId, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error: any) {
    await transaction.rollback();
    console.error('Update product error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Barcode already exists in system.',
          errorType: 'BARCODE_CONFLICT'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to update product' 
      },
      { status: 500 }
    );
  }
}
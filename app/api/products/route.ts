import { NextRequest, NextResponse } from 'next/server';
import { Product, Category } from '@/lib/database/models';
import { generateBarcode } from '@/lib/utils/barcode-generator';
import { validateFile, uploadProductImage } from '@/lib/utils/file-upload';
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
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extracting fields
    const name = formData.get('name') as string;
    const cost_price_raw = formData.get('cost_price') as string;
    const selling_price_raw = formData.get('selling_price') as string;
    const stock_quantity = formData.get('stock_quantity') as string;
    const category_id = formData.get('category_id') as string;
    const imageFile = formData.get('image') as File | null;

    // 2. Validation - Check for presence and valid numbers
    if (!name || !cost_price_raw || !selling_price_raw) {
      return NextResponse.json(
        { error: 'Product name, cost price, and selling price are required' },
        { status: 400 }
      );
    }

    const cost_price = parseFloat(cost_price_raw) || 0;
    const selling_price = parseFloat(selling_price_raw) || 0;

    if (selling_price < cost_price) {
      return NextResponse.json(
        { error: 'Selling price cannot be lower than cost price' },
        { status: 400 }
      );
    }

    // 3. Image Processing - Using the direct function calls
    let image_url = null;
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      
      // The service handles directory creation and sharp processing
      const upload = await uploadProductImage(imageFile);
      image_url = upload.url;
    }

    // 4. Barcode Generation
    let barcode = generateBarcode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await Product.findOne({ where: { barcode } });
      if (!existing) break;
      barcode = generateBarcode();
      attempts++;
    }

  // 5. Database Save
const product = await Product.create({
  barcode,
  name,
  cost_price,
  price: selling_price, 
  image_url,
  stock_quantity: parseInt(stock_quantity || '0') || 0,
  category_id: (category_id && category_id !== "undefined") ? category_id : null,
  min_stock_level: 0 
});

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
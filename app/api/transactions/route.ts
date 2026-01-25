import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem, Product, User, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';


function generateTransactionNumber(): string {
  const now = new Date();
  
  // 1. Get Date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 2. Generate a 4-character random string (Hexadecimal)
  // This helps prevent collisions if two sales happen in the same second
  const randomSuffix = Math.random()
    .toString(16)
    .toUpperCase()
    .substring(2, 6);

  const datePart = `${year}${month}${day}`;
  
  return `TX-${datePart}-${randomSuffix}`;
}

export async function POST(request: NextRequest) {
  const t = await sequelize.transaction();

  try {
    // 1. EXTRACT CASHIER ID FROM TOKEN COOKIE
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token found' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const created_by = decoded.id; 

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const {
      items,
      subtotal,
      tax_amount = 0,
      discount_amount = 0,
      total_amount,
      amount_paid,
      payment_method,
      momo_phone,
      customer_name
    } = body;

    // --- VALIDATION ---
    if (!items?.length) throw new Error('Cannot process an empty cart.');

    const paid = parseFloat(amount_paid || total_amount);
    const total = parseFloat(total_amount);
    const change_amount = paid - total;

    // --- STEP 1: CREATE TRANSACTION HEADER ---
    const transaction = await Transaction.create({
      transaction_number: generateTransactionNumber(), 
      customer_name: customer_name || 'Walk-in Customer',
      subtotal: parseFloat(subtotal),
      tax_amount: parseFloat(tax_amount),
      discount_amount: parseFloat(discount_amount),
      total_amount: total,
      amount_paid: paid,
      change_amount: change_amount > 0 ? change_amount : 0,
      payment_method,
      momo_phone: payment_method === 'momo' ? momo_phone : null,
      status: 'completed',
      created_by // Automatically set from the cookie!
    }, { transaction: t });

    // --- STEP 2: PROCESS ITEMS & UPDATE STOCK ---
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: true });
      
      if (!product) throw new Error(`Product ${item.product_name} not found.`);
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      await TransactionItem.create({
        transaction_id: transaction.id,
        product_id: item.product_id,
        barcode: item.barcode,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.unit_price) * item.quantity,
        discount_amount: 0,
        product_image:product.image_url || "not provided"
      }, { transaction: t });

      // Atomic decrement
      await product.decrement('stock_quantity', { 
        by: item.quantity, 
        transaction: t 
      });
    }

    await t.commit();

    return NextResponse.json({
      success: true,
      data: { 
        id: transaction.id, 
        transaction_number: transaction.transaction_number 
      }
    }, { status: 201 });

  } catch (error: any) {
    await t.rollback();
    console.error('POS Checkout Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}










export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    // 2. PARSE QUERY PARAMETERS
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // 3. BUILD FILTER
    const where: any = {};

    /** * ROLE-BASED ACCESS CONTROL
     * Admin & Manager: See everything
     * Cashier: See only their own transactions
     */
    if (userRole !== 'admin' && userRole !== 'manager') {
      where.created_by = userId;
    }

    if (startDate && endDate) {
      // Sets time to start and end of day for precise filtering
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      where.created_at = { [Op.between]: [start, end] };
    }

    // 4. EXECUTE QUERY
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: TransactionItem,
          as: 'items',
          attributes: ['id', 'quantity', 'unit_price', 'total_price'],
          include: ['product'] 
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['full_name', 'username']
        }
      ]
    });

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error: any) {
    console.error('Fetch Transactions Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load transactions' }, 
      { status: 500 }
    );
  }
}
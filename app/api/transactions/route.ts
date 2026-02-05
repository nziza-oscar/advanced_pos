import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem, Product, User, StockLog, sequelize } from '@/lib/database/models';
import { createNotification } from '@/lib/database/helpers/notifications'; 
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateTransactionNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
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
    const userName = decoded.full_name || decoded.username || 'Unknown User';

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
      created_by
    }, { transaction: t });

    // --- STEP 2: PROCESS ITEMS, UPDATE STOCK, AND CREATE STOCK LOGS ---
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { 
        transaction: t, 
        lock: true 
      });
      
      if (!product) throw new Error(`Product ${item.product_name} not found.`);
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock_quantity}`);
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
        product_image: product.image_url || "not provided"
      }, { transaction: t });

      const currentStock = product.stock_quantity;
      
      await product.decrement('stock_quantity', { 
        by: item.quantity, 
        transaction: t 
      });

      await product.reload({ transaction: t });
      const newStock = product.stock_quantity;

      // Create StockLog for the sale
      await StockLog.create({
        product_id: item.product_id,
        user_id: created_by,
        change_amount: -item.quantity,
        reason: 'sale',
        notes: `Sold ${item.quantity} units via transaction ${transaction.transaction_number}. Stock changed from ${currentStock} to ${newStock}.`
      }, { transaction: t });

      // --- NEW NOTIFICATION LOGIC ---
      // Check if stock is now low or empty and create UI Notification
      if (newStock <= product.min_stock_level) {
        const isOutOfStock = newStock === 0;
        
        await createNotification({
          title: isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK ALERT',
          message: `${product.name} (SKU: ${product.barcode}) ${isOutOfStock ? 'is now empty' : `is running low: ${newStock} remaining`}.`,
          type: isOutOfStock ? 'alert' : 'low_stock',
        }, t);
      }
    }
    await createNotification({
      title: 'NEW SALE COMPLETED',
      message: `Transaction ${transaction.transaction_number} processed by ${userName} for a total of ${total.toFixed(2)} FRW.`,
      type: 'sale',
    }, t);

    await t.commit();

    return NextResponse.json({
      success: true,
      data: { 
        id: transaction.id, 
        transaction_number: transaction.transaction_number,
        message: 'Transaction completed and stock logs created successfully.'
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased limit for history
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    const where: any = {};

    // Restriction: Cashiers only see their own sales
    if (userRole === "cashier") {
      where.created_by = userId;
    }

    // Date Range Filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      where.created_at = { [Op.between]: [start, end] };
    }

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
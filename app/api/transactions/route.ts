import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem, Product, User } from '@/lib/database/models';
import { Op } from 'sequelize';

// Generate unique transaction number
function generateTransactionNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TX${year}${month}${day}${random}`;
}

// GET all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    const where: any = {};

    // Date range filter
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Status filter
    if (status) {
      where.status = status;
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
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'barcode']
          }]
        },
        {
          model: User,
          as: 'cashier',
          attributes: ['id', 'username', 'full_name']
        }
      ]
    });

    const transactions = rows.map(transaction => ({
      id: transaction.get('id'),
      transaction_number: transaction.get('transaction_number'),
      customer_name: transaction.get('customer_name'),
      customer_phone: transaction.get('customer_phone'),
      subtotal: parseFloat(transaction.get('subtotal')),
      tax_amount: parseFloat(transaction.get('tax_amount')),
      discount_amount: parseFloat(transaction.get('discount_amount')),
      total_amount: parseFloat(transaction.get('total_amount')),
      amount_paid: parseFloat(transaction.get('amount_paid')),
      change_amount: parseFloat(transaction.get('change_amount')),
      payment_method: transaction.get('payment_method'),
      momo_transaction_id: transaction.get('momo_transaction_id'),
      momo_phone: transaction.get('momo_phone'),
      status: transaction.get('status'),
      notes: transaction.get('notes'),
      created_at: transaction.get('created_at'),
      items: transaction.items.map((item: any) => ({
        id: item.get('id'),
        product_id: item.get('product_id'),
        barcode: item.get('barcode'),
        product_name: item.get('product_name'),
        quantity: item.get('quantity'),
        unit_price: parseFloat(item.get('unit_price')),
        total_price: parseFloat(item.get('total_price')),
        discount_amount: parseFloat(item.get('discount_amount')),
        product: item.product ? {
          id: item.product.get('id'),
          name: item.product.get('name'),
          barcode: item.product.get('barcode')
        } : null
      })),
      cashier: transaction.cashier ? {
        id: transaction.cashier.get('id'),
        username: transaction.cashier.get('username'),
        full_name: transaction.cashier.get('full_name')
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new transaction (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      items,
      subtotal,
      tax_amount = 0,
      discount_amount = 0,
      total_amount,
      amount_paid,
      payment_method,
      momo_phone,
      momo_transaction_id,
      notes,
      created_by
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Validate items have required fields
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: 'Each item must have product_id, quantity, and unit_price' },
          { status: 400 }
        );
      }
    }

    // Start transaction
    const transaction = await Transaction.create({
      transaction_number: generateTransactionNumber(),
      customer_name,
      customer_phone,
      subtotal: parseFloat(subtotal),
      tax_amount: parseFloat(tax_amount),
      discount_amount: parseFloat(discount_amount),
      total_amount: parseFloat(total_amount),
      amount_paid: parseFloat(amount_paid),
      change_amount: parseFloat(amount_paid) - parseFloat(total_amount),
      payment_method,
      momo_phone: payment_method === 'momo' ? momo_phone : null,
      momo_transaction_id: payment_method === 'momo' ? momo_transaction_id : null,
      status: 'completed',
      notes,
      created_by
    });

    // Create transaction items and update stock
    for (const item of items) {
      // Create transaction item
      await TransactionItem.create({
        transaction_id: transaction.get('id'),
        product_id: item.product_id,
        barcode: item.barcode,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.unit_price) * item.quantity,
        discount_amount: item.discount_amount || 0
      });

      // Update product stock
      const product = await Product.findByPk(item.product_id);
      if (product) {
        const currentStock = product.get('stock_quantity');
        await product.update({
          stock_quantity: currentStock - item.quantity
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction completed successfully',
      data: {
        id: transaction.get('id'),
        transaction_number: transaction.get('transaction_number'),
        total_amount: parseFloat(transaction.get('total_amount')),
        change_amount: parseFloat(transaction.get('change_amount')),
        payment_method: transaction.get('payment_method')
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}
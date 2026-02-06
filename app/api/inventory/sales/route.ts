import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionItem, User } from '@/lib/database/models';
import { Op } from 'sequelize';
import moment from 'moment';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'day';

    let startDate;
    if (range === 'week') {
      startDate = moment().subtract(7, 'days').startOf('day').toDate();
    } else if (range === 'month') {
      startDate = moment().subtract(1, 'months').startOf('day').toDate();
    } else {
      startDate = moment().subtract(24, 'hours').toDate();
    }

    const transactions = await Transaction.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        },
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'cashier',
          attributes: ['full_name']
        },
        {
          model: TransactionItem,
          as: 'items'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedSales = transactions.map((tx:any) => ({
      id: tx.id,
      invoice_no: tx.transaction_number,
      customer: tx.customer_name || 'Walk-in Customer',
      method: tx.payment_method,
      subtotal: Number(tx.subtotal),
      tax: Number(tx.tax_amount),
      discount: Number(tx.discount_amount),
      total: Number(tx.total_amount),
      cashier: tx.cashier?.full_name || 'System',
      timestamp: tx.created_at,
      time_ago: moment(tx.created_at).fromNow(),
      items: tx.items?.map((item: any) => ({
        name: item.product_name,
        qty: item.quantity,
        price: Number(item.unit_price),
        image: item.product_image
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedSales
    });

  } catch (error: any) {
    console.error('SALES_FETCH_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction records' },
      { status: 500 }
    );
  }
}
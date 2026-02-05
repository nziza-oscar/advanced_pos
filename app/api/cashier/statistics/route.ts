import { NextResponse } from 'next/server';
import { Op, fn, col, literal } from 'sequelize';
import { Transaction, TransactionItem } from '@/lib/database/models';
import { verifyAuth } from '@/lib/auth/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [stats, payments, itemsCount, hourlyRaw] = await Promise.all([
      Transaction.findOne({
        where: {
          created_by: user.id,
          status: 'completed',
          created_at: { [Op.gte]: startOfDay }
        },
        attributes: [
          [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_revenue'],
          [fn('COALESCE', fn('COUNT', col('id')), 0), 'transaction_count'],
          [fn('COALESCE', fn('SUM', col('discount_amount')), 0), 'total_discounts']
        ],
        raw: true
      }),

      Transaction.findAll({
        where: {
          created_by: user.id,
          status: 'completed',
          created_at: { [Op.gte]: startOfDay }
        },
        attributes: [
          'payment_method',
          [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'amount']
        ],
        group: ['payment_method'],
        raw: true
      }),

      TransactionItem.findOne({
        include: [{
          model: Transaction,
          as: 'transaction',
          attributes: [],
          where: {
            created_by: user.id,
            status: 'completed',
            created_at: { [Op.gte]: startOfDay }
          }
        }],
        attributes: [[fn('COALESCE', fn('SUM', col('quantity')), 0), 'total_items']],
        raw: true
      }),

      // FIXED: Using MySQL HOUR() function instead of DATE_PART
      Transaction.findAll({
        where: {
          created_by: user.id,
          status: 'completed',
          created_at: { [Op.gte]: startOfDay }
        },
        attributes: [
          // Using literal for MySQL HOUR() function
          [literal('HOUR(created_at)'), 'hour'],
          [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total']
        ],
        group: [literal('HOUR(created_at)')],
        order: [[literal('HOUR(created_at)'), 'ASC']],
        raw: true
      })
    ]);

    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hourData = hourlyRaw.find((item: any) => parseInt(item.hour) === i);
      return {
        time: `${i % 12 || 12} ${i >= 12 ? 'PM' : 'AM'}`,
        hour: i,
        amount: hourData ? Number(hourData.total) : 0
      };
    });

    const payMethods = { cash: 0, momo: 0, card: 0, bank: 0 };
    payments.forEach((p: any) => {
      const key = p.payment_method.toLowerCase() as keyof typeof payMethods;
      if (payMethods[key] !== undefined) payMethods[key] = Number(p.amount || 0);
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          revenue: Number((stats as any)?.total_revenue || 0),
          transactions: Number((stats as any)?.transaction_count || 0),
          discounts: Number((stats as any)?.total_discounts || 0),
          itemsSold: Number((itemsCount as any)?.total_items || 0)
        },
        payments: payMethods,
        hourly: hourlyData
      }
    });
  } catch (error: any) {
    console.error('Cashier dashboard error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
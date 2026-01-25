import { NextResponse } from 'next/server';
import { Op, fn, col } from 'sequelize';
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
          [fn('SUM', col('total_amount')), 'total_revenue'],
          [fn('COUNT', col('id')), 'transaction_count'],
          [fn('SUM', col('discount_amount')), 'total_discounts']
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
          [fn('SUM', col('total_amount')), 'amount']
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
            created_at: { [Op.gte]: startOfDay }
          }
        }],
        attributes: [[fn('SUM', col('quantity')), 'total_items']],
        raw: true
      }),

      Transaction.findAll({
        where: {
          created_by: user.id,
          status: 'completed',
          created_at: { [Op.gte]: startOfDay }
        },
        attributes: [
          [fn('DATE_PART', 'hour', col('created_at')), 'hour'],
          [fn('SUM', col('total_amount')), 'total']
        ],
        group: [fn('DATE_PART', 'hour', col('created_at'))],
        order: [[fn('DATE_PART', 'hour', col('created_at')), 'ASC']],
        raw: true
      })
    ]);

    const hourlyData = hourlyRaw.map((item: any) => {
      const h = Number(item.hour);
      return {
        time: `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`,
        amount: Number(item.total)
      };
    });

    const payMethods = { cash: 0, momo: 0, card: 0, bank: 0 };
    payments.forEach((p: any) => {
      const key = p.payment_method.toLowerCase() as keyof typeof payMethods;
      if (payMethods[key] !== undefined) payMethods[key] = Number(p.amount);
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

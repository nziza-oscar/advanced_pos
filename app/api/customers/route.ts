import { NextResponse } from 'next/server';
import { Transaction, sequelize } from '@/lib/database/models';

export async function GET() {
  try {
    // Aggregating unique customers from the Transactions table
    const customers = await Transaction.findAll({
      attributes: [
        [sequelize.col('customer_name'), 'name'],
        [sequelize.col('momo_phone'), 'phone'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent'],
        [sequelize.fn('MAX', sequelize.col('created_at')), 'last_visit']
      ],
      where: { status: 'completed' },
      group: ['customer_name', 'momo_phone'],
      order: [[sequelize.fn('MAX', sequelize.col('created_at')), 'DESC']],
      raw: true
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to aggregate customers' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/database/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      transaction_id,
      amount_paid,
      customer_name,
      customer_phone,
      notes
    } = body;

    if (!transaction_id || !amount_paid) {
      return NextResponse.json(
        { error: 'Transaction ID and amount paid are required' },
        { status: 400 }
      );
    }

    // Find transaction
    const transaction = await Transaction.findByPk(transaction_id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction with cash payment
    await transaction.update({
      payment_method: 'cash',
      amount_paid: parseFloat(amount_paid),
      change_amount: parseFloat(amount_paid) - parseFloat(transaction.get('total_amount')),
      customer_name: customer_name || transaction.get('customer_name'),
      customer_phone: customer_phone || transaction.get('customer_phone'),
      notes: notes || transaction.get('notes'),
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      message: 'Cash payment processed successfully',
      data: {
        transaction_id: transaction.get('id'),
        transaction_number: transaction.get('transaction_number'),
        total_amount: parseFloat(transaction.get('total_amount')),
        amount_paid: parseFloat(transaction.get('amount_paid')),
        change_amount: parseFloat(transaction.get('change_amount'))
      }
    });

  } catch (error) {
    console.error('Cash payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process cash payment' },
      { status: 500 }
    );
  }
}
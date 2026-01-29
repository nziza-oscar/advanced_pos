import { NextRequest, NextResponse } from 'next/server';
import { Transaction, StockLog, User , Product} from '@/lib/database/models';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: {
        created_at: { [Op.gte]: today }
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name']
      }],
      order: [['created_at', 'DESC']],
      limit: Math.min(limit, 50),
      attributes: [
        'id',
        'transaction_number',
        'total_amount',
        'status',
        'payment_method',
        'created_at'
      ]
    });

    // Get recent stock changes
    const recentStockChanges = await StockLog.findAll({
      where: {
        created_at: { [Op.gte]: today }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'barcode']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(limit, 50),
      attributes: [
        'id',
        'change_amount',
        'reason',
        'notes',
        'created_at'
      ]
    });

    // Combine and sort activities
    const activities = [
      ...recentTransactions.map(tx => ({
        type: 'transaction' as const,
        id: tx.id,
        title: `Transaction ${tx.transaction_number}`,
        description: `${tx.payment_method} - FRW ${tx.total_amount}`,
        user: tx.creator?.name || 'System',
        timestamp: tx.created_at,
        status: tx.status,
        icon: 'receipt'
      })),
      ...recentStockChanges.map(log => ({
        type: 'stock' as const,
        id: log.id,
        title: `${log.change_amount > 0 ? 'Stock Added' : 'Stock Reduced'}`,
        description: `${log.product?.name} (${log.reason}) - ${Math.abs(log.change_amount)} units`,
        user: log.user?.name || 'System',
        timestamp: log.created_at,
        status: 'completed',
        icon: 'package'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error: any) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recent activity',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
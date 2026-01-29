import { NextRequest, NextResponse } from 'next/server';
import { Transaction, sequelize } from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';
import { PDFDocument } from './PDFDocument';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Fetch all data needed for the report
    const reportData = await fetchReportData(start, end);

    // Generate PDF
    const pdfStream = await PDFDocument(reportData, {
      startDate: startDate || 'Last 30 days',
      endDate: endDate || 'Today'
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF file
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="admin-report-${startDate || 'latest'}-to-${endDate || 'now'}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate PDF report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function fetchReportData(start: Date, end: Date) {
  // 1. Summary Stats
  const summaryResult = await Transaction.findOne({
    where: {
      created_at: { [Op.between]: [start, end] },
      status: 'completed'
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      [sequelize.fn('AVG', sequelize.col('total_amount')), 'avgOrder']
    ],
    raw: true
  }) as any;

  // 2. Daily Sales (last 14 days for PDF)
  const dailySales = await sequelize.query(`
    SELECT 
      DATE(t.created_at) as date,
      COALESCE(SUM(t.total_amount), 0) as revenue,
      COALESCE(COUNT(t.id), 0) as transactions,
      COALESCE(AVG(t.total_amount), 0) as avg_order
    FROM transactions t
    WHERE t.created_at BETWEEN :start AND :end
      AND t.status = 'completed'
    GROUP BY DATE(t.created_at)
    ORDER BY date DESC
    LIMIT 14
  `, {
    replacements: { start, end },
    type: QueryTypes.SELECT
  }) as any[];

  // 3. Top Products
  const topProducts = await sequelize.query(`
    SELECT 
      p.name,
      c.name as category_name,
      COALESCE(SUM(ti.quantity), 0) as quantity,
      COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN transaction_items ti ON ti.product_id = p.id
    LEFT JOIN transactions t ON t.id = ti.transaction_id
      AND t.created_at BETWEEN :start AND :end
      AND t.status = 'completed'
    WHERE t.id IS NOT NULL
    GROUP BY p.id, p.name, p.category_id, c.name
    ORDER BY revenue DESC
    LIMIT 10
  `, {
    replacements: { start, end },
    type: QueryTypes.SELECT
  }) as any[];

  // 4. Payment Methods
  const paymentMethods = await Transaction.findAll({
    where: {
      created_at: { [Op.between]: [start, end] },
      status: 'completed'
    },
    attributes: [
      'payment_method',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
    ],
    group: ['payment_method'],
    raw: true
  });

  const totalTransactions = parseInt(summaryResult?.transactions || 1);

  return {
    summary: {
      revenue: parseFloat(summaryResult?.revenue || 0),
      transactions: totalTransactions,
      avgOrder: parseFloat(summaryResult?.avgOrder || 0)
    },
    dailySales: dailySales.map(d => ({
      date: d.date,
      revenue: parseFloat(d.revenue),
      transactions: parseInt(d.transactions),
      avgOrder: parseFloat(d.avg_order),
      dayOfWeek: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    })),
    topProducts: topProducts.map(p => ({
      name: p.name,
      category: p.category_name || 'Uncategorized',
      quantity: parseInt(p.quantity),
      revenue: parseFloat(p.revenue)
    })),
    paymentMethods: paymentMethods.map((pm: any) => ({
      method: pm.payment_method,
      count: parseInt(pm.count),
      revenue: parseFloat(pm.revenue || 0),
      percentage: Math.round((parseInt(pm.count) / totalTransactions) * 100)
    }))
  };
}
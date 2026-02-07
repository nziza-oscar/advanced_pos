import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { Transaction, User, sequelize } from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'POS System';
    workbook.created = new Date();

    // ========== STYLES (Fixed with "as const") ==========
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 16, color: { argb: '1E3A8A' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const }
    };

    const subtitleStyle: Partial<ExcelJS.Style> = {
      font: { italic: true, color: { argb: '6B7280' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const }
    };

    const metricStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 14, color: { argb: '111827' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }
    };

    // ========== SHEET 1: SUMMARY ==========
    const summarySheet = workbook.addWorksheet('Summary');

    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'POS SYSTEM - ADMIN REPORT';
    titleCell.style = titleStyle;

    summarySheet.mergeCells('A2:F2');
    const subtitleCell = summarySheet.getCell('A2');
    subtitleCell.value = `Period: ${startDate || 'Last 30 Days'} to ${endDate || 'Today'}`;
    subtitleCell.style = subtitleStyle;

    const summary = await getSummaryStats(start, end);
    const metrics = [
      ['Total Revenue', summary.revenue],
      ['Total Transactions', summary.transactions],
      ['Average Order Value', summary.avgOrderValue],
      ['Active Staff', summary.activeStaff],
      ['Revenue Change (%)', summary.revenueChange],
      ['Transaction Change (%)', summary.transactionChange]
    ];

    metrics.forEach(([label, value], index) => {
      const rowNum = index + 4;
      const labelCell = summarySheet.getCell(`A${rowNum}`);
      const valueCell = summarySheet.getCell(`B${rowNum}`);
      
      labelCell.value = label;
      labelCell.font = { bold: true };
      
      valueCell.value = value;
      valueCell.style = metricStyle;
      if (typeof value === 'number' && index < 3) {
          valueCell.numFmt = index === 1 ? '#,##0' : 'FRW #,##0.00';
      }
    });

    // ========== SHEET 2: DAILY SALES ==========
    const dailySheet = workbook.addWorksheet('Daily Sales');
    const dailyData = await getDailySales(start, end);
    
    dailySheet.getRow(1).values = ['Date', 'Revenue (FRW)', 'Transactions', 'Average Order (FRW)', 'Day of Week'];
    dailySheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    dailyData.forEach((day, index) => {
      const row = dailySheet.getRow(index + 2);
      row.values = [day.date, day.revenue, day.transactions, day.avgOrder, day.dayOfWeek];
      if (day.dayOfWeek === 'Saturday' || day.dayOfWeek === 'Sunday') {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        });
      }
    });

    dailySheet.getColumn(2).numFmt = 'FRW #,##0.00';
    dailySheet.getColumn(4).numFmt = 'FRW #,##0.00';

    // ========== SHEET 3: TOP PRODUCTS ==========
    const productsSheet = workbook.addWorksheet('Top Products');
    const topProducts = await getTopProducts(start, end);
    
    productsSheet.getRow(1).values = ['Rank', 'Product Name', 'Category', 'Quantity Sold', 'Revenue (FRW)', 'Average Price (FRW)'];
    productsSheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    topProducts.forEach((product, index) => {
      productsSheet.addRow([
        index + 1,
        product.name,
        product.category,
        product.quantity,
        product.revenue,
        product.quantity > 0 ? product.revenue / product.quantity : 0
      ]);
    });

    productsSheet.getColumn(5).numFmt = 'FRW #,##0.00';
    productsSheet.getColumn(6).numFmt = 'FRW #,##0.00';

    // ========== SHEET 4: CATEGORY ANALYSIS ==========
    const categorySheet = workbook.addWorksheet('Category Analysis');
    const categories = await getCategoryAnalysis(start, end);
    
    categorySheet.getRow(1).values = ['Category', 'Revenue (FRW)', 'Percentage', 'Transaction Count', 'Avg. Transaction (FRW)'];
    categorySheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    categories.forEach((cat) => {
      categorySheet.addRow([cat.name, cat.revenue, cat.percentage, cat.transactionCount, cat.avgTransaction]);
    });

    categorySheet.getColumn(2).numFmt = 'FRW #,##0.00';
    categorySheet.getColumn(3).numFmt = '0.00%';
    categorySheet.getColumn(5).numFmt = 'FRW #,##0.00';

    // ========== SHEET 5: PAYMENT METHODS ==========
    const paymentSheet = workbook.addWorksheet('Payment Methods');
    const payments = await getPaymentMethods(start, end);
    
    paymentSheet.getRow(1).values = ['Method', 'Transaction Count', 'Percentage', 'Total Revenue (FRW)', 'Avg. Revenue (FRW)'];
    paymentSheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    payments.forEach((pm) => {
      paymentSheet.addRow([
        pm.method.toUpperCase(),
        pm.count,
        pm.percentage,
        pm.revenue,
        pm.count > 0 ? pm.revenue / pm.count : 0
      ]);
    });

    paymentSheet.getColumn(3).numFmt = '0.00%';
    paymentSheet.getColumn(4).numFmt = 'FRW #,##0.00';
    paymentSheet.getColumn(5).numFmt = 'FRW #,##0.00';

    // Global Column Width Fix
    [summarySheet, dailySheet, productsSheet, categorySheet, paymentSheet].forEach(sheet => {
      sheet.columns.forEach(col => { col.width = 20; });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="admin-report-${Date.now()}.xlsx"`
      }
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to export report' }, { status: 500 });
  }
}

async function getSummaryStats(start: Date, end: Date) {
  const result = await Transaction.findOne({
    where: { created_at: { [Op.between]: [start, end] }, status: 'completed' },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
    ],
    raw: true
  }) as any;

  const revenue = parseFloat(result?.revenue || 0);
  const transactions = parseInt(result?.transactions || 0);
  const avgOrderValue = transactions > 0 ? revenue / transactions : 0;

  const activeStaff = await User.count({
    where: { 
      is_active: true,
      last_login: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  return { revenue, transactions, avgOrderValue, activeStaff, revenueChange: 12.5, transactionChange: 8.0 };
}

async function getDailySales(start: Date, end: Date) {
  const results = await sequelize.query(`
    SELECT DATE(t.created_at) as date, SUM(t.total_amount) as revenue, COUNT(t.id) as transactions, AVG(t.total_amount) as avg_order
    FROM transactions t WHERE t.created_at BETWEEN :start AND :end AND t.status = 'completed'
    GROUP BY DATE(t.created_at) ORDER BY date ASC
  `, { replacements: { start, end }, type: QueryTypes.SELECT }) as any[];

  return results.map((r) => ({
    date: r.date,
    revenue: parseFloat(r.revenue || 0),
    transactions: parseInt(r.transactions || 0),
    avgOrder: parseFloat(r.avg_order || 0),
    dayOfWeek: new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' })
  }));
}

async function getTopProducts(start: Date, end: Date) {
  const results = await sequelize.query(`
    SELECT p.name, c.name as category_name, SUM(ti.quantity) as quantity, SUM(ti.quantity * ti.unit_price) as revenue
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN transaction_items ti ON ti.product_id = p.id
    LEFT JOIN transactions t ON t.id = ti.transaction_id AND t.created_at BETWEEN :start AND :end AND t.status = 'completed'
    WHERE t.id IS NOT NULL GROUP BY p.id, p.name, c.name ORDER BY revenue DESC LIMIT 20
  `, { replacements: { start, end }, type: QueryTypes.SELECT }) as any[];

  return results.map((r) => ({
    name: r.name,
    category: r.category_name || 'Uncategorized',
    quantity: parseInt(r.quantity || 0),
    revenue: parseFloat(r.revenue || 0)
  }));
}

async function getCategoryAnalysis(start: Date, end: Date) {
  const results = await sequelize.query(`
    SELECT c.name, SUM(ti.quantity * ti.unit_price) as revenue, COUNT(DISTINCT ti.transaction_id) as transaction_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN transaction_items ti ON ti.product_id = p.id
    LEFT JOIN transactions t ON t.id = ti.transaction_id AND t.created_at BETWEEN :start AND :end AND t.status = 'completed'
    WHERE t.id IS NOT NULL GROUP BY c.id, c.name ORDER BY revenue DESC
  `, { replacements: { start, end }, type: QueryTypes.SELECT }) as any[];

  const totalRevenue = results.reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);
  return results.map((r) => ({
    name: r.name,
    revenue: parseFloat(r.revenue || 0),
    percentage: totalRevenue > 0 ? parseFloat(r.revenue || 0) / totalRevenue : 0,
    transactionCount: parseInt(r.transaction_count || 0),
    avgTransaction: parseInt(r.transaction_count || 0) > 0 ? parseFloat(r.revenue || 0) / parseInt(r.transaction_count || 0) : 0
  }));
}

async function getPaymentMethods(start: Date, end: Date) {
  const results = await Transaction.findAll({
    where: { created_at: { [Op.between]: [start, end] }, status: 'completed' },
    attributes: ['payment_method', [sequelize.fn('COUNT', sequelize.col('id')), 'count'], [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']],
    group: ['payment_method'],
    raw: true
  });
  const totalCount = results.reduce((sum, r: any) => sum + parseInt(r.count || 0), 0);
  return results.map((r: any) => ({
    method: r.payment_method,
    count: parseInt(r.count || 0),
    percentage: totalCount > 0 ? parseInt(r.count || 0) / totalCount : 0,
    revenue: parseFloat(r.revenue || 0)
  }));
}
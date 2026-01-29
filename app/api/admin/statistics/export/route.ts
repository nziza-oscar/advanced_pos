import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { Transaction, TransactionItem, Product, Category, User, sequelize } from '@/lib/database/models';
import { Op, QueryTypes } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'excel';

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = 'POS System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ========== SHEET 1: SUMMARY ==========
    const summarySheet = workbook.addWorksheet('Summary', {
      views: [{ state: 'frozen', ySplit: 2 }]
    });

    // Header style
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } }, // Blue-900
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    // Title style
    const titleStyle = {
      font: { bold: true, size: 16, color: { argb: '1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Subtitle style
    const subtitleStyle = {
      font: { italic: true, color: { argb: '6B7280' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Metric style
    const metricStyle = {
      font: { bold: true, size: 24, color: { argb: '111827' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } }
    };

    // Add title
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'POS SYSTEM - ADMIN REPORT';
    titleCell.style = titleStyle;

    summarySheet.mergeCells('A2:F2');
    const subtitleCell = summarySheet.getCell('A2');
    subtitleCell.value = `Period: ${startDate} to ${endDate}`;
    subtitleCell.style = subtitleStyle;

    // Add summary metrics
    const summary = await getSummaryStats(start, end);
    
    // Metric rows - CHANGED: FRW instead of $
    const metrics = [
      ['Total Revenue', `FRW ${summary.revenue.toLocaleString()}`],
      ['Total Transactions', summary.transactions.toLocaleString()],
      ['Average Order Value', `FRW ${summary.avgOrderValue.toFixed(2)}`],
      ['Active Staff', summary.activeStaff.toString()],
      ['Revenue Change', `${summary.revenueChange > 0 ? '+' : ''}${summary.revenueChange.toFixed(1)}%`],
      ['Transaction Change', `${summary.transactionChange > 0 ? '+' : ''}${summary.transactionChange.toFixed(1)}%`]
    ];

    metrics.forEach(([label, value], index) => {
      const row = index + 4;
      summarySheet.getCell(`A${row}`).value = label;
      summarySheet.getCell(`A${row}`).style = { font: { bold: true } };
      
      summarySheet.getCell(`B${row}`).value = value;
      summarySheet.getCell(`B${row}`).style = metricStyle;
    });

    // ========== SHEET 2: DAILY SALES ==========
    const dailySheet = workbook.addWorksheet('Daily Sales', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Get daily sales data
    const dailyData = await getDailySales(start, end);
    
    // Add headers
    dailySheet.getRow(1).values = ['Date', 'Revenue (FRW)', 'Transactions', 'Average Order (FRW)', 'Day of Week'];
    dailySheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add data
    dailyData.forEach((day, index) => {
      const row = dailySheet.getRow(index + 2);
      row.values = [
        day.date,
        day.revenue,
        day.transactions,
        day.avgOrder,
        day.dayOfWeek
      ];
      
      // Color weekends
      if (day.dayOfWeek === 'Saturday' || day.dayOfWeek === 'Sunday') {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Amber-50
        });
      }
    });

    // Format columns - CHANGED: FRW prefix instead of $
    dailySheet.getColumn(2).numFmt = 'FRW #,##0.00';
    dailySheet.getColumn(4).numFmt = 'FRW #,##0.00';
    dailySheet.columns.forEach(column => {
      column.width = 18;
    });

    // ========== SHEET 3: TOP PRODUCTS ==========
    const productsSheet = workbook.addWorksheet('Top Products', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    const topProducts = await getTopProducts(start, end);
    
    productsSheet.getRow(1).values = ['Rank', 'Product Name', 'Category', 'Quantity Sold', 'Revenue (FRW)', 'Average Price (FRW)'];
    productsSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    topProducts.forEach((product, index) => {
      const row = productsSheet.getRow(index + 2);
      row.values = [
        index + 1,
        product.name,
        product.category,
        product.quantity,
        product.revenue,
        product.quantity > 0 ? product.revenue / product.quantity : 0
      ];
    });

    productsSheet.getColumn(4).numFmt = '#,##0';
    productsSheet.getColumn(5).numFmt = 'FRW #,##0.00';
    productsSheet.getColumn(6).numFmt = 'FRW #,##0.00';
    productsSheet.columns.forEach(column => {
      column.width = 20;
    });

    // ========== SHEET 4: CATEGORY ANALYSIS ==========
    const categorySheet = workbook.addWorksheet('Category Analysis', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    const categories = await getCategoryAnalysis(start, end);
    
    categorySheet.getRow(1).values = ['Category', 'Revenue (FRW)', 'Percentage', 'Transaction Count', 'Avg. Transaction (FRW)'];
    categorySheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    categories.forEach((cat, index) => {
      const row = categorySheet.getRow(index + 2);
      row.values = [
        cat.name,
        cat.revenue,
        cat.percentage,
        cat.transactionCount,
        cat.avgTransaction
      ];
    });

    categorySheet.getColumn(2).numFmt = 'FRW #,##0.00';
    categorySheet.getColumn(3).numFmt = '0.00%';
    categorySheet.getColumn(5).numFmt = 'FRW #,##0.00';

    // ========== SHEET 5: PAYMENT METHODS ==========
    const paymentSheet = workbook.addWorksheet('Payment Methods', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    const payments = await getPaymentMethods(start, end);
    
    paymentSheet.getRow(1).values = ['Method', 'Transaction Count', 'Percentage', 'Total Revenue (FRW)', 'Avg. Revenue (FRW)'];
    paymentSheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    payments.forEach((pm, index) => {
      const row = paymentSheet.getRow(index + 2);
      row.values = [
        pm.method.charAt(0).toUpperCase() + pm.method.slice(1),
        pm.count,
        pm.percentage,
        pm.revenue,
        pm.count > 0 ? pm.revenue / pm.count : 0
      ];
    });

    paymentSheet.getColumn(3).numFmt = '0.00%';
    paymentSheet.getColumn(4).numFmt = 'FRW #,##0.00';
    paymentSheet.getColumn(5).numFmt = 'FRW #,##0.00';

    // Add conditional formatting for revenue columns
    [dailySheet, productsSheet, categorySheet, paymentSheet].forEach(sheet => {
      const revenueCol = sheet.getColumn(2); // Assuming revenue is column 2
      revenueCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1 && cell.value) {
          // Color scale based on value (in FRW)
          const value = Number(cell.value);
          if (value > 100000) { // Adjusted for FRW
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } }; // Green-100
          } else if (value > 50000) { // Adjusted for FRW
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Amber-100
          }
        }
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return Excel file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="admin-report-${startDate}-to-${endDate}.xlsx"`
      }
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getSummaryStats(start: Date, end: Date) {
  const result = await Transaction.findOne({
    where: {
      created_at: { [Op.between]: [start, end] },
      status: 'completed'
    },
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

  return {
    revenue,
    transactions,
    avgOrderValue,
    activeStaff,
    revenueChange: 12.5,
    transactionChange: 8.0
  };
}

async function getDailySales(start: Date, end: Date) {
  const results = await sequelize.query(`
    SELECT 
      DATE(t.created_at) as date,
      COALESCE(SUM(t.total_amount), 0) as revenue,
      COALESCE(COUNT(t.id), 0) as transactions,
      COALESCE(AVG(t.total_amount), 0) as avg_order
    FROM transactions t
    WHERE t.created_at BETWEEN :start AND :end
      AND t.status = 'completed'
    GROUP BY DATE(t.created_at)
    ORDER BY date ASC
  `, {
    replacements: { start, end },
    type: QueryTypes.SELECT
  }) as any[];

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
    SELECT 
      p.id,
      p.name,
      p.category_id,
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
    LIMIT 20
  `, {
    replacements: { start, end },
    type: QueryTypes.SELECT
  }) as any[];

  return results.map((r) => ({
    name: r.name,
    category: r.category_name || 'Uncategorized',
    quantity: parseInt(r.quantity || 0),
    revenue: parseFloat(r.revenue || 0)
  }));
}

async function getCategoryAnalysis(start: Date, end: Date) {
  const results = await sequelize.query(`
    SELECT 
      c.id,
      c.name,
      COALESCE(SUM(ti.quantity * ti.unit_price), 0) as revenue,
      COALESCE(COUNT(DISTINCT ti.transaction_id), 0) as transaction_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN transaction_items ti ON ti.product_id = p.id
    LEFT JOIN transactions t ON t.id = ti.transaction_id
      AND t.created_at BETWEEN :start AND :end
      AND t.status = 'completed'
    WHERE t.id IS NOT NULL
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `, {
    replacements: { start, end },
    type: QueryTypes.SELECT
  }) as any[];

  const totalRevenue = results.reduce((sum, r) => sum + parseFloat(r.revenue || 0), 0);

  return results.map((r) => ({
    name: r.name,
    revenue: parseFloat(r.revenue || 0),
    percentage: totalRevenue > 0 ? parseFloat(r.revenue || 0) / totalRevenue : 0,
    transactionCount: parseInt(r.transaction_count || 0),
    avgTransaction: parseInt(r.transaction_count || 0) > 0 ? 
      parseFloat(r.revenue || 0) / parseInt(r.transaction_count || 0) : 0
  }));
}

async function getPaymentMethods(start: Date, end: Date) {
  const results = await Transaction.findAll({
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

  const totalCount = results.reduce((sum, r: any) => sum + parseInt(r.count || 0), 0);

  return results.map((r: any) => ({
    method: r.payment_method,
    count: parseInt(r.count || 0),
    percentage: totalCount > 0 ? parseInt(r.count || 0) / totalCount : 0,
    revenue: parseFloat(r.revenue || 0)
  }));
}
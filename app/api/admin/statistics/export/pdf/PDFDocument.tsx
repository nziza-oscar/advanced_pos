import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';

// Register fonts (optional)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
    borderBottomStyle: 'solid',
  },
  logo: {
    width: 90,
    height: 90,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#1E3A8A',
    color: '#FFFFFF',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 5,
    fontFamily: 'Helvetica',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  highlightRow: {
    backgroundColor: '#D1FAE5',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
  },
});

// Format currency in FRW
const formatCurrency = (amount: number) => {
  return `FRW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// PDF Document Component
export const PDFReport = ({ data, period }: any) => {
  const { summary, dailySales, topProducts, paymentMethods } = data;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="http://localhost:3000/doc_logo.png"
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>POS SYSTEM - ADMIN REPORT</Text>
            <Text style={styles.subtitle}>Sales Performance Analysis</Text>
            <Text style={styles.date}>
              Period: {period.startDate} to {period.endDate}
            </Text>
            <Text style={styles.date}>
              Generated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Summary Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Text style={styles.metricValue}>{formatCurrency(summary.revenue)}</Text>
              <Text style={styles.metricLabel}>Completed Transactions</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Transactions</Text>
              <Text style={styles.metricValue}>{summary.transactions.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Completed Orders</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Average Order Value</Text>
              <Text style={styles.metricValue}>{formatCurrency(summary.avgOrder)}</Text>
              <Text style={styles.metricLabel}>Per Transaction</Text>
            </View>
          </View>
        </View>

        {/* Daily Sales Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Sales (Last 14 Days)</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.textLeft]}>Date</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue (FRW)</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Transactions</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Avg. Order</Text>
            </View>
            
            {/* Table Rows */}
            {dailySales.map((day: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.textLeft]}>
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} ({day.dayOfWeek})
                </Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(day.revenue)}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{day.transactions}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(day.avgOrder)}</Text>
              </View>
            ))}
            
            {/* Table Footer */}
            <View style={[styles.tableRow, { backgroundColor: '#F9FAFB', fontWeight: 'bold' }]}>
              <Text style={[styles.tableCell, styles.textLeft]}>TOTAL</Text>
              <Text style={[styles.tableCell, styles.textRight]}>
                {formatCurrency(dailySales.reduce((sum: number, day: any) => sum + day.revenue, 0))}
              </Text>
              <Text style={[styles.tableCell, styles.textCenter]}>
                {dailySales.reduce((sum: number, day: any) => sum + day.transactions, 0)}
              </Text>
              <Text style={[styles.tableCell, styles.textRight]}>
                {formatCurrency(summary.avgOrder)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.textCenter]}>Rank</Text>
              <Text style={[styles.tableCell, styles.textLeft]}>Product Name</Text>
              <Text style={[styles.tableCell, styles.textLeft]}>Category</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Qty Sold</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue (FRW)</Text>
            </View>
            
            {topProducts.map((product: any, index: number) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index < 3 && styles.highlightRow
                ]}
              >
                <Text style={[styles.tableCell, styles.textCenter]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.textLeft]}>{product.name}</Text>
                <Text style={[styles.tableCell, styles.textLeft]}>{product.category}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{product.quantity.toLocaleString()}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(product.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated automatically by the POS System.</Text>
          <Text>Confidential - For internal use only</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Second Page for Payment Methods */}
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="/doc_logo.png"
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>PAYMENT METHODS ANALYSIS</Text>
            <Text style={styles.subtitle}>Transaction Distribution by Payment Type</Text>
          </View>
        </View>

        {/* Payment Methods Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method Distribution</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.textLeft]}>Payment Method</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Transactions</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Percentage</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue (FRW)</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Avg. Revenue</Text>
            </View>
            
            {paymentMethods.map((pm: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.textLeft]}>
                  {pm.method.charAt(0).toUpperCase() + pm.method.slice(1)}
                </Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{pm.count.toLocaleString()}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{pm.percentage}%</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(pm.revenue)}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>
                  {formatCurrency(pm.count > 0 ? pm.revenue / pm.count : 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ marginBottom: 5 }}>• Total Revenue: {formatCurrency(summary.revenue)}</Text>
            <Text style={{ marginBottom: 5 }}>• Total Transactions: {summary.transactions.toLocaleString()}</Text>
            <Text style={{ marginBottom: 5 }}>• Average Order Value: {formatCurrency(summary.avgOrder)}</Text>
            <Text style={{ marginBottom: 5 }}>• Generated on: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>End of Report - POS System Administration</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

// Function to render PDF to stream
export async function PDFDocument(data: any, period: any) {
  const { renderToStream } = await import('@react-pdf/renderer');
  return await renderToStream(<PDFReport data={data} period={period} />);
}
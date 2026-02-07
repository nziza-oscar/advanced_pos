'use client';

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

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ]
});

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
    width: 60,
    height: 60,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 9,
    color: '#374151',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#1E3A8A',
    color: '#FFFFFF',
    padding: 6,
    marginBottom: 10,
    borderRadius: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 28,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    padding: 6,
    flex: 1,
  },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
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

const formatCurrency = (amount: number) => {
  return `FRW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

export const PDFReport = ({ data, period }: any) => {
  const { summary, dailySales, topProducts, paymentMethods } = data;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>POS SYSTEM - ADMIN REPORT</Text>
            <Text style={styles.subtitle}>Sales Performance Analysis</Text>
            <Text style={styles.date}>Period: {period.startDate} to {period.endDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Text style={styles.metricValue}>{formatCurrency(summary.revenue)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Transactions</Text>
              <Text style={styles.metricValue}>{summary.transactions.toLocaleString()}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg. Order Value</Text>
              <Text style={styles.metricValue}>{formatCurrency(summary.avgOrder)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Sales (Last 14 Days)</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.textLeft]}>Date</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Trans.</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Avg. Order</Text>
            </View>
            
            {dailySales.map((day: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.textLeft]}>{new Date(day.date).toLocaleDateString()} ({day.dayOfWeek})</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(day.revenue)}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{day.transactions}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(day.avgOrder)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Confidential - POS Internal Use Only</Text>
        </View>
        
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number | null }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} 
          fixed 
        />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.textCenter, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableCell, styles.textLeft, { flex: 2 }]}>Product</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Qty</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue</Text>
            </View>
            {topProducts.map((p: any, i: number) => (
              <View key={i} style={[styles.tableRow, i < 3 ? styles.highlightRow : {}]}>
                <Text style={[styles.tableCell, styles.textCenter, { flex: 0.5 }]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.textLeft, { flex: 2 }]}>{p.name}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{p.quantity}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(p.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method Distribution</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Method</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>Count</Text>
              <Text style={[styles.tableCell, styles.textCenter]}>%</Text>
              <Text style={[styles.tableCell, styles.textRight]}>Revenue</Text>
            </View>
            {paymentMethods.map((pm: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{pm.method.toUpperCase()}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{pm.count}</Text>
                <Text style={[styles.tableCell, styles.textCenter]}>{pm.percentage}%</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatCurrency(pm.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number | null }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} 
          fixed 
        />
      </Page>
    </Document>
  );
};

export async function generatePDFStream(data: any, period: any) {
  const { renderToStream } = await import('@react-pdf/renderer');
  return await renderToStream(<PDFReport data={data} period={period} />);
}
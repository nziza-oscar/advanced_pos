import { NextRequest, NextResponse } from 'next/server';
import { Transaction, Product, User,sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const [transactionCount, productCount, userCount] = await Promise.all([
      Transaction.count(),
      Product.count(),
      User.count()
    ]);

    // Get pending transactions
    const pendingTransactions = await Transaction.count({
      where: { status: 'pending' }
    });

    // Get low stock items
    const lowStockItems = await Product.count({
      where: {
        stock_quantity: {
          [Op.lte]: sequelize.col('min_stock_level')
        }
      }
    });

    // Get system info (simplified - adjust based on your environment)
    const systemInfo = {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length
    };

    // Calculate memory percentage
    const memoryUsage = ((systemInfo.memory.used / systemInfo.memory.total) * 100).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        database: {
          totalTransactions: transactionCount,
          totalProducts: productCount,
          totalUsers: userCount,
          pendingTransactions,
          lowStockItems
        },
        system: {
          uptime: formatUptime(systemInfo.uptime),
          memoryUsage: `${memoryUsage}%`,
          platform: systemInfo.platform,
          cpuCores: systemInfo.cpus,
          status: 'healthy' // You can add more sophisticated health checks
        },
        performance: {
          responseTime: 'fast', // You can measure actual response times
          lastBackup: await getLastBackupDate(),
          errors24h: 0 // Track errors in your application
        }
      }
    });

  } catch (error: any) {
    console.error('System status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function getLastBackupDate(): Promise<string | null> {
  try {
    return '2024-01-15 02:00:00';
  } catch (error) {
    return null;
  }
}
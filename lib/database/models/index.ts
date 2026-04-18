// lib/database/models/index.ts
import sequelize from '../connection';
import Tenant from './Tenant';
import User from './User';
import Category from './Category';
import Product from './Product';
import Barcode from './Barcode';
import Transaction from './Transaction';
import TransactionItem from './TransactionItem';
import StockLog from './StockLog';
import Subscription from './Subscription';
import Setting from './Setting';

// Tenant associations - avoid using 'settings' as association name since Tenant already has a 'settings' attribute
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Product, { foreignKey: 'tenant_id', as: 'products' });
Product.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Category, { foreignKey: 'tenant_id', as: 'categories' });
Category.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Barcode, { foreignKey: 'tenant_id', as: 'barcodes' });
Barcode.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(Transaction, { foreignKey: 'tenant_id', as: 'transactions' });
Transaction.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasMany(StockLog, { foreignKey: 'tenant_id', as: 'stock_logs' });
StockLog.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// Subscription associations (One-to-One)
Tenant.hasOne(Subscription, { foreignKey: 'tenant_id', as: 'subscription' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// Setting associations - use different name to avoid collision with Tenant.settings attribute
Tenant.hasMany(Setting, { foreignKey: 'tenant_id', as: 'tenant_settings' });
Setting.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product associations
Product.hasMany(Barcode, { foreignKey: 'product_id', as: 'barcodes' });
Barcode.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(TransactionItem, { foreignKey: 'product_id', as: 'transaction_items' });
Product.hasMany(StockLog, { foreignKey: 'product_id', as: 'stock_logs' });

// Transaction associations
Transaction.hasMany(TransactionItem, { foreignKey: 'transaction_id', as: 'items', onDelete: 'CASCADE' });
TransactionItem.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
TransactionItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User associations
User.hasMany(Transaction, { foreignKey: 'created_by', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'created_by', as: 'cashier' });

User.hasMany(StockLog, { foreignKey: 'user_id', as: 'stock_actions' });
StockLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Barcode, { foreignKey: 'generated_by', as: 'generated_barcodes' });
Barcode.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });

export {
  sequelize,
  Tenant,
  User,
  Category,
  Product,
  Barcode,
  Transaction,
  TransactionItem,
  StockLog,
  Subscription,
  Setting
};
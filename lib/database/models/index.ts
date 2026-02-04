import sequelize from '../connection';
import Product from './Product';
import Category from './Category';
import Transaction from './Transaction';
import TransactionItem from './TransactionItem';
import User from './User';
import StockLog from './StockLog';
import Setting from './Setting';
import Barcode from './Barcode';
import Notification from './Notification';

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Transaction <-> TransactionItem
Transaction.hasMany(TransactionItem, {
  foreignKey: 'transaction_id',
  as: 'items',
  onDelete: 'CASCADE'
});
TransactionItem.belongsTo(Transaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

// Product <-> TransactionItem
Product.hasMany(TransactionItem, {
  foreignKey: 'product_id',
  as: 'transaction_items'
});
TransactionItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// User <-> Transaction
User.hasMany(Transaction, {
  foreignKey: 'created_by',
  as: 'transactions'
});
Transaction.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'cashier'
});

// Product <-> StockLog
Product.hasMany(StockLog, { foreignKey: 'product_id', as: 'stock_logs' });
StockLog.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> StockLog
User.hasMany(StockLog, { foreignKey: 'user_id', as: 'performed_stock_actions' });
StockLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Notification (Optional: If notifications are user-specific)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  Setting,
  Product,
  Barcode,
  StockLog,
  Category,
  Transaction,
  TransactionItem,
  User,
  Notification, 
};
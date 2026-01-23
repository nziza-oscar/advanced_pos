import sequelize from '../connection';
import  Product  from './Product';
import  Category  from './Category';
import Transaction from './Transaction';
import  TransactionItem  from './TransactionItem';
import  User from './User';

// Define associations
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Transaction.hasMany(TransactionItem, {
  foreignKey: 'transaction_id',
  as: 'items',
  onDelete: 'CASCADE'
});

TransactionItem.belongsTo(Transaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

TransactionItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(TransactionItem, {
  foreignKey: 'product_id',
  as: 'transaction_items'
});

User.hasMany(Transaction, {
  foreignKey: 'created_by',
  as: 'transactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'cashier'
});

export {
  sequelize,
  Product,
  Category,
  Transaction,
  TransactionItem,
  User,
};
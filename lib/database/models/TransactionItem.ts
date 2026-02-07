import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import sequelize from '../connection';
import Product from './Product';
import Transaction from './Transaction';

class TransactionItem extends Model<InferAttributes<TransactionItem>, InferCreationAttributes<TransactionItem>> {
  declare id: CreationOptional<string>;
  declare transaction_id: string;
  declare product_id: string;
  declare barcode: string;
  declare product_name: string;
  declare product_image: string | null;
  declare quantity: number;
  declare unit_price: number;
  declare total_price: number;
  declare discount_amount: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Virtual associations for TypeScript visibility
  declare product?: NonAttribute<Product>;
  declare transaction?: NonAttribute<Transaction>;
}

TransactionItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  product_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['transaction_id'] },
    { fields: ['product_id'] }
  ]
});

export default TransactionItem;
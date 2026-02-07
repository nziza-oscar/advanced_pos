import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import sequelize from '../connection';
import TransactionItem from './TransactionItem';
import User from './User';

export const PaymentMethod = {
  CASH: 'cash',
  MOMO: 'momo',
  CARD: 'card',
  BANK: 'bank'
} as const;

export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];
export type TransactionStatusType = typeof TransactionStatus[keyof typeof TransactionStatus];

class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
  declare id: CreationOptional<string>;
  declare transaction_number: string;
  declare customer_name: string | null;
  declare customer_phone: string | null;
  declare subtotal: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare total_amount: number;
  declare amount_paid: number;
  declare change_amount: number;
  declare payment_method: PaymentMethodType;
  declare momo_transaction_id: string | null;
  declare momo_phone: string | null;
  declare status: TransactionStatusType;
  declare notes: string | null;
  declare created_by: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Virtual associations for TypeScript visibility
  declare items?: NonAttribute<TransactionItem[]>;
  declare cashier?: NonAttribute<User>;
}

Transaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  change_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  payment_method: {
    type: DataTypes.ENUM(...Object.values(PaymentMethod)),
    allowNull: false,
    defaultValue: PaymentMethod.CASH
  },
  momo_transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  momo_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
    defaultValue: TransactionStatus.COMPLETED
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['transaction_number'] },
    { fields: ['created_at'] },
    { fields: ['status'] }
  ]
});

export default Transaction;
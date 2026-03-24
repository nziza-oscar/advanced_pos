// lib/database/models/StockLog.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const StockReason = {
  RESTOCK: 'restock',
  SALE: 'sale',
  RETURN: 'return',
  WASTAGE: 'wastage',
  ADJUSTMENT: 'adjustment'
} as const;

export type StockReasonType = typeof StockReason[keyof typeof StockReason];

class StockLog extends Model<InferAttributes<StockLog>, InferCreationAttributes<StockLog>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare product_id: string;
  declare user_id: string;
  declare change_amount: number;
  declare reason: StockReasonType;
  declare notes: string | null;
  declare created_at: CreationOptional<Date>;
}

StockLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  change_amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.ENUM(...Object.values(StockReason)),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'stock_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['product_id'] },
    { fields: ['created_at'] }
  ]
});

export default StockLog;
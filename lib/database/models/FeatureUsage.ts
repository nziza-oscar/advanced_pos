// lib/database/models/FeatureUsage.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

class FeatureUsage extends Model<InferAttributes<FeatureUsage>, InferCreationAttributes<FeatureUsage>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare feature_key: string;
  declare usage_value: number;
  declare limit_value: number | null;
  declare reset_at: Date | null;
  declare metadata: object | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

FeatureUsage.init({
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
  feature_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    references: {
      model: 'features',
      key: 'key'
    }
  },
  usage_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  limit_value: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Current limit for this feature (cached from plan/tenant config)'
  },
  reset_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When to reset the usage counter'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'feature_usage',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tenant_id', 'feature_key'], unique: true },
    { fields: ['feature_key'] }
  ]
});

export default FeatureUsage;
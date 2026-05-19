// lib/database/models/TenantFeature.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

class TenantFeature extends Model<InferAttributes<TenantFeature>, InferCreationAttributes<TenantFeature>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare feature_key: string;
  declare value: any;
  declare is_enabled: CreationOptional<boolean>;
  declare expires_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

TenantFeature.init({
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
  value: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom feature value for this tenant (overrides plan default)'
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'If set, feature expires after this date'
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'tenant_features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tenant_id', 'feature_key'], unique: true },
    { fields: ['feature_key'] },
    { fields: ['is_enabled'] }
  ]
});

export default TenantFeature;
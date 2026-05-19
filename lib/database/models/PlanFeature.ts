// lib/database/models/PlanFeature.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

class PlanFeature extends Model<InferAttributes<PlanFeature>, InferCreationAttributes<PlanFeature>> {
  declare id: CreationOptional<string>;
  declare plan: string;
  declare feature_key: string;
  declare value: any;
  declare is_custom: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

PlanFeature.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  plan: {
    type: DataTypes.ENUM('basic', 'professional', 'enterprise', 'trial'),
    allowNull: false
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
    allowNull: false,
    comment: 'Feature value/limit for this specific plan'
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this is a custom override for a specific tenant'
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'plan_features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['plan', 'feature_key'], unique: true },
    { fields: ['feature_key'] }
  ]
});

export default PlanFeature;
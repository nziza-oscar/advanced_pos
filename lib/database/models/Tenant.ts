// lib/database/models/Tenant.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const TenantStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
  EXPIRED: 'expired'
} as const;

export const TenantPlan = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
  TRIAL: 'trial'
} as const;

export type TenantStatusType = typeof TenantStatus[keyof typeof TenantStatus];
export type TenantPlanType = typeof TenantPlan[keyof typeof TenantPlan];

class Tenant extends Model<InferAttributes<Tenant>, InferCreationAttributes<Tenant>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare logo_url: string | null;
  declare plan: TenantPlanType;
  declare status: TenantStatusType;
  declare settings: object | null;
  declare subscription_start: Date | null;
  declare subscription_end: Date | null;
  declare max_users: number;
  declare max_products: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Tenant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isLowercase: true,
      isAlphanumeric: true,
      len: [3, 100]
    }
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  plan: {
    type: DataTypes.ENUM(...Object.values(TenantPlan)),
    allowNull: false,
    defaultValue: TenantPlan.TRIAL
  },
  status: {
    type: DataTypes.ENUM(...Object.values(TenantStatus)),
    allowNull: false,
    defaultValue: TenantStatus.TRIAL
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  subscription_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  max_users: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  max_products: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'tenants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['slug'] },
    { fields: ['status'] }
  ]
});

export default Tenant;
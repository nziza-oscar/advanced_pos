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
  declare slug: CreationOptional<string>;
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

  // Helper method to generate slug from name
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Helper method to ensure unique slug
  static async generateUniqueSlug(baseName: string, transaction?: any): Promise<string> {
    let slug = this.generateSlug(baseName);
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existingTenant = await Tenant.findOne({
        where: { slug: uniqueSlug },
        transaction
      });
      
      if (!existingTenant) {
        break;
      }
      
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }
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
  ],
  hooks: {
    beforeValidate: async (tenant: Tenant, options: any) => {
      if (!tenant.slug && tenant.name) {
        tenant.slug = await Tenant.generateUniqueSlug(tenant.name, options.transaction);
      }
    },
    beforeUpdate: async (tenant: Tenant, options: any) => {
      // If name changed and slug wasn't manually updated, regenerate slug
      if (tenant.changed('name') && !tenant.changed('slug')) {
        tenant.slug = await Tenant.generateUniqueSlug(tenant.name, options.transaction);
      }
    }
  }
});

export default Tenant;
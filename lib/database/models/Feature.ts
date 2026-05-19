// lib/database/models/Feature.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const FeatureType = {
  BOOLEAN: 'boolean',
  LIMIT: 'limit',
  CONFIG: 'config',
  MODULE: 'module'
} as const;

export const FeatureCategory = {
  INVENTORY: 'inventory',
  POS: 'pos',
  REPORTING: 'reporting',
  INTEGRATION: 'integration',
  TEAM: 'team',
  CUSTOMER: 'customer',
  DISCOUNT: 'discount',
  LOYALTY: 'loyalty',
  API: 'api',
  SECURITY: 'security'
} as const;

export type FeatureTypeType = typeof FeatureType[keyof typeof FeatureType];
export type FeatureCategoryType = typeof FeatureCategory[keyof typeof FeatureCategory];

class Feature extends Model<InferAttributes<Feature>, InferCreationAttributes<Feature>> {
  declare id: CreationOptional<string>;
  declare key: string;
  declare name: string;
  declare description: string | null;
  declare type: FeatureTypeType;
  declare category: FeatureCategoryType;
  declare default_value: any;
  declare is_active: CreationOptional<boolean>;
  declare depends_on: string[] | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Feature.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z_][a-z0-9_]*$/ // snake_case format
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(...Object.values(FeatureType)),
    allowNull: false,
    defaultValue: FeatureType.BOOLEAN
  },
  category: {
    type: DataTypes.ENUM(...Object.values(FeatureCategory)),
    allowNull: false,
    defaultValue: FeatureCategory.POS
  },
  default_value: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: false,
    validate: {
      isValidForType(value: any) {
        // Validation will be handled in hooks
        return true;
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  depends_on: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of feature keys that this feature depends on'
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['key'], unique: true },
    { fields: ['category'] },
    { fields: ['is_active'] }
  ],
  hooks: {
    beforeValidate: (feature: Feature) => {
      // Validate default_value based on type
      if (feature.type === FeatureType.BOOLEAN && typeof feature.default_value !== 'boolean') {
        feature.default_value = false;
      }
      if (feature.type === FeatureType.LIMIT && typeof feature.default_value !== 'number') {
        feature.default_value = 0;
      }
      if (feature.type === FeatureType.CONFIG && typeof feature.default_value !== 'object') {
        feature.default_value = {};
      }
      if (feature.type === FeatureType.MODULE && typeof feature.default_value !== 'boolean') {
        feature.default_value = false;
      }
    }
  }
});

export default Feature;
// lib/database/models/Barcode.ts
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const BarcodeStatus = {
  AVAILABLE: 'available',
  USED: 'used',
  VOID: 'void'
} as const;

export const BarcodeType = {
  UPC_A: 'upc_a',
  UPC_E: 'upc_e',
  EAN_13: 'ean_13',
  EAN_8: 'ean_8',
  CODE_39: 'code_39',
  CODE_128: 'code_128',
  QR_CODE: 'qr_code'
} as const;

export type BarcodeStatusType = typeof BarcodeStatus[keyof typeof BarcodeStatus];
export type BarcodeTypeType = typeof BarcodeType[keyof typeof BarcodeType];

class Barcode extends Model<InferAttributes<Barcode>, InferCreationAttributes<Barcode>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare barcode: string;
  declare barcode_type: BarcodeTypeType;
  declare product_id: string | null;
  declare status: BarcodeStatusType;
  declare generated_by: string;
  declare expires_at: Date | null;
  declare metadata: object | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Barcode.init({
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
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  barcode_type: {
    type: DataTypes.ENUM(...Object.values(BarcodeType)),
    allowNull: false,
    defaultValue: BarcodeType.CODE_128
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(...Object.values(BarcodeStatus)),
    allowNull: false,
    defaultValue: BarcodeStatus.AVAILABLE
  },
  generated_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'barcodes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['barcode'] },
    { fields: ['product_id'] },
    { fields: ['status'] },
    { fields: ['tenant_id', 'barcode'], unique: true }
  ]
});

export default Barcode;
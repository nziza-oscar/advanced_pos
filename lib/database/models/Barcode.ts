import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const BarcodeStatus = {
  AVAILABLE: 'available',
  USED: 'used',
  VOID: 'void'
} as const;

export type BarcodeStatusType = typeof BarcodeStatus[keyof typeof BarcodeStatus];

class Barcode extends Model<InferAttributes<Barcode>, InferCreationAttributes<Barcode>> {
  declare id: CreationOptional<string>;
  declare barcode_id: number;
  declare barcode: string;
  declare status: BarcodeStatusType;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Barcode.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  barcode_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM(...Object.values(BarcodeStatus)),
    allowNull: false,
    defaultValue: BarcodeStatus.AVAILABLE
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
    { fields: ['barcode_id'] },
    { fields: ['barcode'] },
    { fields: ['status'] }
  ]
});

export default Barcode;
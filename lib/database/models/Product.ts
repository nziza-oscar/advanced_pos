import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare barcode: string;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare cost_price: number | null;
  declare image_url: string | null;
  declare category_id: string | null;
  declare stock_quantity: number;
  declare min_stock_level: number;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Product.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Product ;
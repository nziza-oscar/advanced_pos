import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Setting extends Model {}

Setting.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  key: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  }, // e.g., 'shop_name', 'tax_rate'
  value: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  group: { 
    type: DataTypes.STRING, 
    defaultValue: 'general' 
  }, // e.g., 'receipt', 'financial'
}, { 
  sequelize, 
  modelName: 'Setting', 
  underscored: true,
  timestamps: true 
});

export default Setting;
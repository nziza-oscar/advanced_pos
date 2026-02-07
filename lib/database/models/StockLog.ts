import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class StockLog extends Model {}

StockLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false }, 
  change_amount: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.ENUM('restock', 'sale', 'return', 'wastage', 'adjustment'), allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: 'StockLog', underscored: true });

export default StockLog;
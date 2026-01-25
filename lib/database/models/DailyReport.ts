import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class DailyReport extends Model {}

DailyReport.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  total_cash_sales: { type: DataTypes.DECIMAL(20, 2), defaultValue: 0 },
  total_momo_sales: { type: DataTypes.DECIMAL(20, 2), defaultValue: 0 },
  expected_cash: { type: DataTypes.DECIMAL(20, 2), defaultValue: 0 },
  actual_cash: { type: DataTypes.DECIMAL(20, 2), allowNull: true },
  discrepancy: { type: DataTypes.DECIMAL(20, 2), defaultValue: 0 },
  closed_by: { type: DataTypes.UUID, allowNull: false }
}, { sequelize, modelName: 'DailyReport', underscored: true });

export default DailyReport;
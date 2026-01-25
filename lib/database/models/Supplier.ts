import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Supplier extends Model {}

Supplier.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  contact_person: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
}, { sequelize, modelName: 'Supplier', underscored: true });

export default Supplier;
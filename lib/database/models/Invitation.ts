import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const InvitationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export type InvitationStatusType = typeof InvitationStatus[keyof typeof InvitationStatus];

class Invitation extends Model<InferAttributes<Invitation>, InferCreationAttributes<Invitation>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare email: string;
  declare role: string;
  declare token: string;
  declare invited_by: string;
  declare status: InvitationStatusType;
  declare expires_at: Date;
  declare accepted_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Invitation.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  token: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  invited_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(InvitationStatus)),
    allowNull: false,
    defaultValue: InvitationStatus.PENDING
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'invitations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['email'] },
    { fields: ['token'] },
    { fields: ['status'] }
  ]
});

export default Invitation;
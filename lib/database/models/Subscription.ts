import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../connection';

export const SubscriptionStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete'
} as const;

export type SubscriptionStatusType = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

class Subscription extends Model<InferAttributes<Subscription>, InferCreationAttributes<Subscription>> {
  declare id: CreationOptional<string>;
  declare tenant_id: string;
  declare stripe_customer_id: string | null;
  declare stripe_subscription_id: string | null;
  declare plan: string;
  declare status: SubscriptionStatusType;
  declare current_period_start: Date;
  declare current_period_end: Date;
  declare cancel_at_period_end: CreationOptional<boolean>;
  declare amount: number;
  declare currency: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Subscription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  stripe_customer_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stripe_subscription_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  plan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
    allowNull: false,
    defaultValue: SubscriptionStatus.TRIALING
  },
  current_period_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  current_period_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cancel_at_period_end: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Subscription;
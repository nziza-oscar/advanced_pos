import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, Op } from 'sequelize';
import sequelize from '../connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Define the class to give TypeScript full visibility of instance properties and methods
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare username: string;
  declare password_hash: string;
  declare full_name: string;
  declare role: UserRoleType;
  declare is_active: CreationOptional<boolean>;
  declare last_login: CreationOptional<Date | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance Methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  }

  generateAuthToken(): string {
    const payload = {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      full_name: this.full_name
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
  }

  // Static Methods
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async findByCredentials(emailOrUsername: string, password: string): Promise<User> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
        is_active: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Invalid login credentials');
    }

    await user.update({ last_login: new Date() });
    return user;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.CASHIER
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default User
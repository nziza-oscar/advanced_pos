import { Sequelize } from 'sequelize';
import pg from "pg"
import * as mysql2 from 'mysql2'
import dotenv from 'dotenv';

dotenv.config();

// Use the DATABASE_URL provided by Neon
const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/pos_system";

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  dialectModule: mysql2,
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false, 
  //   },
  // },
  logging:  false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

export default sequelize;
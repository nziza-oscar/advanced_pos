import { Sequelize } from 'sequelize';
import pg from "pg"
import * as mysql2 from 'mysql2'
import dotenv from 'dotenv';

dotenv.config();

// Use the DATABASE_URL provided by Neon
const databaseUrl = process.env.DATABASE_URL ;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  // dialect: 'mysql',
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
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
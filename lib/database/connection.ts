import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import * as mysql from "mysql2"

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  dialectModule: mysql,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  benchmark: false,
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
});

export default sequelize;
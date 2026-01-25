import sequelize from '../lib/database/connection';
import '../lib/database/models'; // Import models to ensure they are registered

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

syncDatabase();
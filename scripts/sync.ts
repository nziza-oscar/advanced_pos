import sequelize from '../lib/database/connection';
import '../lib/database/models'; 

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

syncDatabase();
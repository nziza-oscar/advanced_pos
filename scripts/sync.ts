// scripts/sync.ts
import sequelize from '../lib/database/connection';
import {
  Tenant,
  User,
  Category,
  Product,
  Barcode,
  Transaction,
  TransactionItem,
  StockLog
} from '../lib/database/models';

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync all models with alter: true
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
    
    // Create default super admin if not exists
    const superAdmin = await User.findOne({
      where: { role: 'super_admin' }
    });
    
    if (!superAdmin) {
      const hashedPassword = await User.hashPassword('admin123');
      await User.create({
        email: 'admin@pos.com',
        username: 'superadmin',
        password_hash: hashedPassword,
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        tenant_id: null
      });
      console.log('✅ Super admin created (email: admin@pos.com, password: admin123)');
    } else {
      console.log('✅ Super admin already exists');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
    process.exit(1);
  }
}

syncDatabase();
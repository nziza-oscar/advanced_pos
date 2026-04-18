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
  StockLog,
  Subscription,
  Setting
} from '../lib/database/models';

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync all models with alter: true
    // Warning: force:true will drop tables and recreate them
    await sequelize.sync({ alter: true, force: true });
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
    
    // Create default settings if not exists
    const defaultSettings = await Setting.findOne({
      where: { key: 'system_name' }
    });
    
    if (!defaultSettings) {
      await Setting.bulkCreate([
        { key: 'system_name', value: 'Smart POS System', group: 'general' },
        { key: 'system_version', value: '1.0.0', group: 'general' },
        { key: 'default_currency', value: 'RWF', group: 'general' },
        { key: 'tax_rate', value: '18', group: 'financial' },
        { key: 'enable_tax', value: 'true', group: 'financial' },
        { key: 'receipt_footer', value: 'Thank you for shopping with us!', group: 'receipt' },
        { key: 'timezone', value: 'Africa/Kigali', group: 'general' },
        { key: 'date_format', value: 'DD/MM/YYYY', group: 'general' }
      ]);
      console.log('✅ Default settings created');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('   Email: admin@pos.com');
    console.log('   Password: admin123');
    console.log('   Role: Super Admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
    process.exit(1);
  }
}

syncDatabase();
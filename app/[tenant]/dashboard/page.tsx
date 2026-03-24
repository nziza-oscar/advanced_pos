// app/[tenant]/dashboard/page.tsx
import { headers } from 'next/headers';
import { getTenantContext } from '@/lib/tenant/utils';
import { Product, Transaction } from '@/models';

export default async function DashboardPage() {
  const tenant = await getTenantContext();
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');
  
  if (!tenant) {
    return <div>No tenant found</div>;
  }
  
  // Fetch tenant-specific data
  const [productCount, recentTransactions] = await Promise.all([
    Product.count({ where: { tenant_id: tenant.id, is_active: true } }),
    Transaction.findAll({
      where: { tenant_id: tenant.id },
      limit: 10,
      order: [['created_at', 'DESC']]
    })
  ]);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Products</h3>
          <p className="text-3xl font-bold">{productCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Your Role</h3>
          <p className="text-3xl font-bold capitalize">{userRole?.replace('_', ' ')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Plan</h3>
          <p className="text-3xl font-bold capitalize">{tenant.plan}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y">
          {recentTransactions.map((transaction: any) => (
            <div key={transaction.id} className="px-6 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{transaction.transaction_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${transaction.total_amount}</p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.payment_method}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
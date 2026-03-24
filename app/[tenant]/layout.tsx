// app/[tenant]/layout.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/tenant/utils';
import { TenantProvider } from '@/app/contexts/TenantContext';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant: tenantSlug } = params;
  
  // Get tenant from database
  const tenant = await getTenantBySlug(tenantSlug);
  
  if (!tenant) {
    notFound();
  }
  
  return (
    <TenantProvider tenant={tenant}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                {tenant.logo_url && (
                  <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto mr-3" />
                )}
                <h1 className="text-xl font-semibold text-gray-900">{tenant.name}</h1>
              </div>
              <nav>
                <ul className="flex space-x-4">
                  <li><a href={`/${tenantSlug}/dashboard`} className="text-gray-700 hover:text-gray-900">Dashboard</a></li>
                  <li><a href={`/${tenantSlug}/products`} className="text-gray-700 hover:text-gray-900">Products</a></li>
                  <li><a href={`/${tenantSlug}/sales`} className="text-gray-700 hover:text-gray-900">Sales</a></li>
                  <li><a href={`/${tenantSlug}/reports`} className="text-gray-700 hover:text-gray-900">Reports</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="py-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}
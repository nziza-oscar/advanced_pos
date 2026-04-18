// app/[tenant]/layout.tsx
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTenantBySlug } from '@/lib/tenant/utils';
import { TenantProvider } from '@/app/contexts/TenantContext';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import TenantHeader from '@/components/tenant/TenantHeader';
import jwt from 'jsonwebtoken';

interface TenantLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  full_name: string;
  tenant_id: string | null;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant: tenantSlug } = params;
  
  // Get tenant from database
  const tenant = await getTenantBySlug(tenantSlug);
  
  if (!tenant) {
    notFound();
  }
  
  // Get token from cookies - MUST AWAIT
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const tenantSlugCookie = cookieStore.get('tenant_slug')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  // Verify and decode JWT
  let user: JwtPayload | null = null;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as JwtPayload;
  } catch (error) {
    console.error('Invalid token:', error);
    redirect('/login');
  }
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user is super admin (should go to admin panel)
  if (user.role === 'super_admin') {
    redirect('/admin');
  }
  
  // Verify user belongs to this tenant
  if (user.tenant_id !== tenant.id) {
    redirect('/unauthorized');
  }
  
  return (
    <TenantProvider tenant={tenant}>
      <div className="flex h-screen bg-background overflow-hidden">
        <TenantSidebar tenant={tenant} userRole={user.role} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">
          <TenantHeader 
            tenant={tenant} 
            userRole={user.role} 
            userName={user.full_name}
            userEmail={user.email}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6 max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
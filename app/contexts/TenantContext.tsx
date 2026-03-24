// contexts/TenantContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: 'basic' | 'professional' | 'enterprise' | 'trial';
  status: 'active' | 'suspended' | 'trial' | 'expired';
  settings: any;
}

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({ children, tenant }: { children: ReactNode; tenant: Tenant }) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
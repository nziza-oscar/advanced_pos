// lib/tenant/utils.ts
import { Op } from 'sequelize';
import sequelize from '@/lib/database/connection';
import Tenant, { TenantPlan, TenantStatus, TenantPlanType, TenantStatusType } from '@/lib/database/models/Tenant';
import User, { UserRole } from '@/lib/database/models/User';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

// Cache tenant lookup for 5 minutes
const tenantCache = new Map<string, { tenant: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get tenant by slug (path-based)
 */
export async function getTenantBySlug(slug: string) {
  // Check cache first
  const cached = tenantCache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return cached.tenant;
  }
  
  try {
    const tenant = await Tenant.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: {
          [Op.in]: [TenantStatus.ACTIVE, TenantStatus.TRIAL]
        }
      },
      attributes: ['id', 'name', 'slug', 'logo_url', 'plan', 'status', 'settings']
    });
    
    // Cache the result
    if (tenant) {
      tenantCache.set(slug, {
        tenant: tenant.toJSON(),
        expires: Date.now() + CACHE_TTL
      });
    } else {
      tenantCache.set(slug, {
        tenant: null,
        expires: Date.now() + CACHE_TTL
      });
    }
    
    return tenant;
  } catch (error) {
    console.error('Error fetching tenant by slug:', error);
    return null;
  }
}

/**
 * Get current tenant from URL path (server-side)
 */
export async function getCurrentTenant() {
  const headersList = await headers(); // Added await here
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenantId = headersList.get('x-tenant-id');
  
  if (tenantId) {
    return await getTenantById(tenantId);
  }
  
  if (tenantSlug) {
    return await getTenantBySlug(tenantSlug);
  }
  
  return null;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string) {
  try {
    const tenant = await Tenant.findByPk(id, {
      attributes: ['id', 'name', 'slug', 'logo_url', 'plan', 'status', 'settings']
    });
    
    return tenant;
  } catch (error) {
    console.error('Error fetching tenant by ID:', error);
    return null;
  }
}

/**
 * Validate tenant access for current user
 */
export async function validateTenantAccess(tenantId: string, userId: string) {
  const user = await User.findOne({
    where: {
      id: userId,
      tenant_id: tenantId,
      is_active: true
    }
  });
  
  if (!user) {
    throw new Error('Access denied to this tenant');
  }
  
  return user;
}

/**
 * Generate unique tenant slug
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await Tenant.findOne({ where: { slug } });
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Create new tenant
 */
export async function createTenant(data: {
  name: string;
  slug?: string;
  plan?: TenantPlanType;
  email: string;
  fullName: string;
}) {
  const result = await sequelize.transaction(async (t) => {
    // Generate slug if not provided
    const slug = data.slug || await generateUniqueSlug(data.name);
    
    // Create tenant
    const tenant = await Tenant.create({
      name: data.name,
      slug,
      plan: data.plan || TenantPlan.TRIAL,
      status: TenantStatus.TRIAL,
      max_users: 5,
      max_products: 100,
      max_storage_mb: 100,
      subscription_start: new Date(),
      subscription_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'YYYY-MM-DD'
      }
    }, { transaction: t });
    
    // Create admin user for tenant
    const hashedPassword = await User.hashPassword('temporary-password'); // Should send invite email
    const user = await User.create({
      tenant_id: tenant.id,
      email: data.email,
      username: data.email.split('@')[0],
      password_hash: hashedPassword,
      full_name: data.fullName,
      role: UserRole.TENANT_ADMIN,
      is_active: true
    }, { transaction: t });
    
    return { tenant, user };
  });
  
  // Clear cache for new slug
  tenantCache.delete(result.tenant.slug);
  
  return result;
}

/**
 * Get all tenants (super admin only)
 */
export async function getAllTenants(options: {
  page?: number;
  limit?: number;
  status?: TenantStatusType;
  search?: string;
}) {
  const { page = 1, limit = 20, status, search } = options;
  const offset = (page - 1) * limit;
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const { count, rows } = await Tenant.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['settings'] }
  });
  
  return {
    tenants: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
}

/**
 * Check if tenant subscription is active
 */
export async function isTenantSubscriptionActive(tenantId: string): Promise<boolean> {
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['status', 'subscription_end']
    });
    
    if (!tenant) return false;
    
    if (tenant.status === TenantStatus.SUSPENDED) return false;
    if (tenant.status === TenantStatus.EXPIRED) return false;
    
    if (tenant.subscription_end && new Date(tenant.subscription_end) < new Date()) {
      // Subscription expired - update status
      await tenant.update({ status: TenantStatus.EXPIRED });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Check if tenant has access to a feature
 */
export async function hasFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['plan', 'settings']
    });
    
    if (!tenant) return false;
    
    const featuresByPlan = {
      [TenantPlan.TRIAL]: ['products', 'inventory', 'sales'],
      [TenantPlan.BASIC]: ['products', 'inventory', 'sales', 'reports'],
      [TenantPlan.PROFESSIONAL]: ['products', 'inventory', 'sales', 'reports', 'api_access', 'advanced_reports'],
      [TenantPlan.ENTERPRISE]: ['products', 'inventory', 'sales', 'reports', 'api_access', 'advanced_reports', 'multi_branch', 'custom_integrations']
    };
    
    const allowedFeatures = featuresByPlan[tenant.plan as keyof typeof featuresByPlan] || featuresByPlan[TenantPlan.BASIC];
    
    // Check custom feature flags from settings
    const customFeatures = (tenant.settings as any)?.enabled_features || [];
    
    return allowedFeatures.includes(feature) || customFeatures.includes(feature);
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Validate tenant limits
 */
export async function validateTenantLimit(
  tenantId: string, 
  resourceType: 'users' | 'products' | 'storage',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; message?: string }> {
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['max_users', 'max_products', 'max_storage_mb']
    });
    
    if (!tenant) {
      return { allowed: false, limit: 0, message: 'Tenant not found' };
    }
    
    let limit = 0;
    switch (resourceType) {
      case 'users':
        limit = tenant.max_users;
        break;
      case 'products':
        limit = tenant.max_products;
        break;
      case 'storage':
        limit = tenant.max_storage_mb;
        break;
    }
    
    const allowed = currentCount < limit;
    const message = allowed ? undefined : `${resourceType} limit reached (${limit})`;
    
    return { allowed, limit, message };
  } catch (error) {
    console.error('Error validating tenant limit:', error);
    return { allowed: false, limit: 0, message: 'Error validating limit' };
  }
}

/**
 * Get tenant settings
 */
export async function getTenantSettings(tenantId: string, key?: string) {
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['settings']
    });
    
    if (!tenant) return null;
    
    const settings = tenant.settings || {};
    
    if (key) {
      return (settings as any)[key];
    }
    
    return settings;
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    return null;
  }
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(tenantId: string, updates: object) {
  try {
    const tenant = await Tenant.findByPk(tenantId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    
    const currentSettings = tenant.settings || {};
    const updatedSettings = {
      ...currentSettings,
      ...updates
    };
    
    await tenant.update({ settings: updatedSettings });
    
    // Clear cache for this tenant
    if (tenant.slug) {
      tenantCache.delete(tenant.slug);
    }
    
    return tenant;
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    throw error;
  }
}

// React cache for server components
export const getTenantContext = cache(async () => {
  const headersList = await headers(); // Added await here
  const tenantSlug = headersList.get('x-tenant-slug');
  
  if (!tenantSlug) {
    return null;
  }
  
  return await getTenantBySlug(tenantSlug);
});

export { TenantStatus, TenantPlan };
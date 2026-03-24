// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User, Tenant } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, tenant_slug } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    let user = null;
    let tenant = null;

    // If tenant_slug is provided, try to login with tenant context
    if (tenant_slug) {
      // Find tenant by slug
      tenant = await Tenant.findOne({
        where: {
          slug: tenant_slug,
          status: {
            [Op.in]: ['active', 'trial']
          }
        }
      });

      if (!tenant) {
        return NextResponse.json(
          { error: 'Invalid tenant' },
          { status: 404 }
        );
      }

      // Check if tenant subscription is active
      if (tenant.subscription_end && new Date(tenant.subscription_end) < new Date()) {
        return NextResponse.json(
          { error: 'Your subscription has expired. Please contact support to renew.' },
          { status: 403 }
        );
      }

      // Try to find user in this tenant
      try {
        user = await User.findByCredentials(username, password, tenant.id);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }
    } else {
      // Try to find user without tenant context (super admin or regular user)
      try {
        user = await User.findByCredentials(username, password);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }

      // If user has tenant_id, get tenant info
      if (user.tenant_id) {
        tenant = await Tenant.findByPk(user.tenant_id);
      }
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Prepare user data
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      last_login: user.last_login,
      tenant_id: user.tenant_id,
      created_at: user.created_at
    };

    // Prepare tenant data if exists
    const tenantData = tenant ? {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo_url: tenant.logo_url,
      plan: tenant.plan,
      status: tenant.status
    } : null;

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tenant: tenantData,
        token
      }
    });

    // Set HttpOnly cookie for token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // If user has tenant, set tenant cookie
    if (tenant) {
      response.cookies.set({
        name: 'tenant_slug',
        value: tenant.slug,
        httpOnly: false, // Allow client to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });
    }

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    if (error.message.includes('Access denied')) {
      return NextResponse.json(
        { error: 'You do not have access to this tenant' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
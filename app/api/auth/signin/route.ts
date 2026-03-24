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
        { error: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { username: username }],
        is_active: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      );
    }

    // Handle super admin (no tenant)
    if (user.role === 'super_admin') {
      await user.update({ last_login: new Date() });
      const token = user.generateAuthToken();

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            is_active: user.is_active
          },
          token,
          redirectUrl: '/admin'
        }
      });

      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });

      return response;
    }

    // Handle tenant users
    let tenant: Tenant | null = null;
    
    // If tenant_slug is provided in the request
    if (tenant_slug) {
      tenant = await Tenant.findOne({
        where: {
          slug: tenant_slug,
          status: { [Op.in]: ['active', 'trial'] }
        }
      });

      if (!tenant) {
        return NextResponse.json(
          { error: 'Invalid organization' },
          { status: 404 }
        );
      }

      // Verify user belongs to this tenant
      if (user.tenant_id !== tenant.id) {
        return NextResponse.json(
          { error: 'You do not have access to this organization' },
          { status: 403 }
        );
      }
    } 
    // If no tenant_slug provided, get user's tenant
    else if (user.tenant_id) {
      tenant = await Tenant.findByPk(user.tenant_id);
      
      if (!tenant) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
    } 
    // User has no tenant and is not super admin
    else {
      return NextResponse.json(
        { error: 'No organization associated with this account' },
        { status: 400 }
      );
    }

    // Safety check - tenant should exist here
    if (!tenant) {
      return NextResponse.json(
        { error: 'Organization configuration error' },
        { status: 500 }
      );
    }

    // Check tenant status
    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return NextResponse.json(
        { error: 'Your organization account is not active' },
        { status: 403 }
      );
    }

    // Check subscription
    if (tenant.subscription_end && new Date(tenant.subscription_end) < new Date()) {
      return NextResponse.json(
        { error: 'Your subscription has expired' },
        { status: 403 }
      );
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate token
    const token = user.generateAuthToken();

    // Determine redirect URL based on user role
    const roleRouteMap: Record<string, string> = {
      tenant_admin: 'dashboard',
      manager: 'manager',
      cashier: 'cashier',
      inventory_manager: 'inventory'
    };
    
    const route = roleRouteMap[user.role] || 'dashboard';
    const redirectUrl = `/${tenant.slug}/${route}`;

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
          tenant_id: user.tenant_id
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          status: tenant.status
        },
        token,
        redirectUrl
      }
    });

    // Set cookies
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    response.cookies.set({
      name: 'tenant_slug',
      value: tenant.slug,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
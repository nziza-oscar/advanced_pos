// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import User, { UserRole } from '@/lib/database/models/User';
import Tenant, { TenantPlan, TenantStatus } from '@/lib/database/models/Tenant';
import sequelize from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      username, 
      password, 
      full_name, 
      business_name,
      business_type,
      country,
      plan = TenantPlan.TRIAL 
    } = body;

    // Validate required fields
    if (!email || !username || !password || !full_name || !business_name || !business_type || !country) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure both user and tenant are created or none
    const transaction = await sequelize.transaction();

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email },
            { username }
          ]
        },
        transaction
      });

      if (existingUser) {
        await transaction.rollback();
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 409 }
        );
      }

      // Hash the password
      const password_hash = await User.hashPassword(password);

      // Create tenant with business information
      const tenant = await Tenant.create({
        name: business_name,
        plan: plan,
        status: TenantStatus.ACTIVE,
        max_users: 5, // Default max users for trial/basic plan
        max_products: 1000, // Default max products
        settings: {
          business_type: business_type,
          country: country,
          registered_at: new Date().toISOString(),
          timezone: 'UTC'
        },
        subscription_start: new Date(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      }, { transaction });

      // Create user associated with the tenant
      const user = await User.create({
        email,
        username,
        password_hash,
        full_name,
        role: UserRole.TENANT_ADMIN, 
        tenant_id: tenant.id,
        is_active: true,
        last_login: new Date()
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      // Generate auth token
      const token = user.generateAuthToken();

      // Prepare user data for response (exclude sensitive info)
      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        tenant_id: user.tenant_id,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at
      };

      // Prepare tenant data for response
      const tenantData = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        settings: tenant.settings,
        subscription_start: tenant.subscription_start,
        subscription_end: tenant.subscription_end,
        max_users: tenant.max_users,
        max_products: tenant.max_products
      };

      const response = NextResponse.json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          tenant: tenantData,
          token
        }
      }, { status: 201 });

      // Set cookie for authentication
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;

    } catch (error: any) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { error: 'A tenant with this name already exists' },
        { status: 409 }
      );
    }

    if (error.name === 'SequelizeValidationError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
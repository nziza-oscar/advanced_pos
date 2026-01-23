import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/database/models';
import { Op } from 'sequelize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, full_name, role = 'cashier' } = body;

    if (!email || !username || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, username, password, and full name are required' },
        { status: 400 }
      );
    }

    // FIX: Import Op directly from 'sequelize' to stop pg-hstore lookup
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    const password_hash = await User.hashPassword(password);

    const user = await User.create({
      email,
      username,
      password_hash,
      full_name,
      role,
      is_active: true
    });

    const token = user.generateAuthToken();

    // Using class properties directly (thanks to 'declare' in your model)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      last_login: user.last_login,
      created_at: user.created_at
    };

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    }, { status: 201 });

    // Set cookie for your proxy/middleware to detect
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
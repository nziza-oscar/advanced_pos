import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/database/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;


    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by credentials
    const user = await User.findByCredentials(username, password);

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data (without password)
    const userData = {
      id: user.get('id'),
      email: user.get('email'),
      username: user.get('username'),
      full_name: user.get('full_name'),
      role: user.get('role'),
      is_active: user.get('is_active'),
      last_login: user.get('last_login'),
      created_at: user.get('created_at')
    };

    // Set cookie (optional)
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

    // Set HttpOnly cookie for token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Signin error:', error);
    
    if (error.message.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
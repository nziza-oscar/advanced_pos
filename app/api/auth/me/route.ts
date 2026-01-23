import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { User } from '@/lib/database/models';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user || !user.get('is_active')) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Return user data
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

    return NextResponse.json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    
    if (error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
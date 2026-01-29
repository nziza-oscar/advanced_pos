import { NextRequest, NextResponse } from 'next/server';
import { User, sequelize } from '@/lib/database/models';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error: any) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, username, password, role } = body;

    // Validate required fields
    if (!full_name || !email || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ email }, { username }] 
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      full_name,
      email,
      username,
      password_hash,
      role,
      is_active: true
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
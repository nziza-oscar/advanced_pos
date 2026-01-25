import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function verifyAuth(req: Request) {
  const cookieString = req.headers.get('cookie') || '';
  const token = cookieString
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      username: string;
      role: string;
      full_name: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  full_name: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = verifyToken(token);
    if (decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return false;
  } catch (error) {
    return true;
  }
};
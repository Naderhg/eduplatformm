import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = '30d'; // Fixed expiration time for demo
  
  return jwt.sign(
    { id },
    secret,
    { expiresIn }
  ) as string;
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables.");
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("⚠️ No or malformed Authorization header:", authHeader);
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Received Token:', token);
  console.log('📌 JWT_SECRET at middleware:', JWT_SECRET);

  try {
    
    console.log("📌 JWT_SECRET at middleware:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = decoded.userId;
    // Debugging logs (you can remove after it's working)
    console.log('🔐 Received Token:', token);
    console.log('🔍 Using Secret:', JWT_SECRET);
    console.log('✅ Decoded Payload:', decoded);
    console.log('🔓 Attached userId to request:', (req as any).userId);

    (req as any).userId = decoded.userId;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
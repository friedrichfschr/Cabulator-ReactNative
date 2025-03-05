import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import {User} from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Decoded token:', decoded);
    // Attach user to request object
    User.findById(decoded.id, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
import { Request, Response, NextFunction } from 'express';

// Middleware to add security headers for video streaming
export const addVideoSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Possible production dev server
    'http://localhost:3000', // Backend itself
  ];

  // Add basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Add CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Allow requests without Origin header (like direct video element requests)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  next();
};

// Middleware to validate video access token
export const validateVideoToken = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Additional token validation can be added here
  // For now, let the controller handle JWT verification
  next();
};

// Rate limiting middleware for video requests (disabled for testing)
const videoRequestCounts = new Map();

export const videoRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Temporarily disabled for testing
  // const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  // const now = Date.now();
  // const windowMs = 60 * 1000; // 1 minute window
  // const maxRequests = 100; // Increased to 100 for testing

  // // Clean old entries
  // for (const [ip, data] of videoRequestCounts.entries()) {
  //   if (now - data.timestamp > windowMs) {
  //     videoRequestCounts.delete(ip);
  //   }
  // }

  // // Check current IP
  // const currentData = videoRequestCounts.get(clientIP);
  // if (currentData) {
  //   if (currentData.count >= maxRequests) {
  //     return res.status(429).json({
  //       success: false,
  //       message: 'Too many video requests, please try again later'
  //     });
  //   }
  //   currentData.count++;
  // } else {
  //   videoRequestCounts.set(clientIP, {
  //     count: 1,
  //     timestamp: now
  //   });
  // }

  next();
};

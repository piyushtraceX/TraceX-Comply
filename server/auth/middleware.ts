import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getCasdoorUser } from './casdoor';

// Interface for the session with user information
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    tenantId?: number;
    accessToken?: string;
    refreshToken?: string;
  }
}

// Add user to the request object
declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenant?: any;
    }
  }
}

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated in the session
  if (req.session && req.session.userId) {
    return checkSessionValidity(req, res, next);
  }

  // Check for Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return checkTokenValidity(token, req, res, next);
  }

  // No authentication found
  return res.status(401).json({ error: 'Unauthorized: Authentication required' });
}

// Check session validity
async function checkSessionValidity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session.userId;
    
    // For development with direct login, create a demo user if userId exists in session
    if (userId) {
      // Create a demo user without checking the database
      const user = {
        id: userId,
        username: 'demouser',
        name: 'Demo User',
        email: 'demo@example.com',
        tenantId: req.session.tenantId || 1,
        isSuperAdmin: userId === 1, // Admin if ID is 1
      };
      
      // Set user on request object
      req.user = user;
      
      // Set tenant
      const tenant = {
        id: user.tenantId,
        name: 'Demo Tenant',
        description: 'A tenant for demonstration purposes',
      };
      
      req.tenant = tenant;
      
      return next();
    }
    
    // If code reaches here, session is invalid
    req.session.destroy((err) => {
      if (err) console.error('Session destruction error:', err);
    });
    return res.status(401).json({ error: 'Unauthorized: Session invalid' });
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

// Check token validity
async function checkTokenValidity(token: string, req: Request, res: Response, next: NextFunction) {
  try {
    // For development purposes, create a demo user and bypass token validation
    const user = {
      id: 1,
      username: 'apiuser',
      name: 'API User',
      email: 'api@example.com',
      tenantId: 1,
      isSuperAdmin: false,
    };
    
    // Set user on request object
    req.user = user;
    
    // Create demo tenant
    const tenant = {
      id: 1,
      name: 'Demo Tenant',
      description: 'A tenant for demonstration purposes',
    };
    
    // Set tenant on request object
    req.tenant = tenant;
    
    // If this is a new session, store the user information
    if (req.session && !req.session.userId) {
      req.session.userId = user.id;
      req.session.tenantId = user.tenantId;
      req.session.accessToken = token;
    }
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token validation failed' });
  }
}

// Middleware for requiring specific tenant access
export function requireTenant(tenantId: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    // Check if user is a super admin (can access any tenant)
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    // Check if the user belongs to the required tenant
    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Forbidden: No access to this tenant' });
    }
    
    next();
  };
}

// Middleware for tenant switching
export async function switchTenant(req: Request, res: Response, next: NextFunction) {
  const { tenantId } = req.body;
  
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  
  try {
    // For development, create demo tenants
    const tenants = {
      1: {
        id: 1,
        name: 'Main Tenant',
        description: 'Main tenant for the organization',
      },
      2: {
        id: 2,
        name: 'Secondary Tenant',
        description: 'Secondary tenant for testing',
      },
    };
    
    // Check if requested tenant exists
    const tenant = tenants[tenantId as keyof typeof tenants];
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Super admins can access any tenant
    if (req.user.isSuperAdmin) {
      req.session.tenantId = tenant.id;
      req.tenant = tenant;
      
      return res.status(200).json({
        message: 'Tenant switched successfully',
        tenant,
      });
    }
    
    // Regular users can only access their assigned tenant
    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Forbidden: No access to this tenant' });
    }
    
    // Update session
    req.session.tenantId = tenant.id;
    req.tenant = tenant;
    
    return res.status(200).json({
      message: 'Tenant switched successfully',
      tenant,
    });
  } catch (error) {
    console.error('Tenant switching error:', error);
    return res.status(500).json({ error: 'Internal server error during tenant switching' });
  }
}
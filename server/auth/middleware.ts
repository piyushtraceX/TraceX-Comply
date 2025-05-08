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
    
    // Get user from database
    const user = await storage.getUser(userId as number);
    
    if (!user) {
      // User not found, session invalid
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ error: 'Unauthorized: Session invalid' });
    }
    
    // Set user on request object
    req.user = user;
    
    // Set tenant ID if present in the session
    if (req.session.tenantId) {
      const tenant = await storage.getTenant(req.session.tenantId);
      if (tenant) {
        req.tenant = tenant;
      }
    } else if (user.tenantId) {
      // Use the user's tenant if present
      const tenant = await storage.getTenant(user.tenantId);
      if (tenant) {
        req.tenant = tenant;
        req.session.tenantId = tenant.id;
      }
    }
    
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

// Check token validity
async function checkTokenValidity(token: string, req: Request, res: Response, next: NextFunction) {
  try {
    // Get user info from Casdoor
    const casdoorUser = await getCasdoorUser(token);
    
    if (!casdoorUser || !casdoorUser.id) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Find user in our database by their Casdoor ID
    const user = await storage.getUserByCasdoorId(casdoorUser.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    
    // Set user on request object
    req.user = user;
    
    // Set user's tenant if available
    if (user.tenantId) {
      const tenant = await storage.getTenant(user.tenantId);
      if (tenant) {
        req.tenant = tenant;
      }
    }
    
    // If this is a new session, store the user information
    if (req.session && !req.session.userId) {
      req.session.userId = user.id;
      req.session.tenantId = user.tenantId === null ? undefined : user.tenantId;
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
    // Check if the user is a super admin (can access any tenant)
    if (req.user.isSuperAdmin) {
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      // Update session
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
    
    const tenant = await storage.getTenant(tenantId);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
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
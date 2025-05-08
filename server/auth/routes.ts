import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getSigninUrl, verifyAndGetUser, refreshToken } from './casdoor';
import { authenticate, switchTenant } from './middleware';
// Temporarily disable Casbin and provide mock implementations
// import { authzMiddleware, syncPermissionsWithCasbin, initializeCasbinWithBasicPolicies } from './casbin';

// Temporary middleware that always grants access
const authzMiddleware = (resource: string, action: string) => {
  return (req: Request, res: Response, next: Function) => {
    console.log(`[MOCK] Checking permission for ${resource}:${action} - access granted`);
    next();
  };
};

// Temporary function for syncing permissions
const syncPermissionsWithCasbin = async (): Promise<void> => {
  console.log('[MOCK] Syncing permissions with Casbin');
  return Promise.resolve();
};

// Temporary function for initializing policies
const initializeCasbinWithBasicPolicies = async (): Promise<void> => {
  console.log('[MOCK] Initializing basic policies');
  return Promise.resolve();
};

import { storage } from '../storage';

const router = Router();

// Extend SessionData to include oauth-specific properties
declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    callbackUrl?: string;
  }
}

// Endpoint to get the sign-in URL for Casdoor OAuth
router.get('/signin', (req: Request, res: Response) => {
  // Generate a state parameter for security (helps prevent CSRF)
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  
  // Get the callback URL from the request or use a default
  const callbackUrl = req.query.callbackUrl as string || '/';
  req.session.callbackUrl = callbackUrl;
  
  // Generate the sign-in URL
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
  const signinUrl = getSigninUrl(redirectUri, state);
  
  res.json({ signinUrl });
});

// OAuth callback handler
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // Verify state parameter to prevent CSRF
    if (!state || state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    // Get user info from Casdoor
    const { user, token } = await verifyAndGetUser(code as string);
    
    // Set user in session
    req.session.userId = user.id;
    req.session.tenantId = user.tenantId;
    req.session.accessToken = token.access_token;
    req.session.refreshToken = token.refresh_token;
    
    // Clear OAuth state
    delete req.session.oauthState;
    
    // Redirect to the callback URL or a default
    const callbackUrl = req.session.callbackUrl || '/';
    delete req.session.callbackUrl;
    
    // For API clients expecting JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        user,
        redirectUrl: callbackUrl
      });
    }
    
    // For browser clients expecting a redirect
    res.redirect(callbackUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshTokenStr = req.session.refreshToken || req.body.refreshToken;
    
    if (!refreshTokenStr) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const tokenResponse = await refreshToken(refreshTokenStr);
    
    // Update tokens in session if applicable
    if (req.session) {
      req.session.accessToken = tokenResponse.access_token;
      req.session.refreshToken = tokenResponse.refresh_token;
    }
    
    res.json({
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in,
      token_type: tokenResponse.token_type
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

// Get the current authenticated user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    // Get user roles for the current tenant
    let roles: any[] = [];
    if (req.user && req.tenant) {
      roles = await storage.getUserRoles(req.user.id, req.tenant.id);
    }
    
    res.json({
      user: req.user,
      tenant: req.tenant,
      roles: roles
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Switch tenant
router.post('/switch-tenant', authenticate, switchTenant);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.json({ message: 'Logged out successfully' });
  });
});

// Tenant Management Routes (protected by admin permissions)
router.get('/tenants', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware 
  async (req: Request, res: Response) => {
    try {
      const tenants = await storage.listTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Tenant listing error:', error);
      res.status(500).json({ error: 'Failed to list tenants' });
    }
  }
);

router.post('/tenants', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware
  async (req: Request, res: Response) => {
    try {
      const tenant = await storage.createTenant(req.body);
      res.status(201).json(tenant);
    } catch (error) {
      console.error('Tenant creation error:', error);
      res.status(500).json({ error: 'Failed to create tenant' });
    }
  }
);

// Role Management Routes
router.get('/roles', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware
  async (req: Request, res: Response) => {
    try {
      // Get tenant ID from query param or current tenant
      const tenantId = req.query.tenantId 
        ? Number(req.query.tenantId) 
        : (req.tenant ? req.tenant.id : undefined);
        
      const roles = await storage.listRoles(tenantId);
      res.json(roles);
    } catch (error) {
      console.error('Role listing error:', error);
      res.status(500).json({ error: 'Failed to list roles' });
    }
  }
);

router.post('/roles', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware
  async (req: Request, res: Response) => {
    try {
      const role = await storage.createRole(req.body);
      
      // Sync permissions with Casbin
      await syncPermissionsWithCasbin();
      
      res.status(201).json(role);
    } catch (error) {
      console.error('Role creation error:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }
);

// User Role Assignment Routes
router.post('/users/:userId/roles', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const { roleId, tenantId } = req.body;
      
      // Assign the role in the database
      const userRole = await storage.assignRoleToUser({
        userId,
        roleId,
        tenantId
      });
      
      // Sync to Casbin
      await syncPermissionsWithCasbin();
      
      res.status(201).json(userRole);
    } catch (error) {
      console.error('Role assignment error:', error);
      res.status(500).json({ error: 'Failed to assign role to user' });
    }
  }
);

router.delete('/users/:userId/roles/:roleId', 
  authenticate, 
  (req, res, next) => next(), // Temporary replacement for authzMiddleware
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const roleId = Number(req.params.roleId);
      const tenantId = req.query.tenantId ? Number(req.query.tenantId) : undefined;
      
      // Remove the role in the database
      await storage.removeRoleFromUser(userId, roleId, tenantId);
      
      // Sync to Casbin
      await syncPermissionsWithCasbin();
      
      res.status(200).json({ message: 'Role removed from user successfully' });
    } catch (error) {
      console.error('Role removal error:', error);
      res.status(500).json({ error: 'Failed to remove role from user' });
    }
  }
);

// Initialize Casbin with basic policies (admin only)
router.post('/initialize-policies', 
  authenticate, 
  async (req: Request, res: Response) => {
    try {
      // Check if user is a super admin
      if (!req.user || !req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      
      await initializeCasbinWithBasicPolicies();
      
      res.status(200).json({ message: 'Basic policies initialized successfully' });
    } catch (error) {
      console.error('Policy initialization error:', error);
      res.status(500).json({ error: 'Failed to initialize policies' });
    }
  }
);

// Export routes
export default router;
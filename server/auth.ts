import { Request, Response, NextFunction, Express } from 'express';
import session from 'express-session';
import { storage } from './storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Create async version of scrypt
const scryptAsync = promisify(scrypt);

// Helper functions for password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Setup session middleware
export function setupSessionMiddleware(app: Express) {
  // Initialize session middleware with PostgreSQL store
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    store: storage.sessionStore
  }));
}

// Type definitions for extended Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenant?: any;
    }
  }
}

// Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  
  try {
    // Get user from database
    const user = await storage.getUser(userId);
    
    if (!user) {
      // User not found in database despite having a session
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    
    // Store user in request
    req.user = user;
    
    // Get tenant info if user has a tenantId
    if (req.session.tenantId && user.tenantId !== req.session.tenantId) {
      // User switched tenants, check if they have access to this tenant
      const tenant = await storage.getTenant(req.session.tenantId);
      if (tenant) {
        req.tenant = tenant;
      } else {
        // Reset to user's default tenant
        req.session.tenantId = user.tenantId;
        req.tenant = user.tenantId ? await storage.getTenant(user.tenantId) : null;
      }
    } else if (user.tenantId) {
      // Use user's default tenant
      req.session.tenantId = user.tenantId;
      req.tenant = await storage.getTenant(user.tenantId);
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed due to server error' });
  }
}

// Setup authentication routes
export function setupAuthRoutes(app: Express) {
  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, password, email, displayName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Create default tenant if it doesn't exist
      let defaultTenant = await storage.getTenantByName('default');
      if (!defaultTenant) {
        defaultTenant = await storage.createTenant({
          name: 'default',
          displayName: 'Default Tenant',
          description: 'Default tenant for new users'
        });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        displayName,
        tenantId: defaultTenant.id,
        isActive: true,
        isSuperAdmin: false
      });

      // Set up default user role
      let userRole = await storage.getRoleByName('user', defaultTenant.id);
      if (!userRole) {
        userRole = await storage.createRole({
          name: 'user',
          displayName: 'User',
          description: 'Basic user role',
          tenantId: defaultTenant.id
        });
      }

      // Assign role to user
      await storage.assignRoleToUser({
        userId: user.id,
        roleId: userRole.id,
        tenantId: defaultTenant.id
      });

      // Set user in session
      req.session.userId = user.id;
      req.session.tenantId = user.tenantId;

      // Get user roles
      const roles = await storage.getUserRoles(user.id, user.tenantId);

      res.status(201).json({
        user,
        tenant: defaultTenant,
        roles: roles.map(role => role.name)
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed due to server error' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }
      
      // Verify password
      const passwordValid = await comparePasswords(password, user.password);
      
      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login timestamp
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Set user in session
      req.session.userId = user.id;
      req.session.tenantId = user.tenantId;
      
      // Get tenant info
      let tenant = undefined;
      if (user.tenantId) {
        tenant = await storage.getTenant(user.tenantId);
      }
      
      // Get user roles
      const roles = await storage.getUserRoles(user.id, user.tenantId);
      
      res.json({
        user,
        tenant,
        roles: roles.map(role => role.name)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed due to server error' });
    }
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user endpoint
  app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
    try {
      // Get user roles
      const roles = await storage.getUserRoles(req.user.id, req.session.tenantId);
      
      res.json({
        user: req.user,
        tenant: req.tenant,
        roles: roles.map(role => role.name)
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to fetch current user info' });
    }
  });
  
  // Switch tenant endpoint
  app.post('/api/auth/switch-tenant', authenticate, async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.body;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }
      
      // Check if tenant exists
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      // Set tenant in session
      req.session.tenantId = tenant.id;
      
      // Get user roles for this tenant
      const roles = await storage.getUserRoles(req.user.id, tenant.id);
      
      res.json({
        message: 'Tenant switched successfully',
        tenant,
        roles: roles.map(role => role.name)
      });
    } catch (error) {
      console.error('Switch tenant error:', error);
      res.status(500).json({ error: 'Failed to switch tenant' });
    }
  });
}
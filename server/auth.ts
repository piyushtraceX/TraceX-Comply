import { Request, Response, NextFunction, Express } from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { storage } from './storage';

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

// Setup session middleware
export function setupSessionMiddleware(app: Express) {
  // Initialize session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  }));
}

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  
  // For development, create a mock user based on session
  req.user = {
    id: userId,
    username: 'demouser',
    name: 'Demo User',
    email: 'demo@example.com',
    tenantId: req.session.tenantId || 1,
    isSuperAdmin: userId === 1
  };
  
  // Add mock tenant info
  req.tenant = {
    id: req.session.tenantId || 1,
    name: 'Demo Tenant',
    description: 'A demo tenant for development purposes'
  };
  
  next();
}

// Setup authentication routes
export function setupAuthRoutes(app: Express) {
  // Login endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // For development, accept any credentials
    const user = {
      id: 1,
      username,
      name: 'Demo User',
      email: `${username}@example.com`,
      tenantId: 1,
      isSuperAdmin: username === 'admin'
    };
    
    // Set user in session
    req.session.userId = user.id;
    req.session.tenantId = user.tenantId;
    
    res.json({ 
      user,
      tenant: {
        id: 1,
        name: 'Demo Tenant',
        description: 'A demo tenant for development purposes'
      }
    });
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
  app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
    res.json({
      user: req.user,
      tenant: req.tenant,
      roles: ['user'] // Basic role for all users
    });
  });
  
  // Switch tenant endpoint
  app.post('/api/auth/switch-tenant', authenticate, (req: Request, res: Response) => {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // For development, we'll just accept any tenant ID
    req.session.tenantId = tenantId;
    
    const tenant = {
      id: tenantId,
      name: `Tenant ${tenantId}`,
      description: `Description for tenant ${tenantId}`
    };
    
    res.json({
      message: 'Tenant switched successfully',
      tenant
    });
  });
}
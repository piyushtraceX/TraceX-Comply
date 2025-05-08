import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import authRoutes from "./auth/routes";
import { initCasbinEnforcer, syncPermissionsWithCasbin } from "./auth/casbin";
import { authenticate, requireTenant } from "./auth/middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: storage.sessionStore,
  }));

  // Initialize Casbin enforcer - temporarily disabled
  // await initCasbinEnforcer();
  
  // Register authentication and authorization routes
  app.use('/api/auth', authRoutes);
  
  // Example protected API route
  app.get('/api/protected', authenticate, (req, res) => {
    res.json({
      message: 'This is a protected endpoint',
      user: req.user,
      tenant: req.tenant
    });
  });
  
  // Example tenant-specific API route
  app.get('/api/tenants/:tenantId/data', 
    authenticate, 
    (req, res, next) => requireTenant(Number(req.params.tenantId))(req, res, next),
    (req, res) => {
      res.json({
        message: `Data for tenant ${req.params.tenantId}`,
        user: req.user
      });
    }
  );
  
  // User management API routes
  app.get('/api/users', authenticate, async (req, res) => {
    try {
      // Get tenant ID from query param or current tenant
      const tenantId = req.query.tenantId 
        ? Number(req.query.tenantId) 
        : (req.tenant ? req.tenant.id : undefined);
        
      const users = await storage.listUsers(tenantId);
      
      // Remove sensitive information
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error('User listing error:', error);
      res.status(500).json({ error: 'Failed to list users' });
    }
  });
  
  app.post('/api/users', authenticate, async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      
      res.status(201).json(safeUser);
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  // Add more API routes as needed...

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSessionMiddleware, setupAuthRoutes, authenticate } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware first
  setupSessionMiddleware(app);
  
  // Status endpoint for health checks
  app.get('/express-status', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Express server is running with database-backed authentication',
      timestamp: new Date().toISOString()
    });
  });
  
  // Basic API test endpoint
  app.get('/api/test', (req: Request, res: Response) => {
    res.json({
      message: 'Express API test endpoint is working',
      timestamp: new Date().toISOString()
    });
  });
  
  // Set up database-backed authentication routes
  setupAuthRoutes(app);
  
  // User management endpoints
  app.get('/api/users', authenticate, async (req: Request, res: Response) => {
    try {
      // Only allow super admins to list all users
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const users = await storage.listUsers();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  // Create an endpoint to seed a demo user if needed
  app.post('/api/seed-demo-user', async (req: Request, res: Response) => {
    try {
      // Check if the demo user already exists
      const existingUser = await storage.getUserByUsername('demouser');
      
      if (existingUser) {
        return res.json({ 
          message: 'Demo user already exists', 
          user: existingUser 
        });
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
      
      // Create the demo user
      const demoUser = await storage.createUser({
        username: 'demouser',
        password: '$2b$10$iq70nZ.hRxkEA7WV7UFr0OXVgGuOxOLXwKHPZ7IfHxD5QI4r1Aw3m', // 'password'
        email: 'demo@example.com',
        displayName: 'Demo User',
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
        userId: demoUser.id,
        roleId: userRole.id,
        tenantId: defaultTenant.id
      });
      
      res.status(201).json({
        message: 'Demo user created successfully',
        user: demoUser
      });
    } catch (error) {
      console.error('Error creating demo user:', error);
      res.status(500).json({ error: 'Failed to create demo user' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

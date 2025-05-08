import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSessionMiddleware, setupAuthRoutes, authenticate } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session middleware
  setupSessionMiddleware(app);
  
  // Register authentication routes
  setupAuthRoutes(app);
  
  // Example protected API route
  app.get('/api/protected', authenticate, (req, res) => {
    res.json({
      message: 'This is a protected endpoint',
      user: req.user,
      tenant: req.tenant
    });
  });
  
  // Example API routes that handle specific resources
  app.get('/api/users', authenticate, (req, res) => {
    // Return mock users for development
    const users = [
      {
        id: 1,
        username: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        tenantId: 1,
        isSuperAdmin: true
      },
      {
        id: 2,
        username: 'manager',
        name: 'Manager User',
        email: 'manager@example.com',
        tenantId: 1,
        isSuperAdmin: false
      }
    ];
    
    res.json(users);
  });
  
  app.get('/api/tenants', authenticate, (req, res) => {
    // Return mock tenants for development
    const tenants = [
      {
        id: 1,
        name: 'Main Organization',
        description: 'Main tenant for the organization'
      },
      {
        id: 2,
        name: 'Partner Organization',
        description: 'Partner tenant for collaboration'
      }
    ];
    
    res.json(tenants);
  });
  
  const httpServer = createServer(app);

  return httpServer;
}

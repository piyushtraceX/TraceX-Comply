import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // TEMPORARY: Re-enabling API routes while Go server is being fixed
  // Express will continue to handle API requests as a fallback
  
  // Status endpoint for health checks
  app.get('/express-status', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Express server is running in API fallback mode',
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
  
  // Authentication endpoints
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    try {
      // For demo, accept any credentials
      const user = {
        id: 1,
        username,
        name: 'Demo User',
        email: `${username}@example.com`
      };
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.json({ message: 'Logged out successfully' });
    }
  });
  
  app.get('/api/auth/me', (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // In a real app, get user from database
    const user = {
      id: req.session.userId,
      username: 'demouser',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    
    res.json({ user });
  });
  
  // User management endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // No API routes - all API functionality has been moved to the Go server
  
  // Status endpoint for health checks
  app.get('/express-status', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Express server is running, but all API functionality has been moved to the Go server',
      timestamp: new Date().toISOString()
    });
  });
  
  const httpServer = createServer(app);
  return httpServer;
}

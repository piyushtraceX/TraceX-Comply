import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger for non-API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Only log non-API requests since API requests are handled by Go server
    if (!path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Important notice for API requests
app.use('/api', (req, res) => {
  res.status(404).json({
    error: "API Not Found", 
    message: "API endpoints have been moved to the Go server. Please update your client configuration.",
    goServerUrl: process.env.GO_SERVER_URL || "http://localhost:8080/api"
  });
});

(async () => {
  const server = await registerRoutes(app);

  // Generic error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite for development or serve static files for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server configuration
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Frontend server running on port ${port}`);
    log(`NOTE: All API functionality has been moved to the Go server`);
  });
})();

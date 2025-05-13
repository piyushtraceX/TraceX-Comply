// Integrated development server for Complimate
// This runs both the Go server and the Vite dev server
import express from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { spawn } from 'child_process';
import { createServer } from 'vite';

// Setup middleware to avoid port conflicts
const killProcessesOnPorts = async (ports: number[]) => {
  for (const port of ports) {
    try {
      await new Promise((resolve) => {
        const cmd = process.platform === 'win32' 
          ? `npx kill-port ${port}`
          : `lsof -i :${port} | tail -n +2 | awk '{print $2}' | xargs -r kill -9`;
        
        spawn(cmd, { shell: true }).on('close', resolve);
      });
    } catch (error) {
      console.log(`No process found on port ${port} or failed to kill`);
    }
  }
};

const startGoServer = async () => {
  console.log('Building and starting Go server...');
  
  // Build the Go server
  const buildProcess = spawn('cd go-server && go build -o server main.go', {
    shell: true,
    stdio: 'inherit'
  });
  
  await new Promise((resolve) => buildProcess.on('close', resolve));
  
  // Start the Go server
  const goServer = spawn('./go-server/server', {
    env: { ...process.env, GO_PORT: '8081' },
    shell: true,
    stdio: 'inherit'
  });
  
  goServer.on('error', (err) => {
    console.error('Failed to start Go server:', err);
  });
  
  return goServer;
};

const startViteServer = async () => {
  // Create Vite server
  console.log('Starting Vite dev server...');
  const vite = await createServer({
    configFile: 'vite.config.ts',
    server: {
      port: 5173,
      strictPort: true,
      host: '0.0.0.0'
    }
  });
  
  // Start Vite server
  await vite.listen();
  
  return vite;
};

const startProxy = async () => {
  const app = express();
  const PORT = 5000;
  
  // Add direct route for health checking
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Express proxy is running',
      timestamp: new Date().toISOString()
    });
  });

  // Special case for /auth/casdoor - redirect to Go server's OAuth endpoint
  app.get('/auth/casdoor', (req, res) => {
    console.log('EXPRESS: Redirecting /auth/casdoor to Go server OAuth handler at /api/auth/casdoor');
    
    // Add timestamp parameter to avoid caching issues
    const timestamp = new Date().getTime();
    const redirectUrl = `/api/auth/casdoor?ts=${timestamp}`;
    
    // Use the /api/auth/casdoor route directly, which will be proxied to Go
    // This ensures it works both in local dev and Replit environments
    res.redirect(redirectUrl);
  });
  
  // Handle /auth/me redirections as well
  app.get('/auth/me', (req, res) => {
    console.log('EXPRESS: Redirecting /auth/me to /api/auth/me');
    res.redirect('/api/auth/me');
  });
  
  // Handle any other auth routes that might be missing the /api prefix
  app.get('/auth/*', (req, res) => {
    const path = req.path.replace('/auth/', '/api/auth/');
    console.log(`EXPRESS: Redirecting ${req.path} to ${path}`);
    res.redirect(path + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  });

  // All /api/* requests are proxied to Go server by the middleware below
  // We don't need special handling for individual /api/auth/* routes

  // Add specific route for /api/auth/casdoor with detailed logging
  app.get('/api/auth/casdoor', (req, res, next) => {
    console.log('EXPRESS: Direct handling of /api/auth/casdoor');
    
    // Check if we're in Replit environment
    const isReplit = req.headers.host?.includes('replit') || req.headers.host?.includes('repl.co');
    
    // Get the full host for the Replit environment
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    
    console.log(`EXPRESS: Auth request in ${isReplit ? 'Replit' : 'local'} environment`);
    console.log(`EXPRESS: Host headers - protocol: ${protocol}, host: ${host}`);
    
    // Add query parameters
    const queryParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    
    // Pass special headers to Go server to help it construct correct callback URLs
    req.headers['x-replit-domain'] = `${protocol}://${host}`;
    req.headers['x-environment'] = isReplit ? 'replit' : 'local';
    
    // Let the proxy middleware handle the actual forwarding
    next();
  });

  // Add an explicit route handler for the root auth endpoint for error debugging
  app.get('/auth', (req, res) => {
    console.log('EXPRESS: Caught request to /auth root');
    res.redirect('/auth/casdoor');
  });

  // Add a catch-all route for missing API routes with helpful debugging info
  app.all('/api/*', (req, res, next) => {
    console.log(`EXPRESS: Processing API request for ${req.method} ${req.url}`);
    next();
  });

  // Forward all API requests directly to Go server
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    secure: false,
    xfwd: true,
    pathRewrite: undefined, // Do not rewrite paths
    // Add logging but fix TypeScript errors
    onProxyReq: function(proxyReq: any, req: any, res: any) {
      console.log(`EXPRESS PROXY: Forwarding ${req.method} ${req.url} to Go server`);
    },
    onProxyRes: function(proxyRes: any, req: any, res: any) {
      console.log(`EXPRESS PROXY: Received ${proxyRes.statusCode} ${proxyRes.statusMessage} from Go server for ${req.method} ${req.url}`);
    },
    onError: function(err: Error, req: any, res: any) {
      console.error(`EXPRESS PROXY ERROR: ${err.message} for ${req.method} ${req.url}`);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Proxy Error: ${err.message}`);
    }
  } as any));
  
  // Forward all other requests to Vite
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    secure: false,
    ws: true
  }));
  
  // Start Express proxy
  return new Promise<void>((resolve) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
===================================================
🚀 Development environment running successfully!
===================================================

📱 Access the application at: http://localhost:${PORT}

✅ This combined setup includes:
   - Go API server (running on port 8081)
   - Vite dev server with React (running on port 5173)
   - Express proxy server (running on port ${PORT})

💡 All requests from your browser will go through the proxy:
   - API requests (/api/*) → forwarded to Go server
   - All other requests → forwarded to Vite React app

Press Ctrl+C to stop all servers.
      `);
      resolve();
    });
  });
};

const main = async () => {
  try {
    // Kill any existing processes on our ports
    await killProcessesOnPorts([5000, 5173, 8081]);
    
    // Start Go server 
    const goServer = await startGoServer();
    
    // Start Vite server
    const viteServer = await startViteServer();
    
    // Start proxy server
    await startProxy();
    
    // Handle process termination
    const cleanup = () => {
      console.log('\nShutting down servers...');
      goServer.kill();
      viteServer.close();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (error) {
    console.error('Error starting the development environment:', error);
    process.exit(1);
  }
};

main();
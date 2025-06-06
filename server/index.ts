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
  
  // Rebuild the Go server every time to ensure we have the latest code
  const buildProcess = spawn('cd go-server && go build -o server main.go', {
    shell: true,
    stdio: 'inherit'
  });
  
  await new Promise((resolve) => buildProcess.on('close', resolve));
  
  // Copy important environment variables
  const replitDomains = process.env.REPLIT_DOMAINS;
  console.log(`EXPRESS: REPLIT_DOMAINS environment variable = '${replitDomains}'`);
  
  // Double-check that we're using our freshly built binary
  const goServer = spawn('cd go-server && ./server', {
    env: { 
      ...process.env, 
      GO_PORT: '8081',
      // Make sure REPLIT_DOMAINS is explicitly passed to child process
      ...(replitDomains ? { REPLIT_DOMAINS: replitDomains } : {})
    },
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

  // EMERGENCY DIRECT HANDLER: Express handles the OAuth redirect directly
  app.get('/api/auth/casdoor', (req, res) => {
    console.log('⚠️ EXPRESS: EMERGENCY DIRECT HANDLING of /api/auth/casdoor');
    console.log('⚠️ EXPRESS: Bypassing Go server completely for OAuth redirect');
    
    // Hard-coded Casdoor parameters
    const casdoorEndpoint = "https://tracextech.casdoor.com";
    const clientID = "d85be9c2468eae1dbf58";
    
    // Determine the callback URL for Replit environment
    let callbackUrl: string;
    const replitDomains = process.env.REPLIT_DOMAINS;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || '';
    
    console.log(`⚠️ EXPRESS OAUTH: Host information - protocol: ${protocol}, host: ${host}`);
    console.log(`⚠️ EXPRESS OAUTH: REPLIT_DOMAINS env var: ${replitDomains}`);
    
    if (replitDomains) {
      // First priority: Use REPLIT_DOMAINS environment variable
      callbackUrl = `https://${replitDomains}/api/auth/callback`;
      console.log(`⚠️ EXPRESS OAUTH: Using callback URL from REPLIT_DOMAINS: ${callbackUrl}`);
    } else if (host && (host.includes('replit') || host.includes('.repl.co'))) {
      // Second priority: Use hostname if it's a Replit domain
      callbackUrl = `${protocol}://${host}/api/auth/callback`;
      console.log(`⚠️ EXPRESS OAUTH: Using callback URL from hostname: ${callbackUrl}`);
    } else {
      // Fallback for local development
      callbackUrl = "http://localhost:5000/api/auth/callback";
      console.log(`⚠️ EXPRESS OAUTH: Using localhost callback URL: ${callbackUrl}`);
    }
    
    // Construct the OAuth URL manually
    const state = "eudr-complimate";
    const scope = "read";
    const authUrl = `${casdoorEndpoint}/login/oauth/authorize?` +
      `client_id=${clientID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `scope=${scope}&` +
      `state=${state}`;
    
    console.log(`⚠️ EXPRESS OAUTH: Redirecting to Casdoor with URL: ${authUrl}`);
    
    // Redirect directly to Casdoor
    res.redirect(307, authUrl);
  });

  // Add an explicit route handler for the root auth endpoint for error debugging
  app.get('/auth', (req, res) => {
    console.log('EXPRESS: Caught request to /auth root');
    res.redirect('/auth/casdoor');
  });

  // Add a catch-all route for missing API routes with helpful debugging info
  app.all('/api/*', (req, res, next) => {
    console.log(`EXPRESS: Processing API request for ${req.method} ${req.url}`);
    console.log(`EXPRESS: Path details - originalUrl: ${req.originalUrl}, path: ${req.path}, baseUrl: ${req.baseUrl}`);
    
    // Make sure the target URL includes /api in the path
    console.log(`EXPRESS: Target would be: http://localhost:8081${req.originalUrl}`);
    
    next();
  });

  // Forward all API requests directly to Go server
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8081/api',
    changeOrigin: true,
    secure: false,
    xfwd: true,
    pathRewrite: {
      '^/api': '' // Replace /api with nothing since it's already in the target
    },
    // Add logging but fix TypeScript errors
    onProxyReq: function(proxyReq: any, req: any, res: any) {
      const originalPath = req.originalUrl;
      const targetPath = proxyReq.path;
      console.log(`EXPRESS PROXY: Forwarding ${req.method} ${originalPath} to Go server as ${targetPath}`);
      
      // Add X-Forwarded headers for proper Go server handling
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
      proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
      
      // Add our custom header for domain detection
      const replitDomains = process.env.REPLIT_DOMAINS;
      if (replitDomains) {
        // If REPLIT_DOMAINS env var is available, use it (most reliable)
        console.log(`EXPRESS PROXY: Adding X-Replit-Domains-Env header: ${replitDomains}`);
        proxyReq.setHeader('X-Replit-Domains-Env', replitDomains);
        
        // Add the direct callback URL in a header
        const callbackUrl = `https://${replitDomains}/api/auth/callback`;
        proxyReq.setHeader('X-Replit-Callback-URL', callbackUrl);
        console.log(`EXPRESS PROXY: Adding X-Replit-Callback-URL header: ${callbackUrl}`);
        
        // Also add environment dump (for debugging)
        console.log("EXPRESS PROXY: Environment variables:");
        Object.keys(process.env)
          .filter(key => key.includes("REPLIT"))
          .forEach(key => {
            console.log(`  ${key}: ${process.env[key]}`);
          });
      } else {
        console.log("EXPRESS PROXY: No REPLIT_DOMAINS environment variable found");
      }
      
      if (req.hostname.includes('replit') || req.hostname.includes('.app')) {
        const protocol = req.protocol || 'https';
        const replitDomain = `${protocol}://${req.hostname}`;
        console.log(`EXPRESS PROXY: Adding X-Replit-Domain header: ${replitDomain}`);
        proxyReq.setHeader('X-Replit-Domain', replitDomain);
      }
    },
    onProxyRes: function(proxyRes: any, req: any, res: any) {
      console.log(`EXPRESS PROXY: Received ${proxyRes.statusCode} ${proxyRes.statusMessage} from Go server for ${req.method} ${req.originalUrl}`);
    },
    onError: function(err: Error, req: any, res: any) {
      console.error(`EXPRESS PROXY ERROR: ${err.message} for ${req.method} ${req.originalUrl}`);
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
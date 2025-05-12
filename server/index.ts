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
    console.log('EXPRESS: Redirecting to Go server OAuth handler');
    // Redirect to the Go server's endpoint which has all the proper OAuth parameters
    res.redirect('http://localhost:8081/api/auth/casdoor');
  });

  // Forward all API requests directly to Go server without any special handling
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    secure: false,
    xfwd: true
  }));
  
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
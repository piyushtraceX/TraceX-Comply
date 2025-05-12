// This script replaces the Node.js server with the Go server
const { spawn } = require('child_process');
const { resolve } = require('path');

// Make the scripts executable
spawn('chmod', ['+x', 'run-go-server.sh', 'run-dev.sh', 'run-prod.sh'], {
  stdio: 'inherit'
});

// Start the Go server in development mode
const goServer = spawn('./run-go-server.sh', ['dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: process.env.PATH,
    DATABASE_URL: process.env.DATABASE_URL,
    GO_PORT: "8081",
  }
});

// Handle signals
process.on('SIGINT', () => {
  console.log('Shutting down Go server...');
  goServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down Go server...');
  goServer.kill('SIGTERM');
  process.exit(0);
});

// Keep the process running
goServer.on('close', (code) => {
  console.log(`Go server exited with code ${code}`);
  process.exit(code);
});
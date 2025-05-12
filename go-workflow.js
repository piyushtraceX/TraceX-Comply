// This is a new workflow script that replaces the Node.js/Express server with our Go server

// Start the Go server
const { execSync, spawn } = require('child_process');

// Make sure our scripts are executable
execSync('chmod +x run-go-server.sh');

console.log('Starting Go server in development mode...');
const goServer = spawn('./run-go-server.sh', ['dev'], {
  stdio: 'inherit',
  env: process.env
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down Go server...');
  goServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down Go server...');
  goServer.kill();
  process.exit(0);
});

// Keep the process running
goServer.on('exit', (code) => {
  console.log(`Go server exited with code ${code}`);
  process.exit(code);
});

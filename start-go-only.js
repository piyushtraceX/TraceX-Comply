// This script replaces the Node.js/Express server with the Go server
import { spawn } from 'child_process';

console.log('Starting Go server in development mode...');

// Make the script executable
spawn('chmod', ['+x', 'run-minimal-go.sh']);

// Start the Go server
const goServer = spawn('./run-minimal-go.sh', [], {
  stdio: 'inherit',
  env: process.env
});

goServer.on('close', (code) => {
  console.log(`Go server exited with code ${code}`);
  process.exit(code);
});

// Handle signals
process.on('SIGINT', () => {
  goServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  goServer.kill('SIGTERM');
  process.exit(0);
});

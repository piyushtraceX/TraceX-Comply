// This script replaces the Node.js server with the Go server
import { spawn } from 'child_process';

console.log("Running Go server instead of Node.js/Express");

// Make the start_go.sh script executable
spawn('chmod', ['+x', 'start_go.sh']);

// Start the Go server
const goServer = spawn('./start_go.sh', [], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GO_PORT: "8081"
  }
});

// Handle process signals
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

// Keep the process alive
goServer.on('close', (code) => {
  console.log(`Go server exited with code ${code}`);
  process.exit(code);
});
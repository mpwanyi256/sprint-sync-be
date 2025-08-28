#!/usr/bin/env node

/**
 * JWT Authentication Test Script
 * 
 * This script tests the JWT token generation and validation
 * to ensure the authentication system is working correctly.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔐 Testing JWT Authentication System...');

// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret-key-for-development';

// Run the TypeScript test file
const tsNode = spawn('npx', ['ts-node', 'src/test-auth.ts'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: { ...process.env }
});

tsNode.on('close', (code) => {
  if (code === 0) {
    console.log('✅ JWT Authentication test completed successfully!');
  } else {
    console.error('❌ JWT Authentication test failed with code:', code);
    process.exit(code);
  }
});

tsNode.on('error', (error) => {
  console.error('❌ Error running JWT Authentication test:', error);
  process.exit(1);
});

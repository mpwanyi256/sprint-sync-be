#!/usr/bin/env node

/**
 * User Seeding Script
 * 
 * This script populates the database with initial users for development/testing.
 * 
 * Usage:
 *   node scripts/seed-users.js
 *   npm run seed:users
 *   yarn seed:users
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting user seeding process...');

// Run the TypeScript file with ts-node
const tsNode = spawn('npx', ['ts-node', 'src/database/seedUsers.ts'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

tsNode.on('close', (code) => {
  if (code === 0) {
    console.log('✅ User seeding completed successfully!');
  } else {
    console.error('❌ User seeding failed with code:', code);
    process.exit(code);
  }
});

tsNode.on('error', (error) => {
  console.error('❌ Error running user seeding:', error);
  process.exit(1);
});

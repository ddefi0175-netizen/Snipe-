#!/usr/bin/env node
/**
 * Backend Health Check Script
 * 
 * This script can be used to verify the backend is running properly.
 * Usage: node healthcheck.js [url]
 * 
 * Default URL: http://localhost:4000/health
 */

const http = require('http');
const https = require('https');

const url = process.argv[2] || 'http://localhost:4000/health';
const parsedUrl = new URL(url);
const protocol = parsedUrl.protocol === 'https:' ? https : http;

console.log(`[Health Check] Checking: ${url}`);

const req = protocol.get(url, { timeout: 10000 }, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (res.statusCode === 200 && json.status === 'ok') {
        console.log('✓ Backend is healthy');
        console.log(`  MongoDB Connected: ${json.mongoConnected}`);
        
        if (json.realTimeData) {
          // Dynamic field logging
          const dataFields = [
            { key: 'users', label: 'Users' },
            { key: 'admins', label: 'Admins' },
            { key: 'trades', label: 'Trades' },
            { key: 'stakingPlans', label: 'Staking Plans' }
          ];
          
          dataFields.forEach(({ key, label }) => {
            if (json.realTimeData[key] !== undefined) {
              console.log(`  ${label}: ${json.realTimeData[key]}`);
            }
          });
        }
        
        console.log(`  Uptime: ${Math.floor(json.uptime)}s`);
        console.log(`  Last Checked: ${json.timestamp}`);
        process.exit(0);
      } else {
        console.error('✗ Backend returned unhealthy status');
        console.error(`  Status Code: ${res.statusCode}`);
        console.error(`  Response:`, json);
        process.exit(1);
      }
    } catch (e) {
      console.error('✗ Failed to parse health check response');
      console.error(`  Error: ${e.message}`);
      console.error(`  Raw Response: ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`✗ Health check failed: ${e.message}`);
  console.error('  Possible reasons:');
  console.error('    - Backend is not running');
  console.error('    - MongoDB connection failed');
  console.error('    - Network issues');
  console.error('    - Server is starting up (wait 30s and retry)');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('✗ Health check timed out after 10 seconds');
  console.error('  The backend may be under heavy load or starting up');
  req.destroy();
  process.exit(1);
});

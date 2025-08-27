// This script generates a service role key for Supabase
// The service role key has full access and bypasses RLS

const jwt = require('jsonwebtoken');

// Supabase JWT secret - this is the default for local development
// For production, you would need the actual JWT secret from your Supabase project
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

const payload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
};

const token = jwt.sign(payload, SUPABASE_JWT_SECRET, {
  algorithm: 'HS256',
});

console.log('Service Role Key:');
console.log(token);
console.log('\nAdd this to your .env.local file:');
console.log(`SUPABASE_SERVICE_ROLE_KEY=${token}`);
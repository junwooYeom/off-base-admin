// Script to test property approval with a valid admin token
const { SignJWT } = require('jose');

// Secret key for JWT - same as in admin-auth.ts
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'off-base-admin-dev-secret-key-2024'
);

async function createTestToken() {
  const token = await new SignJWT({ 
    id: 'test-admin-id',
    email: 'test@admin.com',
    is_super_admin: true,
    loggedInAt: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(SECRET_KEY);
  
  return token;
}

async function testApproval(propertyId) {
  const token = await createTestToken();
  
  const response = await fetch(`http://localhost:3001/api/admin/properties/${propertyId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `admin-token=${token}`
    }
  });
  
  const result = await response.json();
  console.log('Response status:', response.status);
  console.log('Response body:', result);
}

// Test with the property ID we found
testApproval('a46a9ca5-9106-4541-80ff-dc74bb186b19').catch(console.error);
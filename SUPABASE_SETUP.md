# Supabase Setup Guide for Admin/Realtor Platform

## Overview
This guide explains how to connect and use Supabase with your admin and realtor dashboards.

## 1. Supabase Project Setup

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Database Schema Setup

### Method 1: SQL Editor (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration
4. Copy and paste the contents of `supabase/migrations/002_row_level_security.sql`
5. Run the RLS setup

### Method 2: CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your_project_id

# Run migrations
supabase db push
```

## 3. Usage Examples

### Admin Queries

```typescript
import { adminQueries } from '@/lib/supabase-admin'

// Get all users with filters
const { data: users, error } = await adminQueries.users.getAll({
  status: 'PENDING',
  role: 'REALTOR'
})

// Update user status
await adminQueries.users.updateStatus(userId, 'ALLOWED')

// Get properties for verification
const { data: properties } = await adminQueries.properties.getAll({
  status: 'PENDING'
})

// Approve property
await adminQueries.properties.updateStatus(propertyId, 'APPROVED')
```

### Realtor Queries

```typescript
import { realtorQueries } from '@/lib/supabase-realtor'
import { useAuth } from '@/hooks/useAuth'

const { user } = useAuth()

// Get realtor's leads
const { data: leads } = await realtorQueries.leads.getAll(user.id, {
  status: 'NEW'
})

// Create new lead
await realtorQueries.leads.create(user.id, {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  source: 'Website'
})

// Get analytics
const { data: analytics } = await realtorQueries.analytics.getOverview(user.id, 'month')

// Create commission record
await realtorQueries.commissions.create(user.id, {
  property_id: 'property-uuid',
  sale_price: 500000,
  commission_rate: 2.5,
  split_rate: 50
})
```

### Real-time Updates

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

// Listen for new leads
useRealtimeUpdates({
  table: 'leads',
  filter: `realtor_id=eq.${user.id}`,
  event: 'INSERT',
  onUpdate: (payload) => {
    // Refresh leads list
    loadLeads()
  }
})

// Listen for property status changes
useRealtimeUpdates({
  table: 'properties',
  event: 'UPDATE',
  onUpdate: (payload) => {
    if (payload.new.status !== payload.old.status) {
      // Property status changed
      loadProperties()
    }
  }
})
```

## 4. Authentication Integration

### Custom Hook Usage
```typescript
import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    // Redirect to login
    return null
  }

  // User is authenticated
  return (
    <div>
      <p>Welcome {user.email}</p>
      {user.user_type === 'ADMIN' && <AdminPanel />}
      {user.user_type === 'REALTOR' && <RealtorPanel />}
    </div>
  )
}
```

## 5. Row Level Security (RLS)

The setup includes comprehensive RLS policies:

- **Admins**: Can view and manage all users and properties
- **Realtors**: Can only access their own leads, clients, and analytics
- **Users**: Can view their own profile and approved properties

## 6. Storage Setup

### Create Storage Buckets
```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'property-images', true),
  ('user-documents', 'user-documents', false),
  ('bulk-uploads', 'bulk-uploads', false);
```

### Storage Policies
```sql
-- Allow realtors to upload property images
CREATE POLICY "Realtors can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public can view property images
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');
```

## 7. Testing the Setup

### Test Admin Functions
```typescript
// Test in browser console or a test file
import { adminQueries } from '@/lib/supabase-admin'

// Get user stats
const stats = await adminQueries.stats.getOverview()
console.log('Admin stats:', stats)
```

### Test Realtor Functions
```typescript
import { realtorQueries } from '@/lib/supabase-realtor'

// Test lead creation
const lead = await realtorQueries.leads.create('realtor-uuid', {
  name: 'Test Lead',
  email: 'test@example.com'
})
console.log('Created lead:', lead)
```

## 8. Error Handling

All query functions return `{ data, error }` objects:

```typescript
const { data, error } = await realtorQueries.leads.getAll(userId)

if (error) {
  console.error('Error loading leads:', error)
  // Handle error (show toast, etc.)
  return
}

// Use data
setLeads(data || [])
```

## 9. Performance Optimization

### Indexes
The setup includes indexes for common queries:
- User lookups by role and status
- Property queries by status
- Lead queries by realtor and status
- Analytics queries by date

### Pagination
Use pagination for large datasets:
```typescript
const { data, count } = await adminQueries.users.getAll({
  page: 1,
  limit: 20
})
```

## 10. Deployment

1. Deploy your Next.js app
2. Update environment variables in production
3. Test all functionality in production environment

## 11. Monitoring

Use Supabase Dashboard to monitor:
- Database performance
- Auth users
- Storage usage
- Real-time connections

This setup provides a robust foundation for your admin and realtor platforms with proper security, real-time updates, and scalable architecture.
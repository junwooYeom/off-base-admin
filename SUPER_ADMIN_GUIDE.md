# Super Admin Feature Guide

## Overview
The Super Admin feature provides enhanced administrative privileges for managing the admin panel. Super Admins have additional capabilities beyond regular admins.

## Features

### Super Admin Capabilities
- **Manage Other Admins**: Approve, reject, or change status of admin accounts
- **Grant/Revoke Super Admin Privileges**: Promote regular admins to super admin or remove super admin privileges
- **Full System Access**: Access to all administrative features and data

### Regular Admin Limitations
- Cannot modify other admin accounts
- Cannot grant or revoke super admin privileges
- Limited to their assigned administrative tasks

## Database Structure

### admins Table
```sql
- id: UUID (Primary Key)
- email: VARCHAR (Unique)
- password_hash: VARCHAR
- status: VARCHAR ('PENDING', 'APPROVED', 'REJECTED')
- is_super_admin: BOOLEAN (default: false)
- created_at: TIMESTAMP
- approved_at: TIMESTAMP (nullable)
- approved_by: UUID (nullable)
```

## Setup Instructions

### 1. Initial Super Admin Setup

Use the provided script to set up your first super admin:

```bash
# Set your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
export SUPABASE_URL="https://dijtowiohxvwdnvgprud.supabase.co"

# Run the setup script
node scripts/setup-super-admin.js
```

The script provides the following options:
1. Create a new super admin
2. Promote existing admin to super admin
3. List all admins
4. Remove super admin privileges

### 2. Manual Database Setup

If you prefer to set up manually via SQL:

```sql
-- Make an existing admin a super admin
UPDATE public.admins 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

## UI Features

### Admin Management Page (/admin/admins)
- **Visual Indicators**:
  - Purple crown icon for super admins
  - Purple background highlighting for super admin rows
  - Role badges showing "슈퍼 관리자" (Super Admin) or "일반 관리자" (Regular Admin)

- **Actions Available to Super Admins**:
  - Approve/Reject pending admin requests
  - Toggle super admin status for approved admins
  - View all admin details and status

### Security Considerations

1. **Row Level Security (RLS)**:
   - Only super admins can modify other admin records
   - All admins can view the admin list
   - Regular admins can only view their own detailed information

2. **Best Practices**:
   - Always maintain at least one super admin account
   - Use strong passwords for super admin accounts
   - Regularly audit super admin access logs
   - Limit the number of super admin accounts

## API Endpoints

### GET /api/admin/current
Returns the current logged-in admin's information including super admin status:

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "is_super_admin": true
}
```

## Testing the Feature

1. **Create a Test Super Admin**:
```bash
node scripts/setup-super-admin.js
# Choose option 1 and follow the prompts
```

2. **Login to Admin Panel**:
- Navigate to `/admin/auth/login`
- Use the super admin credentials

3. **Test Permissions**:
- Go to `/admin/admins`
- Verify you can see the "작업" (Actions) column
- Test promoting/demoting admin privileges
- Verify regular admins cannot see action buttons

## Troubleshooting

### Common Issues

1. **Cannot see super admin features**:
   - Ensure the admin account has `is_super_admin = true` in the database
   - Clear browser cache and re-login
   - Check browser console for API errors

2. **Script fails to connect**:
   - Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
   - Check network connection to Supabase
   - Ensure the project is active and not paused

3. **RLS policies blocking access**:
   - Review the RLS policies on the admins table
   - Ensure policies are enabled and correctly configured

## Migration Rollback

If you need to remove the super admin feature:

```sql
-- Remove the column and related policies
ALTER TABLE public.admins DROP COLUMN IF EXISTS is_super_admin;
DROP POLICY IF EXISTS "Super admins can update admin status" ON public.admins;
```

## Future Enhancements

Potential improvements for the super admin feature:
- Audit logs for super admin actions
- Two-factor authentication for super admins
- Time-limited super admin sessions
- Role-based permissions system
- Email notifications for critical actions
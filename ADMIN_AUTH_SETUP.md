# Admin Authentication Setup

## Overview
The admin system uses a simple and secure authentication system with admin approval.

## Features
1. **Simple Signup**: Direct registration without email confirmation
2. **Admin Approval Required**: All new admins must be approved by existing admins
3. **Secure Password Storage**: Passwords are hashed with bcrypt

## Setup Instructions

### Default Admin Account
The system comes with a pre-approved admin account:
- **Email**: `luminate5991@gmail.com`
- **Password**: `LuMiNaTe123!`

You can login directly at `/admin/auth/login` with these credentials.

### Creating Additional Admins

1. **New admin signs up** at `/admin/auth/signup`
2. **Existing admin approves** from `/admin/admins` dashboard
3. **New admin can login** at `/admin/auth/login`

## Authentication Flow

```
User Signs Up → Admin Status: PENDING → 
Existing Admin Approves → Admin Status: APPROVED → User Can Login
```

## Routes
- **Login**: `/admin/auth/login`
- **Signup**: `/admin/auth/signup`
- **Admin Management**: `/admin/admins` (for approving new admins)

## Security Features
- Passwords hashed with bcrypt
- JWT tokens for session management
- Manual admin approval required
- 24-hour session expiry

## Database Structure
The `admins` table includes:
- `id`: UUID primary key
- `email`: Unique email address
- `auth_uid`: Optional Supabase Auth user ID (for future use)
- `password_hash`: Bcrypt hashed password
- `status`: PENDING | APPROVED | REJECTED
- `created_at`: Timestamp
- `approved_at`: Approval timestamp
- `approved_by`: ID of approving admin

## Important Notes
- All admins use `/admin/auth/login` for authentication
- No email confirmation required
- Admin approval is the only requirement after signup
- Sessions expire after 24 hours for security
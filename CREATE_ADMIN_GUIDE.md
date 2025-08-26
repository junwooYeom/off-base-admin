# Create Admin Account Guide

## Admin Account Details
- **Email**: luminate5991@gmail.com
- **Password**: LuMiNaTe123!
- **Password Hash**: `$2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm`

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project (the one with URL: `bjwhxrapqobyjccnviud.supabase.co`)

2. **Navigate to Table Editor**
   - In the left sidebar, click on "Table Editor"
   - Find and select the `admins` table

3. **Insert New Row**
   - Click the "Insert row" button
   - Fill in the following fields:
     - `email`: luminate5991@gmail.com
     - `password_hash`: $2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm
     - `status`: APPROVED
     - `created_at`: (leave as current timestamp or click "now")
     - `approved_at`: (leave as current timestamp or click "now")
   - Click "Save"

## Method 2: Using SQL Editor in Supabase

1. **Go to SQL Editor**
   - In Supabase Dashboard, click on "SQL Editor" in the left sidebar

2. **Run this SQL command**:
```sql
INSERT INTO admins (
    email,
    password_hash,
    status,
    created_at,
    approved_at
) VALUES (
    'luminate5991@gmail.com',
    '$2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm',
    'APPROVED',
    NOW(),
    NOW()
);
```

3. **Execute the query**
   - Click "Run" or press Cmd/Ctrl + Enter

## Method 3: Temporarily Disable RLS (Not Recommended for Production)

If you have admin access to the database:

1. **Disable RLS temporarily**:
```sql
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

2. **Insert the admin**:
```sql
INSERT INTO admins (
    email,
    password_hash,
    status,
    created_at,
    approved_at
) VALUES (
    'luminate5991@gmail.com',
    '$2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm',
    'APPROVED',
    NOW(),
    NOW()
);
```

3. **Re-enable RLS**:
```sql
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
```

## After Creating the Admin

Once the admin is created, you can:

1. **Login to the Admin Panel**
   - Go to: http://localhost:3000/admin/auth/login
   - Email: luminate5991@gmail.com
   - Password: LuMiNaTe123!

2. **Verify Login**
   - You should be redirected to the admin dashboard
   - You can now access all admin features

## Troubleshooting

If you can't login after creating the admin:

1. **Check the admin exists**:
   - Go to Supabase Dashboard > Table Editor > admins table
   - Verify the row exists with email: luminate5991@gmail.com

2. **Check the status**:
   - Make sure `status` is set to `APPROVED`
   - If it's `PENDING`, update it to `APPROVED`

3. **Check the password hash**:
   - Ensure the password_hash field contains exactly:
   - `$2b$10$/Q/k1aGN5M4c1IF3XtY/8.e233P6ktA/ix4KYEvdZ/FwZLhwRYstm`

4. **Clear browser cache**:
   - Sometimes old session data can interfere
   - Try incognito/private browsing mode

## Alternative: Create via Sign-up Flow

If manual insertion doesn't work:

1. Go to: http://localhost:3000/admin/auth/signup
2. Register with:
   - Email: luminate5991@gmail.com
   - Password: LuMiNaTe123!
3. Then manually approve in Supabase:
   - Go to admins table
   - Find the row with this email
   - Change `status` from `PENDING` to `APPROVED`
   - Set `approved_at` to current timestamp

## Security Note

After successfully logging in, consider:
- Creating additional admin accounts through the admin panel
- Setting up proper RLS policies for the admins table
- Using environment variables for sensitive data
-- Create admin user for luminate5991@gmail.com
-- Password: LuMiNaTe123!
-- BCrypt hash generated for the password

-- First check if admin exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admins WHERE email = 'luminate5991@gmail.com') THEN
        -- Insert new admin with APPROVED status
        INSERT INTO admins (
            email,
            password_hash,
            status,
            created_at,
            approved_at
        ) VALUES (
            'luminate5991@gmail.com',
            -- BCrypt hash for 'LuMiNaTe123!' with salt rounds 10
            '$2a$10$K5JKGxrPvGZ8xXjP3qYLXOVxqVHWMF8Gy1Y0YPbzjKnVSYoXXXXXX',
            'APPROVED',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Admin created successfully!';
    ELSE
        -- Update existing admin to APPROVED status
        UPDATE admins 
        SET status = 'APPROVED',
            approved_at = NOW()
        WHERE email = 'luminate5991@gmail.com';
        RAISE NOTICE 'Admin status updated to APPROVED!';
    END IF;
END $$;

-- Verify the admin was created/updated
SELECT id, email, status, created_at, approved_at 
FROM admins 
WHERE email = 'luminate5991@gmail.com';
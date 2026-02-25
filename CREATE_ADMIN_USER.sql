-- =====================================================
-- CREATE ADMIN USER FOR ZEROSCHOOL
-- =====================================================

-- STEP 1: First, you need to create a user account in Supabase
-- Go to: Authentication > Users > Add User
-- Or use this SQL to create a user directly:

-- Create admin user (replace with your email and password)
-- Note: This creates the user in Supabase Auth
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@zeroschool.com', -- Change this to your email
    crypt('Admin@123', gen_salt('bf')), -- Change this to your password
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- STEP 2: Get the user ID (run this after creating the user)
-- This will show you the user ID that was just created
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@zeroschool.com';

-- STEP 3: Assign admin role to the user
-- Replace 'USER_ID_HERE' with the actual UUID from Step 2
INSERT INTO public.user_roles (user_id, role)
VALUES (
    'USER_ID_HERE', -- Replace with actual user ID from Step 2
    'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- ALTERNATIVE: EASIER METHOD USING SUPABASE DASHBOARD
-- =====================================================

-- METHOD 1: Create user through Supabase Dashboard (RECOMMENDED)
-- 1. Go to: https://supabase.com/dashboard/project/fqjsamabpcvxwunpvovs/auth/users
-- 2. Click "Add User" button
-- 3. Enter:
--    - Email: admin@zeroschool.com (or your email)
--    - Password: Admin@123 (or your password)
--    - Auto Confirm User: YES (check this box)
-- 4. Click "Create User"
-- 5. Copy the User ID (UUID) that appears
-- 6. Run the query below with that User ID

-- METHOD 2: After creating user in dashboard, assign admin role
-- Replace 'PASTE_USER_ID_HERE' with the UUID from the dashboard
INSERT INTO public.user_roles (user_id, role)
VALUES (
    'PASTE_USER_ID_HERE', -- Paste the UUID here
    'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- QUICK SETUP: ALL-IN-ONE COMMAND
-- =====================================================

-- This creates a test admin user with a known ID
-- Email: admin@zeroschool.com
-- Password: Admin@123

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Generate a specific UUID for the admin user
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'admin@zeroschool.com',
        crypt('Admin@123', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Admin User"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Insert into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    
    -- Show the created user
    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Email: admin@zeroschool.com';
    RAISE NOTICE 'Password: Admin@123';
    RAISE NOTICE 'User ID: %', v_user_id;
END $$;

-- =====================================================
-- VERIFY ADMIN USER
-- =====================================================

-- Check if admin user exists
SELECT 
    u.id,
    u.email,
    u.created_at,
    ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@zeroschool.com';

-- =====================================================
-- LOGIN CREDENTIALS
-- =====================================================

-- After running the script above, use these credentials to login:
-- Email: admin@zeroschool.com
-- Password: Admin@123

-- Then navigate to: http://localhost:5173/ZSINA/dashboard
-- (or your app URL + /ZSINA/dashboard)

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get "user already exists" error, find and update the existing user:
SELECT id, email FROM auth.users WHERE email = 'admin@zeroschool.com';

-- Then assign admin role using the ID from above:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('paste-user-id-here', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- CREATE ADDITIONAL ADMIN USERS
-- =====================================================

-- To create more admin users, change the email and run:
DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'another-admin@zeroschool.com'; -- Change this
    v_password TEXT := 'SecurePassword123'; -- Change this
BEGIN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token,
        email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id, 'authenticated', 'authenticated',
        v_email, crypt(v_password, gen_salt('bf')),
        NOW(), '{"provider":"email","providers":["email"]}',
        '{"name":"Admin User"}', NOW(), NOW(), '', '', '', ''
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    
    RAISE NOTICE 'Admin user created: % / %', v_email, v_password;
END $$;

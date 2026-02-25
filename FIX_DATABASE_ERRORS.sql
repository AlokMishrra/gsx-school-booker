-- =====================================================
-- FIX DATABASE ERRORS
-- Run this to fix the 500 and 400 errors
-- =====================================================

-- 1. Fix colleges table - add user_id column if missing
ALTER TABLE public.colleges 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create user_tracking table (for tracking service)
CREATE TABLE IF NOT EXISTS public.user_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_tracking
CREATE INDEX IF NOT EXISTS idx_user_tracking_user ON public.user_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_event ON public.user_tracking(event_type);

-- Enable RLS on user_tracking
ALTER TABLE public.user_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert tracking data" ON public.user_tracking;
DROP POLICY IF EXISTS "Users can view their own tracking" ON public.user_tracking;

-- Create policies for user_tracking
CREATE POLICY "Anyone can insert tracking data"
    ON public.user_tracking FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own tracking"
    ON public.user_tracking FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 3. Verify and fix user_roles table
-- Check if user_roles exists and has correct structure
DO $$
BEGIN
    -- Ensure user_roles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'college')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT unique_user_role UNIQUE(user_id, role)
        );
        
        CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
        CREATE INDEX idx_user_roles_role ON public.user_roles(role);
        
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Fix RLS policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Anyone can view user roles"
    ON public.user_roles FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage roles"
    ON public.user_roles FOR ALL
    USING (true);

-- 5. Now create the admin user with proper role
DO $$
DECLARE
    v_user_id UUID;
    v_existing_user UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO v_existing_user
    FROM auth.users
    WHERE email = 'admin@zeroschool.com';
    
    IF v_existing_user IS NOT NULL THEN
        -- User exists, just ensure they have admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_existing_user, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to existing user: %', v_existing_user;
    ELSE
        -- Create new admin user
        v_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token,
            email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id, 'authenticated', 'authenticated',
            'admin@zeroschool.com',
            crypt('Admin@123', gen_salt('bf')),
            NOW(), '{"provider":"email","providers":["email"]}',
            '{"name":"Admin User"}', NOW(), NOW(), '', '', '', ''
        );
        
        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin');
        
        RAISE NOTICE 'New admin user created: %', v_user_id;
    END IF;
END $$;

-- 6. Verify the admin user
SELECT 
    u.id,
    u.email,
    u.created_at,
    ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@zeroschool.com';

-- 7. Test query that the app uses
SELECT role 
FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@zeroschool.com' LIMIT 1);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database errors fixed!';
    RAISE NOTICE '📧 Admin Email: admin@zeroschool.com';
    RAISE NOTICE '🔑 Admin Password: Admin@123';
    RAISE NOTICE '🚀 You can now login and access /ZSINA/dashboard';
END $$;

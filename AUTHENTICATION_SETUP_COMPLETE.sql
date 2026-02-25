-- =====================================================
-- AUTHENTICATION SYSTEM - COMPLETE SETUP
-- =====================================================
-- This file documents the authentication system for the booking platform
-- The tables are already created in migration: 20260202094320_d26f45b6-371a-4959-b4b0-3689f97e2678.sql

-- =====================================================
-- EXISTING TABLES OVERVIEW
-- =====================================================

/*
1. auth.users (Supabase built-in)
   - Handles user authentication (email/password)
   - Automatically created by Supabase

2. public.user_roles
   - Stores user roles (admin/user)
   - Automatically assigns 'user' role on signup
   - Links to auth.users via user_id

3. public.colleges
   - Stores college profile information
   - Links to auth.users via user_id
   - Created when user registers
*/

-- =====================================================
-- VERIFY TABLES EXIST
-- =====================================================

-- Check if colleges table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'colleges'
) AS colleges_table_exists;

-- Check if user_roles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
) AS user_roles_table_exists;

-- =====================================================
-- VIEW CURRENT STRUCTURE
-- =====================================================

-- View colleges table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'colleges'
ORDER BY ordinal_position;

-- View user_roles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- =====================================================
-- HELPFUL QUERIES FOR TESTING
-- =====================================================

-- 1. View all registered colleges
SELECT 
    c.id,
    c.name AS college_name,
    c.contact_person,
    c.email,
    c.phone,
    c.created_at,
    u.email AS auth_email,
    u.created_at AS user_created_at
FROM public.colleges c
JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- 2. View all users with their roles
SELECT 
    u.id AS user_id,
    u.email,
    u.created_at AS registered_at,
    COALESCE(
        ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL),
        ARRAY['user']::app_role[]
    ) AS roles,
    c.name AS college_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.colleges c ON u.id = c.user_id
GROUP BY u.id, u.email, u.created_at, c.name
ORDER BY u.created_at DESC;

-- 3. Check if a specific email is registered
-- Replace 'test@example.com' with the email you want to check
SELECT 
    u.email,
    u.created_at,
    c.name AS college_name,
    c.contact_person
FROM auth.users u
LEFT JOIN public.colleges c ON u.id = c.user_id
WHERE u.email = 'test@example.com';

-- 4. View admin users
SELECT 
    u.id,
    u.email,
    ur.role,
    ur.created_at AS role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- =====================================================
-- CREATE ADMIN USER (IF NEEDED)
-- =====================================================

-- Step 1: First create the user in Supabase Dashboard or via signup
-- Step 2: Then run this query to make them admin
-- Replace 'admin@example.com' with the actual admin email

DO $
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'admin@example.com'
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Add admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to user: %', v_user_id;
    ELSE
        RAISE NOTICE 'User not found with email: admin@example.com';
    END IF;
END $;

-- =====================================================
-- TEST DATA - CREATE SAMPLE COLLEGE USER
-- =====================================================

-- Note: This is for testing only. In production, users register via the UI
-- You cannot directly insert into auth.users - use Supabase signup instead

-- After a user signs up via the Register page, their college profile is created
-- The Register.tsx page handles this automatically

-- =====================================================
-- VERIFY AUTHENTICATION FLOW
-- =====================================================

-- 1. Check if auto-role trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('colleges', 'user_roles')
ORDER BY tablename;

-- 3. View all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('colleges', 'user_roles')
ORDER BY tablename, policyname;

-- =====================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- =====================================================

-- Delete a specific college (and cascade to user)
-- CAUTION: This will delete the user from auth.users too!
-- DELETE FROM public.colleges WHERE email = 'test@example.com';

-- Remove admin role from a user
-- DELETE FROM public.user_roles 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com')
-- AND role = 'admin';

-- =====================================================
-- STATISTICS
-- =====================================================

-- Count total registered users
SELECT COUNT(*) AS total_users FROM auth.users;

-- Count total colleges
SELECT COUNT(*) AS total_colleges FROM public.colleges;

-- Count admin users
SELECT COUNT(*) AS total_admins 
FROM public.user_roles 
WHERE role = 'admin';

-- Registration statistics by date
SELECT 
    DATE(created_at) AS registration_date,
    COUNT(*) AS registrations
FROM auth.users
GROUP BY DATE(created_at)
ORDER BY registration_date DESC
LIMIT 30;

-- =====================================================
-- NOTES
-- =====================================================

/*
AUTHENTICATION FLOW:

1. USER REGISTRATION (via /register page):
   - User fills registration form (college name, contact person, email, phone, address, password)
   - Frontend calls: supabase.auth.signUp({ email, password })
   - Supabase creates user in auth.users
   - Trigger automatically creates entry in user_roles with role='user'
   - Frontend creates entry in colleges table with user profile data
   - User receives verification email (if email confirmation enabled)

2. USER LOGIN (via /login page):
   - User enters email and password
   - Frontend calls: supabase.auth.signInWithPassword({ email, password })
   - Supabase validates credentials
   - Returns session token
   - Frontend checks user_roles to determine if admin
   - Redirects to appropriate page (admin dashboard or schools page)

3. BOOKING FLOW:
   - User must be authenticated (checked via useAuth hook)
   - If not authenticated, shows dialog with Login/Register options
   - After authentication, user can book sessions
   - Bookings are linked to college_id from colleges table

4. ADMIN ACCESS:
   - Admin users have role='admin' in user_roles table
   - Can access /ZSINA/dashboard and other admin routes
   - Can manage schools, bookings, and view analytics

SECURITY:
- Row Level Security (RLS) enabled on all tables
- Users can only view/edit their own data
- Admins can view/edit all data
- Public can view active schools (read-only)
- All policies use security definer functions to prevent recursion

FILES:
- Frontend: src/pages/Login.tsx, src/pages/Register.tsx
- Auth Context: src/contexts/AuthContext.tsx
- Migration: supabase/migrations/20260202094320_d26f45b6-371a-4959-b4b0-3689f97e2678.sql
*/

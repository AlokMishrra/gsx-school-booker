-- =====================================================
-- COMPLETE AUTHENTICATION SCHEMA SETUP - FIXED VERSION
-- =====================================================
-- This file creates all necessary tables and policies for user authentication
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE ENUMS
-- =====================================================

-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- STEP 2: CREATE USER_ROLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- =====================================================
-- STEP 3: CREATE COLLEGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_colleges_user_id ON public.colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_colleges_email ON public.colleges(email);

-- =====================================================
-- STEP 4: CREATE SCHOOLS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  state TEXT,
  city TEXT,
  tier INTEGER CHECK (tier IN (1, 2, 3)),
  student_strength INTEGER,
  school_fee TEXT,
  average_fee TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schools_city ON public.schools(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_state ON public.schools(state) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_tier ON public.schools(tier) WHERE tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_active ON public.schools(is_active);

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Function to get college_id for current user
CREATE OR REPLACE FUNCTION public.get_college_id(_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_college_id UUID;
BEGIN
  SELECT id INTO v_college_id
  FROM public.colleges
  WHERE user_id = _user_id
  LIMIT 1;
  
  RETURN v_college_id;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 7: CREATE RLS POLICIES FOR USER_ROLES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STEP 8: CREATE RLS POLICIES FOR COLLEGES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Colleges can view their own profile" ON public.colleges;
DROP POLICY IF EXISTS "Colleges can update their own profile" ON public.colleges;
DROP POLICY IF EXISTS "Colleges can insert their own profile" ON public.colleges;
DROP POLICY IF EXISTS "Admins can view all colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can manage all colleges" ON public.colleges;

-- Colleges can view their own profile
CREATE POLICY "Colleges can view their own profile"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Colleges can update their own profile
CREATE POLICY "Colleges can update their own profile"
  ON public.colleges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Colleges can insert their own profile
CREATE POLICY "Colleges can insert their own profile"
  ON public.colleges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all colleges
CREATE POLICY "Admins can view all colleges"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all colleges
CREATE POLICY "Admins can manage all colleges"
  ON public.colleges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STEP 9: CREATE RLS POLICIES FOR SCHOOLS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can view all schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON public.schools;

-- Anyone can view active schools (public read)
CREATE POLICY "Anyone can view active schools"
  ON public.schools FOR SELECT
  USING (is_active = true);

-- Admins can view all schools
CREATE POLICY "Admins can view all schools"
  ON public.schools FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage schools
CREATE POLICY "Admins can manage schools"
  ON public.schools FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STEP 10: CREATE TRIGGERS
-- =====================================================

-- Trigger for colleges updated_at
DROP TRIGGER IF EXISTS update_colleges_updated_at ON public.colleges;
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for schools updated_at
DROP TRIGGER IF EXISTS update_schools_updated_at ON public.schools;
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 11: AUTO-CREATE USER ROLE ON SIGNUP
-- =====================================================

-- Function to auto-create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create user role on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 12: GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.schools TO anon, authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.colleges TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_college_id TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('user_roles', 'colleges', 'schools');
    
    RAISE NOTICE 'Tables created: % out of 3', v_count;
END $$;

-- Check if RLS is enabled
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('user_roles', 'colleges', 'schools')
    AND rowsecurity = true;
    
    RAISE NOTICE 'Tables with RLS enabled: % out of 3', v_count;
END $$;

-- Check if trigger exists
DO $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_created'
    ) INTO v_exists;
    
    IF v_exists THEN
        RAISE NOTICE 'Auto-role trigger: ✓ Created';
    ELSE
        RAISE NOTICE 'Auto-role trigger: ✗ Not found';
    END IF;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTHENTICATION SCHEMA SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  ✓ user_roles';
    RAISE NOTICE '  ✓ colleges';
    RAISE NOTICE '  ✓ schools';
    RAISE NOTICE '';
    RAISE NOTICE 'Security enabled:';
    RAISE NOTICE '  ✓ Row Level Security (RLS)';
    RAISE NOTICE '  ✓ Policies configured';
    RAISE NOTICE '  ✓ Auto-role assignment trigger';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Test registration at /register';
    RAISE NOTICE '  2. Test login at /login';
    RAISE NOTICE '  3. Create admin user (see below)';
    RAISE NOTICE '';
    RAISE NOTICE 'To create an admin user:';
    RAISE NOTICE '  INSERT INTO public.user_roles (user_id, role)';
    RAISE NOTICE '  SELECT id, ''admin'' FROM auth.users';
    RAISE NOTICE '  WHERE email = ''your@email.com''';
    RAISE NOTICE '  ON CONFLICT DO NOTHING;';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

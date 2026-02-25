-- =====================================================
-- REBUILD COLLEGES TABLE - COMPLETE FIX
-- =====================================================
-- This drops and recreates the colleges table with correct schema

-- Step 1: Drop existing table (this will also drop related data)
DROP TABLE IF EXISTS public.colleges CASCADE;

-- Step 2: Create colleges table with correct schema
CREATE TABLE public.colleges (
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

-- Step 3: Create indexes
CREATE INDEX idx_colleges_user_id ON public.colleges(user_id);
CREATE INDEX idx_colleges_email ON public.colleges(email);

-- Step 4: Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Colleges can view their own profile"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Colleges can update their own profile"
  ON public.colleges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Colleges can insert their own profile"
  ON public.colleges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all colleges"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all colleges"
  ON public.colleges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 6: Create trigger for updated_at
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Grant permissions
GRANT ALL ON public.colleges TO authenticated;

-- Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'colleges'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COLLEGES TABLE REBUILT SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '  ✓ id (UUID)';
    RAISE NOTICE '  ✓ user_id (UUID)';
    RAISE NOTICE '  ✓ name (TEXT)';
    RAISE NOTICE '  ✓ contact_person (TEXT)';
    RAISE NOTICE '  ✓ email (TEXT)';
    RAISE NOTICE '  ✓ phone (TEXT)';
    RAISE NOTICE '  ✓ address (TEXT)';
    RAISE NOTICE '  ✓ created_at (TIMESTAMPTZ)';
    RAISE NOTICE '  ✓ updated_at (TIMESTAMPTZ)';
    RAISE NOTICE '';
    RAISE NOTICE 'Security:';
    RAISE NOTICE '  ✓ RLS enabled';
    RAISE NOTICE '  ✓ Policies created';
    RAISE NOTICE '  ✓ Trigger added';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to test registration!';
    RAISE NOTICE '========================================';
END $$;

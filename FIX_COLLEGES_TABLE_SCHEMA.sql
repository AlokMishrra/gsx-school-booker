-- =====================================================
-- FIX COLLEGES TABLE SCHEMA
-- =====================================================
-- This adds missing columns to the colleges table

-- Add contact_person column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'colleges' 
        AND column_name = 'contact_person'
    ) THEN
        ALTER TABLE public.colleges 
        ADD COLUMN contact_person TEXT NOT NULL DEFAULT 'Contact Person';
        
        RAISE NOTICE 'Added contact_person column to colleges table';
    ELSE
        RAISE NOTICE 'contact_person column already exists';
    END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'colleges' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.colleges 
        ADD COLUMN phone TEXT NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Added phone column to colleges table';
    ELSE
        RAISE NOTICE 'phone column already exists';
    END IF;
END $$;

-- Add address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'colleges' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.colleges 
        ADD COLUMN address TEXT NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Added address column to colleges table';
    ELSE
        RAISE NOTICE 'address column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'colleges'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COLLEGES TABLE SCHEMA FIXED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Columns verified:';
    RAISE NOTICE '  ✓ id';
    RAISE NOTICE '  ✓ user_id';
    RAISE NOTICE '  ✓ name';
    RAISE NOTICE '  ✓ contact_person';
    RAISE NOTICE '  ✓ email';
    RAISE NOTICE '  ✓ phone';
    RAISE NOTICE '  ✓ address';
    RAISE NOTICE '  ✓ created_at';
    RAISE NOTICE '  ✓ updated_at';
    RAISE NOTICE '';
    RAISE NOTICE 'Try registration again!';
    RAISE NOTICE '========================================';
END $$;

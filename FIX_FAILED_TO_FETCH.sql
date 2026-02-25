-- =====================================================
-- FIX "FAILED TO FETCH" ERROR
-- This script ensures all required tables exist
-- =====================================================

-- Check if tables exist
DO $$
DECLARE
    v_schools_exists BOOLEAN;
    v_sessions_exists BOOLEAN;
BEGIN
    -- Check if schools table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schools'
    ) INTO v_schools_exists;
    
    -- Check if career_fair_sessions table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'career_fair_sessions'
    ) INTO v_sessions_exists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 TABLE CHECK';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schools table exists: %', v_schools_exists;
    RAISE NOTICE 'Sessions table exists: %', v_sessions_exists;
    RAISE NOTICE '========================================';
    
    IF NOT v_schools_exists OR NOT v_sessions_exists THEN
        RAISE NOTICE '❌ TABLES MISSING!';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 TO FIX:';
        RAISE NOTICE '1. Run FRESH_DATABASE_SETUP.sql';
        RAISE NOTICE '2. This will create all required tables';
        RAISE NOTICE '3. Then refresh your website';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '✅ All required tables exist';
        RAISE NOTICE '';
        RAISE NOTICE '🔍 CHECKING DATA...';
    END IF;
END $$;

-- If tables exist, check data
DO $$
DECLARE
    v_schools_count INTEGER;
    v_sessions_count INTEGER;
BEGIN
    -- Only run if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schools') THEN
        SELECT COUNT(*) INTO v_schools_count FROM public.schools WHERE is_active = true;
        SELECT COUNT(*) INTO v_sessions_count FROM public.career_fair_sessions;
        
        RAISE NOTICE '========================================';
        RAISE NOTICE '📊 DATA CHECK';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Active schools: %', v_schools_count;
        RAISE NOTICE 'Total sessions: %', v_sessions_count;
        RAISE NOTICE '========================================';
        
        IF v_schools_count = 0 THEN
            RAISE NOTICE '❌ NO SCHOOLS IN DATABASE!';
            RAISE NOTICE '';
            RAISE NOTICE '🔧 TO FIX:';
            RAISE NOTICE '1. Run QUICK_TEST_SCHOOLS.sql (adds 3 test schools)';
            RAISE NOTICE '   OR';
            RAISE NOTICE '2. Run ADD_ALL_STATES_SCHOOLS.sql (adds 70+ schools)';
            RAISE NOTICE '';
        ELSE
            RAISE NOTICE '✅ Schools found in database';
            RAISE NOTICE '';
            RAISE NOTICE '🔍 CHECKING RLS POLICIES...';
        END IF;
    END IF;
END $$;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('schools', 'career_fair_sessions')
ORDER BY tablename, policyname;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 NEXT STEPS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'If tables are missing:';
    RAISE NOTICE '  → Run FRESH_DATABASE_SETUP.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'If tables exist but no schools:';
    RAISE NOTICE '  → Run QUICK_TEST_SCHOOLS.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'After running scripts:';
    RAISE NOTICE '  → Restart dev server (Ctrl+C, then npm run dev)';
    RAISE NOTICE '  → Refresh browser (F5)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

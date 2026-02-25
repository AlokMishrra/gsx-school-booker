-- =====================================================
-- CHECK DATABASE DATA
-- Run this to verify if you have schools in your database
-- =====================================================

-- Check if schools table exists and has data
SELECT 
    COUNT(*) as total_schools,
    COUNT(*) FILTER (WHERE is_active = true) as active_schools
FROM public.schools;

-- Show sample schools
SELECT 
    id,
    name,
    city,
    state,
    tier,
    is_active
FROM public.schools
LIMIT 10;

-- Check if career_fair_sessions table has data
SELECT 
    COUNT(*) as total_sessions
FROM public.career_fair_sessions;

-- =====================================================
-- DIAGNOSIS
-- =====================================================

DO $$
DECLARE
    v_schools INTEGER;
    v_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_schools FROM public.schools WHERE is_active = true;
    SELECT COUNT(*) INTO v_sessions FROM public.career_fair_sessions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 DATABASE STATUS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Active Schools: %', v_schools;
    RAISE NOTICE 'Total Sessions: %', v_sessions;
    RAISE NOTICE '========================================';
    
    IF v_schools = 0 THEN
        RAISE NOTICE '❌ NO SCHOOLS FOUND!';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 TO FIX:';
        RAISE NOTICE '1. Run FRESH_DATABASE_SETUP.sql first';
        RAISE NOTICE '2. Then run ADD_ALL_STATES_SCHOOLS.sql';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '✅ Schools found in database';
        RAISE NOTICE '✅ Your website should show schools';
        RAISE NOTICE '';
        IF v_sessions = 0 THEN
            RAISE NOTICE '⚠️  No sessions found';
            RAISE NOTICE 'Run the session creation part of the script';
        END IF;
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

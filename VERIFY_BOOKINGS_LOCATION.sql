-- =====================================================
-- VERIFY BOOKINGS LOCATION
-- This script helps you verify where bookings are stored
-- =====================================================

-- =====================================================
-- IMPORTANT: WHERE TO FIND YOUR BOOKINGS
-- =====================================================

/*
🎯 YOUR BOOKINGS ARE STORED IN: career_fair_sessions table

❌ NOT in the "bookings" table (that's for a different feature)
✅ YES in the "career_fair_sessions" table

To view your bookings in Supabase:
1. Go to Table Editor
2. Select "career_fair_sessions" table
3. Filter by: is_booked = true
4. You will see all bookings with booking_data column containing user info
*/

-- =====================================================
-- QUERY 1: Count all bookings in career_fair_sessions
-- =====================================================

SELECT 
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE session_type = 'physical') as physical_bookings,
    COUNT(*) FILTER (WHERE session_type = 'career_fair') as career_fair_bookings
FROM public.career_fair_sessions
WHERE is_booked = true;

-- =====================================================
-- QUERY 2: View all bookings with details
-- =====================================================

SELECT 
    cfs.id,
    s.name as school_name,
    s.city,
    cfs.session_type,
    cfs.slot_number,
    cfs.session_date,
    cfs.start_time,
    cfs.end_time,
    cfs.is_booked,
    cfs.booking_data->>'college_name' as college_name,
    cfs.booking_data->>'user_name' as user_name,
    cfs.booking_data->>'phone_number' as phone_number,
    cfs.booking_data->>'email' as email,
    cfs.booking_data->>'booked_at' as booked_at,
    cfs.created_at
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
ORDER BY cfs.created_at DESC;

-- =====================================================
-- QUERY 3: View bookings grouped by school
-- =====================================================

SELECT 
    s.name as school_name,
    s.city,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE cfs.session_type = 'physical') as physical_bookings,
    COUNT(*) FILTER (WHERE cfs.session_type = 'career_fair') as career_fair_bookings
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
GROUP BY s.name, s.city
ORDER BY total_bookings DESC;

-- =====================================================
-- QUERY 4: View bookings grouped by college
-- =====================================================

SELECT 
    cfs.booking_data->>'college_name' as college_name,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE cfs.session_type = 'physical') as physical_bookings,
    COUNT(*) FILTER (WHERE cfs.session_type = 'career_fair') as career_fair_bookings,
    array_agg(DISTINCT s.name) as schools_booked
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
GROUP BY cfs.booking_data->>'college_name'
ORDER BY total_bookings DESC;

-- =====================================================
-- QUERY 5: Check if bookings table has any data
-- =====================================================

-- This table is for a DIFFERENT feature (old inventory system)
-- Your career fair bookings are NOT stored here
SELECT 
    COUNT(*) as bookings_table_count,
    'This table is for inventory bookings, not career fair bookings' as note
FROM public.bookings;

-- =====================================================
-- QUERY 6: View recent bookings with full details
-- =====================================================

SELECT 
    cfs.id,
    s.name as school_name,
    s.city,
    s.tier,
    CASE 
        WHEN cfs.session_type = 'physical' THEN 'P' || cfs.slot_number
        ELSE 'CF' || cfs.slot_number
    END as slot_label,
    cfs.session_date,
    cfs.start_time || ' - ' || cfs.end_time as time_range,
    cfs.booking_data->>'college_name' as college,
    cfs.booking_data->>'user_name' as booked_by,
    cfs.booking_data->>'phone_number' as phone,
    cfs.booking_data->>'email' as email,
    TO_CHAR(
        (cfs.booking_data->>'booked_at')::timestamptz, 
        'YYYY-MM-DD HH24:MI:SS'
    ) as booking_time
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
ORDER BY (cfs.booking_data->>'booked_at')::timestamptz DESC
LIMIT 20;

-- =====================================================
-- QUERY 7: Verify table structure
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'career_fair_sessions'
ORDER BY ordinal_position;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
    v_total_bookings INTEGER;
    v_total_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_bookings
    FROM public.career_fair_sessions
    WHERE is_booked = true;
    
    SELECT COUNT(*) INTO v_total_sessions
    FROM public.career_fair_sessions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 BOOKING SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Total Sessions: %', v_total_sessions;
    RAISE NOTICE '✅ Booked Sessions: %', v_total_bookings;
    RAISE NOTICE '✅ Available Sessions: %', v_total_sessions - v_total_bookings;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TO VIEW BOOKINGS IN SUPABASE:';
    RAISE NOTICE '1. Go to Table Editor';
    RAISE NOTICE '2. Select "career_fair_sessions" table';
    RAISE NOTICE '3. Filter: is_booked = true';
    RAISE NOTICE '4. Check "booking_data" column for user details';
    RAISE NOTICE '========================================';
END $$;

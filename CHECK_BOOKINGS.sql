-- =====================================================
-- CHECK BOOKINGS IN DATABASE
-- Run this to see if bookings are being saved
-- =====================================================

-- 1. Check total sessions
SELECT 
    COUNT(*) as total_sessions,
    SUM(CASE WHEN is_booked THEN 1 ELSE 0 END) as booked_sessions,
    SUM(CASE WHEN NOT is_booked THEN 1 ELSE 0 END) as available_sessions
FROM public.career_fair_sessions;

-- 2. Show all booked sessions with details
SELECT 
    cfs.id,
    s.name as school_name,
    cfs.session_type,
    cfs.slot_number,
    cfs.is_booked,
    cfs.booking_data,
    cfs.created_at,
    cfs.updated_at
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
ORDER BY cfs.updated_at DESC;

-- 3. Show booking data details
SELECT 
    s.name as school_name,
    cfs.session_type,
    'Slot ' || cfs.slot_number as slot,
    cfs.booking_data->>'college_name' as college_name,
    cfs.booking_data->>'user_name' as user_name,
    cfs.booking_data->>'email' as email,
    cfs.booking_data->>'phone_number' as phone,
    cfs.booking_data->>'booked_at' as booked_at
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
ORDER BY cfs.updated_at DESC;

-- 4. Check if there are any sessions at all
SELECT 
    s.name as school_name,
    COUNT(*) as total_sessions,
    SUM(CASE WHEN cfs.is_booked THEN 1 ELSE 0 END) as booked
FROM public.schools s
LEFT JOIN public.career_fair_sessions cfs ON s.id = cfs.school_id
GROUP BY s.name
ORDER BY s.name;

-- 5. Test manual booking (to verify permissions work)
-- Uncomment and modify the school_id to test
/*
UPDATE public.career_fair_sessions
SET 
    is_booked = true,
    booking_data = '{"college_name": "Test College", "user_name": "Test User", "email": "test@test.com", "phone_number": "1234567890", "booked_at": "2024-01-01T00:00:00Z"}'::jsonb
WHERE school_id = (SELECT id FROM public.schools LIMIT 1)
AND session_type = 'physical'
AND slot_number = 1
AND is_booked = false;
*/

-- 6. Check RLS policies
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
WHERE tablename = 'career_fair_sessions'
ORDER BY policyname;

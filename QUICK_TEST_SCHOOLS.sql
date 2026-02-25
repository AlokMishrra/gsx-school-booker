-- =====================================================
-- QUICK TEST - Add 3 Test Schools
-- Run this to quickly test if the website works
-- =====================================================

-- Add 3 test schools
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Test School Delhi', 'New Delhi', 'Delhi', 1, 2000, '₹50,000', '₹45,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Test Address Delhi', 'test.delhi@school.edu', '+91-9876543210', 'Test school', true),
    ('Test School Mumbai', 'Mumbai', 'Maharashtra', 1, 2500, '₹60,000', '₹55,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Test Address Mumbai', 'test.mumbai@school.edu', '+91-9876543211', 'Test school', true),
    ('Test School Bangalore', 'Bangalore', 'Karnataka', 2, 1800, '₹45,000', '₹42,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Test Address Bangalore', 'test.bangalore@school.edu', '+91-9876543212', 'Test school', true)
ON CONFLICT DO NOTHING;

-- Create sessions for test schools
DO $$
DECLARE
    school_record RECORD;
    i INTEGER;
BEGIN
    FOR school_record IN SELECT id FROM public.schools WHERE name LIKE 'Test School%' LOOP
        -- Create 9 physical session slots
        FOR i IN 1..9 LOOP
            INSERT INTO public.career_fair_sessions (
                school_id, session_type, slot_number, 
                session_date, start_time, end_time, is_booked
            ) VALUES (
                school_record.id,
                'physical',
                i,
                CURRENT_DATE + (i % 30),
                '09:00:00',
                '17:00:00',
                false
            )
            ON CONFLICT (school_id, session_type, slot_number) DO NOTHING;
        END LOOP;
        
        -- Create 20 career fair slots
        FOR i IN 1..20 LOOP
            INSERT INTO public.career_fair_sessions (
                school_id, session_type, slot_number,
                session_date, start_time, end_time, is_booked
            ) VALUES (
                school_record.id,
                'career_fair',
                i,
                CURRENT_DATE + (i % 60),
                '10:00:00',
                '16:00:00',
                false
            )
            ON CONFLICT (school_id, session_type, slot_number) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Verify
SELECT 
    COUNT(*) as test_schools_added
FROM public.schools 
WHERE name LIKE 'Test School%' AND is_active = true;

SELECT 
    COUNT(*) as test_sessions_added
FROM public.career_fair_sessions cfs
JOIN public.schools s ON cfs.school_id = s.id
WHERE s.name LIKE 'Test School%';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TEST SCHOOLS ADDED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Added 3 test schools';
    RAISE NOTICE '📅 Added 87 test sessions (29 per school)';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NOW:';
    RAISE NOTICE '1. Refresh your website (F5)';
    RAISE NOTICE '2. You should see 3 schools in the calendar';
    RAISE NOTICE '3. If it works, run ADD_ALL_STATES_SCHOOLS.sql';
    RAISE NOTICE '========================================';
END $$;

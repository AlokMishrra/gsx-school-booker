-- =====================================================
-- FIX RLS POLICIES FOR SUPABASE TABLE EDITOR
-- This ensures you can see bookings in the Table Editor
-- =====================================================

-- The issue might be that RLS policies are blocking the Supabase
-- Table Editor from viewing the data. Let's fix this.

-- =====================================================
-- OPTION 1: Temporarily disable RLS to verify data exists
-- =====================================================

-- Uncomment these lines to temporarily disable RLS and check if data exists:
-- ALTER TABLE public.career_fair_sessions DISABLE ROW LEVEL SECURITY;
-- After checking, re-enable with:
-- ALTER TABLE public.career_fair_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION 2: Add service_role policy (RECOMMENDED)
-- =====================================================

-- This allows the Supabase service role (used by Table Editor) to see all data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can view all sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON public.career_fair_sessions;

-- Create policy for service role to view all data
CREATE POLICY "Service role can view all sessions"
    ON public.career_fair_sessions
    FOR SELECT
    TO service_role
    USING (true);

-- Create policy for service role to manage all data
CREATE POLICY "Service role can manage all sessions"
    ON public.career_fair_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- VERIFY CURRENT POLICIES
-- =====================================================

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

-- =====================================================
-- CHECK IF RLS IS ENABLED
-- =====================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'career_fair_sessions';

-- =====================================================
-- VERIFY DATA EXISTS (as service_role)
-- =====================================================

-- This query should work regardless of RLS
SELECT 
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE is_booked = true) as booked_sessions,
    COUNT(*) FILTER (WHERE is_booked = false) as available_sessions
FROM public.career_fair_sessions;

-- =====================================================
-- VIEW SAMPLE BOOKINGS
-- =====================================================

SELECT 
    id,
    school_id,
    session_type,
    slot_number,
    is_booked,
    booking_data,
    created_at
FROM public.career_fair_sessions
WHERE is_booked = true
LIMIT 5;

-- =====================================================
-- ALTERNATIVE: Grant direct permissions
-- =====================================================

-- Grant permissions to authenticated and anon roles
GRANT SELECT ON public.career_fair_sessions TO anon, authenticated, service_role;
GRANT INSERT ON public.career_fair_sessions TO anon, authenticated, service_role;
GRANT UPDATE ON public.career_fair_sessions TO anon, authenticated, service_role;

-- =====================================================
-- REFRESH SCHEMA CACHE
-- =====================================================

-- Sometimes Supabase needs to refresh its cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    v_total INTEGER;
    v_booked INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE is_booked = true)
    INTO v_total, v_booked
    FROM public.career_fair_sessions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS POLICIES UPDATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total sessions: %', v_total;
    RAISE NOTICE 'Booked sessions: %', v_booked;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 NOW TRY THIS:';
    RAISE NOTICE '1. Go to Supabase Table Editor';
    RAISE NOTICE '2. Select "career_fair_sessions" table';
    RAISE NOTICE '3. You should now see all data';
    RAISE NOTICE '4. Filter by is_booked = true to see bookings';
    RAISE NOTICE '========================================';
END $$;

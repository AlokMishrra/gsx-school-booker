-- =====================================================
-- FIX BOOKING PERMISSIONS
-- Allow anonymous users to book sessions
-- =====================================================

-- Drop existing policies on career_fair_sessions
DROP POLICY IF EXISTS "Anyone can view career fair sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Anyone can book sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.career_fair_sessions;

-- Create new policies that allow anonymous users

-- 1. Anyone (including anonymous) can view sessions
CREATE POLICY "Anyone can view sessions"
    ON public.career_fair_sessions 
    FOR SELECT
    USING (true);

-- 2. Anyone (including anonymous) can insert sessions
CREATE POLICY "Anyone can insert sessions"
    ON public.career_fair_sessions 
    FOR INSERT
    WITH CHECK (true);

-- 3. Anyone (including anonymous) can update sessions to book them
CREATE POLICY "Anyone can update sessions"
    ON public.career_fair_sessions 
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. Admins can delete sessions
CREATE POLICY "Admins can delete sessions"
    ON public.career_fair_sessions 
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'career_fair_sessions'
ORDER BY policyname;

-- Test: Check if we can query the table
SELECT COUNT(*) as total_sessions FROM public.career_fair_sessions;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Booking permissions fixed!';
    RAISE NOTICE '📝 Anonymous users can now book sessions';
    RAISE NOTICE '🔒 Only admins can delete sessions';
    RAISE NOTICE '🚀 Try booking a session now!';
END $$;

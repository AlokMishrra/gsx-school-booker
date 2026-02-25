-- Cleanup and Recreate Career Fair System
-- This migration safely removes any partial installations and recreates everything

-- =====================================================
-- CLEANUP - Drop existing objects if they exist
-- =====================================================

-- Drop policies
DROP POLICY IF EXISTS "Anyone can view career fair sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Anyone can book sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.career_fair_sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON public.career_fair_sessions;

-- Drop views
DROP VIEW IF EXISTS career_fair_analytics;

-- Drop functions
DROP FUNCTION IF EXISTS get_available_sessions(UUID, TEXT);
DROP FUNCTION IF EXISTS book_session(UUID, TEXT, INTEGER, UUID, JSONB);

-- Drop trigger
DROP TRIGGER IF EXISTS update_career_sessions_updated_at ON public.career_fair_sessions;

-- Drop indexes
DROP INDEX IF EXISTS idx_schools_city;
DROP INDEX IF EXISTS idx_schools_tier;
DROP INDEX IF EXISTS idx_career_sessions_school;
DROP INDEX IF EXISTS idx_career_sessions_type;
DROP INDEX IF EXISTS idx_career_sessions_booked;

-- Drop table
DROP TABLE IF EXISTS public.career_fair_sessions CASCADE;

-- =====================================================
-- ADD COLUMNS TO SCHOOLS TABLE (if not exists)
-- =====================================================
DO $$ 
BEGIN
    -- Add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='city') THEN
        ALTER TABLE public.schools ADD COLUMN city TEXT;
    END IF;
    
    -- Add school_fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='school_fee') THEN
        ALTER TABLE public.schools ADD COLUMN school_fee TEXT;
    END IF;
    
    -- Add average_fee column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='average_fee') THEN
        ALTER TABLE public.schools ADD COLUMN average_fee TEXT;
    END IF;
    
    -- Add tier column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='tier') THEN
        ALTER TABLE public.schools ADD COLUMN tier INTEGER CHECK (tier IN (1, 2, 3));
    END IF;
    
    -- Add student_strength column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='student_strength') THEN
        ALTER TABLE public.schools ADD COLUMN student_strength INTEGER;
    END IF;
    
    -- Add image_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='schools' AND column_name='image_url') THEN
        ALTER TABLE public.schools ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- =====================================================
-- CREATE CAREER FAIR SESSIONS TABLE
-- =====================================================
CREATE TABLE public.career_fair_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('physical', 'career_fair')),
    slot_number INTEGER NOT NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '17:00:00',
    is_booked BOOLEAN DEFAULT false,
    booked_by_college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    booking_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_school_session_slot UNIQUE(school_id, session_type, slot_number)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX idx_schools_city ON public.schools(city) WHERE city IS NOT NULL;
CREATE INDEX idx_schools_tier ON public.schools(tier) WHERE tier IS NOT NULL;
CREATE INDEX idx_career_sessions_school ON public.career_fair_sessions(school_id);
CREATE INDEX idx_career_sessions_type ON public.career_fair_sessions(session_type);
CREATE INDEX idx_career_sessions_booked ON public.career_fair_sessions(is_booked);
CREATE INDEX idx_career_sessions_college ON public.career_fair_sessions(booked_by_college_id) WHERE booked_by_college_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.career_fair_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view career fair sessions"
    ON public.career_fair_sessions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can book sessions"
    ON public.career_fair_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
    ON public.career_fair_sessions FOR UPDATE
    USING (true);

CREATE POLICY "Admins can manage all sessions"
    ON public.career_fair_sessions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_career_sessions_updated_at
    BEFORE UPDATE ON public.career_fair_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DATA - Insert/Update Schools
-- =====================================================
DO $$
DECLARE
    school_data RECORD;
    v_school_id UUID;
    v_row_count INTEGER;
    schools_data CONSTANT JSONB := '[
        {"name": "Delhi Public School", "city": "Delhi", "tier": 1, "student_strength": 2500, "school_fee": "₹50,000", "average_fee": "₹45,000", "image_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&q=80"},
        {"name": "Ryan International School", "city": "Mumbai", "tier": 1, "student_strength": 3000, "school_fee": "₹60,000", "average_fee": "₹55,000", "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop&q=80"},
        {"name": "DAV Public School", "city": "Bangalore", "tier": 2, "student_strength": 1800, "school_fee": "₹40,000", "average_fee": "₹38,000", "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop&q=80"},
        {"name": "Kendriya Vidyalaya", "city": "Chennai", "tier": 2, "student_strength": 1500, "school_fee": "₹30,000", "average_fee": "₹28,000", "image_url": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&h=300&fit=crop&q=80"},
        {"name": "St. Xavier''s School", "city": "Kolkata", "tier": 1, "student_strength": 2200, "school_fee": "₹55,000", "average_fee": "₹52,000", "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&q=80"},
        {"name": "Modern School", "city": "Pune", "tier": 2, "student_strength": 2000, "school_fee": "₹48,000", "average_fee": "₹46,000", "image_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop&q=80"},
        {"name": "Amity International School", "city": "Noida", "tier": 1, "student_strength": 2800, "school_fee": "₹65,000", "average_fee": "₹62,000", "image_url": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&q=80"},
        {"name": "The Heritage School", "city": "Gurgaon", "tier": 1, "student_strength": 3200, "school_fee": "₹70,000", "average_fee": "₹68,000", "image_url": "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=300&fit=crop&q=80"}
    ]'::JSONB;
BEGIN
    FOR school_data IN 
        SELECT * FROM jsonb_to_recordset(schools_data) AS x(
            name TEXT, city TEXT, tier INTEGER, student_strength INTEGER, 
            school_fee TEXT, average_fee TEXT, image_url TEXT
        )
    LOOP
        -- Check if school exists
        SELECT id INTO v_school_id
        FROM public.schools
        WHERE name = school_data.name
        LIMIT 1;
        
        IF v_school_id IS NOT NULL THEN
            -- Update existing school
            UPDATE public.schools
            SET 
                city = school_data.city,
                tier = school_data.tier,
                student_strength = school_data.student_strength,
                school_fee = school_data.school_fee,
                average_fee = school_data.average_fee,
                image_url = school_data.image_url,
                updated_at = NOW()
            WHERE id = v_school_id;
        ELSE
            -- Insert new school
            INSERT INTO public.schools (
                name, address, contact_email, contact_phone, 
                city, tier, student_strength, school_fee, average_fee, image_url,
                description, is_active
            ) VALUES (
                school_data.name,
                school_data.city || ', India',
                LOWER(REPLACE(school_data.name, ' ', '')) || '@school.edu',
                '+91-' || LPAD((RANDOM() * 10000000000)::BIGINT::TEXT, 10, '0'),
                school_data.city,
                school_data.tier,
                school_data.student_strength,
                school_data.school_fee,
                school_data.average_fee,
                school_data.image_url,
                'Premier educational institution',
                true
            );
        END IF;
        
        -- Reset for next iteration
        v_school_id := NULL;
    END LOOP;
END $$;

-- =====================================================
-- CREATE SESSIONS FOR ALL SCHOOLS
-- =====================================================
DO $$
DECLARE
    school_record RECORD;
    i INTEGER;
BEGIN
    FOR school_record IN SELECT id FROM public.schools WHERE is_active = true LOOP
        -- Create 9 physical session slots (P1-P9)
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
        
        -- Create 20 career fair slots (CF1-CF20)
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

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_available_sessions(p_school_id UUID, p_session_type TEXT)
RETURNS TABLE (
    slot_number INTEGER,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cfs.slot_number,
        cfs.session_date,
        cfs.start_time,
        cfs.end_time,
        cfs.is_booked
    FROM public.career_fair_sessions cfs
    WHERE cfs.school_id = p_school_id
    AND cfs.session_type = p_session_type
    ORDER BY cfs.slot_number;
END;
$$;

CREATE OR REPLACE FUNCTION book_session(
    p_school_id UUID,
    p_session_type TEXT,
    p_slot_number INTEGER,
    p_college_id UUID,
    p_booking_data JSONB
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_already_booked BOOLEAN;
    v_rows_updated INTEGER;
BEGIN
    -- Check if session is already booked
    SELECT is_booked INTO v_already_booked
    FROM public.career_fair_sessions
    WHERE school_id = p_school_id
    AND session_type = p_session_type
    AND slot_number = p_slot_number
    FOR UPDATE;
    
    IF v_already_booked THEN
        RETURN false;
    END IF;
    
    -- Book the session
    UPDATE public.career_fair_sessions
    SET 
        is_booked = true,
        booked_by_college_id = p_college_id,
        booking_data = p_booking_data,
        updated_at = NOW()
    WHERE school_id = p_school_id
    AND session_type = p_session_type
    AND slot_number = p_slot_number
    AND is_booked = false;
    
    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    RETURN v_rows_updated > 0;
END;
$$;

-- =====================================================
-- ANALYTICS VIEW
-- =====================================================
CREATE OR REPLACE VIEW career_fair_analytics AS
SELECT 
    s.id AS school_id,
    s.name AS school_name,
    s.city,
    s.tier,
    COUNT(cfs.id) AS total_slots,
    COUNT(cfs.id) FILTER (WHERE cfs.is_booked) AS booked_slots,
    COUNT(cfs.id) FILTER (WHERE cfs.session_type = 'physical' AND cfs.is_booked) AS physical_booked,
    COUNT(cfs.id) FILTER (WHERE cfs.session_type = 'career_fair' AND cfs.is_booked) AS career_fair_booked,
    COUNT(DISTINCT cfs.booked_by_college_id) AS unique_colleges
FROM public.schools s
LEFT JOIN public.career_fair_sessions cfs ON s.id = cfs.school_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.city, s.tier
ORDER BY booked_slots DESC;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT SELECT ON career_fair_analytics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_available_sessions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION book_session TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.career_fair_sessions IS 'Stores booking slots for physical sessions and career fairs';
COMMENT ON COLUMN public.career_fair_sessions.booking_data IS 'JSON data: {college_name, user_name, phone_number, email}';
COMMENT ON FUNCTION get_available_sessions IS 'Returns all sessions for a school and type';
COMMENT ON FUNCTION book_session IS 'Books a session atomically, returns true if successful';
COMMENT ON VIEW career_fair_analytics IS 'Analytics view showing booking statistics per school';

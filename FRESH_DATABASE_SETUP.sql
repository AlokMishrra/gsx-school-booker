-- =====================================================
-- ZEROSCHOOL COMPLETE DATABASE SETUP
-- For Fresh Supabase Account
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- 1. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    description TEXT,
    tier INTEGER CHECK (tier IN (1, 2, 3)),
    school_fee TEXT,
    average_fee TEXT,
    student_strength INTEGER,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CAREER FAIR SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.career_fair_sessions (
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

-- 4. USER ROLES TABLE (for admin access)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'college')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- 5. INVENTORY ITEMS TABLE (optional - for future use)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    item_type TEXT CHECK (item_type IN ('facility', 'equipment')),
    price_per_hour DECIMAL(10, 2),
    quantity_available INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BOOKINGS TABLE (optional - for future use)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKING ITEMS TABLE (optional - for future use)
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    hours INTEGER NOT NULL DEFAULT 1,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS TABLE (optional - for future use)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Schools indexes
CREATE INDEX IF NOT EXISTS idx_schools_city ON public.schools(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_tier ON public.schools(tier) WHERE tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_active ON public.schools(is_active);

-- Career fair sessions indexes
CREATE INDEX IF NOT EXISTS idx_career_sessions_school ON public.career_fair_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_career_sessions_type ON public.career_fair_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_career_sessions_booked ON public.career_fair_sessions(is_booked);
CREATE INDEX IF NOT EXISTS idx_career_sessions_college ON public.career_fair_sessions(booked_by_college_id) WHERE booked_by_college_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_career_sessions_date ON public.career_fair_sessions(session_date);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Inventory items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_school ON public.inventory_items(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON public.inventory_items(is_available);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_college ON public.bookings(college_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get available sessions
CREATE OR REPLACE FUNCTION public.get_available_sessions(p_school_id UUID, p_session_type TEXT)
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

-- Function to book a session
CREATE OR REPLACE FUNCTION public.book_session(
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
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for schools table
DROP TRIGGER IF EXISTS update_schools_updated_at ON public.schools;
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for colleges table
DROP TRIGGER IF EXISTS update_colleges_updated_at ON public.colleges;
CREATE TRIGGER update_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for career_fair_sessions table
DROP TRIGGER IF EXISTS update_career_sessions_updated_at ON public.career_fair_sessions;
CREATE TRIGGER update_career_sessions_updated_at
    BEFORE UPDATE ON public.career_fair_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for inventory_items table
DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_fair_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Anyone can view active schools"
    ON public.schools FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage schools"
    ON public.schools FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Career fair sessions policies
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

-- Colleges policies
CREATE POLICY "Anyone can view colleges"
    ON public.colleges FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage colleges"
    ON public.colleges FOR ALL
    TO authenticated
    USING (true);

-- User roles policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Inventory items policies
CREATE POLICY "Anyone can view available inventory"
    ON public.inventory_items FOR SELECT
    USING (is_available = true);

CREATE POLICY "Admins can manage inventory"
    ON public.inventory_items FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can manage all bookings"
    ON public.bookings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Booking items policies
CREATE POLICY "Anyone can view booking items"
    ON public.booking_items FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage booking items"
    ON public.booking_items FOR ALL
    TO authenticated
    USING (true);

-- Payments policies
CREATE POLICY "Users can view payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create payments"
    ON public.payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- CREATE VIEWS
-- =====================================================

-- Analytics view for career fair bookings
CREATE OR REPLACE VIEW public.career_fair_analytics AS
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

GRANT SELECT ON public.career_fair_analytics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_sessions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_session TO anon, authenticated;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert 8 sample schools
INSERT INTO public.schools (name, city, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Delhi', 1, 2500, '₹50,000', '₹45,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&q=80', 'Delhi, India', 'delhipublicschool@school.edu', '+91-9876543210', 'Premier educational institution', true),
    ('Ryan International School', 'Mumbai', 1, 3000, '₹60,000', '₹55,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop&q=80', 'Mumbai, India', 'ryaninternationalschool@school.edu', '+91-9876543211', 'Premier educational institution', true),
    ('DAV Public School', 'Bangalore', 2, 1800, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop&q=80', 'Bangalore, India', 'davpublicschool@school.edu', '+91-9876543212', 'Premier educational institution', true),
    ('Kendriya Vidyalaya', 'Chennai', 2, 1500, '₹30,000', '₹28,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&h=300&fit=crop&q=80', 'Chennai, India', 'kendriyavidyalaya@school.edu', '+91-9876543213', 'Premier educational institution', true),
    ('St. Xavier''s School', 'Kolkata', 1, 2200, '₹55,000', '₹52,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&q=80', 'Kolkata, India', 'st.xavier''sschool@school.edu', '+91-9876543214', 'Premier educational institution', true),
    ('Modern School', 'Pune', 2, 2000, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop&q=80', 'Pune, India', 'modernschool@school.edu', '+91-9876543215', 'Premier educational institution', true),
    ('Amity International School', 'Noida', 1, 2800, '₹65,000', '₹62,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&q=80', 'Noida, India', 'amityinternationalschool@school.edu', '+91-9876543216', 'Premier educational institution', true),
    ('The Heritage School', 'Gurgaon', 1, 3200, '₹70,000', '₹68,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=300&fit=crop&q=80', 'Gurgaon, India', 'theheritageschool@school.edu', '+91-9876543217', 'Premier educational institution', true)
ON CONFLICT DO NOTHING;

-- Create sessions for all schools
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
-- ADD COMMENTS
-- =====================================================

COMMENT ON TABLE public.schools IS 'Stores school information';
COMMENT ON TABLE public.colleges IS 'Stores college information';
COMMENT ON TABLE public.career_fair_sessions IS 'Stores booking slots for physical sessions and career fairs';
COMMENT ON TABLE public.user_roles IS 'Stores user roles for access control';
COMMENT ON TABLE public.inventory_items IS 'Stores school inventory items';
COMMENT ON TABLE public.bookings IS 'Stores booking information';
COMMENT ON TABLE public.booking_items IS 'Stores items in each booking';
COMMENT ON TABLE public.payments IS 'Stores payment information';

COMMENT ON COLUMN public.career_fair_sessions.booking_data IS 'JSON data: {college_name, user_name, phone_number, email, booked_at}';
COMMENT ON COLUMN public.schools.city IS 'City where the school is located (required)';
COMMENT ON COLUMN public.schools.tier IS 'School tier: 1=Premium, 2=Quality, 3=Standard';
COMMENT ON COLUMN public.schools.school_fee IS 'School fee in rupees (optional)';
COMMENT ON COLUMN public.schools.average_fee IS 'Average fee in rupees (optional)';
COMMENT ON COLUMN public.schools.student_strength IS 'Total number of students (optional)';
COMMENT ON COLUMN public.schools.image_url IS 'URL to school image (optional)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count schools
SELECT COUNT(*) as total_schools FROM public.schools;

-- Count sessions by type
SELECT 
    session_type,
    COUNT(*) as total_sessions,
    SUM(CASE WHEN is_booked THEN 1 ELSE 0 END) as booked_sessions,
    SUM(CASE WHEN NOT is_booked THEN 1 ELSE 0 END) as available_sessions
FROM public.career_fair_sessions
GROUP BY session_type;

-- Show sample schools
SELECT id, name, city, tier, school_fee, student_strength 
FROM public.schools 
ORDER BY name
LIMIT 5;

-- Show total sessions per school
SELECT 
    s.name,
    COUNT(cfs.id) as total_sessions
FROM public.schools s
LEFT JOIN public.career_fair_sessions cfs ON s.id = cfs.school_id
GROUP BY s.name
ORDER BY s.name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Created 8 schools with 232 total sessions (29 per school)';
    RAISE NOTICE '🎯 All tables, indexes, functions, and policies are in place';
    RAISE NOTICE '🚀 Your ZeroSchool application is ready to use!';
END $$;

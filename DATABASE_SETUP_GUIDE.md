# ZeroSchool Database Setup Guide

## Overview
This guide explains how to set up the Career Fair booking system for ZeroSchool on Lovable Cloud (Supabase).

## Migration File
**Location**: `supabase/migrations/20260223000001_add_career_fair_system.sql`

## What This Migration Does

This migration adds the Career Fair booking system to your existing ZeroSchool database without breaking existing functionality.

### New Columns Added to `schools` Table
- `city` - City where school is located
- `school_fee` - School fee amount
- `average_fee` - Average fee amount
- `tier` - School tier (1, 2, or 3)
- `student_strength` - Number of students
- `image_url` - School image URL

### New Table: `career_fair_sessions`
Stores all booking slots for physical sessions and career fairs:
- `id` - Unique identifier
- `school_id` - Reference to school
- `session_type` - 'physical' or 'career_fair'
- `slot_number` - Slot number (1-9 for physical, 1-20 for career fair)
- `session_date` - Date of session
- `start_time` / `end_time` - Session timing
- `is_booked` - Booking status
- `booked_by_college_id` - College that booked (if booked)
- `booking_data` - JSON with college_name, user_name, phone_number, email
- `created_at` / `updated_at` - Timestamps

**Unique Constraint**: (school_id, session_type, slot_number) - Prevents duplicate slots

### Helper Functions

1. **`get_available_sessions(school_id, session_type)`**
   - Returns all sessions for a school
   - Shows which are booked/available

2. **`book_session(school_id, session_type, slot_number, college_id, booking_data)`**
   - Books a session
   - Returns true if successful, false if already booked
   - Atomic operation (prevents double booking)

### Analytics View: `career_fair_analytics`
Shows booking statistics per school:
- Total slots, booked slots
- Physical bookings, career fair bookings
- Unique colleges per school

## Sample Data Included

The migration automatically creates:
- 8 schools with complete information
- 9 physical session slots per school (P1-P9)
- 20 career fair slots per school (CF1-CF20)
- Total: 232 sessions across all schools

## How to Apply Migration

### Lovable Cloud (Automatic)
1. Push your code to Lovable
2. The migration will be automatically detected and applied
3. Check the database tab to verify

### Manual Application (Supabase Dashboard)
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the entire migration file content
4. Paste and click "Run"

## Verification Queries

```sql
-- Check if new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'schools' 
AND column_name IN ('city', 'tier', 'student_strength');

-- Check sessions table
SELECT COUNT(*) FROM public.career_fair_sessions;

-- View sessions by type
SELECT session_type, COUNT(*) 
FROM public.career_fair_sessions 
GROUP BY session_type;

-- Check schools with new data
SELECT name, city, tier, student_strength, school_fee 
FROM public.schools 
WHERE city IS NOT NULL;

-- View analytics
SELECT * FROM career_fair_analytics;
```

## Common Operations

### Add a New School
```sql
INSERT INTO public.schools (
    name, location, address, email, phone,
    school_fee, average_fee, tier, student_strength,
    image_url, description
) VALUES (
    'New School Name',
    'City',
    'Full Address',
    'email@school.com',
    '+91-XXX-XXXXXXX',
    '₹50,000',
    '₹45,000',
    1,
    2000,
    'https://example.com/image.jpg',
    'School description'
);
```

### Create Sessions for a School
```sql
-- Get school ID first
SELECT id FROM public.schools WHERE name = 'School Name';

-- Create physical sessions (replace school_id)
INSERT INTO public.sessions (school_id, session_type, slot_number, session_date, start_time, end_time)
SELECT 
    'YOUR-SCHOOL-UUID-HERE',
    'physical',
    generate_series(1, 9),
    CURRENT_DATE + generate_series(1, 9),
    '09:00:00',
    '17:00:00';

-- Create career fair sessions
INSERT INTO public.sessions (school_id, session_type, slot_number, session_date, start_time, end_time)
SELECT 
    'YOUR-SCHOOL-UUID-HERE',
    'career_fair',
    generate_series(1, 20),
    CURRENT_DATE + generate_series(1, 20),
    '10:00:00',
    '16:00:00';
```

### Create a Booking
```sql
-- First, create or get college
INSERT INTO public.colleges (name, email, phone)
VALUES ('College Name', 'college@email.com', '+91-XXX-XXXXXXX')
RETURNING id;

-- Then create booking
INSERT INTO public.bookings (
    college_id, school_id, session_id, session_type,
    college_name, user_name, phone_number, email
) VALUES (
    'college-uuid',
    'school-uuid',
    'session-uuid',
    'physical',
    'College Name',
    'User Name',
    '+91-XXX-XXXXXXX',
    'user@email.com'
);
```

### Check Available Sessions
```sql
SELECT 
    s.name AS school_name,
    ses.session_type,
    ses.slot_number,
    ses.session_date,
    ses.is_available
FROM public.sessions ses
JOIN public.schools s ON ses.school_id = s.id
WHERE ses.is_available = true
ORDER BY s.name, ses.session_type, ses.slot_number;
```

### View All Bookings
```sql
SELECT 
    b.id,
    c.name AS college_name,
    s.name AS school_name,
    b.session_type,
    b.status,
    b.booking_date,
    b.user_name,
    b.email
FROM public.bookings b
JOIN public.colleges c ON b.college_id = c.id
JOIN public.schools s ON b.school_id = s.id
ORDER BY b.booking_date DESC;
```

## Troubleshooting

### Migration Fails
- Check if tables already exist: `DROP TABLE IF EXISTS table_name CASCADE;`
- Ensure UUID extension is enabled
- Check for foreign key constraint violations

### RLS Issues
- Verify policies are created: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Check user role: `SELECT role FROM public.users WHERE id = auth.uid();`
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Performance Issues
- Verify indexes: `SELECT * FROM pg_indexes WHERE schemaname = 'public';`
- Analyze query plans: `EXPLAIN ANALYZE your_query;`
- Update statistics: `ANALYZE public.table_name;`

## Security Notes

1. **Never expose admin credentials** in client-side code
2. **Always use RLS policies** for data access control
3. **Validate input** on both client and server side
4. **Use prepared statements** to prevent SQL injection
5. **Regularly backup** your database
6. **Monitor** for unusual activity

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Lovable support: https://lovable.dev/docs
- Review migration file comments for details

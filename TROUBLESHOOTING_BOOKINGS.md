# Troubleshooting Bookings Not Saving

## Issue
Bookings show in the UI but don't save to the database.

## Steps to Debug

### 1. Check Browser Console
Open browser console (F12) and look for:
- "Starting booking process..."
- "Looking for session: schoolId=..."
- "Found session: ..."
- "Booking successful for: ..." or "No rows updated for session: ..."
- Any error messages

### 2. Run Database Check
Run `CHECK_BOOKINGS.sql` in Supabase SQL Editor to see:
- How many sessions exist
- How many are booked
- Details of booked sessions

### 3. Verify Permissions
Run this in SQL Editor:
```sql
-- Test if anonymous users can update
UPDATE public.career_fair_sessions
SET is_booked = true
WHERE id = (SELECT id FROM public.career_fair_sessions WHERE is_booked = false LIMIT 1);

-- Check if it worked
SELECT * FROM public.career_fair_sessions WHERE is_booked = true LIMIT 5;
```

### 4. Check RLS Policies
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'career_fair_sessions';
```

Should show:
- "Anyone can view sessions" - SELECT - {public}
- "Anyone can update sessions" - UPDATE - {public}

## Common Issues & Solutions

### Issue 1: RLS Blocking Updates
**Symptom**: Console shows "No rows updated"
**Solution**: Run `FIX_BOOKING_PERMISSIONS.sql`

### Issue 2: Session Not Found
**Symptom**: Console shows "Session not found for: ..."
**Solution**: 
1. Check if sessions exist: `SELECT COUNT(*) FROM career_fair_sessions;`
2. If 0, run `FRESH_DATABASE_SETUP.sql` again

### Issue 3: Wrong Session Type
**Symptom**: Booking works but shows wrong type
**Solution**: Check cellKey format uses `|` not `-`

### Issue 4: Already Booked
**Symptom**: "No rows updated" but no error
**Solution**: The session might already be booked. Check:
```sql
SELECT * FROM career_fair_sessions WHERE id = 'session-id-here';
```

## Manual Test

### Test 1: Book via SQL
```sql
-- Find an available session
SELECT id, school_id, session_type, slot_number, is_booked 
FROM career_fair_sessions 
WHERE is_booked = false 
LIMIT 1;

-- Book it manually
UPDATE career_fair_sessions
SET 
    is_booked = true,
    booking_data = '{"college_name": "Test College", "user_name": "Test User", "email": "test@test.com", "phone_number": "1234567890"}'::jsonb
WHERE id = 'paste-id-here';

-- Verify
SELECT * FROM career_fair_sessions WHERE id = 'paste-id-here';
```

### Test 2: Check Admin Bookings Page
1. Login as admin
2. Go to `/ZSINA/bookings`
3. Should see the manually booked session

## Expected Console Output (Success)

```
Starting booking process...
Selected cells: ["uuid|physical|0"]
Available sessions: 232
Looking for session: schoolId=uuid, type=physical, slot=1
Found session: {id: "...", school_id: "...", ...}
Booking successful for: uuid|physical|0 Updated rows: 1
All bookings completed: ["uuid|physical|0"]
```

## Expected Console Output (Failure)

```
Starting booking process...
Selected cells: ["uuid|physical|0"]
Available sessions: 232
Looking for session: schoolId=uuid, type=physical, slot=1
Found session: {id: "...", school_id: "...", ...}
No rows updated for session: session-id
This might mean the session was already booked
```

## Quick Fix Commands

### Reset All Bookings
```sql
UPDATE career_fair_sessions SET is_booked = false, booking_data = null;
```

### Check Specific School's Sessions
```sql
SELECT 
    s.name,
    cfs.session_type,
    cfs.slot_number,
    cfs.is_booked,
    cfs.booking_data
FROM career_fair_sessions cfs
JOIN schools s ON cfs.school_id = s.id
WHERE s.name = 'Delhi Public School'
ORDER BY cfs.session_type, cfs.slot_number;
```

### Force Enable All Policies
```sql
-- Run FIX_BOOKING_PERMISSIONS.sql
```

## Contact Points

If still not working, check:
1. ✅ Database has sessions (232 total)
2. ✅ RLS policies allow anonymous updates
3. ✅ Browser console shows "Booking successful"
4. ✅ Admin bookings page shows bookings
5. ✅ SQL query shows is_booked = true

If all above pass but still not working, there might be a caching issue. Try:
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Restart dev server

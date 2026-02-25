# Where Are My Bookings? 🔍

## TL;DR - Quick Answer

**Your bookings ARE being saved correctly!** They're just in a different table than you might expect.

- ❌ **NOT** in the `bookings` table
- ✅ **YES** in the `career_fair_sessions` table

---

## Understanding the Two Tables

### 1. `career_fair_sessions` Table ✅
**This is where your Career Fair bookings are stored!**

- Contains all physical sessions (P1-P9) and career fair sessions (CF1-CF20)
- Each row represents one bookable slot
- When a user books a slot, the row is updated with:
  - `is_booked = true`
  - `booking_data` = JSON with user details (college name, user name, phone, email)

### 2. `bookings` Table ❌
**This is for a DIFFERENT feature (old inventory system)**

- Used for booking school facilities/equipment
- NOT used for career fair session bookings
- This is why you don't see your bookings here

---

## How to View Your Bookings in Supabase

### Method 1: Table Editor (Visual)

1. Open your Supabase project
2. Go to **Table Editor** in the left sidebar
3. Select the **`career_fair_sessions`** table
4. Click on **Filters**
5. Add filter: `is_booked` equals `true`
6. You'll see all booked sessions!

### Method 2: SQL Editor (Query)

Run this query in the SQL Editor:

```sql
SELECT 
    s.name as school_name,
    s.city,
    CASE 
        WHEN cfs.session_type = 'physical' THEN 'P' || cfs.slot_number
        ELSE 'CF' || cfs.slot_number
    END as slot,
    cfs.booking_data->>'college_name' as college,
    cfs.booking_data->>'user_name' as user,
    cfs.booking_data->>'phone_number' as phone,
    cfs.booking_data->>'email' as email,
    cfs.booking_data->>'booked_at' as booked_at
FROM career_fair_sessions cfs
JOIN schools s ON cfs.school_id = s.id
WHERE cfs.is_booked = true
ORDER BY cfs.created_at DESC;
```

---

## How the Booking System Works

### When a User Books a Session:

1. **User selects slots** on the Career Fair page
2. **User fills form** with college name, name, phone, email
3. **User clicks "Confirm Booking"**
4. **System updates** `career_fair_sessions` table:
   ```sql
   UPDATE career_fair_sessions
   SET 
     is_booked = true,
     booking_data = {
       "college_name": "ABC College",
       "user_name": "John Doe",
       "phone_number": "+91-1234567890",
       "email": "john@example.com",
       "booked_at": "2024-02-23T10:30:00Z"
     }
   WHERE id = [session_id]
   ```

### When Admin Views Bookings:

1. **Admin opens** `/ZSINA/dashboard/bookings`
2. **System queries** `career_fair_sessions` table:
   ```sql
   SELECT * FROM career_fair_sessions
   WHERE is_booked = true
   ```
3. **Admin sees** all bookings with full details

---

## Verification Steps

### Step 1: Check if bookings exist

```sql
SELECT COUNT(*) as total_bookings
FROM career_fair_sessions
WHERE is_booked = true;
```

### Step 2: View booking details

```sql
SELECT 
    id,
    school_id,
    session_type,
    slot_number,
    is_booked,
    booking_data
FROM career_fair_sessions
WHERE is_booked = true
LIMIT 5;
```

### Step 3: Verify booking_data structure

```sql
SELECT 
    booking_data->>'college_name' as college,
    booking_data->>'user_name' as user,
    booking_data->>'phone_number' as phone,
    booking_data->>'email' as email,
    booking_data->>'booked_at' as booked_at
FROM career_fair_sessions
WHERE is_booked = true
LIMIT 1;
```

---

## Common Confusion Points

### "I don't see bookings in the bookings table"
✅ **Correct!** Career fair bookings are NOT stored in the `bookings` table. They're in `career_fair_sessions`.

### "The admin dashboard shows bookings but Supabase doesn't"
✅ **They're both showing the same data!** You just need to look at the `career_fair_sessions` table in Supabase, not the `bookings` table.

### "Why are there two tables?"
✅ **Different features:**
- `career_fair_sessions` = Career fair booking system (current feature)
- `bookings` = Inventory booking system (future feature for booking facilities/equipment)

---

## Database Schema Overview

```
career_fair_sessions
├── id (UUID)
├── school_id (UUID) → references schools(id)
├── session_type (TEXT) → 'physical' or 'career_fair'
├── slot_number (INTEGER) → 1-9 for physical, 1-20 for career fair
├── session_date (DATE)
├── start_time (TIME)
├── end_time (TIME)
├── is_booked (BOOLEAN) → true when booked
├── booked_by_college_id (UUID) → optional reference
├── booking_data (JSONB) → {college_name, user_name, phone_number, email, booked_at}
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## Quick Verification Script

Run this in Supabase SQL Editor to see a summary:

```sql
-- Run the verification script
\i VERIFY_BOOKINGS_LOCATION.sql
```

Or copy and paste the contents of `VERIFY_BOOKINGS_LOCATION.sql` into the SQL Editor.

---

## Still Not Seeing Bookings?

If you've checked `career_fair_sessions` table with `is_booked = true` filter and still don't see bookings:

1. **Make a test booking:**
   - Go to your app's Career Fair page
   - Select a school (checkbox)
   - Click on a green slot (P1 or CF1)
   - Click "Confirm Booking"
   - Fill in the form
   - Click "Confirm"

2. **Check immediately in Supabase:**
   - Refresh the `career_fair_sessions` table
   - Filter by `is_booked = true`
   - You should see the new booking

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for any errors during booking
   - Check the Network tab for failed requests

---

## Summary

✅ **Bookings ARE being saved**  
✅ **They're in the `career_fair_sessions` table**  
✅ **Filter by `is_booked = true` to see them**  
✅ **The `booking_data` column contains user details**  
✅ **Admin dashboard reads from the same table**  

The system is working correctly! You just need to look at the right table in Supabase.

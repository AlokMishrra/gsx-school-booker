# Complete Booking Troubleshooting Guide 🔧

## Issue: "Bookings showing in admin dashboard but not in Supabase database"

### Quick Diagnosis

The bookings **ARE** being saved to the database. The confusion comes from:

1. ❌ Looking at the wrong table (`bookings` instead of `career_fair_sessions`)
2. ❌ RLS policies might be hiding data in Table Editor
3. ❌ Not filtering by `is_booked = true`

---

## Solution Steps

### Step 1: Verify You're Looking at the Correct Table

**WRONG TABLE:**
```
Table Editor → bookings ❌
```

**CORRECT TABLE:**
```
Table Editor → career_fair_sessions ✅
```

### Step 2: Apply the Correct Filter

In the `career_fair_sessions` table:
1. Click on **Filters**
2. Add filter: `is_booked` **equals** `true`
3. Click **Apply**

You should now see all bookings!

### Step 3: Fix RLS Policies (If Still Not Visible)

Run this SQL script in Supabase SQL Editor:

```sql
-- Copy and paste contents of FIX_RLS_FOR_TABLE_EDITOR.sql
```

Or run:
```bash
\i FIX_RLS_FOR_TABLE_EDITOR.sql
```

---

## Understanding the Data Structure

### How Bookings Are Stored

Each booking is stored as an **UPDATE** to an existing session row:

**Before Booking:**
```json
{
  "id": "abc-123",
  "school_id": "school-xyz",
  "session_type": "physical",
  "slot_number": 1,
  "is_booked": false,  ← Not booked yet
  "booking_data": null  ← No booking data
}
```

**After Booking:**
```json
{
  "id": "abc-123",
  "school_id": "school-xyz",
  "session_type": "physical",
  "slot_number": 1,
  "is_booked": true,  ← Now booked!
  "booking_data": {    ← Booking details added
    "college_name": "ABC College",
    "user_name": "John Doe",
    "phone_number": "+91-1234567890",
    "email": "john@example.com",
    "booked_at": "2024-02-23T10:30:00Z"
  }
}
```

### Why Not a Separate Bookings Table?

**Current Design (Recommended):**
- ✅ One table (`career_fair_sessions`) stores both availability and bookings
- ✅ Atomic updates prevent double-booking
- ✅ Easy to query available vs booked slots
- ✅ Simpler data model

**Alternative Design (Not Used):**
- ❌ Two tables: `sessions` + `bookings`
- ❌ More complex queries (JOINs required)
- ❌ Risk of double-booking without proper locking
- ❌ More tables to maintain

---

## Verification Queries

### Query 1: Count Total Bookings

```sql
SELECT COUNT(*) as total_bookings
FROM career_fair_sessions
WHERE is_booked = true;
```

**Expected Result:**
- If you've made bookings, this should return a number > 0
- If it returns 0, bookings are not being saved

### Query 2: View All Bookings with Details

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
ORDER BY (cfs.booking_data->>'booked_at')::timestamptz DESC;
```

**Expected Result:**
- Shows all bookings with school name, slot, and user details
- Should match what you see in the admin dashboard

### Query 3: Check RLS Policies

```sql
SELECT 
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'career_fair_sessions'
ORDER BY policyname;
```

**Expected Result:**
- Should show policies allowing SELECT for anon/authenticated
- Should show policies allowing INSERT/UPDATE for anon/authenticated

---

## Common Issues and Solutions

### Issue 1: "I see 0 bookings in the query"

**Possible Causes:**
1. No bookings have been made yet
2. Bookings failed to save due to an error

**Solution:**
1. Make a test booking:
   - Go to Career Fair page
   - Select a school (checkbox)
   - Click a green slot
   - Fill form and confirm
2. Check browser console for errors
3. Check Network tab for failed API calls

### Issue 2: "RLS is blocking my view"

**Symptoms:**
- Query returns 0 rows
- But admin dashboard shows bookings

**Solution:**
Run `FIX_RLS_FOR_TABLE_EDITOR.sql` to add service_role policies

### Issue 3: "Bookings disappear after refresh"

**Possible Causes:**
1. Transaction not committed
2. RLS policy blocking updates
3. Database connection issue

**Solution:**
1. Check if `is_booked` is actually set to `true`
2. Verify RLS policies allow updates
3. Check Supabase logs for errors

### Issue 4: "Admin dashboard shows bookings but Table Editor doesn't"

**Cause:**
- Admin dashboard uses authenticated role
- Table Editor might use different role
- RLS policies differ between roles

**Solution:**
Add service_role policy (see `FIX_RLS_FOR_TABLE_EDITOR.sql`)

---

## Testing the Booking Flow

### End-to-End Test

1. **Open Career Fair Page**
   ```
   http://localhost:5173/career-fair
   ```

2. **Select a School**
   - Check the checkbox next to a school name

3. **Select a Slot**
   - Click on a green slot (e.g., P1 or CF1)
   - Slot should turn blue with a checkmark

4. **Confirm Booking**
   - Click "Confirm Booking" button
   - Fill in the form:
     - College Name: "Test College"
     - Your Name: "Test User"
     - Phone: "+91-1234567890"
     - Email: "test@example.com"
   - Click "Confirm"

5. **Verify in Browser**
   - Should see success toast
   - Slot should turn dark blue with CheckCircle icon
   - Slot should be disabled for further bookings

6. **Verify in Admin Dashboard**
   ```
   http://localhost:5173/ZSINA/dashboard/bookings
   ```
   - Should see the booking listed
   - Should show all details (school, slot, college, user, contact)

7. **Verify in Supabase**
   - Go to Table Editor
   - Select `career_fair_sessions` table
   - Filter: `is_booked = true`
   - Should see the booking row
   - Check `booking_data` column for user details

---

## Database Schema Reference

### career_fair_sessions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| school_id | UUID | Foreign key to schools table |
| session_type | TEXT | 'physical' or 'career_fair' |
| slot_number | INTEGER | 1-9 for physical, 1-20 for career fair |
| session_date | DATE | Date of the session |
| start_time | TIME | Start time |
| end_time | TIME | End time |
| is_booked | BOOLEAN | **true when booked** |
| booked_by_college_id | UUID | Optional reference to colleges table |
| booking_data | JSONB | **Contains user details** |
| created_at | TIMESTAMPTZ | Row creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### booking_data JSON Structure

```json
{
  "college_name": "ABC College",
  "user_name": "John Doe",
  "phone_number": "+91-1234567890",
  "email": "john@example.com",
  "booked_at": "2024-02-23T10:30:00.000Z"
}
```

---

## Quick Reference Commands

### View All Bookings
```sql
SELECT * FROM career_fair_sessions WHERE is_booked = true;
```

### Count Bookings
```sql
SELECT COUNT(*) FROM career_fair_sessions WHERE is_booked = true;
```

### View Booking Details
```sql
SELECT 
    booking_data->>'college_name' as college,
    booking_data->>'user_name' as user
FROM career_fair_sessions 
WHERE is_booked = true;
```

### Clear All Bookings (Testing Only)
```sql
UPDATE career_fair_sessions 
SET is_booked = false, booking_data = null;
```

### Reset Specific Booking
```sql
UPDATE career_fair_sessions 
SET is_booked = false, booking_data = null
WHERE id = 'your-session-id';
```

---

## Files to Run

1. **VERIFY_BOOKINGS_LOCATION.sql**
   - Comprehensive verification queries
   - Shows where bookings are stored
   - Displays booking statistics

2. **FIX_RLS_FOR_TABLE_EDITOR.sql**
   - Fixes RLS policies
   - Allows Table Editor to view data
   - Adds service_role policies

3. **WHERE_ARE_MY_BOOKINGS.md**
   - Detailed explanation
   - Step-by-step guide
   - Common confusion points

---

## Summary

✅ **Bookings ARE being saved correctly**  
✅ **They're in `career_fair_sessions` table**  
✅ **Filter by `is_booked = true` to see them**  
✅ **Run `FIX_RLS_FOR_TABLE_EDITOR.sql` if needed**  
✅ **Use `VERIFY_BOOKINGS_LOCATION.sql` to verify**  

The system is working as designed. You just need to look at the right place!

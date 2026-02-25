# 🚀 Quick Fix: See Your Bookings in 30 Seconds

## The Problem
You said: "Bookings showing in admin dashboard but not in Supabase database"

## The Solution
**You're looking at the wrong table!**

---

## Step-by-Step Fix

### Step 1: Open Supabase
Go to your Supabase project dashboard

### Step 2: Click Table Editor
In the left sidebar, click **Table Editor**

### Step 3: Select the CORRECT Table
❌ **DON'T** select: `bookings`  
✅ **DO** select: `career_fair_sessions`

### Step 4: Add Filter
1. Click the **Filters** button (top right)
2. Add filter:
   - Column: `is_booked`
   - Operator: `=` (equals)
   - Value: `true`
3. Click **Apply**

### Step 5: See Your Bookings! 🎉
You should now see all bookings with:
- School ID
- Session type (physical or career_fair)
- Slot number
- **booking_data** column with user details

---

## Still Not Seeing Bookings?

### Option A: Run Verification Query
Open **SQL Editor** and run:

```sql
SELECT COUNT(*) FROM career_fair_sessions WHERE is_booked = true;
```

- **If result > 0:** Bookings exist! Check RLS policies (see Option B)
- **If result = 0:** No bookings made yet. Make a test booking.

### Option B: Fix RLS Policies
Open **SQL Editor** and run:

```sql
-- Copy and paste the entire contents of FIX_RLS_FOR_TABLE_EDITOR.sql
```

Then refresh the Table Editor.

---

## Why This Happened

### Two Different Tables, Two Different Purposes

```
career_fair_sessions table
├── Purpose: Career fair booking system ✅
├── Used by: Career Fair page + Admin Dashboard
└── Contains: Your bookings with is_booked = true

bookings table
├── Purpose: Inventory booking system (future feature) ❌
├── Used by: Not currently used
└── Contains: No career fair bookings
```

---

## Visual Guide

### ❌ WRONG: Looking at bookings table
```
Supabase Dashboard
└── Table Editor
    └── bookings ← WRONG TABLE
        └── Empty or no career fair bookings
```

### ✅ CORRECT: Looking at career_fair_sessions table
```
Supabase Dashboard
└── Table Editor
    └── career_fair_sessions ← CORRECT TABLE
        └── Filter: is_booked = true
            └── All your bookings! 🎉
```

---

## Proof It's Working

### Evidence 1: Admin Dashboard
- You said bookings show in admin dashboard
- Admin dashboard code:
  ```typescript
  .from('career_fair_sessions')
  .eq('is_booked', true)
  ```
- Therefore: Bookings ARE in `career_fair_sessions` table

### Evidence 2: Booking Code
- Career Fair page saves to:
  ```typescript
  .from('career_fair_sessions')
  .update({ is_booked: true, booking_data: {...} })
  ```
- Therefore: Bookings ARE being saved correctly

### Conclusion
✅ Bookings are in the database  
✅ Admin dashboard reads from database  
✅ Everything is working correctly  
✅ You just need to look at the right table!

---

## Quick Reference

### View Bookings in Table Editor
```
Table Editor → career_fair_sessions → Filter: is_booked = true
```

### View Bookings in SQL Editor
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
    booking_data->>'user_name' as user,
    booking_data->>'phone_number' as phone,
    booking_data->>'email' as email
FROM career_fair_sessions 
WHERE is_booked = true;
```

---

## That's It!

Your bookings are there. Just look at `career_fair_sessions` table, not `bookings` table.

**Need more details?** Read:
- `BOOKINGS_WORKING_CORRECTLY.md` - Full explanation
- `WHERE_ARE_MY_BOOKINGS.md` - Detailed guide
- `BOOKING_TROUBLESHOOTING_COMPLETE.md` - Troubleshooting

**Need to verify?** Run:
- `VERIFY_BOOKINGS_LOCATION.sql` - Verification queries

**Need to fix permissions?** Run:
- `FIX_RLS_FOR_TABLE_EDITOR.sql` - Fix RLS policies

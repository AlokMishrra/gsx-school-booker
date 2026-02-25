# 🚀 Setup Instructions - Fix Empty Booking Calendar

## Problem
Your booking calendar is showing but no schools are appearing. This means your database is empty.

## Solution - Run These SQL Scripts in Order

### Step 1: Check Current Database Status
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run: `CHECK_DATABASE_DATA.sql`
4. This will tell you if you have schools or not

### Step 2: Setup Database (If Empty)

#### Option A: Fresh Setup (Recommended)
If you have a fresh/empty database:

1. Open **SQL Editor** in Supabase
2. Copy and paste the entire contents of: **`FRESH_DATABASE_SETUP.sql`**
3. Click **Run**
4. Wait for completion (creates 8 schools with sessions)

#### Option B: Add More Schools from All States
After running the fresh setup, add schools from all states:

1. Open **SQL Editor** in Supabase
2. Copy and paste the entire contents of: **`ADD_ALL_STATES_SCHOOLS.sql`**
3. Click **Run**
4. Wait for completion (adds 70+ schools from all states)

### Step 3: Verify Data
1. Run `CHECK_DATABASE_DATA.sql` again
2. You should see:
   - Active Schools: 70+ (or 8 if you only ran fresh setup)
   - Total Sessions: 2000+ (29 per school)

### Step 4: Refresh Your Website
1. Go back to your browser
2. Refresh the page (F5 or Ctrl+R)
3. You should now see all schools in the booking calendar!

---

## Quick Commands

### Check if database has data:
```sql
SELECT COUNT(*) FROM schools WHERE is_active = true;
```

### If result is 0, run:
1. `FRESH_DATABASE_SETUP.sql` (creates basic structure + 8 schools)
2. `ADD_ALL_STATES_SCHOOLS.sql` (adds 70+ schools from all states)

### If result is > 0, but website still empty:
Check browser console for errors (F12 → Console tab)

---

## Files to Run (In Order)

1. ✅ **CHECK_DATABASE_DATA.sql** - Check current status
2. ✅ **FRESH_DATABASE_SETUP.sql** - Setup database structure + 8 schools
3. ✅ **ADD_ALL_STATES_SCHOOLS.sql** - Add 70+ schools from all states
4. ✅ Refresh website

---

## Expected Result

After running the scripts, your booking calendar should show:

- **School column** with checkboxes
- **School names** with tier badges
- **Physical Sessions** (P1-P9) - green cells
- **Career Fairs** (CF1-CF20) - green cells
- **State filter** dropdown with all states
- **Tier filter** dropdown (Tier 1, 2, 3)

---

## Troubleshooting

### Still not showing schools?

1. **Check browser console** (F12 → Console)
   - Look for errors in red
   - Check if API calls are failing

2. **Verify Supabase credentials** in `.env`:
   ```
   VITE_SUPABASE_URL=https://fqjsamabpcvxwunpvovs.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Check RLS policies**:
   - Run `FIX_RLS_FOR_TABLE_EDITOR.sql`
   - This ensures anonymous users can view schools

4. **Restart dev server**:
   - Stop the server (Ctrl+C in terminal)
   - Run `npm run dev` again

---

## Summary

**The issue:** Database is empty, no schools to display

**The fix:** 
1. Run `FRESH_DATABASE_SETUP.sql` to create structure
2. Run `ADD_ALL_STATES_SCHOOLS.sql` to add schools
3. Refresh website

**Expected time:** 2-3 minutes total

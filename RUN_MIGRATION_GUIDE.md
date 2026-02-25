# How to Run the Database Migration

## The Issue
The booking system is failing because the `career_fair_sessions` table doesn't exist in your Supabase database yet.

## Solution: Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste Migration**
   - Open the file: `supabase/migrations/20260223000002_cleanup_and_recreate.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for completion (should take 5-10 seconds)
   - Check for success message

5. **Verify**
   - Go to "Table Editor" in left sidebar
   - You should see `career_fair_sessions` table
   - It should have 232 rows (8 schools × 29 sessions each)

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual Table Creation

If the migration fails, you can create the table manually:

1. Go to Supabase Dashboard → SQL Editor
2. Run this minimal SQL:

```sql
-- Create the table
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

-- Enable RLS
ALTER TABLE public.career_fair_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view career fair sessions"
    ON public.career_fair_sessions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update sessions"
    ON public.career_fair_sessions FOR UPDATE
    USING (true);
```

## After Running Migration

1. **Refresh the booking page** in your browser
2. **Check browser console** (F12) for any errors
3. **Try booking a session** - it should now work!

## Troubleshooting

### Error: "relation does not exist"
- The table hasn't been created yet
- Run the migration again

### Error: "column does not exist"
- The schools table is missing new columns
- The migration adds these automatically

### Error: "permission denied"
- Check RLS policies are created
- Make sure you're using the correct Supabase credentials

### Still Having Issues?

Check the browser console (F12) for detailed error messages. The code now logs:
- Number of schools fetched
- Number of sessions fetched
- Detailed booking process logs
- Any errors with full details

Look for console messages starting with:
- "Fetching schools and sessions..."
- "Starting booking process..."
- "Error fetching sessions:"

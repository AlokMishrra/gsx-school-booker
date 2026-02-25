# 🚀 Database Setup - Run This First!

## Problem
You're getting errors because the authentication tables don't exist in your database yet.

## Solution
Run the SQL file to create all necessary tables and security policies.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Setup SQL
1. Click "New Query" button
2. Copy the ENTIRE contents of `COMPLETE_AUTH_SCHEMA_SETUP.sql`
3. Paste into the SQL editor
4. Click "Run" button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see output messages like:
```
NOTICE: ========================================
NOTICE: AUTHENTICATION SCHEMA SETUP COMPLETE!
NOTICE: ========================================
NOTICE: Tables created:
NOTICE:   ✓ user_roles
NOTICE:   ✓ colleges
NOTICE:   ✓ schools
```

### Step 4: Check Tables Created
In Supabase Dashboard:
1. Go to "Table Editor" in left sidebar
2. You should see these tables:
   - ✅ user_roles
   - ✅ colleges
   - ✅ schools
   - ✅ career_fair_sessions (if you ran the other migration)

---

## What This SQL Does

### 1. Creates Tables
- **user_roles** - Stores user roles (admin/user)
- **colleges** - Stores college profile information
- **schools** - Stores school information

### 2. Sets Up Security
- Enables Row Level Security (RLS)
- Creates policies so users can only see their own data
- Admins can see all data

### 3. Creates Triggers
- Auto-assigns 'user' role when someone registers
- Auto-updates timestamps

### 4. Creates Helper Functions
- `has_role()` - Check if user is admin
- `get_college_id()` - Get college ID for user
- `handle_new_user()` - Auto-create user role

---

## Testing After Setup

### Test 1: Register a New User
```
1. Go to: http://localhost:5173/register
2. Fill in the form:
   - College Name: Test College
   - Contact Person: John Doe
   - Email: test@college.com
   - Phone: 1234567890
   - Address: 123 Test Street
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Should redirect to login page ✅
```

### Test 2: Check Database
In Supabase Dashboard > SQL Editor, run:
```sql
-- Check if user was created
SELECT 
    u.email,
    c.name AS college_name,
    ur.role
FROM auth.users u
LEFT JOIN public.colleges c ON u.id = c.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

You should see your test user with:
- ✅ Email: test@college.com
- ✅ College name: Test College
- ✅ Role: user

### Test 3: Login
```
1. Go to: http://localhost:5173/login
2. Enter:
   - Email: test@college.com
   - Password: password123
3. Click "Sign In"
4. Should redirect to /schools ✅
```

---

## Create Admin User

After registering a user, make them admin:

### In Supabase SQL Editor:
```sql
-- Replace 'test@college.com' with your email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'test@college.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Verify Admin Role:
```sql
SELECT 
    u.email,
    ur.role,
    ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

### Test Admin Access:
1. Logout if logged in
2. Login with admin credentials
3. Should redirect to `/ZSINA/dashboard` ✅

---

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** The SQL hasn't been run yet. Go back to Step 2.

### Issue: "permission denied"
**Solution:** Make sure you're running the SQL in Supabase SQL Editor, not in your local terminal.

### Issue: "duplicate key value violates unique constraint"
**Solution:** Tables already exist. This is fine! The SQL uses `IF NOT EXISTS` so it won't break anything.

### Issue: Can't register users
**Check:**
1. Is Supabase URL correct in `.env`?
2. Is Supabase anon key correct in `.env`?
3. Did you run the SQL?
4. Check browser console for errors

### Issue: User registered but no college profile
**Check:**
```sql
-- Check if colleges table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'colleges';

-- Check if user exists
SELECT * FROM auth.users WHERE email = 'test@college.com';

-- Check if college profile exists
SELECT * FROM public.colleges WHERE email = 'test@college.com';
```

---

## Quick Verification Checklist

Run these queries in Supabase SQL Editor:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'colleges', 'schools')
ORDER BY table_name;
```
**Expected:** 3 rows (colleges, schools, user_roles)

### 2. Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'colleges', 'schools');
```
**Expected:** All should have `rowsecurity = true`

### 3. Check Trigger Exists
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```
**Expected:** 1 row

### 4. Check Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_role', 'get_college_id', 'handle_new_user');
```
**Expected:** 3 rows

---

## Environment Variables

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from:
1. Supabase Dashboard
2. Settings > API
3. Copy "Project URL" and "anon public" key

---

## Complete Flow

```
1. Run COMPLETE_AUTH_SCHEMA_SETUP.sql in Supabase
   ↓
2. Verify tables created in Table Editor
   ↓
3. Test registration at /register
   ↓
4. Check user created in auth.users
   ↓
5. Check college profile in colleges table
   ↓
6. Check user_roles has 'user' role
   ↓
7. Test login at /login
   ↓
8. (Optional) Make user admin via SQL
   ↓
9. Test admin access at /ZSINA/dashboard
   ↓
10. ✅ DONE!
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `COMPLETE_AUTH_SCHEMA_SETUP.sql` | **RUN THIS FIRST** - Creates all tables |
| `RUN_THIS_FIRST_DATABASE_SETUP.md` | This guide |
| `AUTHENTICATION_QUICK_START.md` | Testing guide |
| `AUTHENTICATION_SETUP_COMPLETE.sql` | Reference queries |

---

## Summary

1. **Open Supabase SQL Editor**
2. **Copy & paste `COMPLETE_AUTH_SCHEMA_SETUP.sql`**
3. **Click Run**
4. **Test registration and login**
5. **Done!** ✅

---

## Need Help?

If you're still having issues:
1. Check browser console (F12) for errors
2. Check Supabase Dashboard > Logs for backend errors
3. Verify `.env` file has correct credentials
4. Make sure dev server is running (`npm run dev`)

---

**Status:** Ready to run! 🚀
**Next Step:** Open Supabase SQL Editor and run the SQL file

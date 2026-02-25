# 🔧 Quick Fix - Run This SQL File

## The Problem
You got this error:
```
ERROR: operator does not exist: text = app_role
```

## The Solution
Use the **FIXED** version of the SQL file.

---

## ⚡ Quick Steps

### 1. Open Supabase SQL Editor
- Go to https://app.supabase.com
- Select your project
- Click "SQL Editor" in left sidebar

### 2. Run the Fixed SQL
- Open file: **`FIXED_AUTH_SCHEMA_SETUP.sql`**
- Copy ALL the contents
- Paste into Supabase SQL Editor
- Click **"Run"** button

### 3. Wait for Success Message
You should see:
```
NOTICE: ========================================
NOTICE: AUTHENTICATION SCHEMA SETUP COMPLETE!
NOTICE: ========================================
NOTICE: Tables created:
NOTICE:   ✓ user_roles
NOTICE:   ✓ colleges
NOTICE:   ✓ schools
```

---

## ✅ What Was Fixed

The original SQL used `app_role` enum type which caused type casting issues.

The fixed version uses:
- `TEXT` type with CHECK constraint instead of enum
- `plpgsql` functions instead of `sql` functions
- Explicit type handling to avoid casting errors

---

## 🧪 Test It Works

### Test 1: Register
```
1. Go to: http://localhost:5173/register
2. Fill form:
   - College Name: Test College
   - Contact Person: John Doe
   - Email: test@example.com
   - Phone: 1234567890
   - Address: 123 Test St
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"
4. Should redirect to login ✅
```

### Test 2: Check Database
In Supabase SQL Editor:
```sql
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

Should show your test user with role = 'user' ✅

### Test 3: Login
```
1. Go to: http://localhost:5173/login
2. Email: test@example.com
3. Password: password123
4. Click "Sign In"
5. Should redirect to /schools ✅
```

---

## 🔐 Create Admin User

After registering, make yourself admin:

```sql
-- Replace with your email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

Verify:
```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

Test admin access:
1. Logout
2. Login with admin email
3. Should redirect to `/ZSINA/dashboard` ✅

---

## 📊 Verify Everything

Run these checks in Supabase SQL Editor:

### Check 1: Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'colleges', 'schools');
```
**Expected:** 3 rows

### Check 2: RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'colleges', 'schools');
```
**Expected:** All have `rowsecurity = t`

### Check 3: Trigger Exists
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```
**Expected:** 1 row

### Check 4: Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_role', 'get_college_id', 'handle_new_user');
```
**Expected:** 3 rows

---

## 🎯 Summary

1. ✅ Use `FIXED_AUTH_SCHEMA_SETUP.sql` (not the old one)
2. ✅ Run it in Supabase SQL Editor
3. ✅ Test registration
4. ✅ Test login
5. ✅ Create admin user (optional)

---

## 🚨 Still Having Issues?

### Issue: "relation already exists"
**Solution:** Tables already exist. This is OK! The SQL uses `IF NOT EXISTS`.

### Issue: "permission denied"
**Solution:** Make sure you're in Supabase SQL Editor, not local terminal.

### Issue: Can't register
**Check:**
1. `.env` has correct Supabase URL and key
2. Dev server is running (`npm run dev`)
3. Browser console for errors (F12)

### Issue: User registered but no college profile
**Check:**
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Check if college exists
SELECT * FROM public.colleges WHERE email = 'test@example.com';

-- Check if role exists
SELECT * FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

---

## 📁 Files

| File | Use This? |
|------|-----------|
| `FIXED_AUTH_SCHEMA_SETUP.sql` | ✅ **YES - Use this one!** |
| `COMPLETE_AUTH_SCHEMA_SETUP.sql` | ❌ No - has type error |
| `QUICK_FIX_RUN_THIS.md` | 📖 This guide |

---

**Ready?** Open Supabase SQL Editor and run `FIXED_AUTH_SCHEMA_SETUP.sql` now! 🚀

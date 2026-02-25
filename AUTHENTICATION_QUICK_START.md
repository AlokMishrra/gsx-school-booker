# Authentication System - Quick Start Guide

## Overview
Your booking platform has a complete authentication system with user registration, login, and role-based access control.

## What's Already Set Up ✅

### 1. Database Tables
- ✅ `auth.users` - Supabase authentication (email/password)
- ✅ `public.colleges` - College profile information
- ✅ `public.user_roles` - User role management (admin/user)

### 2. Frontend Pages
- ✅ `/login` - Login page (src/pages/Login.tsx)
- ✅ `/register` - Registration page (src/pages/Register.tsx)
- ✅ Authentication context (src/contexts/AuthContext.tsx)

### 3. Security
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic role assignment on signup
- ✅ Protected routes for admin access

## How to Use

### For Users (Colleges)

#### Registration Flow:
1. Navigate to `/register` or click "Register" from login page
2. Fill in the registration form:
   - College Name
   - Contact Person Name
   - Email Address
   - Phone Number
   - Complete Address
   - Password (min 6 characters)
   - Confirm Password
3. Click "Create Account"
4. Check email for verification (if enabled)
5. Redirected to login page

#### Login Flow:
1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. Redirected to schools page to start booking

#### Booking Flow:
1. Browse schools on Career Fair page
2. Select schools and sessions
3. Click "Confirm Booking"
4. If not logged in → Authentication dialog appears with:
   - **Login to Your Account** button
   - **Create New Account** button
5. After login/registration → Complete booking

### For Admins

#### Creating an Admin User:
1. First, register a normal user account via `/register`
2. Run this SQL in Supabase SQL Editor:

```sql
-- Replace 'admin@example.com' with your admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

3. Login with admin credentials
4. Access admin dashboard at `/ZSINA/dashboard`

## Database Schema

### colleges Table
```sql
CREATE TABLE public.colleges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_roles Table
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing the System

### 1. Test Registration
```bash
# Navigate to registration page
http://localhost:5173/register

# Fill form and submit
# Check Supabase Dashboard > Authentication > Users
```

### 2. Test Login
```bash
# Navigate to login page
http://localhost:5173/login

# Use registered credentials
# Should redirect to /schools
```

### 3. Test Booking Authentication
```bash
# Navigate to career fair page
http://localhost:5173/schools

# Select sessions without logging in
# Click "Confirm Booking"
# Should show authentication dialog
```

### 4. Verify Database
```sql
-- Check registered users
SELECT u.email, c.name AS college_name, c.contact_person
FROM auth.users u
LEFT JOIN public.colleges c ON u.id = c.user_id
ORDER BY u.created_at DESC;

-- Check user roles
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

## Common SQL Queries

### View All Registered Colleges
```sql
SELECT 
    c.name AS college_name,
    c.contact_person,
    c.email,
    c.phone,
    c.created_at,
    u.email AS login_email
FROM public.colleges c
JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;
```

### Make User an Admin
```sql
-- Replace with actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Remove Admin Role
```sql
DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
AND role = 'admin';
```

### Delete a User Account
```sql
-- This will cascade delete from colleges and user_roles
DELETE FROM auth.users WHERE email = 'user@example.com';
```

## Security Features

### Row Level Security (RLS)
- ✅ Users can only view/edit their own college profile
- ✅ Users can only view their own bookings
- ✅ Admins can view/edit all data
- ✅ Public can view active schools (read-only)

### Password Requirements
- Minimum 6 characters
- Validated on both frontend and backend
- Stored securely by Supabase (hashed)

### Email Verification
- Optional (configure in Supabase Dashboard)
- Settings > Authentication > Email Auth
- Enable "Confirm email" if desired

## Troubleshooting

### Issue: User can't register
**Solution:** Check Supabase Dashboard > Authentication > Providers
- Ensure Email provider is enabled
- Check email templates are configured

### Issue: User registered but no college profile
**Solution:** Check the Register.tsx code
- Verify colleges table insert is working
- Check browser console for errors

### Issue: User can't login
**Solution:**
- Verify email/password are correct
- Check if email confirmation is required
- Look for errors in browser console

### Issue: Admin can't access dashboard
**Solution:**
```sql
-- Verify admin role exists
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';

-- If no admin role, add it
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;
```

## Files Reference

### Frontend
- `src/pages/Login.tsx` - Login page
- `src/pages/Register.tsx` - Registration page
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/pages/CareerFair.tsx` - Booking page with auth check

### Database
- `supabase/migrations/20260202094320_d26f45b6-371a-4959-b4b0-3689f97e2678.sql` - Main migration
- `AUTHENTICATION_SETUP_COMPLETE.sql` - Documentation and queries

## Next Steps

1. **Test the registration flow** - Create a test account
2. **Test the login flow** - Login with test account
3. **Test booking authentication** - Try booking without login
4. **Create an admin user** - Run SQL to assign admin role
5. **Test admin access** - Login as admin and access dashboard

## Support

For more details, see:
- `AUTHENTICATION_SETUP_COMPLETE.sql` - Complete SQL documentation
- `USER_AUTHENTICATION_BOOKING.md` - Booking authentication details
- Supabase Documentation: https://supabase.com/docs/guides/auth

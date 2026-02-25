# Authentication System - Quick Reference Card

## 🎯 Quick Start (3 Steps)

### 1. Test Registration
```
URL: http://localhost:5173/register
Fill form → Submit → Check Supabase Dashboard
```

### 2. Test Login
```
URL: http://localhost:5173/login
Enter credentials → Sign In → Should redirect to /schools
```

### 3. Test Booking Auth
```
URL: http://localhost:5173/schools
Select sessions → Confirm Booking → Should show auth dialog
```

## 📍 Important URLs

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | User login |
| Register | `/register` | New user registration |
| Schools | `/schools` | Browse and book sessions |
| Admin Dashboard | `/ZSINA/dashboard` | Admin only |

## 🗄️ Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auth.users` | Authentication | email, encrypted_password |
| `public.colleges` | College profiles | name, contact_person, email, phone |
| `public.user_roles` | User roles | user_id, role (admin/user) |
| `career_fair_sessions` | Bookings | school_id, is_booked, booking_data |

## 🔑 Key SQL Queries

### View All Users
```sql
SELECT u.email, c.name AS college_name, ur.role
FROM auth.users u
LEFT JOIN public.colleges c ON u.id = c.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
```

### Make User Admin
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT DO NOTHING;
```

### Delete User
```sql
DELETE FROM auth.users WHERE email = 'user@example.com';
```

## 🔐 User Roles

| Role | Access |
|------|--------|
| **user** (default) | Browse schools, book sessions, view own bookings |
| **admin** | All user access + manage schools, view all bookings, analytics |

## 📱 Frontend Components

| File | Purpose |
|------|---------|
| `src/pages/Login.tsx` | Login page with form validation |
| `src/pages/Register.tsx` | Registration with college profile |
| `src/contexts/AuthContext.tsx` | Session management, user state |
| `src/pages/CareerFair.tsx` | Booking page with auth check |

## 🛡️ Security Features

✅ Password hashing (Supabase)
✅ JWT token sessions
✅ Row Level Security (RLS)
✅ Role-based access control
✅ Automatic role assignment
✅ Protected routes

## 🚨 Common Issues & Fixes

### Can't Login
```
Check: Email/password correct?
Check: Email verified? (if required)
Check: Supabase URL in .env
```

### No College Profile
```
Check: Register.tsx colleges insert
Check: Browser console for errors
```

### Not Admin
```sql
-- Run this SQL:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;
```

### Booking Without Login
```
Check: CareerFair.tsx handleBookingClick
Check: useAuth hook imported
Check: showAuthDialog state
```

## 📊 Verification Checklist

- [ ] Can register new user
- [ ] Receives verification email (if enabled)
- [ ] Can login with credentials
- [ ] Redirects to correct page (admin → dashboard, user → schools)
- [ ] Can browse schools without login
- [ ] Shows auth dialog when booking without login
- [ ] Can complete booking after login
- [ ] Admin can access dashboard
- [ ] User data in Supabase Dashboard

## 🎨 Auth Dialog (New Feature)

When user tries to book without login:
```
┌─────────────────────────────┐
│  Authentication Required    │
├─────────────────────────────┤
│  Please login or register   │
│  to book sessions           │
│                             │
│  [Login to Your Account]    │
│                             │
│         Or                  │
│                             │
│  [Create New Account]       │
│                             │
│  [Cancel]                   │
└─────────────────────────────┘
```

## 📝 Registration Form Fields

- College Name (required)
- Contact Person (required)
- Email (required, valid format)
- Phone (required, min 10 digits)
- Address (required, min 10 chars)
- Password (required, min 6 chars)
- Confirm Password (must match)

## 🔄 Authentication Flow

```
Register → Email Verify (optional) → Login → Browse → Book
                                        ↓
                                   Check Auth
                                        ↓
                              Yes ←─────┴─────→ No
                               ↓                 ↓
                         Show Booking      Show Auth
                            Form            Dialog
```

## 💾 Environment Setup

Required in `.env`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📚 Documentation Files

1. `AUTHENTICATION_COMPLETE_SUMMARY.md` - Complete overview
2. `AUTHENTICATION_QUICK_START.md` - Step-by-step guide
3. `AUTHENTICATION_SETUP_COMPLETE.sql` - SQL documentation
4. `AUTHENTICATION_FLOW_DIAGRAM.md` - Visual diagrams
5. `USER_AUTHENTICATION_BOOKING.md` - Booking auth details
6. `AUTH_QUICK_REFERENCE.md` - This file

## 🎯 Test Credentials (Create Your Own)

```
Email: test@college.com
Password: password123
College: Test College
```

## ⚡ Quick Commands

### Start Dev Server
```bash
npm run dev
# or
bun dev
```

### Open Supabase Dashboard
```
https://app.supabase.com/project/YOUR_PROJECT_ID
```

### Check Logs
```
Browser Console (F12)
Supabase Dashboard > Logs
```

## 🎉 Status: COMPLETE ✅

All authentication features are implemented and working:
- ✅ Login page
- ✅ Register page
- ✅ Auth context
- ✅ Database tables
- ✅ Security policies
- ✅ Booking authentication
- ✅ Admin roles
- ✅ Documentation

**Ready to use!** 🚀

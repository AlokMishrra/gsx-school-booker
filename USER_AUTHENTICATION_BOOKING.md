# User Authentication for Booking System

## Overview
Added authentication requirement before users can book sessions. Users must either login or register before they can confirm their bookings.

## Changes Made

### 1. CareerFair.tsx Updates
- Added `useAuth` hook to check user authentication status
- Added `useNavigate` for redirecting to login/register pages
- Added new state `showAuthDialog` to control authentication dialog visibility
- Created `handleBookingClick()` function that checks if user is authenticated before showing booking confirmation

### 2. Authentication Flow

#### For Non-Authenticated Users:
1. User selects schools and sessions
2. User clicks "Confirm Booking" button
3. System checks if user is logged in
4. If NOT logged in → Shows authentication dialog with two options:
   - **Login to Your Account** - Redirects to `/login`
   - **Create New Account** - Redirects to `/register`

#### For Authenticated Users:
1. User selects schools and sessions
2. User clicks "Confirm Booking" button
3. System checks if user is logged in
4. If logged in → Shows booking confirmation dialog (existing flow)
5. User fills in booking details and confirms

### 3. Authentication Dialog Features
- Clean, user-friendly design
- Two clear call-to-action buttons:
  - Primary button: Login (with gradient styling)
  - Secondary button: Register (outlined style)
- Visual separator between options
- Cancel button to close dialog
- Icons for better UX (LogIn and UserPlus icons)

## User Experience

### Before Authentication:
- Users can browse schools
- Users can select schools and sessions
- Users can filter by state and tier
- Users CANNOT complete booking without authentication

### After Authentication:
- Full access to booking system
- Can complete bookings
- Booking data is associated with their account

## Technical Details

### New Imports:
```typescript
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
```

### New State:
```typescript
const { user, loading: authLoading } = useAuth();
const [showAuthDialog, setShowAuthDialog] = useState(false);
```

### Authentication Check:
```typescript
const handleBookingClick = () => {
  if (!user) {
    setShowAuthDialog(true);
    return;
  }
  setShowConfirmDialog(true);
};
```

## Benefits
1. **Security**: Only authenticated users can book sessions
2. **User Management**: Track who makes bookings
3. **Better UX**: Clear path for new users to register
4. **Data Integrity**: Associate bookings with user accounts
5. **Accountability**: Know which user made which booking

## Next Steps (Optional Enhancements)
- Pre-fill booking form with user's profile data (college name, email, etc.)
- Show user's booking history
- Add email notifications after successful booking
- Implement booking cancellation for authenticated users

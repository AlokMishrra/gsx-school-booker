# User Authentication for Booking - Requirements

## Overview
Users must be authenticated (logged in) before they can book sessions. The system should provide registration and login options.

## User Stories

### 1. As a guest user, I want to register an account so that I can book sessions
**Acceptance Criteria:**
- 1.1 When I click "Confirm Booking" without being logged in, I see an authentication dialog
- 1.2 The dialog shows two tabs: "Login" and "Register"
- 1.3 Registration form includes: Email, Password, College Name, Full Name, Phone Number
- 1.4 After successful registration, I am automatically logged in
- 1.5 After login, the booking dialog opens automatically with my details pre-filled

### 2. As a registered user, I want to login so that I can book sessions
**Acceptance Criteria:**
- 2.1 When I click "Confirm Booking" without being logged in, I see an authentication dialog
- 2.2 Login form includes: Email and Password
- 2.3 After successful login, the booking dialog opens with my details pre-filled from my profile
- 2.4 If login fails, I see an error message
- 2.5 I can switch to the "Register" tab if I don't have an account

### 3. As a logged-in user, I want my booking details auto-filled so that I don't have to enter them every time
**Acceptance Criteria:**
- 3.1 When I click "Confirm Booking" while logged in, the booking dialog opens directly
- 3.2 College Name, User Name, Phone Number, and Email are pre-filled from my profile
- 3.3 I can edit the pre-filled information if needed
- 3.4 My booking is associated with my user account

### 4. As a user, I want to see my booking history so that I can track my reservations
**Acceptance Criteria:**
- 4.1 After logging in, I can see a "My Bookings" section
- 4.2 The section shows all my past and current bookings
- 4.3 Each booking shows: School name, Session type, Slot number, Date, Status

### 5. As a user, I want to logout so that I can secure my account
**Acceptance Criteria:**
- 5.1 A "Logout" button is visible in the header when I'm logged in
- 5.2 After logout, I'm redirected to the home page
- 5.3 My session is cleared and I need to login again to book

## Technical Requirements

### Database Schema
- Use Supabase Auth for user management
- Create `user_profiles` table to store additional user information:
  - user_id (UUID, references auth.users)
  - college_name (TEXT)
  - full_name (TEXT)
  - phone_number (TEXT)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)

### Authentication Flow
1. Guest clicks "Confirm Booking"
2. System checks if user is authenticated
3. If not authenticated:
   - Show authentication dialog with Login/Register tabs
   - After successful auth, open booking dialog
4. If authenticated:
   - Open booking dialog directly with pre-filled data

### Security
- Passwords must be at least 8 characters
- Email validation required
- Phone number validation (Indian format)
- RLS policies to ensure users can only see their own bookings
- Session tokens stored securely

## UI/UX Requirements

### Authentication Dialog
- Modal dialog with two tabs: "Login" and "Register"
- Clean, modern design matching the existing UI
- Clear error messages for validation failures
- Loading states during authentication
- "Forgot Password" link in login tab

### Booking Dialog (Authenticated)
- Pre-filled fields are editable
- Show user's name in the dialog header
- "Logout" option in the dialog

### Header Updates
- Show "Login" button when not authenticated
- Show user name and "Logout" button when authenticated
- Show "My Bookings" link when authenticated

## Non-Functional Requirements

### Performance
- Authentication should complete within 2 seconds
- Pre-filling data should be instant

### Usability
- Clear feedback for all actions
- Helpful error messages
- Smooth transitions between states

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA labels for all interactive elements

## Out of Scope (Future Enhancements)
- Social login (Google, Facebook)
- Email verification
- Password reset via email
- Two-factor authentication
- User profile editing page

## Dependencies
- Supabase Auth
- React Context for auth state management
- Form validation library (optional)

## Success Metrics
- 100% of bookings are associated with authenticated users
- < 5% authentication failure rate
- Average authentication time < 2 seconds
- User satisfaction with the booking flow

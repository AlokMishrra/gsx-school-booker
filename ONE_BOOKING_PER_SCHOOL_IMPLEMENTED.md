# One Booking Per School Per Type - Implementation Complete

## Feature Overview

Users can now book only ONE physical session and ONE career fair session per school. After booking, the school becomes disabled if both types are booked.

---

## How It Works

### Booking Rules:

**Per School:**
- ✅ User can book 1 physical session
- ✅ User can book 1 career fair session
- ❌ User cannot book multiple physical sessions for same school
- ❌ User cannot book multiple career fairs for same school

**After Booking:**
- If user has booked BOTH types → School is fully disabled
- If user has booked ONE type → Can still book the other type
- Bookings persist across sessions (after logout/login)

---

## User Experience

### Scenario 1: First Time Booking
```
User logs in
   ↓
Browses schools (all enabled)
   ↓
Selects School A
   ↓
Books 1 physical session
   ↓
✅ Booking successful
   ↓
School A still available (can book career fair)
```

### Scenario 2: Booking Second Type
```
User returns (or refreshes page)
   ↓
School A shows: Can still select
   ↓
Selects School A
   ↓
Physical sessions disabled (already booked)
   ↓
Career fair sessions available
   ↓
Books 1 career fair session
   ↓
✅ Booking successful
   ↓
School A now FULLY DISABLED
```

### Scenario 3: After Logout/Login
```
User logs out
   ↓
User logs in again
   ↓
School A shows "Fully Booked" badge
   ↓
Checkbox is disabled
   ↓
Cannot select School A anymore
   ↓
Other schools still available
```

---

## Visual Indicators

### School List:

**Not Booked:**
```
☐ School Name [Tier 1]
   Location
```

**Partially Booked (1 type):**
```
☐ School Name [Tier 1]
   Location
   (Can still book other type)
```

**Fully Booked (both types):**
```
☑ School Name [Tier 1] [Fully Booked]
   Location
   (Grayed out, disabled)
```

### Session Grid:

**Physical Sessions:**
- Green = Available
- Red = Booked by others
- Blue = Your booking
- Gray = Disabled (you already booked this type)

**Career Fair Sessions:**
- Green = Available
- Red = Booked by others
- Blue = Your booking
- Gray = Disabled (you already booked this type)

---

## Technical Implementation

### 1. Fetch User Bookings on Load
```typescript
useEffect(() => {
  if (user) {
    fetchUserBookings();
  }
}, [user]);
```

### 2. Check School Booking Status
```typescript
const hasUserBookedSchool = (schoolId: string) => {
  const physicalBooked = myBookings has physical session
  const careerBooked = myBookings has career session
  return { physical, career }
};

const isSchoolFullyBooked = (schoolId: string) => {
  const bookings = hasUserBookedSchool(schoolId);
  return bookings.physical && bookings.career;
};
```

### 3. Disable School Selection
```typescript
const handleSchoolToggle = (schoolId: string) => {
  if (isSchoolFullyBooked(schoolId)) {
    toast.error('You have already booked both session types');
    return;
  }
  // ... rest of logic
};
```

### 4. Link Bookings to College
```typescript
const handleConfirmBooking = async () => {
  // Get college_id
  const { data: collegeData } = await supabase
    .from('colleges')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  // Save booking with college_id
  await supabase
    .from('career_fair_sessions')
    .update({
      is_booked: true,
      booked_by_college_id: collegeData.id,  // Link to user
      booking_data: { ... }
    });
};
```

### 5. Refresh After Booking
```typescript
// After successful booking
await fetchSchoolsAndSessions();  // Refresh all sessions
await fetchUserBookings();         // Refresh user's bookings
```

---

## Database Schema

### career_fair_sessions Table:
```sql
CREATE TABLE career_fair_sessions (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  session_type TEXT CHECK (session_type IN ('physical', 'career_fair')),
  slot_number INTEGER,
  is_booked BOOLEAN DEFAULT false,
  booked_by_college_id UUID REFERENCES colleges(id),  ← Links to user
  booking_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## Testing Guide

### Test 1: Book First Session
```
1. Login as user
2. Go to /schools
3. Select School A
4. Select 1 physical session
5. Click "Confirm Booking"
6. Fill form and confirm
7. ✅ Should succeed
8. School A should still be selectable
```

### Test 2: Book Second Session
```
1. Still logged in
2. Select School A again
3. Physical sessions should be grayed out
4. Select 1 career fair session
5. Click "Confirm Booking"
6. Fill form and confirm
7. ✅ Should succeed
8. School A should now be disabled with "Fully Booked" badge
```

### Test 3: Try to Book Third Session
```
1. Try to select School A checkbox
2. ❌ Should be disabled
3. Should show toast: "You have already booked both session types"
4. Cannot select School A
```

### Test 4: Persistence After Logout
```
1. Logout
2. Login again
3. Go to /schools
4. School A should show "Fully Booked" badge
5. Checkbox should be disabled
6. ✅ Bookings persisted
```

### Test 5: Multiple Schools
```
1. Book School A (physical + career)
2. School A becomes disabled
3. School B still available
4. Book School B (physical + career)
5. School B becomes disabled
6. School C still available
7. ✅ Can book multiple schools, one of each type
```

---

## SQL Queries for Testing

### Check User's Bookings:
```sql
SELECT 
    s.name AS school_name,
    cfs.session_type,
    cfs.slot_number,
    cfs.is_booked,
    c.name AS college_name
FROM career_fair_sessions cfs
JOIN schools s ON cfs.school_id = s.id
JOIN colleges c ON cfs.booked_by_college_id = c.id
WHERE c.user_id = 'YOUR_USER_ID'
ORDER BY s.name, cfs.session_type;
```

### Count Bookings Per School:
```sql
SELECT 
    s.name AS school_name,
    COUNT(*) FILTER (WHERE cfs.session_type = 'physical') AS physical_count,
    COUNT(*) FILTER (WHERE cfs.session_type = 'career_fair') AS career_count
FROM career_fair_sessions cfs
JOIN schools s ON cfs.school_id = s.id
JOIN colleges c ON cfs.booked_by_college_id = c.id
WHERE c.user_id = 'YOUR_USER_ID'
AND cfs.is_booked = true
GROUP BY s.name;
```

### Reset User's Bookings (for testing):
```sql
-- Clear all bookings for a user
UPDATE career_fair_sessions
SET is_booked = false, booked_by_college_id = NULL, booking_data = NULL
WHERE booked_by_college_id = (
  SELECT id FROM colleges WHERE user_id = 'YOUR_USER_ID'
);
```

---

## Features Implemented

✅ **Fetch user bookings on page load**
✅ **Fetch user bookings after login**
✅ **Check if school is fully booked**
✅ **Disable school checkbox if fully booked**
✅ **Show "Fully Booked" badge**
✅ **Gray out fully booked schools**
✅ **Prevent selecting fully booked schools**
✅ **Show toast message when trying to select**
✅ **Link bookings to college_id**
✅ **Persist bookings across sessions**
✅ **Refresh bookings after successful booking**
✅ **Visual indicators for booking status**

---

## Edge Cases Handled

✅ **User logs out and logs back in** - Bookings persist
✅ **User refreshes page** - Bookings reload
✅ **User tries to book same type twice** - Prevented
✅ **User books one type, then the other** - Allowed
✅ **User tries to select fully booked school** - Blocked with message
✅ **Multiple users booking same school** - Each tracked separately
✅ **Session already booked by someone else** - Prevented

---

## Benefits

1. **Fair Distribution** - Each user gets limited slots
2. **Prevents Hoarding** - Can't book multiple sessions of same type
3. **Clear Feedback** - Visual indicators show booking status
4. **Persistent** - Bookings saved across sessions
5. **User-Friendly** - Clear messages and disabled states
6. **Scalable** - Works for any number of schools

---

## Summary

Users can now:
- ✅ Book 1 physical session per school
- ✅ Book 1 career fair session per school
- ✅ See which schools they've fully booked
- ✅ Have bookings persist after logout/login
- ❌ Cannot book more than one of each type per school
- ❌ Cannot select schools they've fully booked

**Status:** Fully Implemented and Working ✅

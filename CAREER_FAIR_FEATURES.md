# Career Fair Booking System - Features

## Overview
A comprehensive career fair booking system where colleges can book slots at different schools with smart selection features.

## Key Features

### 1. School Selection (Left Panel)
- List of 8 schools with names and locations
- Click to select a school
- Selected school is highlighted with primary color
- **Booking status indicator**: Green checkmark shows booked schools
- **Progress counter**: Shows "X of 8 booked" at the top
- Scrollable list for easy navigation

### 2. Row Selection System (NEW!)
- **Selection circles** on the left of each row
- Click a circle to select that row number
- When a row is selected, a button appears: "Book Row X for All Schools"
- **One-click booking**: Books the same row number across all available schools
- Automatically finds the first available date for each school
- Skips schools that are already booked

### 3. Calendar View (Right Panel)
- **30-day calendar** showing availability for the next month
- **9 rows per school** representing different booking slots
- **20 total bookings available** per school per date

### 4. Visual Indicators
- **Green cells**: Available slots (darker, clickable)
- **Red cells**: Already booked by others (faded, disabled)
- **Blue cells**: Your bookings (with checkmark icon)
- **Gray cells**: School disabled (when you already have a booking at that school)
- **Badge on each date**: Shows available slots (e.g., "15/20")
- **"Already Booked" badge**: Shows when viewing a school you've already booked

### 5. Booking Rules (UPDATED!)
- ✅ Each college can book **only ONE session per school** (not one row, but one session total)
- ✅ Once you book any slot at a school, ALL other dates at that school become disabled (gray)
- ✅ Cannot book already occupied slots
- ✅ Real-time visual feedback
- ✅ Quick booking: Select a row and book it across all schools at once

### 6. Booking Dialog
When you click an available slot:
- Popup shows booking confirmation
- Displays: School name, Date, Row number
- Important note about one-session-per-school rule
- Confirm or Cancel options

### 7. Navigation
- Accessible from main navigation menu
- Link on homepage
- Mobile responsive design

## How to Use

### Method 1: Individual Booking
1. **Select a School**: Click on any school from the left panel
2. **View Calendar**: See 30 days of availability with 9 rows
3. **Check Availability**: Look at the badge showing available slots
4. **Book a Slot**: Click on a green (available) cell
5. **Confirm**: Review details in the popup and confirm
6. **Track Bookings**: Your bookings appear in blue with checkmarks

### Method 2: Bulk Booking (NEW!)
1. **Select a Row**: Click the circle next to any row number (e.g., Row 3)
2. **Click "Book Row X for All Schools"**: Button appears at the top
3. **Automatic Booking**: System books Row 3 at all schools (first available date)
4. **Instant Results**: All bookings appear in blue across all schools

## Important Rules

- **One Session Per School**: Once you book at a school, you cannot book another session there
- **Disabled State**: After booking, that school's entire calendar turns gray
- **Visual Confirmation**: Booked schools show a green checkmark in the school list
- **No Changes**: Bookings are final and cannot be modified

## Technical Details

- Built with React + TypeScript
- Uses shadcn/ui components
- Responsive design (mobile & desktop)
- Mock data for demonstration
- State management with React hooks
- Smooth animations and transitions

## Access the Application

The app is running at:
- Local: http://localhost:8081/
- Career Fair Page: http://localhost:8081/career-fair

## Future Enhancements (Optional)

- Integration with Supabase backend
- Real-time booking updates
- Email notifications
- Payment integration
- Booking history
- Admin panel for schools
- Export booking reports
- Undo/Cancel bookings

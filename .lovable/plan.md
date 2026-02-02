
# GSX (Global ServiceX) - School Inventory Booking System

A modern, minimalist platform where colleges can register, browse, and book school facilities and equipment with time-based slots, featuring Razorpay payment integration and a comprehensive admin panel.

---

## 🎨 Design & Branding

**Brand Identity:**
- Name: GSX - Global ServiceX
- Modern gradient color scheme with vibrant accents
- Minimalist, professional interface
- Smooth dropdown animations and modern UI transitions
- Clean typography with ample whitespace

---

## 👥 User Roles

### 1. Colleges (Customers)
- Register and login to the platform
- Browse available schools and their inventory
- Book facilities and equipment with time slots
- Make payments via Razorpay
- View booking history and receipts

### 2. Admin (You)
- Full control over schools and inventory
- Manage all bookings (approve, reject, cancel)
- View reports and analytics
- Bulk operations via CSV upload

---

## 📄 Pages & Features

### Public Pages

**1. Landing Page**
- Hero section with GSX branding and value proposition
- How it works section (3-step process)
- Featured schools/inventory preview
- Call-to-action for college registration

**2. Schools/Inventory Listing**
- Browse all available schools
- Filter by location, availability, price range
- View basic info: name, address, contact, description
- Per-item pricing displayed clearly
- Animated dropdown for details

### College Portal (After Registration)

**3. College Registration & Login**
- Email/password registration
- College details: name, contact person, email, phone, address
- Secure authentication via Supabase

**4. School Detail Page**
- Full school information and description
- List of available facilities (classrooms, labs, auditoriums, sports grounds)
- List of available equipment (projectors, computers, lab equipment)
- Individual pricing for each item
- "Add to Booking" button for each item
- Quantity selector for equipment

**5. Booking Cart**
- List of selected schools/items
- Quantity adjustment
- Running total calculation
- "Proceed to Schedule" button

**6. Date & Time Selection**
- Calendar date picker
- Hourly time slot selection (combinable slots)
- Availability checker (grayed out unavailable slots)
- Booking summary with date/time/items
- "Proceed to Payment" button

**7. Payment Page**
- Order summary with complete breakdown
- Razorpay integration for secure payments
- Payment confirmation and receipt
- Booking confirmation with unique booking ID

**8. College Dashboard**
- View all bookings (upcoming, past, cancelled)
- Booking details and receipts
- Profile management

### Admin Panel

**9. Admin Dashboard**
- Overview metrics: total bookings, revenue, active schools
- Recent bookings list
- Quick actions

**10. School Management**
- Add new schools with details (name, address, contact, description)
- Edit existing school information
- Delete schools
- Add facilities and equipment to each school
- Set individual pricing per item
- Activate/deactivate listings

**11. Bulk Operations**
- CSV upload for adding multiple schools at once
- CSV template download
- Bulk edit capabilities
- Import/export functionality

**12. Booking Management**
- View all bookings from all colleges
- Filter by date, school, college, status
- Approve or reject pending bookings
- Cancel bookings with refund options
- View booking details and payment status

**13. Reports & Analytics**
- Revenue reports (daily, weekly, monthly)
- Booking analytics (popular schools, peak times)
- College activity reports
- Export reports to CSV/PDF

---

## 🗄️ Database Structure (Supabase)

- **colleges** - Registered college accounts and details
- **schools** - School information (name, address, contact, description)
- **inventory_items** - Facilities and equipment per school with pricing
- **time_slots** - Available hourly slots per item per date
- **bookings** - Booking records linking colleges to items
- **booking_items** - Individual items within each booking
- **payments** - Payment records from Razorpay
- **user_roles** - Admin role management (secure, separate table)

---

## 💳 Payment Flow

1. College adds items to cart
2. Selects date and time slots
3. Reviews booking summary
4. Redirected to Razorpay checkout
5. Payment confirmation received
6. Booking confirmed and email sent

---

## 🔐 Security

- Secure authentication for colleges and admin
- Row-level security on all database tables
- Admin role stored in separate table (not in profiles)
- Server-side validation for all inputs
- Razorpay webhook for payment verification

---

## ✨ Modern UI Features

- Smooth animated dropdowns
- Skeleton loading states
- Toast notifications for actions
- Responsive design (mobile-friendly)
- Gradient accents and modern shadows
- Micro-interactions and hover effects

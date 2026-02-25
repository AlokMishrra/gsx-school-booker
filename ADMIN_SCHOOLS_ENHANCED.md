# Admin Schools Page Enhanced

## Summary
Enhanced the Admin Schools page to allow admins to add and edit city, location, tier, fees, student strength, and image URL for schools.

## New Fields Added

### 1. City (Required)
- **Type**: Text input
- **Purpose**: Specify the city where the school is located
- **Example**: Delhi, Mumbai, Bangalore
- **Used for**: Location filtering in booking page

### 2. Tier (Required)
- **Type**: Dropdown select
- **Options**:
  - Tier 1 - Premium (excellent infrastructure, high fees)
  - Tier 2 - Quality (good facilities, moderate fees)
  - Tier 3 - Standard (basic facilities, affordable fees)
- **Default**: Tier 2
- **Used for**: School categorization and filtering

### 3. School Fee (Optional)
- **Type**: Text input
- **Format**: ₹50,000
- **Purpose**: Display the school's fee structure
- **Shown in**: Booking page tooltip

### 4. Average Fee (Optional)
- **Type**: Text input
- **Format**: ₹45,000
- **Purpose**: Display average fee information
- **Shown in**: Booking page tooltip

### 5. Student Strength (Optional)
- **Type**: Number input
- **Example**: 2500
- **Purpose**: Show total number of students
- **Shown in**: Booking page tooltip and school card

### 6. Image URL (Optional)
- **Type**: URL input
- **Format**: https://example.com/image.jpg
- **Purpose**: Display school image in booking page
- **Validation**: Must be a valid URL

## Form Layout

### Section 1: Basic Information
- School Name (full width)
- City + Tier (2 columns)

### Section 2: Location
- Address (full width)

### Section 3: Contact
- Email + Phone (2 columns)

### Section 4: Fees & Capacity
- School Fee + Average Fee + Student Strength (3 columns)

### Section 5: Media
- Image URL (full width)

### Section 6: Additional
- Description (full width)

## School Card Display

Now shows:
- School name
- Active/Inactive badge
- Tier badge (if set)
- City (bold) + Address + Phone
- Fee and Student Strength (if set)

## Data Storage

All fields are stored in the `schools` table:
```sql
- name: TEXT
- city: TEXT
- address: TEXT
- contact_email: TEXT
- contact_phone: TEXT
- tier: INTEGER (1, 2, or 3)
- school_fee: TEXT
- average_fee: TEXT
- student_strength: INTEGER
- image_url: TEXT
- description: TEXT
```

## Integration with Booking Page

The booking page now displays:
- City in location filter dropdown
- Tier badge on school cards
- School fee and average fee in tooltip
- Student strength in tooltip
- School image (if URL provided)

## Validation Rules

1. **City**: Required, min 2 characters
2. **Tier**: Required, must be 1, 2, or 3
3. **School Fee**: Optional, text format
4. **Average Fee**: Optional, text format
5. **Student Strength**: Optional, must be a number
6. **Image URL**: Optional, must be valid URL or empty

## Benefits

1. **Better Organization**: Schools categorized by city and tier
2. **Rich Information**: More details for users to make informed decisions
3. **Visual Appeal**: School images enhance the booking experience
4. **Flexible Filtering**: Filter by location and tier
5. **Transparency**: Fee information helps users understand costs

## Admin Workflow

1. Click "Add School" or edit existing school
2. Fill in required fields (Name, City, Tier, Address, Email, Phone)
3. Optionally add fees, student strength, and image URL
4. Save to database
5. School appears in booking page with all information

## Future Enhancements (Optional)

- Image upload instead of URL
- Multiple images per school
- School logo separate from main image
- Facilities list (playground, library, etc.)
- Accreditation badges
- School ratings/reviews
- Operating hours
- Holiday calendar

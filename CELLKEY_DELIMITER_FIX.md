# CellKey Delimiter Fix

## Problem
The booking system was failing with error:
```
Session not found: c19d3fb1-80e6-4006-b06f-baee4db6c823-physical-0 
(school: c19d3fb1, type: career_fair, slot: 4007)
```

## Root Cause
The cellKey format used hyphens (`-`) as delimiters:
```javascript
const cellKey = `${schoolId}-${type}-${index}`;
```

When splitting by `-`, the UUID (which contains hyphens) was being broken into pieces:
- UUID: `c19d3fb1-80e6-4006-b06f-baee4db6c823`
- Split result: `['c19d3fb1', '80e6', '4006', 'b06f', 'baee4db6c823', 'physical', '0']`
- Expected: `['c19d3fb1-80e6-4006-b06f-baee4db6c823', 'physical', '0']`

This caused the parser to incorrectly identify:
- schoolId as just `c19d3fb1` (incomplete UUID)
- type as something random from the UUID parts
- index as a huge number

## Solution
Changed the delimiter from hyphen (`-`) to pipe (`|`):
```javascript
const cellKey = `${schoolId}|${type}|${index}`;
```

Now splitting works correctly:
```javascript
const [schoolId, type, index] = cellKey.split('|');
// Result: ['c19d3fb1-80e6-4006-b06f-baee4db6c823', 'physical', '0']
```

## Files Changed
- `src/pages/CareerFair.tsx`

## All Updated Locations

### 1. Cell Key Construction
- `handleCellClick()` - Line ~166
- `handleSelectRow()` - Line ~294
- `handleSelectColumn()` - Lines ~316, ~333
- `getCellStatus()` - Line ~449

### 2. Cell Key Parsing
- `handleConfirmBooking()` - Line ~364 (booking submission)
- Dialog display - Line ~946 (showing selected sessions)

### 3. Cell Key Comparisons
- `handleCellClick()` - Lines ~172, ~190, ~193, ~200, ~210
- `handleSchoolToggle()` - Line ~231
- `handleRemoveSchool()` - Line ~256
- `handleSelectRow()` - Lines ~279, ~287
- `handleSelectColumn()` - Lines ~313, ~320
- `getCellStatus()` - Line ~456
- Rendering (column indicators) - Lines ~598, ~636, ~717, ~778

## Testing
After this fix:
1. ✅ Cell keys are constructed correctly with pipe delimiter
2. ✅ Cell keys are parsed correctly (UUID stays intact)
3. ✅ Session lookup works (correct schoolId, type, and slot number)
4. ✅ Booking saves to database successfully
5. ✅ UI updates correctly after booking

## Example
Before:
```
cellKey: "c19d3fb1-80e6-4006-b06f-baee4db6c823-physical-0"
split('-'): ["c19d3fb1", "80e6", "4006", "b06f", "baee4db6c823", "physical", "0"]
schoolId: "c19d3fb1" ❌ WRONG
```

After:
```
cellKey: "c19d3fb1-80e6-4006-b06f-baee4db6c823|physical|0"
split('|'): ["c19d3fb1-80e6-4006-b06f-baee4db6c823", "physical", "0"]
schoolId: "c19d3fb1-80e6-4006-b06f-baee4db6c823" ✅ CORRECT
```

## Impact
This fix resolves the booking failure and allows the system to:
- Correctly identify which session to book
- Update the database with the right session ID
- Display booking confirmations properly
- Maintain the one-per-type booking rule correctly

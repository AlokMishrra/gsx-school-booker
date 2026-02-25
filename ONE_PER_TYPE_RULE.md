# One Physical + One Career Per School - Final Rule ✅

## 🎯 Booking Rule

### Each College Can Select:
- ✅ **ONE Physical Session** per school (P1-P9)
- ✅ **ONE Career Fair** per school (CF1-CF20)
- ❌ **NOT multiple** of the same type per school

---

## 📋 How It Works

### Auto-Replace Behavior

When you click a second session of the same type for a school, the system automatically replaces the previous selection:

**Example 1: Physical Sessions**
```
1. Click P3 for DPS → P3 selected (blue)
2. Click P5 for DPS → P3 deselected, P5 selected (blue)
3. Click P8 for DPS → P5 deselected, P8 selected (blue)

Result: Only P8 is selected for DPS
```

**Example 2: Career Fairs**
```
1. Click CF5 for Ryan → CF5 selected (blue)
2. Click CF10 for Ryan → CF5 deselected, CF10 selected (blue)
3. Click CF15 for Ryan → CF10 deselected, CF15 selected (blue)

Result: Only CF15 is selected for Ryan
```

**Example 3: One of Each Type**
```
1. Click P3 for DAV → P3 selected
2. Click CF10 for DAV → CF10 selected (P3 still selected)
3. Click P7 for DAV → P3 deselected, P7 selected (CF10 still selected)
4. Click CF20 for DAV → CF10 deselected, CF20 selected (P7 still selected)

Result: P7 + CF20 selected for DAV (one of each type)
```

---

## 🎨 Visual Feedback

### Selection States

**No Selection:**
```
DPS: [P1] [P2] [P3] [P4] [P5] [P6] [P7] [P8] [P9]
     🟢  🔴  🟢  🟢  🔴  🟢  🔴  🟢  🟢
     All green cells available to click
```

**One Physical Selected:**
```
DPS: [P1] [P2] [P3] [P4] [P5] [P6] [P7] [P8] [P9]
     🟢  🔴  🔵  🟢  🔴  🟢  🔴  🟢  🟢
              ↑
           Selected (P3)
     
     Click P8 → P3 turns green, P8 turns blue
```

**One Physical + One Career Selected:**
```
DPS Physical: [P1] [P2] [P3] [P4] [P5]
              🟢  🔴  🔵  🟢  🔴
                       ↑
                   Selected (P3)

DPS Career:   [CF1][CF2][CF3][CF4][CF5]
              🟢  🟢  🔴  🟢  🔵
                                  ↑
                              Selected (CF5)

Result: P3 + CF5 selected for DPS
```

---

## 🚀 Bulk Selection Behavior

### Row Selector (○ next to school)

**Behavior:**
- Selects first available physical session
- Does NOT select multiple

**Example:**
```
Click ○ next to DPS
→ First available physical session selected (e.g., P1)
→ Only ONE physical session selected
```

### Column Selector (○ above column)

**Behavior:**
- Selects that column for all schools
- Replaces any existing selection of that type
- One per school

**Example:**
```
Click ○ above P5
→ P5 selected for all schools (that have P5 available)
→ If DPS had P3 selected, it's replaced with P5
→ Each school has only ONE physical session selected
```

---

## 💡 Smart Selection Logic

### Automatic Replacement

```typescript
When clicking a cell:
1. Check if school already has a selection of this type
2. If yes → Remove old selection
3. Add new selection
4. Result: Only one selection per type per school
```

### Example Flow

```
State: DPS has P3 selected

User clicks P7 for DPS:
1. System finds P3 is selected for DPS (physical)
2. System removes P3 from selection
3. System adds P7 to selection
4. UI updates: P3 turns green, P7 turns blue

Final: Only P7 selected for DPS
```

---

## 📊 Valid Selection Examples

### Example 1: One Physical Each
```
DPS:    P3 selected
Ryan:   P5 selected
DAV:    P1 selected
KV:     P8 selected
Result: ✅ Valid (one physical per school)
```

### Example 2: One Career Each
```
DPS:    CF10 selected
Ryan:   CF15 selected
DAV:    CF5 selected
KV:     CF20 selected
Result: ✅ Valid (one career per school)
```

### Example 3: One of Each Type
```
DPS:    P3 + CF10 selected
Ryan:   P5 + CF15 selected
DAV:    P1 + CF5 selected
KV:     P8 + CF20 selected
Result: ✅ Valid (one physical + one career per school)
```

### Example 4: Mixed Selections
```
DPS:    P3 + CF10 selected
Ryan:   P5 only selected
DAV:    CF5 only selected
KV:     Nothing selected
Result: ✅ Valid (max one per type per school)
```

---

## ❌ Invalid Selections (Prevented)

### Example 1: Multiple Physical
```
Attempt: Select P3 and P5 for DPS
Result: Only P5 remains (P3 auto-removed)
```

### Example 2: Multiple Career
```
Attempt: Select CF10 and CF15 for Ryan
Result: Only CF15 remains (CF10 auto-removed)
```

### Example 3: Three Physical
```
Attempt: Select P1, P3, P5 for DAV
Result: Only P5 remains (P1 and P3 auto-removed)
```

---

## 🎯 Confirmation Dialog

### What You'll See

```
Selected Sessions:
- DPS Delhi: Physical Session - Slot 3 (P3)
- DPS Delhi: Career Fair - Slot 10 (CF10)
- Ryan Mumbai: Physical Session - Slot 5 (P5)
- DAV Bangalore: Career Fair - Slot 15 (CF15)

Total Selected: 4 session(s)
```

**Note**: Maximum 2 sessions per school (1 physical + 1 career)

---

## 🌐 Try It Now!

**URL**: http://localhost:8081/career-fair

### Test Scenario 1: Auto-Replace
```
1. Click P3 for DPS → P3 turns blue
2. Click P5 for DPS → P3 turns green, P5 turns blue
3. Observe: Only one physical session selected
```

### Test Scenario 2: One of Each
```
1. Click P3 for DPS → P3 turns blue
2. Click CF10 for DPS → CF10 turns blue (P3 stays blue)
3. Click P7 for DPS → P3 turns green, P7 turns blue (CF10 stays blue)
4. Observe: One physical + one career selected
```

### Test Scenario 3: Bulk Selection
```
1. Click ○ above P5 → P5 selected for all schools
2. Click ○ above CF10 → CF10 selected for all schools
3. Observe: Each school has P5 + CF10 (one of each)
```

---

## ✅ Summary

**Rule:**
- ONE physical session per school
- ONE career fair per school
- Total: Maximum 2 selections per school

**Behavior:**
- Clicking a second session of same type → Auto-replaces first
- No alerts or warnings
- Smooth, automatic replacement
- Visual feedback (blue → green → blue)

**Result:**
- Clean, controlled selection
- Prevents overbooking
- Intuitive user experience
- Enterprise-ready booking system

**Perfect for controlled booking with clear limits!** 🚀✅

---

## 🎉 Final State

**Each School Can Have:**
```
✅ 0 selections (nothing selected)
✅ 1 selection (physical OR career)
✅ 2 selections (physical AND career)
❌ 3+ selections (NOT POSSIBLE - auto-replaced)
```

**Visual Indicators:**
- 🟢 Green = Available
- 🔴 Red = Booked/Unavailable
- 🔵 Blue = Your selection (max 1 physical + 1 career per school)
- 🔵 Dark Blue = Confirmed booking

**The system now enforces one physical + one career per school with automatic replacement!** 🎊

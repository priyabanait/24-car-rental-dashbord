# Booking Conflict Prevention System

## Overview
The system now prevents double-booking of vehicles by checking for existing bookings before allowing new ones. A vehicle cannot be booked by multiple users for overlapping date ranges.

---

## Backend Implementation

### 1. Booking Conflict Check (On Booking Creation)

**File:** `backend/routes/bookings.js`

When a user tries to create a booking, the system:

1. **Validates the requested dates** (tripStartDate and tripEndDate)
2. **Checks for conflicting bookings** with the same vehicle
3. **Blocks the booking** if there's a conflict
4. **Allows the booking** if the vehicle is available

#### Conflict Detection Logic

A booking conflict exists when:
- New booking starts during an existing booking
- New booking ends during an existing booking  
- New booking completely contains an existing booking

Only active bookings are checked (`pending`, `confirmed`, `ongoing` status).

**Example Code:**
```javascript
const conflictingBookings = await Booking.find({
  vehicleId,
  status: { $in: ['pending', 'confirmed', 'ongoing'] },
  $or: [
    {
      // New booking starts during an existing booking
      tripStartDate: { $lte: startDate },
      tripEndDate: { $gte: startDate }
    },
    {
      // New booking ends during an existing booking
      tripStartDate: { $lte: endDate },
      tripEndDate: { $gte: endDate }
    },
    {
      // New booking completely contains an existing booking
      tripStartDate: { $gte: startDate },
      tripEndDate: { $lte: endDate }
    }
  ]
});
```

#### Response on Conflict

**Status Code:** `409 Conflict`

**Response:**
```json
{
  "success": false,
  "message": "This vehicle is already booked for the selected dates",
  "conflictDetails": {
    "bookedFrom": "2025-12-20T00:00:00.000Z",
    "bookedUntil": "2025-12-25T00:00:00.000Z",
    "bookingStatus": "confirmed"
  }
}
```

---

### 2. Check Availability Endpoint

**Endpoint:** `GET /api/bookings/check-availability/:vehicleId`

Allows frontend to check if a vehicle is available for specific dates before attempting to book.

**Query Parameters:**
- `startDate` (required): Trip start date (ISO format)
- `endDate` (optional): Trip end date (defaults to start date)

**Example Request:**
```bash
GET /api/bookings/check-availability/675d9c8f2e1e8f001f8b4567?startDate=2025-12-20&endDate=2025-12-25
```

**Response (Available):**
```json
{
  "success": true,
  "available": true,
  "requestedDates": {
    "startDate": "2025-12-20T00:00:00.000Z",
    "endDate": "2025-12-25T00:00:00.000Z"
  },
  "conflictingBookings": []
}
```

**Response (Not Available):**
```json
{
  "success": true,
  "available": false,
  "requestedDates": {
    "startDate": "2025-12-20T00:00:00.000Z",
    "endDate": "2025-12-25T00:00:00.000Z"
  },
  "conflictingBookings": [
    {
      "_id": "675d9c8f2e1e8f001f8b4568",
      "tripStartDate": "2025-12-18T00:00:00.000Z",
      "tripEndDate": "2025-12-22T00:00:00.000Z",
      "status": "confirmed",
      "driverName": "John Doe"
    }
  ]
}
```

---

### 3. Filter Booked Vehicles from Search Results

**File:** `backend/routes/vehicles.js`

When searching for vehicles with trip dates, the system automatically filters out vehicles that are already booked.

**Endpoint:** `GET /api/vehicles/search/by-location`

**Query Parameters:**
- `tripStart` (optional): Trip start date
- `tripEnd` (optional): Trip end date
- ... (other filters like city, category, etc.)

**How It Works:**
1. Fetches all vehicles matching filters (city, category, fuel type, etc.)
2. If `tripStart` is provided, finds all vehicles with conflicting bookings
3. Removes booked vehicles from the results
4. Returns only available vehicles

**Example:**
```javascript
// User searches for cars in Bangalore from Dec 20-25
GET /api/vehicles/search/by-location?city=Bangalore&tripStart=2025-12-20&tripEnd=2025-12-25

// Response will only include vehicles that are NOT booked during these dates
```

---

## Frontend Integration

### 1. Real-time Availability Check

Before booking, check if the vehicle is available:

```javascript
const checkAvailability = async (vehicleId, startDate, endDate) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  
  const params = new URLSearchParams({
    startDate,
    endDate: endDate || startDate
  });
  
  const res = await fetch(
    `${API_BASE}/api/bookings/check-availability/${vehicleId}?${params}`
  );
  
  const data = await res.json();
  
  if (!data.available) {
    alert(`Vehicle is not available. Already booked from ${
      new Date(data.conflictingBookings[0].tripStartDate).toLocaleDateString()
    } to ${
      new Date(data.conflictingBookings[0].tripEndDate).toLocaleDateString()
    }`);
    return false;
  }
  
  return true;
};
```

### 2. Handle Booking Conflict Errors

```javascript
const createBooking = async (bookingData) => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const data = await res.json();
    
    if (res.status === 409) {
      // Booking conflict
      alert(data.message);
      console.log('Conflict details:', data.conflictDetails);
      return null;
    }
    
    if (!res.ok) {
      throw new Error(data.message);
    }
    
    return data.booking;
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
};
```

### 3. Search with Date Filters

When users search for vehicles, include trip dates to see only available vehicles:

```javascript
const searchVehicles = async (filters) => {
  const params = new URLSearchParams({
    city: filters.city,
    location: filters.location,
    tripStart: filters.tripStartDate,  // Include trip dates
    tripEnd: filters.tripEndDate,
    status: 'active'
  });
  
  const res = await fetch(
    `${API_BASE}/api/vehicles/search/by-location?${params}`
  );
  
  const data = await res.json();
  return data.data; // Only returns available vehicles
};
```

---

## Booking Status Flow

### Active Bookings (Block Vehicle)
- `pending` - Booking created, awaiting confirmation
- `confirmed` - Booking confirmed by admin/system
- `ongoing` - Trip in progress

### Inactive Bookings (Don't Block Vehicle)
- `completed` - Trip finished
- `cancelled` - Booking cancelled
- `rejected` - Booking rejected by admin

Only active bookings prevent new bookings from being created.

---

## Database Indexes

For optimal performance, ensure indexes on:

```javascript
// Booking collection
{
  vehicleId: 1,
  tripStartDate: 1,
  tripEndDate: 1,
  status: 1
}
```

---

## Edge Cases Handled

1. **Same-day bookings**: If tripEndDate is not provided, it defaults to tripStartDate
2. **Cancelled bookings**: Don't block future bookings
3. **Completed bookings**: Don't block future bookings
4. **Multiple date range checks**: All three overlap scenarios are checked

---

## Testing Scenarios

### Test 1: Overlapping Start Date
```
Existing: Dec 20 - Dec 25
New Request: Dec 22 - Dec 28
Result: ❌ Conflict (starts during existing booking)
```

### Test 2: Overlapping End Date
```
Existing: Dec 20 - Dec 25
New Request: Dec 18 - Dec 22
Result: ❌ Conflict (ends during existing booking)
```

### Test 3: Fully Contained
```
Existing: Dec 20 - Dec 25
New Request: Dec 21 - Dec 23
Result: ❌ Conflict (contained within existing booking)
```

### Test 4: No Overlap
```
Existing: Dec 20 - Dec 25
New Request: Dec 26 - Dec 30
Result: ✅ Available
```

### Test 5: Cancelled Booking
```
Existing (Cancelled): Dec 20 - Dec 25
New Request: Dec 20 - Dec 25
Result: ✅ Available (cancelled bookings don't block)
```

---

## Benefits

1. **Prevents double-booking**: No two users can book the same car for overlapping dates
2. **Real-time availability**: Search results show only available vehicles
3. **Better UX**: Users see availability before attempting to book
4. **Clear error messages**: Users understand why booking failed
5. **Conflict details**: Shows when the vehicle is already booked

---

## Future Enhancements

1. **Grace periods**: Add buffer time between bookings for cleaning/maintenance
2. **Booking calendar**: Visual calendar showing vehicle availability
3. **Alternative suggestions**: When a vehicle is booked, suggest similar available vehicles
4. **Waitlist**: Allow users to join a waitlist if their preferred dates are booked
5. **Flexible dates**: "Show me availability +/- 3 days"

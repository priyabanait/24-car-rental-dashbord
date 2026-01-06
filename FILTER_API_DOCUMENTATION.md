# Vehicle Filter APIs Documentation

## Overview
This document describes the API endpoints for filtering vehicles on the customer-facing website.

## API Endpoints

### 1. Get Filter Options
**Endpoint:** `GET /api/vehicles/filter-options`

**Description:** Returns all available filter options (categories, fuel types, seating capacities, price range) for active vehicles. Can be scoped to a specific city or location.

**Query Parameters:**
- `city` (optional): Filter options for a specific city
- `location` (optional): Filter options for a specific location
- `status` (optional): Vehicle status filter (default: "active")

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["Bike", "Hatchback", "Sedan", "SUV"],
    "fuelTypes": ["Petrol", "Diesel", "Electric", "CNG"],
    "seatingCapacities": [2, 4, 5, 7],
    "priceRange": {
      "min": 99,
      "max": 5000
    }
  }
}
```

**Example Usage:**
```javascript
// Get all filter options
fetch('http://localhost:4000/api/vehicles/filter-options?status=active')

// Get filter options for a specific city
fetch('http://localhost:4000/api/vehicles/filter-options?city=Bangalore&status=active')
```

---

### 2. Search Vehicles by Location
**Endpoint:** `GET /api/vehicles/search/by-location`

**Description:** Search and filter vehicles based on location, category, fuel type, seating capacity, and price range.

**Query Parameters:**
- `city` (optional): City name (exact match, case-insensitive)
- `location` (optional): Location/area within city (partial match)
- `category` (optional): Vehicle category (exact match, case-insensitive)
- `fuelType` (optional): Fuel type (exact match, case-insensitive)
- `seatingCapacity` (optional): Number of seats
- `minPrice` (optional): Minimum price per day
- `maxPrice` (optional): Maximum price per day
- `status` (optional): Vehicle status (default: "active")
- `tripStart` (optional): Trip start date (for future availability check)
- `tripEnd` (optional): Trip end date (for future availability check)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "filters": {
    "city": "Bangalore",
    "location": "MG Road",
    "category": "Hatchback",
    "fuelType": "Petrol",
    "seatingCapacity": "5",
    "status": "active"
  },
  "data": [
    {
      "vehicleId": "12345",
      "registrationNumber": "KA01AB1234",
      "category": "Hatchback",
      "brand": "Maruti",
      "model": "Swift",
      "carName": "Swift VXI",
      "fuelType": "Petrol",
      "seatingCapacity": 5,
      "pricePerDay": 1200,
      "securityDeposit": 2000,
      "city": "Bangalore",
      "location": "MG Road, Bangalore, Karnataka - 560001, India",
      "carFullPhoto": "https://cloudinary.com/...",
      "status": "active"
    }
  ]
}
```

**Example Usage:**
```javascript
// Search all active vehicles in Bangalore
fetch('http://localhost:4000/api/vehicles/search/by-location?city=Bangalore&status=active')

// Search Hatchback cars with Petrol fuel type
fetch('http://localhost:4000/api/vehicles/search/by-location?city=Bangalore&category=Hatchback&fuelType=Petrol&status=active')

// Search 5-seater vehicles within price range
fetch('http://localhost:4000/api/vehicles/search/by-location?city=Bangalore&seatingCapacity=5&minPrice=1000&maxPrice=2000&status=active')
```

---

## Frontend Implementation

### State Management
```javascript
const [filterOptions, setFilterOptions] = useState({
  categories: [],
  fuelTypes: [],
  seatingCapacities: [],
  priceRange: { min: 0, max: 0 }
});

const [filters, setFilters] = useState({
  city: '',
  location: '',
  category: '',
  fuelType: '',
  seatingCapacity: '',
  minPrice: '',
  maxPrice: ''
});
```

### Fetching Filter Options
```javascript
const fetchFilterOptions = async () => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    
    const queryParams = new URLSearchParams({
      status: 'active'
    });
    
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.location) queryParams.append('location', filters.location);
    
    const res = await fetch(`${API_BASE}/api/vehicles/filter-options?${queryParams.toString()}`);
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        setFilterOptions(result.data);
      }
    }
  } catch (err) {
    console.error('Failed to fetch filter options:', err);
  }
};
```

### Fetching Filtered Vehicles
```javascript
const fetchVehicles = async () => {
  setLoading(true);
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    
    const queryParams = new URLSearchParams({
      status: 'active'
    });
    
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.fuelType) queryParams.append('fuelType', filters.fuelType);
    if (filters.seatingCapacity) queryParams.append('seatingCapacity', filters.seatingCapacity);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    
    const res = await fetch(`${API_BASE}/api/vehicles/search/by-location?${queryParams.toString()}`);
    if (res.ok) {
      const result = await res.json();
      const data = result.data || result;
      setVehicles(Array.isArray(data) ? data : []);
    }
  } catch (err) {
    console.error('Failed to fetch vehicles:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## Features

### Dynamic Filter Options
- Filter options are fetched dynamically based on available vehicles
- When a city is selected, only categories/fuel types/seating capacities available in that city are shown
- Price range is calculated from actual vehicle prices

### Real-time Filtering
- Filters are applied on the backend for better performance
- Results update automatically when filters change
- Clean and intuitive UI with dropdown selects

### Clear Filters
- Single button to reset all filter selections
- Maintains city and location from initial search

---

## Database Schema

The filtering is performed on the Vehicle collection with the following relevant fields:

```javascript
{
  category: String,           // e.g., "Hatchback", "Sedan", "SUV", "Bike"
  fuelType: String,          // e.g., "Petrol", "Diesel", "Electric", "CNG"
  seatingCapacity: Number,   // e.g., 2, 4, 5, 7
  pricePerDay: Number,       // Price in rupees
  city: String,              // City name
  location: String,          // Full address/location
  status: String             // "active", "inactive", "maintenance"
}
```

---

## Performance Considerations

1. **Indexing**: Ensure indexes on frequently filtered fields:
   - `city`
   - `category`
   - `fuelType`
   - `seatingCapacity`
   - `status`
   - `pricePerDay`

2. **Caching**: Consider caching filter options for popular cities

3. **Pagination**: Add pagination for large result sets (currently returns all matching vehicles)

---

## Future Enhancements

1. **Advanced Filters**:
   - Vehicle age/year
   - Transmission type (Manual/Automatic)
   - Features (AC, GPS, etc.)
   - Availability date range

2. **Sorting Options**:
   - Price: Low to High
   - Price: High to Low
   - Newest First
   - Most Popular

3. **Search Suggestions**:
   - Auto-complete for locations
   - Popular searches

4. **Favorites/Wishlist**:
   - Save favorite vehicles
   - Compare vehicles

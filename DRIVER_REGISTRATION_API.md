# Driver Registration Flow - Backend Implementation

## Overview
The backend has been updated to track when a driver completes their registration form. After the initial signup, drivers will be prompted to fill out the complete registration form. Once completed, they won't see the form again on subsequent logins.

## Changes Made

### 1. Database Schema Update (`backend/models/driverSignup.js`)
Added the following field to track registration completion:
- `registrationCompleted` (Boolean, default: false) - Indicates if the driver has completed the full registration form

Extended the schema to store complete driver information:
- Personal info: `name`, `email`, `phone`, `dateOfBirth`, `address`, `latitude`, `longitude`
- License info: `licenseNumber`, `licenseExpiryDate`, `licenseClass`
- Documents: `aadharNumber`, `panNumber`, `electricBillNo`
- Professional: `experience`, `previousEmployment`, `planType`, `vehiclePreference`
- Banking: `bankName`, `accountNumber`, `ifscCode`, `accountHolderName`, `accountBranchName`
- Document uploads: `profilePhoto`, `licenseDocument`, `aadharDocument`, `aadharDocumentBack`, `panDocument`, `bankDocument`, `electricBillDocument`

### 2. Authentication Updates (`backend/routes/driverAuth.js`)

#### Updated Endpoints
All login/signup endpoints now return `registrationCompleted` status:
- `POST /api/driver-auth/signup` - Username/password signup
- `POST /api/driver-auth/login` - Username/password login
- `POST /api/driver-auth/signup-otp` - OTP-based signup
- `POST /api/driver-auth/login-otp` - OTP-based login

**Response Format:**
```json
{
  "message": "Login successful.",
  "token": "jwt_token_here",
  "driver": {
    "id": "driver_id",
    "username": "driver_username",
    "mobile": "driver_mobile",
    "registrationCompleted": false
  }
}
```

#### New Endpoints

##### Get Driver Profile
```
GET /api/driver-auth/profile/:id
```
**Description:** Fetch complete driver profile (excluding password)

**Response:**
```json
{
  "_id": "driver_id",
  "username": "driver_username",
  "mobile": "1234567890",
  "registrationCompleted": false,
  "name": "Driver Name",
  "email": "driver@example.com",
  "status": "pending",
  "kycStatus": "pending",
  // ... other fields
}
```

##### Complete Registration
```
POST /api/driver-auth/complete-registration/:id
```
**Description:** Complete driver registration form and mark as completed

**Request Body:**
```json
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01",
  "address": "Complete address",
  "latitude": "12.9716",
  "longitude": "77.5946",
  "licenseNumber": "DL123456",
  "licenseExpiryDate": "2026-12-31",
  "licenseClass": "LMV",
  "aadharNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "electricBillNo": "EB123456",
  "experience": "5 years",
  "previousEmployment": "Previous Company",
  "planType": "Weekly",
  "vehiclePreference": "Sedan",
  "bankName": "Bank Name",
  "accountNumber": "1234567890",
  "ifscCode": "BANK0001234",
  "accountHolderName": "Account Holder",
  "accountBranchName": "Branch Name",
  "profilePhoto": "cloudinary_url",
  "licenseDocument": "cloudinary_url",
  "aadharDocument": "cloudinary_url",
  "aadharDocumentBack": "cloudinary_url",
  "panDocument": "cloudinary_url",
  "bankDocument": "cloudinary_url",
  "electricBillDocument": "cloudinary_url"
}
```

**Response:**
```json
{
  "message": "Registration completed successfully.",
  "driver": {
    "_id": "driver_id",
    "username": "driver_username",
    "mobile": "1234567890",
    "registrationCompleted": true,
    "name": "Full Name",
    "email": "email@example.com",
    // ... all submitted fields
  }
}
```

## Frontend Integration Guide

### 1. After Login/Signup
Check the `registrationCompleted` flag in the response:

```javascript
const response = await fetch('/api/driver-auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();

if (!data.driver.registrationCompleted) {
  // Show registration form
  navigate('/driver/registration');
} else {
  // Redirect to dashboard
  navigate('/driver/dashboard');
}
```

### 2. Submit Registration Form
```javascript
const completeRegistration = async (driverId, formData) => {
  const response = await fetch(`/api/driver-auth/complete-registration/${driverId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // If using auth middleware
    },
    body: JSON.stringify(formData)
  });

  const data = await response.json();
  
  if (response.ok) {
    // Registration completed successfully
    navigate('/driver/dashboard');
  }
};
```

### 3. Check Registration Status
```javascript
const checkRegistrationStatus = async (driverId) => {
  const response = await fetch(`/api/driver-auth/profile/${driverId}`);
  const driver = await response.json();
  
  return driver.registrationCompleted;
};
```

## Flow Diagram

```
1. Driver Signup/Login
   ↓
2. Check registrationCompleted flag
   ↓
   ├─ false → Show Registration Form (Step 1 of 5)
   │          ↓
   │          User fills form
   │          ↓
   │          POST /complete-registration/:id
   │          ↓
   │          registrationCompleted = true
   │          ↓
   │          Redirect to Dashboard
   │
   └─ true → Redirect to Dashboard directly
```

## Notes

- The `registrationCompleted` flag is automatically set to `false` during signup
- Once the registration form is submitted via the `/complete-registration/:id` endpoint, the flag is set to `true`
- On subsequent logins, the driver will be redirected directly to the dashboard
- All driver registration data is stored in the `DriverSignup` collection
- Password is excluded from profile responses for security

## Testing

1. **Test Signup Flow:**
   - Create a new driver account
   - Verify `registrationCompleted: false` in response
   - Complete registration form
   - Verify `registrationCompleted: true` after completion

2. **Test Login Flow:**
   - Login with incomplete registration → Should show form
   - Login with completed registration → Should skip form

3. **Test Profile Endpoint:**
   - Fetch profile and verify data is returned without password

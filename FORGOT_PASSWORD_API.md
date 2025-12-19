# Forgot Password API Documentation

This document describes the forgot password endpoints for both Drivers and Investors.

## Overview

The forgot password feature allows users to reset their password by providing their mobile/phone number and a new password. The API will check if the user exists and update their password accordingly.

---

## Driver Forgot Password

### Endpoint
```
POST /api/driver-auth/forgot-password
```

### Request Body
```json
{
  "mobile": "1234567890",
  "newPassword": "newPassword123"
}
```

### Request Fields
- `mobile` (string, required): The driver's registered mobile number
- `newPassword` (string, required): The new password to set

### Success Response (200 OK)
```json
{
  "message": "Password updated successfully.",
  "driver": {
    "id": "648a1b2c3d4e5f6g7h8i9j0k",
    "username": "driver_username",
    "mobile": "1234567890"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing fields
```json
{
  "message": "Mobile number and new password required."
}
```

#### 404 Not Found - Driver doesn't exist
```json
{
  "message": "Driver not found with this mobile number."
}
```

#### 500 Internal Server Error
```json
{
  "message": "Server error during password reset."
}
```

---

## Investor Forgot Password

### Endpoint
```
POST /api/investors/forgot-password
```

### Request Body
```json
{
  "phone": "1234567890",
  "newPassword": "newPassword123"
}
```

### Request Fields
- `phone` (string, required): The investor's registered phone number
- `newPassword` (string, required): The new password to set

### Success Response (200 OK)
```json
{
  "message": "Password updated successfully",
  "investor": {
    "id": "648a1b2c3d4e5f6g7h8i9j0k",
    "investorName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing fields
```json
{
  "error": "Phone number and new password required"
}
```

#### 404 Not Found - Investor doesn't exist
```json
{
  "error": "Investor not found with this phone number"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Password reset failed",
  "message": "Error details here"
}
```

---

## Implementation Flow

### Step 1: User Opens "Forgot Password" Screen
The user navigates to the forgot password screen in the mobile app or web interface.

### Step 2: User Enters Information
The user provides:
- Mobile number (for drivers) or Phone number (for investors)
- New password

### Step 3: API Call
The frontend makes a POST request to the appropriate endpoint:
- `/api/driver-auth/forgot-password` for drivers
- `/api/investors/forgot-password` for investors

### Step 4: Backend Validation
The API:
1. Validates that both mobile/phone and newPassword are provided
2. Searches for the user in the respective signup collection (DriverSignup or InvestorSignup)
3. If user exists → Updates the password
4. If user doesn't exist → Returns 404 error

### Step 5: Response
- Success: Password is updated and user information is returned
- Failure: Appropriate error message is returned

---

## Example Usage

### Using cURL (Driver)
```bash
curl -X POST http://localhost:5000/api/driver-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "1234567890",
    "newPassword": "newSecurePassword123"
  }'
```

### Using cURL (Investor)
```bash
curl -X POST http://localhost:5000/api/investors/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "newPassword": "newSecurePassword123"
  }'
```

### Using JavaScript Fetch (Driver)
```javascript
const forgotPasswordDriver = async (mobile, newPassword) => {
  try {
    const response = await fetch('/api/driver-auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile,
        newPassword
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Password updated successfully:', data);
      return data;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};
```

### Using JavaScript Fetch (Investor)
```javascript
const forgotPasswordInvestor = async (phone, newPassword) => {
  try {
    const response = await fetch('/api/investors/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        newPassword
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Password updated successfully:', data);
      return data;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Plain Text Passwords**: Currently, passwords are stored in plain text. It is **strongly recommended** to implement password hashing (e.g., using bcrypt) before production deployment.

2. **OTP Verification**: Consider adding OTP verification before allowing password reset to prevent unauthorized password changes.

3. **Rate Limiting**: Implement rate limiting on these endpoints to prevent brute force attacks.

4. **HTTPS**: Always use HTTPS in production to encrypt data in transit.

5. **Password Strength**: Consider adding password strength validation on both frontend and backend.

---

## Testing

To test the endpoints, you can use:
1. Postman or similar API testing tools
2. cURL commands from terminal
3. Frontend integration testing
4. Unit tests with a testing framework like Jest

### Sample Test Data

**Driver:**
- Mobile: Use an existing driver's mobile number from the DriverSignup collection
- New Password: Any string value

**Investor:**
- Phone: Use an existing investor's phone number from the InvestorSignup collection
- New Password: Any string value

---

## Related Endpoints

### Driver Authentication
- `POST /api/driver-auth/signup` - Driver signup with username/password
- `POST /api/driver-auth/login` - Driver login with username/password
- `POST /api/driver-auth/signup-otp` - Driver signup with OTP
- `POST /api/driver-auth/login-otp` - Driver login with OTP
- `POST /api/driver-auth/forgot-password` - **Driver forgot password** (NEW)

### Investor Authentication
- `POST /api/investors/signup` - Investor signup with phone/password
- `POST /api/investors/login` - Investor login with phone/password
- `POST /api/investors/signup-otp` - Investor signup with OTP
- `POST /api/investors/login-otp` - Investor login with OTP
- `POST /api/investors/forgot-password` - **Investor forgot password** (NEW)

# Authentication Setup Guide

## Overview
Your frontend application is now configured to properly handle sign up and login with correct credentials through backend API calls.

## Changes Made

### 1. **API Configuration** (`src/config/apiConfig.js`)
Added authentication endpoints:
```javascript
AUTH: {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
}
```

### 2. **API Service** (`src/services/apiService.js`)
Updated `login()` and `register()` methods to make real backend API calls:

**Login Method:**
- Sends POST request to `/auth/login`
- Expects: `{ email, password }`
- Returns: `{ success: true, data: { user, token } }`

**Register Method:**
- Sends POST request to `/auth/signup`
- Expects: `{ fullName, email, password }`
- Returns: `{ success: true, data: { user, token } }`

### 3. **Auth Context** (`src/utils/AuthContext.js`)
Updated authentication functions:
- `login(email, password)`: Now calls real backend API
- `signup(userData)`: Calls real backend API with proper error handling
- Both functions now store token and user data in localStorage

### 4. **Login Page** (`src/pages/Login.js`)
Changes:
- Renamed `username` field to `email` for consistency
- Added error message display for login failures
- Imported and integrated `SignupModal` component
- Added loading state management
- Removed dummy signup implementation

### 5. **SignupModal Component** (`src/components/SignupModal.js`)
Already properly integrated with:
- Form validation (password confirmation)
- Loading state
- Error message display
- Integration with AuthContext signup function

## Frontend to Backend API Flow

### Sign Up Flow
```
User fills signup form → SignupModal component
                    ↓
          Validates password match
                    ↓
  Calls AuthContext.signup(userData)
                    ↓
  ApiService.register() makes API call to /auth/signup
                    ↓
  Backend processes registration
                    ↓
  Returns { user, token }
                    ↓
  Token & user stored in localStorage
                    ↓
  User state updated in AuthContext
                    ↓
  Modal closes
```

### Login Flow
```
User enters email & password on Login page
                    ↓
          Validates input fields
                    ↓
  Calls AuthContext.login(email, password)
                    ↓
  ApiService.login() makes API call to /auth/login
                    ↓
  Backend validates credentials
                    ↓
  Returns { user, token }
                    ↓
  Token & user stored in localStorage
                    ↓
  User state updated in AuthContext
                    ↓
  Navigate to /dashboard
```

## Required Backend Endpoints

You need to implement the following endpoints in your Python backend:

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "123",
    "fullName": "John Doe",
    "email": "user@example.com"
  },
  "token": "jwt-token-here"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### POST /api/auth/signup
**Request:**
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200/201):**
```json
{
  "user": {
    "id": "123",
    "fullName": "John Doe",
    "email": "user@example.com"
  },
  "token": "jwt-token-here"
}
```

**Error Response (400/409):**
```json
{
  "message": "Email already exists" OR "Invalid input"
}
```

## How It Works

1. **User Signup:**
   - User clicks "Sign Up" button on login page
   - SignupModal opens
   - User enters full name, email, password, and confirms password
   - On form submit, `AuthContext.signup()` is called
   - Frontend makes API POST request to `http://10.30.0.11:8000/api/auth/signup`
   - If successful, user is logged in and modal closes
   - If failed, error message is displayed

2. **User Login:**
   - User enters email and password on login page
   - On form submit, `AuthContext.login()` is called
   - Frontend makes API POST request to `http://10.30.0.11:8000/api/auth/login`
   - If successful, user is navigated to dashboard
   - If failed, error message is displayed below the form

3. **Session Management:**
   - Token is stored in `localStorage` under key `"token"`
   - User object is stored in `localStorage` under key `"user"`
   - Session persists across page refreshes
   - `useAuth()` hook provides access to `isAuthenticated`, `user`, `login`, `signup`, `logout`

## Using the Auth Context

```javascript
import { useAuth } from "../utils/AuthContext";

function MyComponent() {
  const { isAuthenticated, user, login, signup, logout } = useAuth();

  // Check if user is logged in
  if (isAuthenticated) {
    console.log("User:", user);
    // Render authenticated content
  }

  // Login
  const result = await login(email, password);
  if (result.success) {
    // User logged in
  } else {
    // Show error
    console.log(result.error);
  }

  // Logout
  await logout();
}
```

## API Configuration

Base URL: `http://10.30.0.11:8000/api`

Update `src/config/apiConfig.js` if you need to change:
- Base URL
- Request timeout (default: 5 minutes)
- Other API endpoints

## Error Handling

Both login and signup handle errors gracefully:
- Network errors display appropriate messages
- Invalid credentials show backend error messages
- Form validation prevents invalid submissions
- Loading states prevent multiple submissions

## Testing

### Test Sign Up:
1. Click "Sign Up" button on login page
2. Enter test credentials (full name, email, password)
3. Confirm password matches
4. Click "Create Account"
5. Should see success or error message

### Test Login:
1. Enter email and password
2. Click "SIGN IN"
3. Should navigate to dashboard on success
4. Should show error message on failure

## Next Steps

1. **Implement Backend Endpoints:**
   - Create `/auth/login` endpoint
   - Create `/auth/signup` endpoint
   - Add JWT token generation
   - Add password hashing (bcrypt)
   - Add database user storage

2. **Add Token Validation:**
   - Add request interceptor to include token in headers:
   ```javascript
   headers: {
     "Authorization": `Bearer ${token}`
   }
   ```

3. **Implement Token Refresh:**
   - Add `/auth/refresh` endpoint for token renewal
   - Handle token expiration

4. **Add Additional Security:**
   - Implement CORS properly
   - Add rate limiting
   - Add input validation
   - Add secure password requirements

## Troubleshooting

### "Login failed" error
- Check if backend is running at `http://10.30.0.11:8000`
- Verify API endpoints are implemented
- Check browser console for detailed error messages

### "Email already exists"
- User is trying to sign up with an email that's already registered
- Suggest user to login instead

### Token not persisting
- Check if localStorage is available in browser
- Check browser Privacy/Incognito mode issues
- Verify token is being stored correctly in API responses

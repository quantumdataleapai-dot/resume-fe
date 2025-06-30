# Resume Matcher - API Integration Guide

## Overview

This guide explains how to switch between mock data and real API integration in the Resume Matcher application. The application uses a configuration-based approach that allows seamless transition from development (mock) to production (real API).

## 🔧 Configuration System

### Current Architecture

```
src/
├── config/
│   └── apiConfig.js          # Central API configuration
├── services/
│   └── apiService.js         # Unified API service layer
├── pages/
│   └── Dashboard.js          # Uses ApiService (no direct mock imports)
├── .env.development          # Development environment variables
└── .env.production          # Production environment variables
```

### Key Benefits

✅ **Single Dashboard.js file** - No need for separate files
✅ **Environment-based switching** - Automatic based on build mode
✅ **Feature flags** - Enable/disable features per environment
✅ **Easy maintenance** - All API logic in one service layer

## 🚀 Quick Start

### For Development (Mock Data)

```bash
# Uses .env.development automatically
npm start
```

### For Production (Real API)

```bash
# Uses .env.production automatically
npm run build
npm run start
```

## 🔄 Switching Between Mock and Real API

### Method 1: Environment Variables (Recommended)

**Development (.env.development):**

```env
REACT_APP_USE_MOCK_DATA=true
REACT_APP_API_URL=http://localhost:8000/api
```

**Production (.env.production):**

```env
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_URL=https://api.resumematcher.com/api
```

### Method 2: Direct Configuration

Edit `src/config/apiConfig.js`:

```javascript
const API_CONFIG = {
  USE_MOCK_DATA: false, // Set to false for real API
  BASE_URL: "https://your-real-api.com/api",
  // ... rest of config
};
```

## 📋 Integration Checklist

### Before Going Live

- [ ] **Update Environment Variables**

  ```env
  REACT_APP_USE_MOCK_DATA=false
  REACT_APP_API_URL=https://your-api-domain.com/api
  ```

- [ ] **Backend API Ready**

  - [ ] All endpoints implemented (see API_SPECIFICATION.md)
  - [ ] CORS configured for your frontend domain
  - [ ] JWT authentication working
  - [ ] File upload handling (multipart/form-data)

- [ ] **Test API Endpoints**

  ```bash
  # Test authentication
  curl -X POST https://your-api.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}'

  # Test resume upload
  curl -X POST https://your-api.com/api/resumes/upload \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -F "files=@resume.pdf"
  ```

- [ ] **Update Build Scripts**
  ```json
  {
    "scripts": {
      "build:dev": "REACT_APP_USE_MOCK_DATA=true npm run build",
      "build:prod": "REACT_APP_USE_MOCK_DATA=false npm run build"
    }
  }
  ```

## 🛠 API Service Usage

The application now uses a unified `ApiService` that automatically switches between mock and real API calls:

```javascript
// In Dashboard.js
import ApiService from "../services/apiService";

// Upload resumes (automatically uses mock or real API)
const response = await ApiService.uploadResumes(files);

// Match resumes (automatically uses mock or real API)
const matchResult = await ApiService.matchResumes(jobDescription);

// Upload from URLs (automatically uses mock or real API)
const urlResult = await ApiService.uploadFromUrls(urls);
```

## 🔧 Backend Integration Steps

### 1. API Endpoints to Implement

Refer to `API_SPECIFICATION.md` for complete details:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /resumes/upload` - File upload
- `POST /resumes/upload-from-urls` - URL-based upload
- `GET /resumes` - List resumes
- `POST /resumes/match` - Resume matching
- `GET /resumes/{id}/download` - Download files

### 2. Response Format

Ensure your API responses match the expected format:

```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // ... actual data
  }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "details": {
    // ... error details
  }
}
```

### 3. Authentication

The frontend automatically includes JWT tokens:

```javascript
// Headers sent with each request
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

## 🧪 Testing Both Modes

### Test Mock Mode

```bash
# Set environment
echo "REACT_APP_USE_MOCK_DATA=true" > .env.local

# Start application
npm start

# Test features - should work with mock data
```

### Test API Mode

```bash
# Set environment
echo "REACT_APP_USE_MOCK_DATA=false" > .env.local
echo "REACT_APP_API_URL=https://your-api.com/api" >> .env.local

# Start application
npm start

# Test features - should use real API
```

## 🚨 Common Issues & Solutions

### Issue: API calls fail in production

**Solution:** Check CORS settings on your backend:

```javascript
// Express.js example
app.use(
  cors({
    origin: ["https://your-frontend-domain.com"],
    credentials: true,
  })
);
```

### Issue: Authentication not working

**Solution:** Verify JWT token format and expiration:

```javascript
// Check token in browser console
console.log(localStorage.getItem("authToken"));
```

### Issue: File uploads failing

**Solution:** Ensure backend accepts multipart/form-data:

```javascript
// Express.js with multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
app.post("/api/resumes/upload", upload.array("files"), handler);
```

## 📈 Performance Optimization

### Production Build

```bash
# Optimized production build
npm run build

# Serve static files
npm install -g serve
serve -s build -l 3000
```

### API Caching

Consider implementing request caching for better performance:

```javascript
// Example: Cache resume list for 5 minutes
const cacheKey = "resumes_list";
const cachedData = sessionStorage.getItem(cacheKey);
if (cachedData && Date.now() - cachedData.timestamp < 300000) {
  return JSON.parse(cachedData.data);
}
```

## 🔄 Rollback Strategy

If issues occur in production:

1. **Quick Rollback to Mock Mode:**

   ```bash
   # Emergency rollback
   echo "REACT_APP_USE_MOCK_DATA=true" > .env.production
   npm run build
   ```

2. **Gradual Feature Rollback:**
   ```javascript
   // Disable specific features
   REACT_APP_ENABLE_URL_UPLOAD = false;
   REACT_APP_ENABLE_BULK_DOWNLOAD = false;
   ```

## 📚 Additional Resources

- [API Specification](./API_SPECIFICATION.md) - Complete API documentation
- [Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md) - Backend setup guide
- [Feature Enhancements](./FEATURE_ENHANCEMENTS.md) - Recent improvements

## 🎯 Summary

**You do NOT need to change imports from `Dashboard.js` to `DashboardWithAPI.js`**

The recommended approach uses:

1. **Single Dashboard.js file** with ApiService
2. **Environment-based configuration** for switching modes
3. **Automatic detection** of mock vs real API mode
4. **Feature flags** for enabling/disabling functionality

This approach is more maintainable, professional, and follows industry best practices for React applications.

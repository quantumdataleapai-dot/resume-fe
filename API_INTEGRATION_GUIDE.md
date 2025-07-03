# API Integration Guide

## Current API Configuration

The Resume UI is now configured to connect to the backend API at:

```
http://192.168.41.225:8000/api/
```

## Setup Details

### Changes Made for Integration

1. **API Base URL Configuration**:

   - Updated `apiConfig.js` to point to the production backend URL
   - Disabled mock data mode in `mockApiService.js`

2. **CORS Configuration**:

   - Added necessary CORS headers to API requests
   - Set `withCredentials: false` to handle cross-origin requests

3. **Error Handling**:

   - Enhanced error handling in API interceptors
   - Added detailed logging for connection issues

4. **Testing & Verification**:

   - Added an API connection tester component
   - Implemented real-time connection status display

5. **Unified Upload Endpoints**:
   - Combined single and multiple resume upload endpoints into a single endpoint
   - All uploads now use `/api/resumes/upload` with the `files` key in FormData

## API Status Indicator

A connection status indicator has been added to the bottom-right corner of the application. This shows:

- Connection status (connected/disconnected)
- Connection details
- API endpoint URL
- Option to manually test the connection

## Troubleshooting API Connection Issues

If you're experiencing API connection issues:

1. **Check Backend Server Status**:

   - Ensure the backend server is running at http://192.168.41.225:8000/
   - Verify that the API is responding to requests

2. **Check Network Access**:

   - Ensure there are no firewall or network restrictions blocking access to the API
   - Verify that the client can reach the server (ping test)

3. **CORS Issues**:
   - Check browser console for CORS-related errors
   - Ensure the backend has proper CORS configuration:

```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Reverting to Mock Data

If you need to use mock data (for development or when the API is unavailable):

1. In `src/services/mockApiService.js`:

   - Change `const USE_MOCK_DATA = false;` to `const USE_MOCK_DATA = true;`

2. Restart the React application

## API Implementation Status

The following endpoints should now be functional:

- ✅ `GET /api/resumes` - List all resumes
- ✅ `POST /api/resumes/upload` - Upload multiple resumes
- ✅ `POST /api/jobs/process-text-and-match` - Process job description and match resumes
- ✅ `POST /api/resumes/download-all` - Download all/selected resumes as ZIP

## Next Steps

1. Test each API endpoint to ensure proper integration
2. Verify data formats match between frontend and backend
3. Monitor API connection status during usage
4. Handle any edge cases or errors that arise during testing

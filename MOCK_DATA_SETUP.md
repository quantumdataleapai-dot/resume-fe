# Mock Data Setup for Development

## Overview

This setup allows the frontend to work with realistic mock data while waiting for backend integration.

## How to Enable/Disable Mock Data

### Enable Mock Data (Development)

Set in `.env.development`:

```bash
REACT_APP_USE_MOCK_DATA=true
```

### Disable Mock Data (Production/Backend Ready)

Set in `.env.development`:

```bash
REACT_APP_USE_MOCK_DATA=false
```

## What's Included

### Mock Resume Data

- 5 sample resumes with realistic candidate information
- Skills, experience, education, and contact details
- Matching scores and analysis results

### Mock API Responses

- File upload simulation with realistic delays
- Resume matching with scoring algorithms
- Job description processing
- URL-based resume uploads

### Visual Indicators

- Orange development banner when using mock data
- Console logs showing "Mock:" API calls
- Simulated API delays for realistic testing

## Files Created

1. **`src/utils/mockData.js`** - Sample resume and response data
2. **`src/services/mockApiService.js`** - Mock API service with realistic delays
3. **Updated `src/services/apiService.js`** - Conditional mock/real API usage

## Features Working with Mock Data

✅ **Resume Upload** - Simulates file uploads with success responses
✅ **Resume List** - Shows paginated list of sample resumes  
✅ **Unified Job Processing** - Process job description (text/file) and get matched resumes in one step
✅ **Resume Matching** - Returns realistic match scores and analysis
✅ **URL Upload** - Simulates downloading resumes from URLs
✅ **Authentication** - Dummy login/signup for UI testing

## Current Frontend Workflow

1. **Upload Resumes** - Add resume files to the system
2. **Enter Job Description** - Type or upload job description
3. **Click "Process Job Description"** - Single button processes job and shows matched resumes
4. **View Results** - Matched resumes displayed with scores and analysis

## Removing Mock Data

When backend is ready:

1. Set `REACT_APP_USE_MOCK_DATA=false` in environment files
2. Optionally delete mock files:
   - `src/utils/mockData.js`
   - `src/services/mockApiService.js`
3. Remove mock imports from `src/services/apiService.js`

## Benefits

- **Frontend Development** - Continue UI development without backend
- **Realistic Testing** - Test with realistic data and response delays
- **Easy Toggle** - Switch between mock and real API with one setting
- **Demo Ready** - Show working application to stakeholders
- **Integration Ready** - Easy transition to real backend

# Frontend to Backend API Documentation

## Overview

This document describes all API endpoints that the React frontend application expects the Python backend to implement. The frontend uses these endpoints for resume management, job description processing, and matching functionality.

## Base Configuration

- **Base URL**: `http://localhost:8001/api` (configurable via `REACT_APP_API_URL`)
- **Request Timeout**: 30 seconds
- **Content-Type**: `application/json` (except for file uploads)
- **Max File Size**: 10MB
- **Supported File Types**: PDF, DOC, DOCX, TXT

## Authentication

Currently, the frontend uses dummy authentication (no real backend integration). For production:

- Consider implementing JWT tokens or session-based authentication
- The frontend is ready to integrate with real authentication endpoints

---

## Resume Management Endpoints

### 1. Upload Multiple/Single Resume(s)

**Endpoint**: `POST /api/resumes/upload`
**Content-Type**: `multipart/form-data`

**Request Body**:

```
files: One or more resume files.
FormData with one or multiple files under 'files' key
```

**Frontend Implementation**:

```javascript
// Multiple files are appended to FormData
const formData = new FormData();
Array.from(files).forEach((file) => {
  formData.append("files", file);
});
await axios.post("/api/resumes/upload", formData);

//single file upload
const formData = new FormData();
formData.append("files", file); // Note the plural key still used for consistency
await axios.post("/api/resumes/upload", formData);
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": {
    "uploaded_count": 2,
    "failed_count": 1
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "message": "Resume upload failed due to validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "file": "resume1.pdf",
        "reason": "Unsupported file type"
      },
      {
        "file": "resume2.docx",
        "reason": "File size exceeds 5MB"
      }
    ]
  }
}
```

### 2. Upload Resumes from URLs

**Endpoint**: `POST /api/resumes/upload-urls`
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "urls": [
    "https://example.com/resume1.pdf",
    "https://example.com/resume2.pdf"
  ],
  "options": {
    "timeout_seconds": 30,
    "max_file_size_mb": 10,
    "follow_redirects": true
  }
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "URLs processed successfully",
  "data": {
    "processed_count": 2,
    "successful_uploads": [
      {
        "url": "https://example.com/resume1.pdf",
        "id": "resume_1",
        "filename": "resume1.pdf"
      }
    ],
    "failed_uploads": [
      {
        "url": "https://example.com/resume2.pdf",
        "error": "File size exceeds limit"
      }
    ]
  }
}
```

### 3. Get Resumes List

**Endpoint**: `GET /api/resumes`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

**Example Request**:

```
GET /api/resumes?page=1&limit=10
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": "resume_1",
        "filename": "john_doe_resume.pdf",
        "upload_date": "2025-07-01T10:30:00Z",
        "parsed_data": {
          "name": "John Doe",
          "email": "john@example.com",
          "skills": ["Python", "React"],
          "experience_years": 5
        },
        "match_score": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10
    }
  }
}
```

### 4. Download Resume

**Endpoint**: `GET /api/resumes/{id}/download`

**Path Parameters**:

- `id`: Resume ID

**Query Parameters**:

- `format`: Download format (default: "pdf")

**Example Request**:

```
GET /api/resumes/resume_1/download?format=pdf
```

**Expected Response**:
Binary file data with appropriate headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="john_doe_resume.pdf"
```

---

### 5. Delete Resume

**Endpoint**: `DELETE /api/resumes/{id}/delete`

**Path Parameters**:

- `id`: Resume ID

**Example Request**:

```
DELETE /api/resumes/resume_1/delete
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {
    "deleted_resume_id": "resume_1"
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "message": "Failed to Delete Resume",
  "error": {
    "code": "DB_ERROR",
    "details": "Unable to delete resume from database"
  }
}
```

## Download all resumes in ZIP

## Job Description Processing & Resume Matching (Unified - Recommended)

These endpoints combine job description processing with resume matching in a single API call, which is the recommended approach for the frontend.

### 1. Process Job Description Text and Match Resumes

**Endpoint**: `POST /api/jobs/process-text-and-match`
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "job_description": "We are looking for a Senior Python Developer with 5+ years of experience...",
  "title": "Senior Python Developer", // Optional
  "resume_ids": ["resume_1", "resume_2"] // Optional: specific resumes to match against
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Job description processed and resumes matched successfully",
  "data": {
    "job_analysis": {
      "title": "Senior Python Developer",
      "processed_description": "We are looking for a Senior Python Developer...",
      "extracted_requirements": {
        "required_skills": ["Python", "Django", "SQL"],
        "preferred_skills": ["Docker", "AWS"],
        "experience_years": 5,
        "education": "Bachelor's degree in Computer Science"
      },
      "job_category": "Software Development",
      "seniority_level": "Senior"
    },
    "matched_resumes": [
      {
        "id": "resume_1",
        "filename": "john_doe_resume.pdf",
        "match_score": 85.5,
        "match_details": {
          "skills_match": 90,
          "experience_match": 80,
          "overall_fit": "Excellent"
        },
        "parsed_data": {
          "name": "John Doe",
          "email": "john@example.com",
          "skills": ["Python", "React", "SQL", "JavaScript"],
          "experience_years": 5
        },
        "missing_skills": ["Docker"],
        "matching_skills": ["Python", "Django", "SQL"]
      }
    ],
    "total_matched": 1,
    "average_score": 85.5
  }
}
```

### 2. Process Job Description File and Match Resumes

**Endpoint**: `POST /api/jobs/process-file-and-match`
**Content-Type**: `multipart/form-data`

**Request Body**:

```
FormData:
- file: Job description file (PDF, DOC, DOCX, TXT)
- title: Job title (optional)
- resume_ids: JSON string array of specific resume IDs (optional)
```

**Frontend Implementation**:

```javascript
const formData = new FormData();
formData.append("file", jobFile);
if (title) {
  formData.append("title", title);
}
if (resumeIds && resumeIds.length > 0) {
  formData.append("resume_ids", JSON.stringify(resumeIds));
}
```

**Expected Response**:
Same format as text processing endpoint above.

---

## Job Description Processing Endpoints (Legacy/Optional)

### 1. Process Job Description Text

**Endpoint**: `POST /api/jobs/process-text`
**Content-Type**: `application/json`

**Request Body**:

```json
{
  "job_description": "We are looking for a Senior Python Developer with 5+ years of experience...",
  "title": "Senior Python Developer" // Optional
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Job description processed successfully",
  "data": {
    "id": "job_1",
    "title": "Senior Python Developer",
    "processed_description": "We are looking for a Senior Python Developer...",
    "extracted_requirements": {
      "required_skills": ["Python", "Django", "SQL"],
      "preferred_skills": ["Docker", "AWS"],
      "experience_years": 5,
      "education": "Bachelor's degree in Computer Science",
      "responsibilities": [
        "Develop backend services",
        "Code review and mentoring"
      ]
    },
    "job_category": "Software Development",
    "seniority_level": "Senior"
  }
}
```

### 2. Process Job Description File

**Endpoint**: `POST /api/jobs/process-file`
**Content-Type**: `multipart/form-data`

**Request Body**:

```
FormData:
- file: Job description file (PDF, DOC, DOCX, TXT)
- title: Job title (optional)
```

**Frontend Implementation**:

```javascript
const formData = new FormData();
formData.append("file", file);
if (title) {
  formData.append("title", title);
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Job description file processed successfully",
  "data": {
    "id": "job_2",
    "title": "Data Scientist",
    "filename": "data_scientist_job.pdf",
    "extracted_text": "We are seeking a Data Scientist...",
    "processed_description": "We are seeking a Data Scientist...",
    "extracted_requirements": {
      "required_skills": ["Python", "Machine Learning", "Statistics"],
      "preferred_skills": ["TensorFlow", "PyTorch"],
      "experience_years": 3,
      "education": "Master's degree in Data Science or related field"
    }
  }
}
```

### 3. Get Jobs List

**Endpoint**: `GET /api/jobs`

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_1",
        "title": "Senior Python Developer",
        "created_date": "2025-07-01T10:00:00Z",
        "processed": true,
        "requirements_summary": {
          "required_skills": ["Python", "Django"],
          "experience_years": 5
        }
      }
    ],
    "total_count": 1
  }
}
```

---

## Error Handling

### Standard Error Response Format

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File size exceeds maximum limit",
    "details": {
      "max_size": "10MB",
      "received_size": "15MB"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input parameters
- `FILE_TOO_LARGE`: File exceeds size limit
- `UNSUPPORTED_FORMAT`: File format not supported
- `PROCESSING_ERROR`: Error during file processing
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `413`: Payload Too Large
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## Frontend Integration Notes

### API Service Configuration

The frontend uses axios with these interceptors:

```javascript
// Request interceptor logs all API calls
apiClient.interceptors.request.use((config) => {
  console.log(
    `Making API call to: ${config.method?.toUpperCase()} ${config.baseURL}${
      config.url
    }`
  );
  return config;
});

// Response interceptor logs responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API response received:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`API error:`, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### File Upload Handling

The frontend automatically handles:

- Multiple file selection
- File validation (type and size)
- FormData creation
- Progress tracking (can be implemented)

### Error Handling

The frontend expects consistent error response format and will display appropriate error messages to users.

---

## Environment Configuration

### Frontend Environment Variables

```bash
# .env.development
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_ENVIRONMENT=development

# .env.production
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_ENVIRONMENT=production
```

### Backend CORS Configuration

Ensure your Python backend allows CORS for the frontend domain:

```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing the Integration

### Sample Frontend API Calls

```javascript
// Upload multiple resumes
const files = fileInputRef.current.files;
const response = await ApiService.uploadResumes(files);

// Get resumes
const resumes = await ApiService.getResumes(1, 10);

// Match resumes
const matchResults = await ApiService.matchResumes(
  jobDescription,
  selectedResumeIds
);

// Upload from URLs
const urlResults = await ApiService.uploadFromUrls([
  "http://example.com/resume.pdf",
]);

//Delete Resume
await ApiService.deleteResume(resumeId);
```

### Expected Frontend Behavior

1. **File Upload**: Shows progress, validates files, handles errors
2. **Resume Display**: Lists resumes with parsed information
3. **Matching**: Shows match scores and detailed analysis
4. **Error Handling**: Displays user-friendly error messages

---

## Implementation Priority

### Phase 1 (Core Functionality - Recommended)

1. `POST /api/resumes/upload` - Multiple resume upload
2. `GET /api/resumes` - List resumes
3. `POST /api/jobs/process-text-and-match` - **Unified job processing & matching (MAIN FEATURE)**
4. `POST /api/jobs/process-file-and-match` - **Unified file job processing & matching**
5. `DELETE  /api/resumes/{id}/delete` Delete Resume with id

### Phase 2 (Extended Features)

1. `POST /api/resumes/upload` - Single/multiple resume upload (unified endpoint)
2. `GET /api/resumes/{id}/download` - Resume download
3. `POST /api/resumes/upload-urls` - URL-based upload

### Phase 3 (Legacy/Optional Features)

1. `GET /api/jobs` - Job management
2. Authentication integration
3. Advanced matching algorithms

### Legacy Endpoints (Backwards Compatibility)

These endpoints are maintained for backwards compatibility but are not recommended for new implementations:

1. `POST /api/resumes/match` - Resume matching only (use unified endpoints instead)
2. `POST /api/jobs/process-text` - Job processing only (use unified endpoints instead)
3. `POST /api/jobs/process-file` - Job file processing only (use unified endpoints instead)

**Note**: The unified endpoints (Phase 1) are the recommended approach as they match the frontend's single-button workflow: "Process Job Description" → Get matched resumes directly.

This documentation provides everything the backend team needs to implement the API endpoints that the frontend expects.

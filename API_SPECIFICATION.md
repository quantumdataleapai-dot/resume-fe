# Resume Matcher API Specification

This document provides the complete API specification for the Resume Matcher application frontend integration.

## Base URL

```
https://your-api-domain.com/api
```

## Authentication

All API calls require JWT token authentication (except login/register).

**Header Format:**

```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### POST /auth/login

**Purpose:** User login
**Request:**

```json
{
  "email": "recruiter@company.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "recruiter@company.com",
      "full_name": "John Recruiter",
      "role": "recruiter",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error_code": "INVALID_CREDENTIALS"
}
```

### POST /auth/register

**Purpose:** User registration
**Request:**

```json
{
  "email": "newuser@company.com",
  "password": "password123",
  "full_name": "New User",
  "company": "Company Name"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@company.com",
      "full_name": "New User",
      "role": "recruiter",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

## 2. Resume Management APIs

### POST /resumes/upload

**Purpose:** Upload multiple resume files
**Request:** `multipart/form-data`

```
Content-Type: multipart/form-data

files: [File1.pdf, File2.docx, File3.doc]
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Resumes uploaded successfully",
  "data": {
    "uploaded_count": 3,
    "failed_count": 0,
    "resumes": [
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe - Senior Developer.pdf",
        "file_size": 1024000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z",
        "status": "processed"
      },
      {
        "id": 2,
        "filename": "sarah_wilson_resume.pdf",
        "original_name": "Sarah Wilson - Full Stack Engineer.pdf",
        "file_size": 856000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z",
        "status": "processed"
      }
    ],
    "processing_time_ms": 1200,
    "failed_files": []
  }
}
```

### POST /resumes/upload-from-urls

**Purpose:** Upload resumes from external URLs
**Request:**

```json
{
  "urls": [
    "https://example.com/resumes/john_doe.pdf",
    "https://drive.google.com/file/d/abc123/resume.pdf",
    "https://linkedin.com/in/johndoe/download/resume"
  ],
  "options": {
    "max_file_size": "10MB",
    "allowed_types": ["pdf", "doc", "docx", "txt"],
    "timeout": 30000,
    "follow_redirects": true
  }
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Resumes uploaded from URLs successfully",
  "data": {
    "uploaded_count": 2,
    "failed_count": 1,
    "resumes": [
      {
        "id": 3,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe - Senior Developer.pdf",
        "source_url": "https://example.com/resumes/john_doe.pdf",
        "file_size": 1024000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z",
        "download_time_ms": 1200,
        "status": "processed"
      },
      {
        "id": 4,
        "filename": "sarah_wilson_resume.pdf",
        "original_name": "Sarah Wilson - Full Stack Engineer.pdf",
        "source_url": "https://drive.google.com/file/d/abc123/resume.pdf",
        "file_size": 856000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z",
        "download_time_ms": 2800,
        "status": "processed"
      }
    ],
    "failed_downloads": [
      {
        "url": "https://linkedin.com/in/johndoe/download/resume",
        "error": "Access denied - authentication required",
        "error_code": "DOWNLOAD_AUTH_REQUIRED"
      }
    ],
    "processing_time_ms": 3500
  }
}
```

**Error Response (400) - Invalid URLs:**

```json
{
  "success": false,
  "message": "Some URLs are invalid or inaccessible",
  "data": {
    "uploaded_count": 1,
    "failed_count": 2,
    "resumes": [
      {
        "id": 5,
        "filename": "valid_resume.pdf",
        "source_url": "https://valid-site.com/resume.pdf",
        "status": "processed"
      }
    ],
    "failed_downloads": [
      {
        "url": "https://invalid-url.com/resume.pdf",
        "error": "File not found",
        "error_code": "DOWNLOAD_NOT_FOUND"
      },
      {
        "url": "https://large-file.com/resume.pdf",
        "error": "File size exceeds limit (15MB > 10MB)",
        "error_code": "DOWNLOAD_SIZE_EXCEEDED"
      }
    ]
  }
}
```

### GET /resumes

**Purpose:** Get all uploaded resumes
**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe - Senior Developer.pdf",
        "file_size": 1024000,
        "upload_date": "2024-01-01T00:00:00Z",
        "last_matched": "2024-01-02T10:30:00Z",
        "status": "active"
      },
      {
        "id": 2,
        "filename": "sarah_wilson_resume.pdf",
        "original_name": "Sarah Wilson - Full Stack Engineer.pdf",
        "file_size": 856000,
        "upload_date": "2024-01-01T00:00:00Z",
        "last_matched": "2024-01-02T10:30:00Z",
        "status": "active"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 10,
      "items_per_page": 10
    }
  }
}
```

### GET /resumes/{id}/download

**Purpose:** Download original resume file
**Success Response (200):**

```
Content-Type: application/pdf (or original file type)
Content-Disposition: attachment; filename="John_Doe_Resume.pdf"

[Binary file content]
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Resume not found",
  "error_code": "RESUME_NOT_FOUND"
}
```

---

## 3. Job Description APIs

### POST /jobs/upload

**Purpose:** Upload job description (text or file)
**Request Option 1 (Text):**

```json
{
  "job_description": "We are looking for a Senior Full Stack Developer with 5+ years of experience...",
  "title": "Senior Full Stack Developer",
  "location": "San Francisco, CA",
  "employment_type": "Full-time"
}
```

**Request Option 2 (File Upload):**

```
Content-Type: multipart/form-data

job_file: JobDescription.pdf
title: "Senior Full Stack Developer"
location: "San Francisco, CA"
employment_type: "Full-time"
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Job description processed successfully",
  "data": {
    "job_id": 1,
    "title": "Senior Full Stack Developer",
    "extracted_text": "We are looking for a Senior Full Stack Developer...",
    "key_skills": ["Python", "React", "AWS", "Docker", "REST APIs"],
    "experience_level": "Senior",
    "required_years": 5,
    "location": "San Francisco, CA",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 4. Resume Matching API

### POST /resumes/match

**Purpose:** Match job description with resumes
**Request:**

```json
{
  "job_description": "We are looking for a Senior Full Stack Developer with 5+ years of experience in Python, React, AWS...",
  "job_id": 1,
  "resume_ids": [1, 2, 3, 4, 5],
  "filters": {
    "min_score": 0,
    "max_results": 50
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Resume matching completed",
  "data": {
    "job_analysis": {
      "key_skills": ["Python", "React", "AWS", "Docker", "REST APIs"],
      "experience_level": "Senior",
      "job_category": "Software Development",
      "required_years": 5,
      "location_preferences": ["Remote", "San Francisco"],
      "salary_range": "$120,000 - $180,000"
    },
    "matched_resumes": [
      {
        "id": 2,
        "filename": "sarah_wilson_resume.pdf",
        "original_name": "Sarah Wilson - Full Stack Engineer.pdf",
        "match_score": 94,
        "max_score": 100,
        "rank": 1,
        "matching_skills": [
          "Python",
          "React",
          "AWS",
          "Docker",
          "REST APIs",
          "PostgreSQL"
        ],
        "missing_skills": [],
        "experience_match": "Senior (7 years)",
        "summary": "Excellent match with all required skills and strong experience",
        "detailed_analysis": {
          "technical_skills_score": 95,
          "experience_score": 90,
          "education_score": 85,
          "projects_score": 92
        },
        "strengths": [
          "7+ years full-stack development",
          "Expert in Python and React ecosystem",
          "Strong AWS and DevOps background",
          "Led multiple high-impact projects",
          "Excellent communication skills"
        ],
        "weaknesses": [],
        "interview_recommendation": "Highly recommended - Strong fit for senior role",
        "salary_expectation": "$150,000 - $170,000",
        "availability": "2 weeks notice",
        "contact_info": {
          "email": "sarah.wilson@email.com",
          "phone": "+1-555-0123",
          "linkedin": "https://linkedin.com/in/sarahwilson"
        }
      },
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe - Senior Developer.pdf",
        "match_score": 89,
        "max_score": 100,
        "rank": 2,
        "matching_skills": ["Python", "React", "AWS", "Docker"],
        "missing_skills": ["GraphQL"],
        "experience_match": "Senior (6 years)",
        "summary": "Strong match with excellent Python and React experience",
        "detailed_analysis": {
          "technical_skills_score": 90,
          "experience_score": 88,
          "education_score": 80,
          "projects_score": 85
        },
        "strengths": [
          "6+ years Python development",
          "React expertise with modern frameworks",
          "AWS cloud architecture experience",
          "Strong problem-solving skills",
          "Team leadership experience"
        ],
        "weaknesses": [
          "Limited GraphQL experience",
          "No mention of microservices architecture"
        ],
        "interview_recommendation": "Recommended - Good fit with minor skill gaps",
        "salary_expectation": "$130,000 - $150,000",
        "availability": "1 month notice",
        "contact_info": {
          "email": "john.doe@email.com",
          "phone": "+1-555-0456",
          "linkedin": "https://linkedin.com/in/johndoe"
        }
      }
    ],
    "matching_stats": {
      "total_resumes_analyzed": 10,
      "resumes_with_matches": 8,
      "average_score": 69,
      "highest_score": 94,
      "lowest_score": 32,
      "processing_time_ms": 2340,
      "skill_distribution": {
        "Python": 7,
        "React": 5,
        "AWS": 4,
        "Docker": 6,
        "REST APIs": 8
      }
    },
    "recommendations": {
      "top_candidates": 5,
      "interview_ready": 3,
      "requires_training": 2,
      "not_suitable": 2
    }
  }
}
```

---

## 5. Bulk Download API

### POST /resumes/bulk-download

**Purpose:** Download multiple resumes as ZIP
**Request:**

```json
{
  "resume_ids": [1, 2, 3, 4, 5],
  "format": "original", // or "pdf", "txt"
  "include_analysis": true
}
```

**Success Response (200):**

```
Content-Type: application/zip
Content-Disposition: attachment; filename="resumes_bulk_download.zip"

[Binary ZIP file content containing selected resumes]
```

---

## 6. Analytics API

### GET /analytics/dashboard

**Purpose:** Get dashboard analytics
**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_resumes": 150,
      "total_jobs": 25,
      "total_matches": 1250,
      "avg_match_score": 72
    },
    "recent_activity": [
      {
        "id": 1,
        "type": "resume_upload",
        "description": "3 new resumes uploaded",
        "timestamp": "2024-01-01T10:00:00Z"
      },
      {
        "id": 2,
        "type": "job_match",
        "description": "Job matched with 8 resumes",
        "timestamp": "2024-01-01T09:30:00Z"
      }
    ],
    "top_skills": [
      { "skill": "Python", "count": 45, "percentage": 75 },
      { "skill": "JavaScript", "count": 38, "percentage": 63 },
      { "skill": "React", "count": 32, "percentage": 53 }
    ],
    "match_trends": {
      "last_7_days": [85, 92, 78, 88, 95, 82, 90],
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  }
}
```

---

## 7. Error Response Formats

### Validation Error (422):

```json
{
  "success": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field_errors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"],
      "job_description": ["Job description is required"]
    }
  }
}
```

### File Upload Error (400):

```json
{
  "success": false,
  "message": "File upload failed",
  "error_code": "UPLOAD_ERROR",
  "details": {
    "failed_files": [
      {
        "filename": "invalid_file.txt",
        "error": "Unsupported file format"
      }
    ],
    "supported_formats": [".pdf", ".doc", ".docx"]
  }
}
```

### Rate Limit Error (429):

```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retry_after": 60,
    "limit": 100,
    "window": "1 hour"
  }
}
```

### Server Error (500):

```json
{
  "success": false,
  "message": "Internal server error",
  "error_code": "INTERNAL_ERROR",
  "details": {
    "request_id": "req_123456789"
  }
}
```

---

## 8. Frontend Integration Notes

### API Client Configuration

```javascript
// Base axios configuration
const apiClient = axios.create({
  baseURL: "https://your-api-domain.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### File Upload Headers

```javascript
// For file uploads
headers: {
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${token}`
}
```

### Download File Handling

```javascript
// For file downloads
const response = await fetch("/api/resumes/1/download", {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
```

---

## 9. Required Environment Variables

Backend should support these configuration options:

```env
# API Configuration
API_BASE_URL=https://your-api-domain.com/api
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=3600

# File Upload
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt
UPLOAD_DIR=/uploads/resumes

# Rate Limiting
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 10. Status Codes Summary

| Code | Meaning               | Usage                                   |
| ---- | --------------------- | --------------------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH requests     |
| 201  | Created               | Successful POST requests (creation)     |
| 400  | Bad Request           | Invalid request data/parameters         |
| 401  | Unauthorized          | Missing or invalid authentication       |
| 403  | Forbidden             | Valid auth but insufficient permissions |
| 404  | Not Found             | Resource doesn't exist                  |
| 422  | Unprocessable Entity  | Validation errors                       |
| 429  | Too Many Requests     | Rate limit exceeded                     |
| 500  | Internal Server Error | Server-side errors                      |

---

## Implementation Priority

1. **Phase 1 (Critical):**

   - Authentication APIs
   - Resume upload/list APIs
   - Basic job description processing

2. **Phase 2 (Core Features):**

   - Resume matching API
   - File download APIs
   - Error handling

3. **Phase 3 (Enhanced Features):**
   - Bulk operations
   - Analytics
   - Advanced filtering

This specification provides everything your backend team needs to implement the APIs that the frontend expects. All response formats match exactly what the React application is designed to handle.

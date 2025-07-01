# Resume Matcher API - Resume & Job Description Endpoints

This document details all resume and job description endpoints with their exact request/response formats.

## 📄 Resume Endpoints

### 1. POST /resumes/upload

Upload multiple resume files to the system.

**Request:** `multipart/form-data`

- `resumes`: File[] (PDF, DOC, DOCX files)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Resumes uploaded successfully",
  "data": {
    "uploaded_count": 3,
    "resumes": [
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe Resume.pdf",
        "file_size": 1024000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "filename": "jane_smith_resume.pdf",
        "original_name": "Jane Smith Resume.pdf",
        "file_size": 856000,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid file format",
  "errors": [
    "File must be PDF, DOC, or DOCX format",
    "Maximum file size exceeded (10MB)"
  ]
}
```

---

### 2. GET /resumes

Retrieve all uploaded resumes with pagination.

**Query Parameters:**

- `page`: integer (default: 1)
- `limit`: integer (default: 10)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe Resume.pdf",
        "file_size": 1024000,
        "upload_date": "2024-01-01T00:00:00Z",
        "last_matched": "2024-01-02T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10
    }
  }
}
```

---

### 3. POST /resumes/match

Match resumes against a job description using AI.

**Request:**

```json
{
  "job_description": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS...",
  "resume_ids": [1, 2, 3, 4, 5] // Optional: specific resumes to match
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
      "job_category": "Software Development"
    },
    "matched_resumes": [
      {
        "id": 1,
        "filename": "john_doe_resume.pdf",
        "original_name": "John Doe Resume.pdf",
        "match_score": 87,
        "max_score": 100,
        "matching_skills": ["Python", "React", "AWS", "Docker"],
        "missing_skills": ["Kubernetes"],
        "experience_match": "Senior (6 years)",
        "summary": "Strong match with excellent Python and React experience",
        "strengths": [
          "5+ years Python development",
          "React expertise with modern frameworks",
          "AWS cloud architecture experience"
        ],
        "weaknesses": [
          "Limited Kubernetes experience",
          "No mention of specific testing frameworks"
        ]
      },
      {
        "id": 2,
        "filename": "jane_smith_resume.pdf",
        "original_name": "Jane Smith Resume.pdf",
        "match_score": 92,
        "max_score": 100,
        "matching_skills": ["Python", "React", "AWS", "Docker", "Kubernetes"],
        "missing_skills": [],
        "experience_match": "Senior (8 years)",
        "summary": "Excellent match with all required skills",
        "strengths": [
          "8+ years full-stack development",
          "Complete AWS ecosystem knowledge",
          "Strong DevOps background"
        ],
        "weaknesses": []
      }
    ],
    "matching_stats": {
      "total_resumes_analyzed": 15,
      "resumes_with_matches": 8,
      "average_score": 64,
      "processing_time_ms": 2340
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid job description",
  "errors": ["Job description cannot be empty"]
}
```

---

## 💼 Job Description Endpoints

### 4. POST /jobs

Save a job description to the system.

**Request:**

```json
{
  "title": "Senior Software Developer",
  "description": "We are looking for a senior software developer..."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Job description saved successfully",
  "data": {
    "id": 1,
    "title": "Senior Software Developer",
    "description": "We are looking for a senior software developer...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title is required", "Description must be at least 50 characters"]
}
```

---

### 5. GET /jobs

Retrieve all saved job descriptions.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Senior Software Developer",
        "description": "We are looking for a senior software developer...",
        "created_at": "2024-01-01T00:00:00Z",
        "last_used": "2024-01-02T10:30:00Z"
      }
    ]
  }
}
```

---

## 🔧 Implementation Notes

### Frontend Integration

The React application uses `ApiService` to interact with these endpoints:

```javascript
// Upload resumes
const response = await ApiService.uploadResumes(files);

// Get all resumes with pagination
const response = await ApiService.getResumes(page, limit);

// Match resumes against job description
const response = await ApiService.matchResumes(jobDescription, resumeIds);

// Create job description
const response = await ApiService.createJob(title, description);

// Get all jobs
const response = await ApiService.getJobs();
```

### Mock Data Configuration

The application can run in mock mode by setting `REACT_APP_USE_MOCK_DATA=true` in your environment file. This allows frontend development and testing without a backend.

### Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### File Upload Requirements

- **Supported formats:** PDF, DOC, DOCX
- **Maximum file size:** 10MB per file
- **Multiple upload:** Up to 50 files per request
- **Content extraction:** Automatic text extraction for matching

### Matching Algorithm

The resume matching uses AI to analyze:

- **Skill matching:** Required vs available skills
- **Experience level:** Years and seniority matching
- **Industry relevance:** Domain-specific experience
- **Cultural fit:** Soft skills and values alignment

### Performance Considerations

- Resume matching typically takes 1-3 seconds per 10 resumes
- Large file uploads may take longer based on network speed
- Pagination recommended for large resume collections
- Caching implemented for frequently accessed job descriptions

---

## 📊 Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success - Request completed successfully |
| 201  | Created - Resource created successfully  |
| 400  | Bad Request - Invalid request data       |
| 401  | Unauthorized - Authentication required   |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource not found           |
| 413  | Payload Too Large - File size exceeded   |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error - Server error     |

---

_This documentation corresponds to the Resume Matcher API v1.0_

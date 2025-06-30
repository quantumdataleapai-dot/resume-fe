# API Response Formats - Implementation Guide

This document provides complete API response formats with dummy data for the Resume Matcher application.

## Authentication API Responses

### POST /api/auth/login

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "demo@fisecglobal.net",
      "full_name": "Demo User",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token",
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

### POST /api/auth/register

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "full_name": "New User",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-token",
    "expires_in": 3600
  }
}
```

## Resume Management API Responses

### POST /api/resumes/upload

**Request:** `multipart/form-data` with files

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
    "processing_time_ms": 1200
  }
}
```

### GET /api/resumes

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

### POST /api/resumes/match

**Request:**

```json
{
  "job_description": "We are looking for a Senior Full Stack Developer with 5+ years of experience in Python, React, AWS, and modern development practices...",
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
        "availability": "2 weeks notice"
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
        "availability": "1 month notice"
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

## Job Description API Responses

### POST /api/jobs

**Request:**

```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for a senior software developer with 5+ years...",
  "requirements": ["Python", "React", "AWS"],
  "location": "San Francisco, CA",
  "salary_range": "$120,000 - $180,000",
  "employment_type": "Full-time"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Job description saved successfully",
  "data": {
    "id": 1,
    "title": "Senior Full Stack Developer",
    "description": "We are looking for a senior software developer...",
    "requirements": ["Python", "React", "AWS"],
    "location": "San Francisco, CA",
    "salary_range": "$120,000 - $180,000",
    "employment_type": "Full-time",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "status": "active"
  }
}
```

### GET /api/jobs

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Senior Full Stack Developer",
        "description": "We are looking for a senior software developer...",
        "requirements": ["Python", "React", "AWS"],
        "location": "San Francisco, CA",
        "created_at": "2024-01-01T00:00:00Z",
        "last_used": "2024-01-02T10:30:00Z",
        "match_count": 15,
        "status": "active"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 5,
      "items_per_page": 10
    }
  }
}
```

## Analytics API Responses

### GET /api/analytics/dashboard

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

## Error Response Formats

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

## WebSocket Events (Real-time Updates)

### Resume Processing Update:

```json
{
  "event": "resume_processing",
  "data": {
    "resume_id": 1,
    "status": "processing",
    "progress": 75,
    "message": "Extracting text from PDF..."
  }
}
```

### Match Completion:

```json
{
  "event": "match_completed",
  "data": {
    "job_id": 1,
    "total_matches": 8,
    "highest_score": 94,
    "processing_time": 2340
  }
}
```

This comprehensive API specification provides all the response formats needed for implementing the Python backend and integrating it with the React frontend.

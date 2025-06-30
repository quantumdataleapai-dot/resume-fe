# Python Backend API Response Formats

This document outlines the expected API response formats for the Resume Matcher application backend.

## Base URL

```
http://localhost:8000/api
```

## Authentication Endpoints

### POST /auth/login

**Request:**

```json
{
  "email": "demo@fisecglobal.net",
  "password": "password"
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
      "email": "user@example.com",
      "full_name": "John Doe",
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

**Request:**

```json
{
  "full_name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### POST /auth/logout

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Resume Endpoints

### POST /resumes/upload

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

### GET /resumes

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

### POST /resumes/match

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

### DELETE /resumes/{resume_id}

**Success Response (200):**

```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

## Job Description Endpoints

### POST /jobs

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

### GET /jobs

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

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human readable error message",
  "error_code": "ERROR_CODE_CONSTANT",
  "details": {
    "field_errors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Unprocessable Entity (validation errors)
- `500`: Internal Server Error

## Python FastAPI Example Implementation

```python
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI()

# Response Models
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

class LoginResponse(BaseModel):
    success: bool
    message: str
    data: dict

class MatchedResume(BaseModel):
    id: int
    filename: str
    original_name: str
    match_score: int
    max_score: int = 100
    matching_skills: List[str]
    missing_skills: List[str]
    experience_match: str
    summary: str
    strengths: List[str]
    weaknesses: List[str]

# Login endpoint example
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: dict):
    # Implement authentication logic
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user_data,
            "token": jwt_token,
            "expires_in": 3600
        }
    }

# Resume matching endpoint example
@app.post("/api/resumes/match")
async def match_resumes(match_data: dict):
    # Implement resume matching logic using AI/ML
    return {
        "success": True,
        "message": "Resume matching completed",
        "data": {
            "matched_resumes": matched_resumes_list,
            "matching_stats": stats
        }
    }
```

## Environment Variables

Create a `.env` file in your React app root:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENVIRONMENT=development
```

This API specification provides a complete interface for your Python backend to communicate with the React frontend.

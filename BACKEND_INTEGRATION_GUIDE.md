# Backend Integration Guide - Resume Matcher

## 🚀 Quick Start for Backend Developers

This guide provides everything you need to implement the Python backend for the Resume Matcher frontend application.

## 📋 Documentation Files Overview

| File                        | Purpose                                                    | For Backend Developers                              |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `API_SPECIFICATION.md`      | Complete API spec with endpoints, request/response formats | **Essential** - Use this as your primary reference  |
| `DETAILED_API_RESPONSES.md` | Full response examples with dummy data                     | **Essential** - Copy these response formats exactly |
| `QUICK_API_REFERENCE.md`    | Quick endpoint summary                                     | **Reference** - Quick lookup of endpoints           |
| `API_DOCUMENTATION.md`      | Alternative API documentation                              | **Backup** - Additional format reference            |

## 🎯 Implementation Priority

### Phase 1: Core Authentication (Week 1)

```python
# Required endpoints:
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Phase 2: Resume Management (Week 2)

```python
# Required endpoints:
POST /api/resumes/upload      # Multiple file upload
GET  /api/resumes             # List all resumes
GET  /api/resumes/{id}/download # Download single resume
```

### Phase 3: Matching Engine (Week 3)

```python
# Required endpoints:
POST /api/jobs/upload         # Process job description
POST /api/resumes/match       # Match job with resumes
```

### Phase 4: Advanced Features (Week 4)

```python
# Enhanced endpoints:
POST /api/resumes/bulk-download # ZIP download
GET  /api/analytics/dashboard   # Dashboard stats
```

## 🔧 Key Backend Requirements

### 1. File Upload Configuration

```python
# Required file support:
ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_FILES_PER_UPLOAD = 10

# Multipart form data handling required
# Content-Type: multipart/form-data
```

### 2. Authentication Setup

```python
# JWT Token Configuration:
JWT_SECRET_KEY = 'your-secret-key'
JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

# Demo credentials (for testing):
DEMO_EMAIL = 'demo@fisecglobal.net'
DEMO_PASSWORD = 'demo123'
```

### 3. Response Format (CRITICAL)

**All responses must follow this exact format:**

```python
# Success Response Template:
{
    "success": True,
    "message": "Operation successful",
    "data": {
        # Your response data here
    }
}

# Error Response Template:
{
    "success": False,
    "message": "Error description",
    "error_code": "ERROR_TYPE",
    "details": {
        # Additional error details
    }
}
```

## 📝 Key API Integration Points

### 1. Resume Matching Logic

The frontend expects this exact response format for matching:

```python
# POST /api/resumes/match response:
{
    "success": True,
    "data": {
        "job_id": "job_123",
        "total_resumes_processed": 25,
        "matched_resumes": [
            {
                "id": 1,
                "score": 92,
                "rank": 1,
                "name": "John Doe",
                "email": "john@email.com",
                "phone": "+1234567890",
                "experience_years": 5,
                "skills": ["Python", "Django", "React"],
                "key_strengths": ["Technical Leadership", "Full Stack"],
                "education": "BS Computer Science",
                "location": "New York, NY",
                "file_path": "/uploads/resumes/john_doe.pdf"
            }
        ],
        "matching_criteria": {
            "required_skills": ["Python", "React"],
            "experience_level": "senior",
            "location_preference": "Remote"
        }
    }
}
```

### 2. File Download Implementation

```python
# For resume downloads, support these formats:
GET /api/resumes/{id}/download?format=pdf    # Original file
GET /api/resumes/{id}/download?format=txt    # Plain text
GET /api/resumes/{id}/download?format=json   # Structured data

# Bulk download:
POST /api/resumes/bulk-download
# Request body: {"resume_ids": [1, 2, 3, 4]}
# Response: ZIP file with all resumes
```

### 3. Job Description Processing

```python
# Support both text input and file upload:
POST /api/jobs/upload

# Text input:
{
    "job_description": "Looking for a senior Python developer...",
    "job_title": "Senior Python Developer"
}

# File upload:
# multipart/form-data with 'job_file' field
```

## 🔍 Frontend Expectations

### API Client Configuration

The frontend is configured to:

- **Base URL**: `http://localhost:8000/api` (development)
- **Production URL**: Set via `REACT_APP_API_URL` environment variable
- **Authentication**: Bearer token in Authorization header
- **Timeout**: 30 seconds for API calls
- **File uploads**: 60 seconds timeout

### Error Handling

The frontend expects these specific error codes:

```python
VALIDATION_ERROR = "VALIDATION_ERROR"        # 422
INVALID_CREDENTIALS = "INVALID_CREDENTIALS"  # 401
UPLOAD_ERROR = "UPLOAD_ERROR"                # 400
RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"  # 429
INTERNAL_ERROR = "INTERNAL_ERROR"            # 500
```

## 🧪 Testing Endpoints

### Demo Data for Testing

```python
# Test user credentials:
EMAIL: "demo@fisecglobal.net"
PASSWORD: "demo123"

# Sample resume files for testing:
# - Upload 5-10 sample PDF/DOC resumes
# - Include variety of skills: Python, JavaScript, React, Node.js, etc.
# - Different experience levels: Junior, Mid, Senior

# Sample job descriptions:
JOB_1 = "Senior Python Developer with 5+ years experience in Django, React, and cloud technologies"
JOB_2 = "Frontend Developer skilled in React, TypeScript, and modern web technologies"
```

## 🚨 Critical Implementation Notes

1. **File Security**: Validate file types, scan for malware, limit file sizes
2. **Resume Parsing**: Extract text from PDF/DOC files for matching
3. **Matching Algorithm**: Implement skill matching, experience level comparison
4. **Performance**: Optimize for handling 100+ resumes efficiently
5. **CORS**: Configure CORS for frontend domain
6. **Rate Limiting**: Implement to prevent abuse

## 📞 Frontend Integration Support

If you need clarification on any API responses or have questions about the frontend expectations:

1. Check `API_SPECIFICATION.md` for complete endpoint details
2. Review `DETAILED_API_RESPONSES.md` for exact response formats
3. Look at `src/utils/api.js` to see how frontend calls your APIs
4. Check `src/utils/mockData.js` for expected data structures

## 🎯 Success Criteria

Your backend implementation is ready when:

- [ ] All authentication endpoints return correct response formats
- [ ] Resume upload handles multiple files and returns proper structure
- [ ] Resume matching returns scored candidates in expected format
- [ ] File downloads work for all supported formats
- [ ] Error responses follow the specified format
- [ ] Demo credentials work for frontend testing

## 🔗 Quick Links

- **Primary API Spec**: `API_SPECIFICATION.md`
- **Response Examples**: `DETAILED_API_RESPONSES.md`
- **Frontend API Client**: `src/utils/api.js`
- **Mock Data Reference**: `src/utils/mockData.js`

---

**Ready to implement? Start with `API_SPECIFICATION.md` and use `DETAILED_API_RESPONSES.md` for exact response formats!**

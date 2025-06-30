# Quick API Reference - Resume Matcher

## Base URL

```
https://your-api-domain.com/api
```

## Essential Endpoints

### Authentication

```
POST /auth/login          - User login
POST /auth/register       - User registration
```

### Resume Management

```
GET  /resumes             - List all resumes
POST /resumes/upload      - Upload resume files
GET  /resumes/{id}/download - Download specific resume
POST /resumes/bulk-download - Download multiple resumes as ZIP
```

### Job Description

```
POST /jobs/upload         - Upload/process job description
```

### Matching

```
POST /resumes/match       - Match job with resumes
```

### Analytics (Optional)

```
GET  /analytics/dashboard - Get dashboard stats
```

## Key Response Fields

### For Resume List (/resumes)

```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": 1,
        "original_name": "John Doe - Senior Developer.pdf",
        "upload_date": "2024-01-01T00:00:00Z",
        "status": "active"
      }
    ]
  }
}
```

### For Resume Matching (/resumes/match)

```json
{
  "success": true,
  "data": {
    "matched_resumes": [
      {
        "id": 1,
        "original_name": "John Doe - Senior Developer.pdf",
        "match_score": 89,
        "max_score": 100,
        "matching_skills": ["Python", "React"],
        "missing_skills": ["GraphQL"],
        "experience_match": "Senior (6 years)",
        "summary": "Strong match with excellent Python experience",
        "strengths": ["6+ years Python", "React expertise"],
        "weaknesses": ["Limited GraphQL experience"]
      }
    ]
  }
}
```

## Authentication Header

```
Authorization: Bearer <jwt_token>
```

## File Upload Content-Type

```
Content-Type: multipart/form-data
```

## Frontend Integration Points

1. **Login Component** → `POST /auth/login`
2. **Dashboard Load Resumes** → `GET /resumes`
3. **Resume Upload** → `POST /resumes/upload`
4. **Job Description Processing** → `POST /jobs/upload`
5. **Resume Matching** → `POST /resumes/match`
6. **Individual Downloads** → `GET /resumes/{id}/download`
7. **Bulk Downloads** → `POST /resumes/bulk-download`

## Current Mock Data Location

```
src/utils/mockData.js - Contains all mock responses
```

The frontend is ready to switch from mock data to real API calls once these endpoints are implemented!

# API Testing Guide - Resume Matcher Backend

## 🧪 Testing Your Backend Implementation

This guide provides curl commands and test scenarios to validate your backend implementation.

## 🔧 Environment Setup

```bash
# Set your backend URL
export API_BASE_URL="http://localhost:8000/api"

# For production testing
# export API_BASE_URL="https://your-domain.com/api"
```

## 1️⃣ Authentication Testing

### Test Login (Demo User)

```bash
curl -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=demo@fisecglobal.net&password=demo123"
```

**Expected Response:**

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### Test Invalid Login

```bash
curl -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=wrong@email.com&password=wrongpass"
```

**Expected Response (401):**

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error_code": "INVALID_CREDENTIALS"
}
```

### Test Registration

```bash
curl -X POST "${API_BASE_URL}/auth/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "full_name=Test User&email=test@example.com&password=password123"
```

## 2️⃣ Resume Upload Testing

### Get JWT Token First

```bash
# Store token in variable
TOKEN=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=demo@fisecglobal.net&password=demo123" | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

### Test Resume Upload

```bash
# Create a test file
echo "John Doe - Senior Python Developer
Email: john@email.com
Phone: +1234567890
Skills: Python, Django, React, PostgreSQL
Experience: 5 years in full-stack development" > test_resume.txt

# Upload the resume
curl -X POST "${API_BASE_URL}/resumes/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "files=@test_resume.txt"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Resumes uploaded successfully",
  "data": {
    "uploaded_count": 1,
    "failed_count": 0,
    "resumes": [
      {
        "id": 1,
        "filename": "test_resume.txt",
        "original_name": "test_resume.txt",
        "file_size": 156,
        "content_extracted": true,
        "upload_date": "2024-01-01T00:00:00Z",
        "status": "processed"
      }
    ],
    "processing_time_ms": 1200
  }
}
```

### Test Multiple Resume Upload

```bash
# Create multiple test files
echo "Sarah Wilson - Frontend Developer" > resume1.txt
echo "Mike Johnson - Backend Developer" > resume2.txt

curl -X POST "${API_BASE_URL}/resumes/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "files=@resume1.txt" \
  -F "files=@resume2.txt"
```

## 3️⃣ Resume List Testing

### Get All Resumes

```bash
curl -X GET "${API_BASE_URL}/resumes" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "resumes": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@email.com",
        "phone": "+1234567890",
        "skills": ["Python", "Django", "React"],
        "experience_years": 5,
        "education": "BS Computer Science",
        "location": "New York, NY",
        "upload_date": "2024-01-01T00:00:00Z",
        "file_path": "/uploads/resumes/john_doe.pdf"
      }
    ],
    "total_count": 1
  }
}
```

## 4️⃣ Job Description Testing

### Test Job Description Upload (Text)

```bash
curl -X POST "${API_BASE_URL}/jobs/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "job_description=We are looking for a Senior Python Developer with 5+ years of experience in Django, React, and cloud technologies. Must have strong problem-solving skills and experience with agile development.&job_title=Senior Python Developer"
```

### Test Job Description Upload (File)

```bash
# Create job description file
echo "Senior Full-Stack Developer
Required Skills: Python, Django, React, PostgreSQL
Experience: 5+ years
Location: Remote or New York" > job_description.txt

curl -X POST "${API_BASE_URL}/jobs/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "job_file=@job_description.txt" \
  -F "job_title=Senior Full-Stack Developer"
```

## 5️⃣ Resume Matching Testing

### Test Resume Matching

```bash
curl -X POST "${API_BASE_URL}/resumes/match" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "job_id=job_123456"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Matching completed successfully",
  "data": {
    "job_id": "job_123456",
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
        "skills": ["Python", "Django", "React", "PostgreSQL"],
        "key_strengths": ["Technical Leadership", "Full Stack Development"],
        "education": "BS Computer Science",
        "location": "New York, NY",
        "file_path": "/uploads/resumes/john_doe.pdf"
      }
    ],
    "matching_criteria": {
      "required_skills": ["Python", "React"],
      "experience_level": "senior",
      "location_preference": "Remote"
    },
    "processing_time_ms": 2500
  }
}
```

## 6️⃣ File Download Testing

### Test Resume Download (PDF)

```bash
curl -X GET "${API_BASE_URL}/resumes/1/download?format=pdf" \
  -H "Authorization: Bearer ${TOKEN}" \
  -o "downloaded_resume.pdf"
```

### Test Resume Download (TXT)

```bash
curl -X GET "${API_BASE_URL}/resumes/1/download?format=txt" \
  -H "Authorization: Bearer ${TOKEN}" \
  -o "downloaded_resume.txt"
```

### Test Resume Download (JSON)

```bash
curl -X GET "${API_BASE_URL}/resumes/1/download?format=json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -o "downloaded_resume.json"
```

## 7️⃣ Error Testing

### Test Unauthorized Access

```bash
curl -X GET "${API_BASE_URL}/resumes" \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response (401):**

```json
{
  "success": false,
  "message": "Invalid token",
  "error_code": "INVALID_CREDENTIALS"
}
```

### Test File Upload Without Files

```bash
curl -X POST "${API_BASE_URL}/resumes/upload" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Test Invalid File Format

```bash
echo "test" > invalid.xyz
curl -X POST "${API_BASE_URL}/resumes/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "files=@invalid.xyz"
```

## 8️⃣ Integration Testing Script

Create a complete test script:

```bash
#!/bin/bash
# test_backend.sh

API_BASE_URL="http://localhost:8000/api"

echo "🚀 Testing Resume Matcher Backend API"
echo "======================================"

# 1. Test Login
echo "1️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=demo@fisecglobal.net&password=demo123")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed - no token received"
    exit 1
fi

# 2. Test Resume Upload
echo -e "\n2️⃣ Testing Resume Upload..."
echo "John Doe - Senior Developer" > test_resume.txt
UPLOAD_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/resumes/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "files=@test_resume.txt")

echo "Upload Response: $UPLOAD_RESPONSE"

# 3. Test Resume List
echo -e "\n3️⃣ Testing Resume List..."
LIST_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/resumes" \
  -H "Authorization: Bearer ${TOKEN}")

echo "List Response: $LIST_RESPONSE"

# 4. Test Job Description
echo -e "\n4️⃣ Testing Job Description..."
JOB_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/jobs/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "job_description=Senior Python Developer with React experience&job_title=Senior Developer")

echo "Job Response: $JOB_RESPONSE"

# 5. Test Matching
echo -e "\n5️⃣ Testing Resume Matching..."
MATCH_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/resumes/match" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "job_id=job_123")

echo "Match Response: $MATCH_RESPONSE"

echo -e "\n✅ All tests completed!"
```

Make it executable and run:

```bash
chmod +x test_backend.sh
./test_backend.sh
```

## 9️⃣ Validation Checklist

Your backend is ready when these tests pass:

- [ ] ✅ Demo login returns valid JWT token
- [ ] ✅ Invalid login returns 401 error
- [ ] ✅ Resume upload accepts multiple files
- [ ] ✅ Resume list returns proper format
- [ ] ✅ Job description processing works for text and files
- [ ] ✅ Resume matching returns scored candidates
- [ ] ✅ File downloads work for all formats
- [ ] ✅ Unauthorized requests return 401
- [ ] ✅ All responses follow the specified format
- [ ] ✅ Error responses include proper error codes

## 🔧 Debugging Tips

### Check Response Format

```bash
# Pretty print JSON responses
curl -s "${API_BASE_URL}/resumes" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.'
```

### Check Response Headers

```bash
curl -I "${API_BASE_URL}/resumes" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Test CORS

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS "${API_BASE_URL}/auth/login"
```

## 📞 Frontend Integration Verification

Once your backend tests pass, verify frontend integration:

1. Update frontend `.env` file:

```bash
REACT_APP_API_URL=http://localhost:8000/api
```

2. Start React app:

```bash
cd Resume-UI
npm start
```

3. Test login with demo credentials:

   - Email: `demo@fisecglobal.net`
   - Password: `demo123`

4. Test resume upload and job matching features

Your backend is production-ready when all these tests pass! 🎉

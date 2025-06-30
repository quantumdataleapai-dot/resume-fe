# FastAPI Backend Implementation - Resume Matcher

## 🐍 Python FastAPI Implementation Example

This is a starter implementation for the Resume Matcher backend using FastAPI.

## 📦 Required Dependencies

```bash
# Create requirements.txt
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart aiofiles PyPDF2 python-docx nltk scikit-learn pandas
```

## 🚀 Basic FastAPI Structure

### main.py

```python
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
import uvicorn
from typing import List, Optional
import os
from datetime import datetime, timedelta
import json

from auth import authenticate_user, create_access_token, get_current_user
from models import User, ResumeResponse, MatchResponse
from resume_processor import ResumeProcessor
from job_matcher import JobMatcher

app = FastAPI(title="Resume Matcher API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize processors
resume_processor = ResumeProcessor()
job_matcher = JobMatcher()

@app.get("/")
async def root():
    return {"message": "Resume Matcher API", "status": "running"}

# Authentication endpoints
@app.post("/api/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    """User login endpoint"""
    try:
        # Demo user check
        if email == "demo@fisecglobal.net" and password == "demo123":
            token = create_access_token(data={"sub": email})
            return {
                "success": True,
                "message": "Login successful",
                "data": {
                    "user": {
                        "id": 1,
                        "email": email,
                        "full_name": "Demo User",
                        "created_at": datetime.utcnow().isoformat() + "Z",
                        "updated_at": datetime.utcnow().isoformat() + "Z"
                    },
                    "token": token,
                    "expires_in": 3600
                }
            }

        # Add your user authentication logic here
        user = authenticate_user(email, password)
        if not user:
            raise HTTPException(status_code=401, detail={
                "success": False,
                "message": "Invalid credentials",
                "error_code": "INVALID_CREDENTIALS"
            })

        token = create_access_token(data={"sub": user.email})
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "created_at": user.created_at.isoformat() + "Z",
                    "updated_at": user.updated_at.isoformat() + "Z"
                },
                "token": token,
                "expires_in": 3600
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Login failed",
            "error_code": "INTERNAL_ERROR"
        })

@app.post("/api/auth/register")
async def register(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    """User registration endpoint"""
    try:
        # Add your user registration logic here
        # user = create_user(full_name, email, password)

        token = create_access_token(data={"sub": email})
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user": {
                    "id": 1,  # Replace with actual user ID
                    "email": email,
                    "full_name": full_name,
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                "token": token,
                "expires_in": 3600
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Registration failed",
            "error_code": "INTERNAL_ERROR"
        })

# Resume endpoints
@app.post("/api/resumes/upload")
async def upload_resumes(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload multiple resume files"""
    try:
        uploaded_resumes = []
        upload_dir = "uploads/resumes"
        os.makedirs(upload_dir, exist_ok=True)

        for file in files:
            # Validate file type
            if not file.filename.endswith(('.pdf', '.doc', '.docx', '.txt')):
                continue

            # Save file
            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)

            # Process resume
            resume_data = await resume_processor.process_resume(file_path, file.filename)
            uploaded_resumes.append(resume_data)

        return {
            "success": True,
            "message": "Resumes uploaded successfully",
            "data": {
                "uploaded_count": len(uploaded_resumes),
                "failed_count": len(files) - len(uploaded_resumes),
                "resumes": uploaded_resumes,
                "processing_time_ms": 1200
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Upload failed",
            "error_code": "UPLOAD_ERROR"
        })

@app.get("/api/resumes")
async def list_resumes(current_user: User = Depends(get_current_user)):
    """List all resumes"""
    try:
        # Get resumes from database
        resumes = await resume_processor.get_all_resumes()

        return {
            "success": True,
            "data": {
                "resumes": resumes,
                "total_count": len(resumes)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Failed to fetch resumes",
            "error_code": "INTERNAL_ERROR"
        })

@app.post("/api/jobs/upload")
async def process_job_description(
    job_description: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    """Process job description from text or file"""
    try:
        if job_file:
            # Process uploaded file
            content = await job_file.read()
            job_text = content.decode('utf-8')
        elif job_description:
            job_text = job_description
        else:
            raise HTTPException(status_code=400, detail={
                "success": False,
                "message": "Job description or file is required",
                "error_code": "VALIDATION_ERROR"
            })

        # Process job description
        job_data = await job_matcher.process_job_description(job_text, job_title)

        return {
            "success": True,
            "message": "Job description processed successfully",
            "data": job_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Job processing failed",
            "error_code": "INTERNAL_ERROR"
        })

@app.post("/api/resumes/match")
async def match_resumes(
    job_id: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Match job with resumes"""
    try:
        # Get job details and match with resumes
        matched_resumes = await job_matcher.match_job_with_resumes(job_id)

        return {
            "success": True,
            "message": "Matching completed successfully",
            "data": {
                "job_id": job_id,
                "total_resumes_processed": len(matched_resumes),
                "matched_resumes": matched_resumes,
                "matching_criteria": {
                    "required_skills": ["Python", "React"],
                    "experience_level": "senior",
                    "location_preference": "Remote"
                },
                "processing_time_ms": 2500
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Matching failed",
            "error_code": "INTERNAL_ERROR"
        })

@app.get("/api/resumes/{resume_id}/download")
async def download_resume(
    resume_id: int,
    format: str = "pdf",
    current_user: User = Depends(get_current_user)
):
    """Download a specific resume"""
    try:
        file_path = await resume_processor.get_resume_file_path(resume_id, format)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail={
                "success": False,
                "message": "Resume not found",
                "error_code": "NOT_FOUND"
            })

        return FileResponse(
            path=file_path,
            media_type='application/octet-stream',
            filename=f"resume_{resume_id}.{format}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Download failed",
            "error_code": "INTERNAL_ERROR"
        })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

### auth.py

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Configuration
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class User:
    def __init__(self, id: int, email: str, full_name: str):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    email = verify_token(token)
    # Get user from database based on email
    # For demo, return a mock user
    return User(id=1, email=email, full_name="Demo User")

def authenticate_user(email: str, password: str):
    # Implement your user authentication logic here
    # Check against database, verify password hash, etc.
    pass
```

### resume_processor.py

```python
import PyPDF2
import docx
import os
import json
from typing import List, Dict
from datetime import datetime

class ResumeProcessor:
    def __init__(self):
        self.upload_dir = "uploads/resumes"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def process_resume(self, file_path: str, original_filename: str) -> Dict:
        """Process a resume file and extract information"""
        try:
            # Extract text from file
            text_content = self.extract_text(file_path)

            # Parse resume data (implement your parsing logic)
            parsed_data = self.parse_resume_content(text_content)

            return {
                "id": self.generate_resume_id(),
                "filename": os.path.basename(file_path),
                "original_name": original_filename,
                "file_size": os.path.getsize(file_path),
                "content_extracted": True,
                "upload_date": datetime.utcnow().isoformat() + "Z",
                "status": "processed",
                "parsed_data": parsed_data
            }
        except Exception as e:
            return {
                "filename": original_filename,
                "error": str(e),
                "status": "failed"
            }

    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF, DOC, or TXT files"""
        _, ext = os.path.splitext(file_path)

        if ext.lower() == '.pdf':
            return self.extract_pdf_text(file_path)
        elif ext.lower() in ['.doc', '.docx']:
            return self.extract_docx_text(file_path)
        elif ext.lower() == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text

    def extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text

    def parse_resume_content(self, text: str) -> Dict:
        """Parse resume content and extract structured data"""
        # Implement your resume parsing logic here
        # This is a simplified example
        return {
            "name": "Extracted Name",
            "email": "extracted@email.com",
            "phone": "+1234567890",
            "skills": ["Python", "JavaScript", "React"],
            "experience_years": 5,
            "education": "BS Computer Science",
            "location": "New York, NY"
        }

    def generate_resume_id(self) -> int:
        """Generate unique resume ID"""
        # Implement your ID generation logic
        import random
        return random.randint(1000, 9999)

    async def get_all_resumes(self) -> List[Dict]:
        """Get all processed resumes"""
        # Implement database query to get all resumes
        # Return mock data for now
        return [
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
        ]

    async def get_resume_file_path(self, resume_id: int, format: str) -> str:
        """Get file path for resume download"""
        # Implement logic to get file path based on resume ID and format
        return f"{self.upload_dir}/resume_{resume_id}.{format}"
```

### job_matcher.py

```python
from typing import List, Dict
import json
from datetime import datetime

class JobMatcher:
    def __init__(self):
        pass

    async def process_job_description(self, job_text: str, job_title: str = None) -> Dict:
        """Process job description and extract requirements"""
        # Implement your job processing logic here
        # Extract skills, requirements, etc.

        return {
            "job_id": self.generate_job_id(),
            "job_title": job_title or "Extracted Job Title",
            "processed_text": job_text[:500] + "..." if len(job_text) > 500 else job_text,
            "required_skills": ["Python", "React", "Django"],
            "experience_level": "senior",
            "location": "Remote",
            "processed_at": datetime.utcnow().isoformat() + "Z"
        }

    async def match_job_with_resumes(self, job_id: str) -> List[Dict]:
        """Match job requirements with available resumes"""
        # Implement your matching algorithm here
        # This returns mock matched resumes

        return [
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
            },
            {
                "id": 2,
                "score": 87,
                "rank": 2,
                "name": "Sarah Wilson",
                "email": "sarah@email.com",
                "phone": "+0987654321",
                "experience_years": 4,
                "skills": ["Python", "React", "Node.js", "MongoDB"],
                "key_strengths": ["Frontend Development", "API Design"],
                "education": "MS Software Engineering",
                "location": "San Francisco, CA",
                "file_path": "/uploads/resumes/sarah_wilson.pdf"
            }
        ]

    def generate_job_id(self) -> str:
        """Generate unique job ID"""
        import uuid
        return f"job_{uuid.uuid4().hex[:8]}"
```

## 🚀 Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API will be available at:
# http://localhost:8000
# Documentation: http://localhost:8000/docs
```

## 📝 Implementation Notes

1. **Database Integration**: Add your preferred database (PostgreSQL, MongoDB, etc.)
2. **File Storage**: Consider cloud storage (AWS S3, Google Cloud) for production
3. **Resume Parsing**: Implement more sophisticated parsing using spaCy, NLTK, or commercial APIs
4. **Matching Algorithm**: Implement semantic matching using word embeddings or transformer models
5. **Security**: Add proper validation, rate limiting, and security headers
6. **Testing**: Add unit tests and integration tests

This starter provides the basic structure that matches your frontend API expectations!

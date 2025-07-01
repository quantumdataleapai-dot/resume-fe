# Backend Implementation Guide - Job Description API

This document provides the exact API specification for backend developers to implement job description processing endpoints.

## 🎯 Overview

The job description API supports two input methods:

1. **Text Input**: Direct text processing via JSON
2. **File Upload**: Document file processing (PDF, DOC, DOCX, TXT)

Both methods extract skills, classify experience level, and prepare data for resume matching.

---

## 📡 API Endpoints to Implement

### 1. POST /api/jobs/upload-text

**Purpose**: Process job description from text input

**Request Headers**:

```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Request Body**:

```json
{
  "job_description": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS. The ideal candidate should have strong problem-solving skills and experience with microservices architecture.",
  "title": "Senior Software Developer" // Optional
}
```

**Response**:

```json
{
  "success": true,
  "message": "Job description processed successfully",
  "data": {
    "job_id": 123456789,
    "title": "Senior Software Developer",
    "description": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS. The ideal candidate should have strong problem-solving skills and experience with microservices architecture.",
    "extracted_text": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS. The ideal candidate should have strong problem-solving skills and experience with microservices architecture.",
    "key_skills": [
      "Python",
      "React",
      "AWS",
      "Microservices",
      "Problem-solving"
    ],
    "experience_level": "Senior",
    "job_category": "Software Development",
    "created_at": "2024-01-01T00:00:00Z",
    "processing_time_ms": 850
  }
}
```

---

### 2. POST /api/jobs/upload-file

**Purpose**: Process job description from uploaded file

**Request Headers**:

```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Request Body** (form-data):

```
job_file: [File] (PDF, DOC, DOCX, TXT)
title: "Senior Software Developer" (Optional)
```

**Response**:

```json
{
  "success": true,
  "message": "Job description file processed successfully",
  "data": {
    "job_id": 123456790,
    "title": "Senior Software Developer",
    "original_filename": "senior_dev_job.pdf",
    "file_size": 245760,
    "extracted_text": "Senior Software Developer Position\n\nJob Summary:\nWe are seeking an experienced software developer with expertise in modern web technologies...",
    "key_skills": [
      "Python",
      "React",
      "AWS",
      "Docker",
      "REST APIs",
      "Git",
      "Agile"
    ],
    "experience_level": "Senior",
    "job_category": "Software Development",
    "content_extracted": true,
    "created_at": "2024-01-01T00:00:00Z",
    "processing_time_ms": 1840
  }
}
```

---

### 3. POST /api/jobs/process (Unified Endpoint)

**Purpose**: Handle both text and file uploads in a single endpoint

**Option A - Text Input**:

```json
{
  "job_description": "Job description text...",
  "title": "Job Title"
}
```

**Option B - File Upload** (multipart/form-data):

```
job_file: [File]
title: "Job Title"
```

**Response**: Same format as individual endpoints above

---

## 🔧 Backend Implementation Requirements

### File Processing Libraries

**Python Example**:

```python
# Required libraries
import PyPDF2          # PDF processing
import python-docx     # DOC/DOCX processing
import spacy          # NLP for skill extraction
import re             # Text processing

# File text extraction
def extract_text_from_file(file, file_type):
    if file_type == 'pdf':
        return extract_pdf_text(file)
    elif file_type in ['doc', 'docx']:
        return extract_docx_text(file)
    elif file_type == 'txt':
        return file.read().decode('utf-8')
    else:
        raise ValueError("Unsupported file type")

def extract_pdf_text(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_docx_text(docx_file):
    from docx import Document
    doc = Document(docx_file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text
```

### Skill Extraction Algorithm

```python
# Skill extraction using predefined skill database
TECH_SKILLS = [
    "Python", "JavaScript", "React", "Angular", "Vue.js", "Node.js",
    "Java", "C#", "PHP", "Ruby", "Go", "Rust", "TypeScript",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
    "Git", "REST APIs", "GraphQL", "Microservices", "DevOps"
]

SOFT_SKILLS = [
    "Leadership", "Communication", "Problem-solving", "Teamwork",
    "Critical thinking", "Adaptability", "Time management"
]

def extract_skills(job_text):
    found_skills = []
    job_text_lower = job_text.lower()

    for skill in TECH_SKILLS + SOFT_SKILLS:
        if skill.lower() in job_text_lower:
            found_skills.append(skill)

    return found_skills

def classify_experience_level(job_text):
    job_text_lower = job_text.lower()

    if any(term in job_text_lower for term in ["senior", "lead", "principal", "architect", "8+ years", "10+ years"]):
        return "Senior"
    elif any(term in job_text_lower for term in ["mid-level", "intermediate", "3-5 years", "5+ years"]):
        return "Mid-level"
    elif any(term in job_text_lower for term in ["junior", "entry", "graduate", "0-2 years", "internship"]):
        return "Junior"
    else:
        return "Mid-level"  # Default

def categorize_job(skills, job_text):
    job_text_lower = job_text.lower()

    if any(skill in skills for skill in ["React", "Angular", "Vue.js", "Frontend"]):
        return "Frontend Development"
    elif any(skill in skills for skill in ["Python", "Java", "Node.js", "Backend"]):
        return "Backend Development"
    elif any(skill in skills for skill in ["React", "Python", "Full-stack"]):
        return "Full-stack Development"
    elif any(skill in skills for skill in ["AWS", "Docker", "Kubernetes", "DevOps"]):
        return "DevOps/Cloud"
    elif any(term in job_text_lower for term in ["data scientist", "machine learning", "ai"]):
        return "Data Science"
    else:
        return "Software Development"
```

### Complete Flask Example

```python
from flask import Flask, request, jsonify
import time
import uuid
from datetime import datetime

app = Flask(__name__)

@app.route('/api/jobs/upload-text', methods=['POST'])
def upload_job_text():
    try:
        start_time = time.time()
        data = request.get_json()

        if not data or 'job_description' not in data:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": ["job_description is required"]
            }), 400

        job_description = data['job_description']
        title = data.get('title', 'Untitled Job')

        if len(job_description.strip()) < 50:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": ["Job description must be at least 50 characters long"]
            }), 400

        # Process job description
        skills = extract_skills(job_description)
        experience_level = classify_experience_level(job_description)
        job_category = categorize_job(skills, job_description)

        processing_time = int((time.time() - start_time) * 1000)

        result = {
            "job_id": int(time.time() * 1000),  # Simple ID generation
            "title": title,
            "description": job_description,
            "extracted_text": job_description,
            "key_skills": skills,
            "experience_level": experience_level,
            "job_category": job_category,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "processing_time_ms": processing_time
        }

        return jsonify({
            "success": True,
            "message": "Job description processed successfully",
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Processing failed",
            "errors": [str(e)]
        }), 500

@app.route('/api/jobs/upload-file', methods=['POST'])
def upload_job_file():
    try:
        start_time = time.time()

        if 'job_file' not in request.files:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": ["job_file is required"]
            }), 400

        file = request.files['job_file']
        title = request.form.get('title', file.filename.rsplit('.', 1)[0])

        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": ["No file selected"]
            }), 400

        # Validate file type
        allowed_extensions = {'pdf', 'doc', 'docx', 'txt'}
        file_extension = file.filename.rsplit('.', 1)[1].lower()

        if file_extension not in allowed_extensions:
            return jsonify({
                "success": False,
                "message": "Invalid file format",
                "errors": ["Only PDF, DOC, DOCX, and TXT files are supported"]
            }), 400

        # Extract text from file
        extracted_text = extract_text_from_file(file, file_extension)

        if len(extracted_text.strip()) < 50:
            return jsonify({
                "success": False,
                "message": "Processing failed",
                "errors": ["Could not extract sufficient text from the file"]
            }), 422

        # Process extracted text
        skills = extract_skills(extracted_text)
        experience_level = classify_experience_level(extracted_text)
        job_category = categorize_job(skills, extracted_text)

        processing_time = int((time.time() - start_time) * 1000)

        result = {
            "job_id": int(time.time() * 1000),
            "title": title,
            "original_filename": file.filename,
            "file_size": len(file.read()),
            "extracted_text": extracted_text,
            "key_skills": skills,
            "experience_level": experience_level,
            "job_category": job_category,
            "content_extracted": True,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "processing_time_ms": processing_time
        }

        return jsonify({
            "success": True,
            "message": "Job description file processed successfully",
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Processing failed",
            "errors": [str(e)]
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
```

---

## 🗄️ Database Schema

### Jobs Table

```sql
CREATE TABLE jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    extracted_text TEXT,
    original_filename VARCHAR(255),
    file_size INT,
    key_skills JSON,
    experience_level ENUM('Junior', 'Mid-level', 'Senior', 'Lead'),
    job_category VARCHAR(100),
    content_extracted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processing_time_ms INT,

    INDEX idx_category (job_category),
    INDEX idx_experience (experience_level),
    INDEX idx_created (created_at)
);
```

---

## 📊 Validation Rules

### Text Input Validation

- **job_description**: Required, minimum 50 characters, maximum 10,000 characters
- **title**: Optional, maximum 255 characters

### File Upload Validation

- **job_file**: Required, supported formats: PDF, DOC, DOCX, TXT
- **file_size**: Maximum 10MB
- **title**: Optional, defaults to filename without extension

### Content Processing

- **skill_extraction**: Minimum 1 skill required
- **experience_classification**: Must be one of: Junior, Mid-level, Senior, Lead
- **category_assignment**: Must be assigned to a valid category

---

## 🚀 Integration with Resume Matching

After job description processing, the extracted text and skills are used for resume matching:

```python
# Example integration
@app.route('/api/resumes/match', methods=['POST'])
def match_resumes():
    data = request.get_json()
    job_description = data['job_description']
    resume_ids = data.get('resume_ids')  # Optional

    # Use the processed job description for matching
    job_skills = extract_skills(job_description)
    job_experience = classify_experience_level(job_description)

    # Match against resumes
    matched_resumes = perform_matching(job_skills, job_experience, resume_ids)

    return jsonify({
        "success": True,
        "message": "Resume matching completed",
        "data": {
            "job_analysis": {
                "key_skills": job_skills,
                "experience_level": job_experience,
                "job_category": categorize_job(job_skills, job_description)
            },
            "matched_resumes": matched_resumes,
            "matching_stats": calculate_stats(matched_resumes)
        }
    })
```

---

This specification provides everything needed for backend implementation of the job description processing API that integrates seamlessly with your React frontend.

# Resume Upload API Endpoints - No Authentication

Complete specification for resume upload endpoints supporting multiple files, single file, and URL uploads **without authentication requirements**.

## 🚀 Overview

The resume upload API supports three distinct upload methods:

1. **Multiple File Upload**: Upload several resume files at once
2. **Single File Upload**: Upload one resume file
3. **URL Upload**: Download resumes from URLs

**Note**: These endpoints do not require authentication - no JWT tokens or login required.

---

## 📤 Upload Endpoints

### 1. POST /api/resumes/upload-multiple

**Purpose**: Upload multiple resume files simultaneously

**Request Headers**:

```
Content-Type: multipart/form-data
```

**Request Body** (form-data):

```
resumes: [File, File, File, ...]  // Multiple resume files
```

**Supported File Types**: PDF, DOC, DOCX, TXT
**File Size Limit**: 10MB per file
**Maximum Files**: 50 files per request

**Success Response (201)**:

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
        "original_name": "John Doe Resume.pdf",
        "file_size": 1024000,
        "content_extracted": true,
        "upload_date": "2024-12-30T10:15:30Z"
      },
      {
        "id": 2,
        "filename": "sarah_wilson_resume.pdf",
        "original_name": "Sarah Wilson Resume.pdf",
        "file_size": 856000,
        "content_extracted": true,
        "upload_date": "2024-12-30T10:15:31Z"
      },
      {
        "id": 3,
        "filename": "mike_chen_resume.docx",
        "original_name": "Mike Chen Resume.docx",
        "file_size": 945000,
        "content_extracted": true,
        "upload_date": "2024-12-30T10:15:32Z"
      }
    ],
    "failed_uploads": [],
    "processing_stats": {
      "total_processing_time_ms": 2450,
      "average_file_size_mb": 0.94,
      "extraction_success_rate": 100
    }
  }
}
```

**Error Response (400)**:

```json
{
  "success": false,
  "message": "Upload validation failed",
  "errors": ["No files provided", "Maximum 50 files allowed per upload"]
}
```

**Partial Success Response (207)**:

```json
{
  "success": true,
  "message": "Partial upload completed",
  "data": {
    "uploaded_count": 2,
    "failed_count": 1,
    "resumes": [
      // ... successfully uploaded resumes
    ],
    "failed_uploads": [
      {
        "filename": "corrupted_resume.pdf",
        "error": "File is corrupted or password protected",
        "error_code": "EXTRACTION_FAILED"
      }
    ]
  }
}
```

---

### 2. POST /api/resumes/upload-single

**Purpose**: Upload a single resume file

**Request Headers**:

```
Content-Type: multipart/form-data
```

**Request Body** (form-data):

```
resume: [File]  // Single resume file
metadata: {     // Optional JSON string
  "candidate_name": "John Doe",
  "position_applied": "Software Developer",
  "source": "website"
}
```

**Success Response (201)**:

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume": {
      "id": 123,
      "filename": "john_doe_resume.pdf",
      "original_name": "John Doe Resume.pdf",
      "file_size": 1024000,
      "content_extracted": true,
      "upload_date": "2024-12-30T10:15:30Z",
      "extracted_text_preview": "John Doe\\nSenior Software Developer\\n5+ years experience in Python, React...",
      "metadata": {
        "candidate_name": "John Doe",
        "position_applied": "Software Developer",
        "source": "website"
      },
      "processing_info": {
        "processing_time_ms": 1200,
        "text_extraction_method": "pdf_parser",
        "pages_processed": 2,
        "character_count": 2847
      }
    }
  }
}
```

**Error Response (400)**:

```json
{
  "success": false,
  "message": "Upload failed",
  "errors": [
    "No file provided",
    "File size exceeds 10MB limit",
    "Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files"
  ]
}
```

---

### 3. POST /api/resumes/upload-from-urls

**Purpose**: Download and process resumes from URLs

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "urls": [
    "https://example.com/resumes/john_doe.pdf",
    "https://linkedin.com/in/johndoe/resume",
    "https://dropbox.com/shared/resume.docx"
  ],
  "options": {
    "timeout_seconds": 30,
    "max_file_size_mb": 10,
    "allowed_domains": ["linkedin.com", "dropbox.com", "drive.google.com"],
    "follow_redirects": true,
    "user_agent": "ResumeMatcherBot/1.0"
  }
}
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "URL downloads completed",
  "data": {
    "uploaded_count": 2,
    "failed_count": 1,
    "resumes": [
      {
        "id": 124,
        "filename": "john_doe_resume.pdf",
        "original_name": "john_doe.pdf",
        "original_url": "https://example.com/resumes/john_doe.pdf",
        "file_size": 1024000,
        "content_extracted": true,
        "upload_date": "2024-12-30T10:15:30Z",
        "download_info": {
          "download_time_ms": 3400,
          "content_type": "application/pdf",
          "final_url": "https://example.com/resumes/john_doe.pdf",
          "redirects_followed": 0
        }
      },
      {
        "id": 125,
        "filename": "resume_linkedin.pdf",
        "original_name": "resume.pdf",
        "original_url": "https://linkedin.com/in/johndoe/resume",
        "file_size": 856000,
        "content_extracted": true,
        "upload_date": "2024-12-30T10:15:33Z",
        "download_info": {
          "download_time_ms": 5200,
          "content_type": "application/pdf",
          "final_url": "https://linkedin.com/dl/resume/johndoe.pdf",
          "redirects_followed": 2
        }
      }
    ],
    "failed_downloads": [
      {
        "url": "https://dropbox.com/shared/resume.docx",
        "error": "Download timeout after 30 seconds",
        "error_code": "TIMEOUT",
        "http_status": null,
        "retry_possible": true
      }
    ],
    "processing_stats": {
      "total_processing_time_ms": 8600,
      "successful_downloads": 2,
      "failed_downloads": 1,
      "total_downloaded_mb": 1.88
    }
  }
}
```

**Error Response (400)**:

```json
{
  "success": false,
  "message": "URL validation failed",
  "errors": [
    "No URLs provided",
    "Maximum 20 URLs allowed per request",
    "Invalid URL format: 'not-a-url'",
    "Blocked domain: 'malicious-site.com'"
  ]
}
```

**All Failed Response (422)**:

```json
{
  "success": false,
  "message": "All downloads failed",
  "data": {
    "uploaded_count": 0,
    "failed_count": 3,
    "failed_downloads": [
      {
        "url": "https://example.com/resume1.pdf",
        "error": "File not found",
        "error_code": "NOT_FOUND",
        "http_status": 404
      },
      {
        "url": "https://example.com/resume2.pdf",
        "error": "Access denied",
        "error_code": "FORBIDDEN",
        "http_status": 403
      },
      {
        "url": "https://example.com/resume3.pdf",
        "error": "Connection timeout",
        "error_code": "TIMEOUT"
      }
    ]
  }
}
```

---

## 🔧 Backend Implementation Guide

### Python Flask Example

```python
from flask import Flask, request, jsonify
import requests
import time
import os
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import uuid

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_FILES_PER_UPLOAD = 50
MAX_URLS_PER_REQUEST = 20

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_file(file_path, file_type):
    """Extract text from uploaded file"""
    try:
        if file_type == 'pdf':
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
        elif file_type in ['doc', 'docx']:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        elif file_type == 'txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
    except Exception as e:
        raise Exception(f"Text extraction failed: {str(e)}")

@app.route('/api/resumes/upload-multiple', methods=['POST'])
def upload_multiple_resumes():
    """Handle multiple file uploads"""
    try:
        if 'resumes' not in request.files:
            return jsonify({
                "success": False,
                "message": "Upload validation failed",
                "errors": ["No files provided"]
            }), 400

        files = request.files.getlist('resumes')

        if len(files) > MAX_FILES_PER_UPLOAD:
            return jsonify({
                "success": False,
                "message": "Upload validation failed",
                "errors": [f"Maximum {MAX_FILES_PER_UPLOAD} files allowed per upload"]
            }), 400

        uploaded_resumes = []
        failed_uploads = []
        start_time = time.time()

        for file in files:
            if file.filename == '':
                continue

            if not allowed_file(file.filename):
                failed_uploads.append({
                    "filename": file.filename,
                    "error": "Unsupported file format",
                    "error_code": "INVALID_FORMAT"
                })
                continue

            try:
                # Save file
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(file_path)

                # Get file info
                file_size = os.path.getsize(file_path)
                file_type = filename.rsplit('.', 1)[1].lower()

                # Extract text
                extracted_text = extract_text_from_file(file_path, file_type)

                resume_data = {
                    "id": int(time.time() * 1000000) + len(uploaded_resumes),
                    "filename": unique_filename,
                    "original_name": file.filename,
                    "file_size": file_size,
                    "content_extracted": True,
                    "upload_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                }

                uploaded_resumes.append(resume_data)

            except Exception as e:
                failed_uploads.append({
                    "filename": file.filename,
                    "error": str(e),
                    "error_code": "PROCESSING_FAILED"
                })

        processing_time = int((time.time() - start_time) * 1000)

        response_data = {
            "uploaded_count": len(uploaded_resumes),
            "failed_count": len(failed_uploads),
            "resumes": uploaded_resumes,
            "failed_uploads": failed_uploads,
            "processing_stats": {
                "total_processing_time_ms": processing_time,
                "average_file_size_mb": round(sum(r["file_size"] for r in uploaded_resumes) / len(uploaded_resumes) / 1024 / 1024, 2) if uploaded_resumes else 0,
                "extraction_success_rate": round((len(uploaded_resumes) / len(files)) * 100, 1) if files else 0
            }
        }

        if len(uploaded_resumes) == 0:
            return jsonify({
                "success": False,
                "message": "All uploads failed",
                "data": response_data
            }), 422
        elif len(failed_uploads) > 0:
            return jsonify({
                "success": True,
                "message": "Partial upload completed",
                "data": response_data
            }), 207
        else:
            return jsonify({
                "success": True,
                "message": "Resumes uploaded successfully",
                "data": response_data
            }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Server error",
            "errors": [str(e)]
        }), 500

@app.route('/api/resumes/upload-single', methods=['POST'])
def upload_single_resume():
    """Handle single file upload"""
    try:
        if 'resume' not in request.files:
            return jsonify({
                "success": False,
                "message": "Upload failed",
                "errors": ["No file provided"]
            }), 400

        file = request.files['resume']
        metadata = request.form.get('metadata', '{}')

        if file.filename == '':
            return jsonify({
                "success": False,
                "message": "Upload failed",
                "errors": ["No file selected"]
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "message": "Upload failed",
                "errors": ["Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files"]
            }), 400

        start_time = time.time()

        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)

        # Get file info
        file_size = os.path.getsize(file_path)
        file_type = filename.rsplit('.', 1)[1].lower()

        if file_size > MAX_FILE_SIZE:
            return jsonify({
                "success": False,
                "message": "Upload failed",
                "errors": ["File size exceeds 10MB limit"]
            }), 400

        # Extract text
        extracted_text = extract_text_from_file(file_path, file_type)
        processing_time = int((time.time() - start_time) * 1000)

        resume_data = {
            "id": int(time.time() * 1000000),
            "filename": unique_filename,
            "original_name": file.filename,
            "file_size": file_size,
            "content_extracted": True,
            "upload_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "extracted_text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text,
            "metadata": eval(metadata) if metadata != '{}' else {},
            "processing_info": {
                "processing_time_ms": processing_time,
                "text_extraction_method": f"{file_type}_parser",
                "pages_processed": extracted_text.count('\n') // 50 + 1,  # Rough estimate
                "character_count": len(extracted_text)
            }
        }

        return jsonify({
            "success": True,
            "message": "Resume uploaded successfully",
            "data": {
                "resume": resume_data
            }
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Upload failed",
            "errors": [str(e)]
        }), 500

@app.route('/api/resumes/upload-from-urls', methods=['POST'])
def upload_from_urls():
    """Handle URL downloads"""
    try:
        data = request.get_json()

        if not data or 'urls' not in data:
            return jsonify({
                "success": False,
                "message": "URL validation failed",
                "errors": ["No URLs provided"]
            }), 400

        urls = data['urls']
        options = data.get('options', {})

        if len(urls) > MAX_URLS_PER_REQUEST:
            return jsonify({
                "success": False,
                "message": "URL validation failed",
                "errors": [f"Maximum {MAX_URLS_PER_REQUEST} URLs allowed per request"]
            }), 400

        timeout = options.get('timeout_seconds', 30)
        max_size = options.get('max_file_size_mb', 10) * 1024 * 1024

        uploaded_resumes = []
        failed_downloads = []
        start_time = time.time()

        for url in urls:
            try:
                # Download file
                response = requests.get(url, timeout=timeout, stream=True)
                response.raise_for_status()

                # Check content type and size
                content_type = response.headers.get('content-type', '')
                content_length = int(response.headers.get('content-length', 0))

                if content_length > max_size:
                    failed_downloads.append({
                        "url": url,
                        "error": f"File size ({content_length} bytes) exceeds limit",
                        "error_code": "FILE_TOO_LARGE"
                    })
                    continue

                # Save downloaded file
                filename = url.split('/')[-1] or 'resume'
                if '.' not in filename:
                    filename += '.pdf'  # Default extension

                unique_filename = f"{uuid.uuid4()}_{secure_filename(filename)}"
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                file_size = os.path.getsize(file_path)
                file_type = filename.rsplit('.', 1)[1].lower()

                # Extract text
                extracted_text = extract_text_from_file(file_path, file_type)

                resume_data = {
                    "id": int(time.time() * 1000000) + len(uploaded_resumes),
                    "filename": unique_filename,
                    "original_name": filename,
                    "original_url": url,
                    "file_size": file_size,
                    "content_extracted": True,
                    "upload_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "download_info": {
                        "download_time_ms": int((time.time() - start_time) * 1000),
                        "content_type": content_type,
                        "final_url": response.url,
                        "redirects_followed": len(response.history)
                    }
                }

                uploaded_resumes.append(resume_data)

            except requests.exceptions.Timeout:
                failed_downloads.append({
                    "url": url,
                    "error": f"Download timeout after {timeout} seconds",
                    "error_code": "TIMEOUT",
                    "retry_possible": True
                })
            except requests.exceptions.RequestException as e:
                failed_downloads.append({
                    "url": url,
                    "error": str(e),
                    "error_code": "DOWNLOAD_FAILED"
                })
            except Exception as e:
                failed_downloads.append({
                    "url": url,
                    "error": str(e),
                    "error_code": "PROCESSING_FAILED"
                })

        processing_time = int((time.time() - start_time) * 1000)
        total_size_mb = sum(r["file_size"] for r in uploaded_resumes) / 1024 / 1024

        response_data = {
            "uploaded_count": len(uploaded_resumes),
            "failed_count": len(failed_downloads),
            "resumes": uploaded_resumes,
            "failed_downloads": failed_downloads,
            "processing_stats": {
                "total_processing_time_ms": processing_time,
                "successful_downloads": len(uploaded_resumes),
                "failed_downloads": len(failed_downloads),
                "total_downloaded_mb": round(total_size_mb, 2)
            }
        }

        if len(uploaded_resumes) == 0:
            return jsonify({
                "success": False,
                "message": "All downloads failed",
                "data": response_data
            }), 422
        else:
            return jsonify({
                "success": True,
                "message": "URL downloads completed",
                "data": response_data
            }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Server error",
            "errors": [str(e)]
        }), 500

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=8000)
```

---

## 📋 Frontend Integration

Update your API configuration to remove authentication:

```javascript
// Remove auth interceptor from apiClient
apiClient.interceptors.request.use(
  (config) => {
    // No authentication required - remove token header
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Usage Examples**:

```javascript
// Multiple upload
const files = document.getElementById("fileInput").files;
const response = await ApiService.uploadResumes(files);

// Single upload with metadata
const file = document.getElementById("singleFile").files[0];
const response = await ApiService.uploadSingleResume(file, {
  candidate_name: "John Doe",
  position_applied: "Software Developer",
});

// URL upload
const urls = [
  "https://example.com/resume1.pdf",
  "https://example.com/resume2.pdf",
];
const response = await ApiService.uploadFromUrls(urls);
```

---

This specification provides complete backend implementation for all three upload methods without authentication requirements.

# Job Description API Endpoints

Complete specification for job description processing endpoints supporting both text and file uploads.

## 📝 Job Description Endpoints

### 1. POST /jobs/upload-text

Process job description from plain text input.

**Request:** `application/json`

```json
{
  "job_description": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS...",
  "title": "Senior Software Developer" // Optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job description processed successfully",
  "data": {
    "job_id": 123456789,
    "title": "Senior Software Developer",
    "description": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS...",
    "extracted_text": "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS...",
    "key_skills": ["Python", "React", "AWS", "Docker", "REST APIs"],
    "experience_level": "Senior",
    "job_category": "Software Development",
    "created_at": "2024-01-01T00:00:00Z",
    "processing_time_ms": 850
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid job description",
  "errors": [
    "Job description cannot be empty",
    "Job description must be at least 50 characters long"
  ]
}
```

---

### 2. POST /jobs/upload-file

Process job description from uploaded document file.

**Request:** `multipart/form-data`

- `job_file`: File (PDF, DOC, DOCX, TXT)
- `title`: string (optional)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job description file processed successfully",
  "data": {
    "job_id": 123456790,
    "title": "Senior Software Developer",
    "original_filename": "job_description.pdf",
    "file_size": 245760,
    "extracted_text": "Senior Software Developer Position\n\nWe are looking for an experienced software developer with expertise in modern web technologies...",
    "key_skills": ["Python", "React", "AWS", "Docker", "REST APIs", "Git"],
    "experience_level": "Senior",
    "job_category": "Software Development",
    "content_extracted": true,
    "created_at": "2024-01-01T00:00:00Z",
    "processing_time_ms": 1840
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "File processing failed",
  "errors": [
    "Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files",
    "File size exceeds maximum limit of 10MB"
  ]
}
```

**Error Response (422):**

```json
{
  "success": false,
  "message": "Content extraction failed",
  "errors": [
    "Could not extract text from the uploaded file",
    "File appears to be corrupted or password protected"
  ]
}
```

---

### 3. POST /jobs/process

Unified endpoint that handles both text and file uploads.

**Request Option 1:** Text input (`application/json`)

```json
{
  "job_description": "We are looking for a senior software developer...",
  "title": "Senior Software Developer"
}
```

**Request Option 2:** File upload (`multipart/form-data`)

- `job_file`: File (PDF, DOC, DOCX, TXT)
- `title`: string (optional)

**Success Response (200):**
Same as individual endpoints above, format depends on input type.

---

### 4. POST /jobs

Save processed job description to database.

**Request:** `application/json`

```json
{
  "title": "Senior Software Developer",
  "description": "We are looking for a senior software developer...",
  "key_skills": ["Python", "React", "AWS"],
  "experience_level": "Senior",
  "job_category": "Software Development"
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
    "key_skills": ["Python", "React", "AWS"],
    "experience_level": "Senior",
    "job_category": "Software Development",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 5. GET /jobs

Retrieve all saved job descriptions.

**Query Parameters:**

- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `category`: string (optional filter)

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
        "key_skills": ["Python", "React", "AWS"],
        "experience_level": "Senior",
        "job_category": "Software Development",
        "created_at": "2024-01-01T00:00:00Z",
        "last_used": "2024-01-02T10:30:00Z",
        "match_count": 15
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

---

## 🔧 Frontend Integration Examples

### Text Input Processing

```javascript
// Process job description from text
const processJobText = async (jobDescription, title = null) => {
  try {
    const response = await ApiService.uploadJobDescriptionText(
      jobDescription,
      title
    );

    if (response.success) {
      console.log("Job processed:", response.data);
      console.log("Extracted skills:", response.data.key_skills);
      console.log("Experience level:", response.data.experience_level);
      return response.data;
    }
  } catch (error) {
    console.error("Text processing failed:", error);
    throw error;
  }
};

// Usage
const jobText = `
We are seeking a Senior Full Stack Developer with:
- 5+ years of experience in Python and React
- Strong knowledge of AWS cloud services
- Experience with Docker and containerization
- REST API development experience
`;

const result = await processJobText(jobText, "Senior Full Stack Developer");
```

### File Upload Processing

```javascript
// Process job description from file
const processJobFile = async (file, title = null) => {
  try {
    const response = await ApiService.uploadJobDescriptionFile(file, title);

    if (response.success) {
      console.log("File processed:", response.data);
      console.log(
        "Extracted text length:",
        response.data.extracted_text.length
      );
      console.log("Original filename:", response.data.original_filename);
      return response.data;
    }
  } catch (error) {
    console.error("File processing failed:", error);
    throw error;
  }
};

// Usage with file input
document
  .getElementById("jobFileInput")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await processJobFile(file, "Senior Developer Position");
    }
  });
```

### Unified Processing (Handles Both)

```javascript
// Universal job description processor
const processJobDescription = async (data) => {
  try {
    const response = await ApiService.processJobDescription(data);

    if (response.success) {
      console.log("Job processed successfully:", response.data);

      // Extract and display key information
      const { job_id, title, key_skills, experience_level, job_category } =
        response.data;

      console.log(`Job ID: ${job_id}`);
      console.log(`Title: ${title}`);
      console.log(`Skills Required: ${key_skills.join(", ")}`);
      console.log(`Experience Level: ${experience_level}`);
      console.log(`Category: ${job_category}`);

      return response.data;
    }
  } catch (error) {
    console.error("Processing failed:", error);
    throw error;
  }
};

// Usage examples
// For text input
await processJobDescription({
  job_description: "Looking for a Python developer...",
  title: "Python Developer",
});

// For file upload
const fileInput = document.getElementById("jobFile");
await processJobDescription({
  file: fileInput.files[0],
  title: "Senior Position",
});
```

### Complete Workflow Integration

```javascript
// Complete job processing and matching workflow
class JobProcessingWorkflow {
  async processAndMatch(jobData, resumeIds = null) {
    try {
      // Step 1: Process job description
      console.log("Processing job description...");
      const jobResult = await ApiService.processJobDescription(jobData);

      if (!jobResult.success) {
        throw new Error("Job processing failed");
      }

      console.log(`✅ Job processed: ${jobResult.data.title}`);
      console.log(`📋 Skills found: ${jobResult.data.key_skills.join(", ")}`);

      // Step 2: Save job description
      const savedJob = await ApiService.createJob(
        jobResult.data.title,
        jobResult.data.extracted_text
      );

      console.log(`💾 Job saved with ID: ${savedJob.data.id}`);

      // Step 3: Match against resumes
      console.log("Matching resumes...");
      const matchResult = await ApiService.matchResumes(
        jobResult.data.extracted_text,
        resumeIds
      );

      if (matchResult.success) {
        console.log(
          `🎯 Found ${matchResult.data.matched_resumes.length} matches`
        );

        // Return complete results
        return {
          job: jobResult.data,
          saved_job_id: savedJob.data.id,
          matches: matchResult.data.matched_resumes,
          stats: matchResult.data.matching_stats,
        };
      }
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }
  }
}

// Usage
const workflow = new JobProcessingWorkflow();

// Process text and match
const textResult = await workflow.processAndMatch({
  job_description: "We need a React developer...",
  title: "React Developer",
});

// Process file and match
const fileInput = document.getElementById("jobFile");
const fileResult = await workflow.processAndMatch({
  file: fileInput.files[0],
  title: "Senior Position",
});
```

---

## 📋 Validation Rules

### Text Input Validation

- **Minimum length**: 50 characters
- **Maximum length**: 10,000 characters
- **Required fields**: job_description
- **Optional fields**: title

### File Upload Validation

- **Supported formats**: PDF, DOC, DOCX, TXT
- **Maximum file size**: 10MB
- **Required fields**: job_file
- **Optional fields**: title

### Content Extraction

- **Text extraction**: Automatic for all supported formats
- **Skill detection**: AI-powered skill extraction
- **Experience level**: Automatic classification (Junior/Mid/Senior/Lead)
- **Job category**: Automatic categorization

---

## 🚨 Error Handling

### Common Error Scenarios

1. **Empty job description**

   ```json
   {
     "success": false,
     "message": "Validation failed",
     "errors": ["Job description cannot be empty"]
   }
   ```

2. **Unsupported file format**

   ```json
   {
     "success": false,
     "message": "Invalid file format",
     "errors": ["Only PDF, DOC, DOCX, and TXT files are supported"]
   }
   ```

3. **File too large**

   ```json
   {
     "success": false,
     "message": "File size exceeded",
     "errors": ["Maximum file size is 10MB"]
   }
   ```

4. **Content extraction failed**
   ```json
   {
     "success": false,
     "message": "Processing failed",
     "errors": ["Could not extract readable text from the file"]
   }
   ```

---

## 🎯 Backend Implementation Tips

1. **File Processing**: Use libraries like PyPDF2, python-docx, or similar for text extraction
2. **Skill Extraction**: Implement NLP-based skill detection using spaCy or similar
3. **Experience Classification**: Use keyword matching and ML models for experience level detection
4. **Job Categorization**: Implement classification based on skills and job description content
5. **Async Processing**: For large files, consider implementing async processing with job queues

---

_This specification is designed for seamless backend integration with the Resume Matcher frontend application._

# Resume API Usage Examples

This file provides practical examples of how to use the Resume Matcher API endpoints.

## Quick Start Examples

### 1. Upload Multiple Resumes

```javascript
// Frontend example using fetch
const uploadResumes = async (files) => {
  const formData = new FormData();

  // Add multiple files to form data
  Array.from(files).forEach((file) => {
    formData.append("resumes", file);
  });

  try {
    const response = await fetch("/api/resumes/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log(
        `${result.data.uploaded_count} resumes uploaded successfully`
      );
      result.data.resumes.forEach((resume) => {
        console.log(`- ${resume.original_name} (${resume.file_size} bytes)`);
      });
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

// Using with file input
document.getElementById("resumeInput").addEventListener("change", (e) => {
  const files = e.target.files;
  uploadResumes(files);
});
```

### 2. Get All Resumes with Pagination

```javascript
const getResumes = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`/api/resumes?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("Resumes:", result.data.resumes);
      console.log("Pagination:", result.data.pagination);

      // Display pagination info
      const { current_page, total_pages, total_items } = result.data.pagination;
      console.log(
        `Page ${current_page} of ${total_pages} (${total_items} total)`
      );
    }
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
  }
};

// Load first page
getResumes(1, 20);
```

### 3. Match Resumes Against Job Description

```javascript
const matchResumes = async (jobDescription, specificResumeIds = null) => {
  const payload = {
    job_description: jobDescription,
  };

  // Optionally match only specific resumes
  if (specificResumeIds && specificResumeIds.length > 0) {
    payload.resume_ids = specificResumeIds;
  }

  try {
    const response = await fetch("/api/resumes/match", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Job Analysis:", result.data.job_analysis);
      console.log("Matching Stats:", result.data.matching_stats);

      // Sort by match score (descending)
      const sortedMatches = result.data.matched_resumes.sort(
        (a, b) => b.match_score - a.match_score
      );

      console.log("Top Matches:");
      sortedMatches.slice(0, 5).forEach((resume, index) => {
        console.log(
          `${index + 1}. ${resume.original_name} - ${resume.match_score}%`
        );
        console.log(`   Skills: ${resume.matching_skills.join(", ")}`);
        console.log(`   Experience: ${resume.experience_match}`);
      });
    }
  } catch (error) {
    console.error("Matching failed:", error);
  }
};

// Example usage
const jobDesc = `
We are seeking a Senior Full Stack Developer with:
- 5+ years of experience in Python and React
- Strong knowledge of AWS cloud services
- Experience with Docker and containerization
- REST API development experience
- Bachelor's degree in Computer Science or related field
`;

matchResumes(jobDesc);
```

### 4. Create and Save Job Description

```javascript
const createJob = async (title, description) => {
  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Job created:", result.data);
      return result.data.id;
    }
  } catch (error) {
    console.error("Failed to create job:", error);
  }
};

// Save a job posting
const jobId = await createJob(
  "Senior React Developer",
  "We are looking for an experienced React developer to join our team..."
);
```

### 5. Get All Saved Jobs

```javascript
const getJobs = async () => {
  try {
    const response = await fetch("/api/jobs", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("Saved jobs:", result.data.jobs);

      result.data.jobs.forEach((job) => {
        console.log(`- ${job.title} (Created: ${job.created_at})`);
        if (job.last_used) {
          console.log(`  Last used: ${job.last_used}`);
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  }
};

// Load all saved jobs
getJobs();
```

## 🔨 Advanced Usage Examples

### Complete Recruitment Workflow

```javascript
class RecruitmentWorkflow {
  constructor(authToken) {
    this.authToken = authToken;
    this.baseUrl = "/api";
  }

  // Upload and process multiple resumes
  async uploadAndProcessResumes(files) {
    console.log(`Starting upload of ${files.length} resumes...`);

    const uploadResult = await this.uploadResumes(files);
    if (!uploadResult.success) {
      throw new Error("Upload failed");
    }

    console.log(`✅ ${uploadResult.data.uploaded_count} resumes uploaded`);
    return uploadResult.data.resumes;
  }

  // Create job and match resumes
  async findBestCandidates(jobTitle, jobDescription, topN = 10) {
    // Save the job description
    const jobResult = await this.createJob(jobTitle, jobDescription);
    console.log(`✅ Job "${jobTitle}" saved with ID: ${jobResult.data.id}`);

    // Match against all resumes
    const matchResult = await this.matchResumes(jobDescription);
    console.log(
      `✅ Analyzed ${matchResult.data.matching_stats.total_resumes_analyzed} resumes`
    );

    // Return top candidates
    const topCandidates = matchResult.data.matched_resumes
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, topN);

    console.log(`🎯 Top ${topN} candidates found:`);
    topCandidates.forEach((candidate, index) => {
      console.log(
        `${index + 1}. ${candidate.original_name} (${candidate.match_score}%)`
      );
    });

    return {
      job_id: jobResult.data.id,
      candidates: topCandidates,
      stats: matchResult.data.matching_stats,
    };
  }

  // Filter candidates by criteria
  async filterCandidates(jobDescription, filters = {}) {
    const matchResult = await this.matchResumes(jobDescription);
    let candidates = matchResult.data.matched_resumes;

    // Apply filters
    if (filters.minScore) {
      candidates = candidates.filter((c) => c.match_score >= filters.minScore);
    }

    if (filters.requiredSkills) {
      candidates = candidates.filter((c) =>
        filters.requiredSkills.every((skill) =>
          c.matching_skills.includes(skill)
        )
      );
    }

    if (filters.experienceLevel) {
      candidates = candidates.filter((c) =>
        c.experience_match
          .toLowerCase()
          .includes(filters.experienceLevel.toLowerCase())
      );
    }

    return candidates.sort((a, b) => b.match_score - a.match_score);
  }

  // Helper methods
  async uploadResumes(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("resumes", file));

    const response = await fetch(`${this.baseUrl}/resumes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.authToken}` },
      body: formData,
    });

    return await response.json();
  }

  async matchResumes(jobDescription, resumeIds = null) {
    const payload = { job_description: jobDescription };
    if (resumeIds) payload.resume_ids = resumeIds;

    const response = await fetch(`${this.baseUrl}/resumes/match`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async createJob(title, description) {
    const response = await fetch(`${this.baseUrl}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    return await response.json();
  }
}

// Usage example
const workflow = new RecruitmentWorkflow("your-auth-token");

// Complete recruitment process
async function recruitForPosition() {
  try {
    // 1. Upload resumes (from file input)
    const fileInput = document.getElementById("resumeFiles");
    await workflow.uploadAndProcessResumes(fileInput.files);

    // 2. Define job requirements
    const jobTitle = "Senior Full Stack Developer";
    const jobDescription = `
      We are seeking a Senior Full Stack Developer with:
      - 5+ years of experience in Python and React
      - Strong knowledge of AWS cloud services
      - Experience with Docker and containerization
      - REST API development experience
    `;

    // 3. Find and filter candidates
    const result = await workflow.findBestCandidates(
      jobTitle,
      jobDescription,
      10
    );

    // 4. Apply additional filters
    const filteredCandidates = await workflow.filterCandidates(jobDescription, {
      minScore: 70,
      requiredSkills: ["Python", "React"],
      experienceLevel: "Senior",
    });

    console.log(`🎯 Final shortlist: ${filteredCandidates.length} candidates`);

    return {
      job_id: result.job_id,
      shortlisted_candidates: filteredCandidates,
      total_stats: result.stats,
    };
  } catch (error) {
    console.error("Recruitment process failed:", error);
  }
}

// Run the recruitment process
recruitForPosition();
```

## 🎯 Error Handling Best Practices

```javascript
const handleApiErrors = async (apiCall) => {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Handle validation errors
        console.error("Validation errors:", errorData.errors);
        errorData.errors.forEach((error) => {
          console.error(`- ${error}`);
        });
      } else {
        // Handle general errors
        console.error("API Error:", errorData.message);
      }

      throw new Error(errorData.message || "API request failed");
    }

    return await response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("Network error: Please check your connection");
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};

// Usage with error handling
const safeUpload = async (files) => {
  return handleApiErrors(async () => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("resumes", file));

    return fetch("/api/resumes/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });
  });
};
```

## 📱 Frontend Integration Tips

1. **File Validation**: Always validate files on the frontend before upload
2. **Progress Tracking**: Show upload progress for large files
3. **Error Display**: Present errors in user-friendly format
4. **Caching**: Cache job descriptions and resumes for better UX
5. **Pagination**: Implement proper pagination for large datasets
6. **Loading States**: Show loading indicators during API calls

---

_These examples work with the Resume Matcher API v1.0_

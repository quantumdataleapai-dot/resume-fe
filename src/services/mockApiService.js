// Mock API Service - Development Only
// Set USE_MOCK_DATA to false when backend is ready
import {
  mockResumes,
  mockMatchedResumes,
  mockJobAnalysis,
  mockUploadResponse,
  mockUrlUploadResponse,
  simulateApiDelay,
} from "../utils/mockData";

// Force disable mock mode to use real API
const USE_MOCK_DATA = false;

console.log("Mock API Service loaded. USE_MOCK_DATA:", USE_MOCK_DATA);
console.log(
  "Environment REACT_APP_USE_MOCK_DATA:",
  process.env.REACT_APP_USE_MOCK_DATA
);

class MockApiService {
  async uploadResumes(files) {
    await simulateApiDelay(1500);
    console.log("Mock: Uploading files:", files.length);

    // Add uploaded files to mock data
    const newResumes = Array.from(files).map((file, index) => ({
      id: `mock_${Date.now()}_${index}`,
      filename: file.name,
      upload_status: "success",
      parsed_data: {
        name: `Candidate ${Date.now()}`,
        email: `candidate${index}@email.com`,
        skills: ["JavaScript", "React", "CSS"],
      },
    }));

    return {
      ...mockUploadResponse,
      data: {
        ...mockUploadResponse.data,
        uploaded_count: files.length,
        resumes: newResumes,
      },
    };
  }

  async getResumes(page = 1, limit = 10) {
    await simulateApiDelay(800);
    console.log("Mock: Getting resumes, page:", page, "limit:", limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResumes = mockResumes.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        resumes: paginatedResumes,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(mockResumes.length / limit),
          total_items: mockResumes.length,
          items_per_page: limit,
        },
      },
    };
  }

  async matchResumes(jobDescription, resumeIds = null) {
    await simulateApiDelay(2000);
    console.log(
      "Mock: Matching resumes for job:",
      jobDescription.substring(0, 50) + "..."
    );

    let resumesToMatch = mockMatchedResumes;
    if (resumeIds && resumeIds.length > 0) {
      resumesToMatch = mockMatchedResumes.filter((resume) =>
        resumeIds.includes(resume.id)
      );
    }

    return {
      success: true,
      message: "Resume matching completed",
      data: {
        job_analysis: mockJobAnalysis,
        matched_resumes: resumesToMatch,
        total_matched: resumesToMatch.length,
        average_score:
          resumesToMatch.reduce((sum, r) => sum + r.match_score, 0) /
          resumesToMatch.length,
      },
    };
  }

  // New unified method: Process Job Description and match resumes in one call
  async processJobAndMatch(jobData, resumeIds = null) {
    await simulateApiDelay(2500);

    if (jobData.file) {
      console.log("Mock: Processing job file and matching:", jobData.file.name);
    } else {
      console.log(
        "Mock: Processing job text and matching:",
        jobData.job_description?.substring(0, 50) + "..."
      );
    }

    let resumesToMatch = mockMatchedResumes;
    if (resumeIds && resumeIds.length > 0) {
      resumesToMatch = mockMatchedResumes.filter((resume) =>
        resumeIds.includes(resume.id)
      );
    }

    return {
      success: true,
      message: "Job description processed and resumes matched successfully",
      data: {
        job_analysis: {
          ...mockJobAnalysis,
          title: jobData.title || mockJobAnalysis.title,
          processed_from: jobData.file ? "file" : "text",
        },
        matched_resumes: resumesToMatch,
        total_matched: resumesToMatch.length,
        average_score:
          resumesToMatch.reduce((sum, r) => sum + r.match_score, 0) /
          resumesToMatch.length,
      },
    };
  }

  async uploadFromUrls(urls, options = {}) {
    await simulateApiDelay(2500);
    console.log("Mock: Uploading from URLs:", urls);

    return {
      ...mockUrlUploadResponse,
      data: {
        ...mockUrlUploadResponse.data,
        processed_count: urls.length,
        successful_uploads: urls.map((url, index) => ({
          url,
          id: `url_resume_${Date.now()}_${index}`,
          filename: `resume_from_url_${index}.pdf`,
          parsed_data: {
            name: `URL Candidate ${index + 1}`,
            email: `urlcandidate${index}@email.com`,
            skills: ["Python", "React", "SQL"],
          },
        })),
      },
    };
  }

  async processJobDescription(data) {
    await simulateApiDelay(1000);
    console.log("Mock: Processing job description");

    return {
      success: true,
      message: "Job description processed successfully",
      data: {
        id: `job_${Date.now()}`,
        title: data.title || "Software Developer",
        processed_description: data.job_description || "Sample job description",
        extracted_requirements: {
          required_skills: ["Python", "React", "SQL"],
          preferred_skills: ["AWS", "Docker"],
          experience_years: 3,
          education: "Bachelor's degree",
        },
        job_category: "Software Development",
        seniority_level: "Mid-level",
      },
    };
  }

  async downloadResume(resumeId, format = "pdf") {
    await simulateApiDelay(500);
    console.log("Mock: Downloading resume:", resumeId);

    // Return mock file data
    return {
      success: true,
      message: "File ready for download",
      url: `mock://resume_${resumeId}.${format}`,
    };
  }

  async downloadAllResumes(resumeIds = null, format = "zip") {
    await simulateApiDelay(1000);
    console.log("Mock: Downloading all resumes:", resumeIds || "all");

    // Create a simple alert since we can't actually download files in mock mode
    alert(
      "MOCK API: In a real implementation, this would download a ZIP file with all selected resumes. IDs: " +
        (resumeIds ? resumeIds.join(", ") : "all resumes")
    );

    // Return mock response
    return {
      success: true,
      message: "All resumes would be downloaded as ZIP in real implementation",
      mockDetails: {
        resumeIds: resumeIds || "all resumes",
        format: format,
      },
    };
  }

  async getJobs() {
    await simulateApiDelay(600);
    console.log("Mock: Getting jobs");

    return {
      success: true,
      data: {
        jobs: [
          {
            id: "job_1",
            title: "Senior Python Developer",
            created_date: "2025-07-01T10:00:00Z",
            processed: true,
            requirements_summary: {
              required_skills: ["Python", "Django"],
              experience_years: 5,
            },
          },
          {
            id: "job_2",
            title: "React Frontend Developer",
            created_date: "2025-07-01T11:00:00Z",
            processed: true,
            requirements_summary: {
              required_skills: ["React", "JavaScript"],
              experience_years: 3,
            },
          },
        ],
        total_count: 2,
      },
    };
  }

  // Authentication methods (dummy)
  async login(credentials) {
    await simulateApiDelay(800);
    console.log("Mock: Login attempt for:", credentials.email);
    return { success: true, message: "Mock login successful" };
  }

  async register(userData) {
    await simulateApiDelay(1000);
    console.log("Mock: Registration attempt for:", userData.email);
    return { success: true, message: "Mock registration successful" };
  }
}

const mockApiServiceInstance = new MockApiService();

export { USE_MOCK_DATA };
export default mockApiServiceInstance;

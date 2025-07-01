// API Service for Frontend-to-Python Backend Communication
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import { mockApiResponses } from "../utils/mockData";

// Create axios instance for Python backend
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple request interceptor (no authentication)
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Making API call to: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API response received:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`API error:`, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Simulate API delay for mock calls
const simulateApiDelay = (ms = API_CONFIG.MOCK_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Simplified API Service Class
class ApiService {
  // Authentication (dummy - frontend only)
  async login(credentials) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      if (
        credentials.email === "demo@recruiter.com" &&
        credentials.password === "demo123"
      ) {
        const mockResponse = {
          success: true,
          data: {
            user: { id: 1, email: credentials.email, name: "Demo Recruiter" },
            token: "mock-jwt-token-12345",
          },
        };
        localStorage.setItem("authToken", mockResponse.data.token);
        return mockResponse;
      } else {
        throw new Error("Invalid credentials");
      }
    }
    // No real backend auth - using dummy system
    return { success: true, message: "Using dummy authentication" };
  }

  async register(userData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      const mockResponse = {
        success: true,
        data: {
          user: { id: 2, email: userData.email, name: userData.fullName },
          token: "mock-jwt-token-67890",
        },
      };
      localStorage.setItem("authToken", mockResponse.data.token);
      return mockResponse;
    }
    // No real backend auth - using dummy system
    return { success: true, message: "Using dummy authentication" };
  }

  // Resume APIs
  async uploadResumes(files) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return mockApiResponses.uploadResumes;
    } else {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.UPLOAD_MULTIPLE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    }
  }

  async uploadSingleResume(file, metadata = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(1200);
      const mockResume = {
        id: Date.now(),
        filename: file.name.replace(/\s+/g, "_").toLowerCase(),
        original_name: file.name,
        file_size: file.size,
        content_extracted: true,
        upload_date: new Date().toISOString(),
      };
      return {
        success: true,
        message: "Resume uploaded successfully",
        data: { resume: mockResume },
      };
    } else {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.UPLOAD_SINGLE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    }
  }

  async uploadFromUrls(urls, options = {}) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(3000); // URL downloads take longer

      const mockUploadedResumes = await Promise.all(
        urls.map(async (url, index) => {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;

          const candidateNames = [
            "John Smith",
            "Sarah Johnson",
            "Michael Brown",
            "Emma Davis",
            "David Wilson",
            "Lisa Anderson",
            "James Taylor",
            "Jennifer Martinez",
          ];

          const candidateName = candidateNames[index % candidateNames.length];
          const filename = urlObj.pathname.split("/").pop() || "resume";
          const fileExtensions = [".pdf", ".doc", ".docx", ".txt"];
          const fileExt = fileExtensions[index % fileExtensions.length];

          return {
            id: Date.now() + index,
            filename: `${candidateName
              .toLowerCase()
              .replace(" ", "_")}_resume${fileExt}`,
            original_name: `${candidateName}_resume${fileExt}`,
            original_url: url,
            file_size: Math.floor(Math.random() * 500000) + 100000,
            content_extracted: true,
            upload_date: new Date().toISOString(),
            download_info: {
              download_time_ms: Math.floor(Math.random() * 3000) + 1000,
              content_type: `application/${fileExt.slice(1)}`,
              final_url: url,
              redirects_followed: Math.floor(Math.random() * 3),
            },
          };
        })
      );

      return {
        success: true,
        message: "URL downloads completed",
        data: {
          uploaded_count: urls.length,
          failed_count: 0,
          resumes: mockUploadedResumes,
          failed_downloads: [],
          processing_stats: {
            total_processing_time_ms: 8600,
            successful_downloads: urls.length,
            failed_downloads: 0,
            total_downloaded_mb: 1.88,
          },
        },
      };
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.UPLOAD_FROM_URLS,
        {
          urls,
          options: {
            timeout_seconds: 30,
            max_file_size_mb: 10,
            follow_redirects: true,
            ...options,
          },
        }
      );
      return response.data;
    }
  }

  async getResumes(page = 1, limit = 10) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(500);
      // Return mock response matching GET /resumes specification
      return mockApiResponses.getResumes;
    } else {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESUMES.LIST, {
        params: { page, limit },
      });
      return response.data;
    }
  }

  async matchResumes(jobDescription, resumeIds = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(2000);
      // Return mock response matching POST /resumes/match specification
      return mockApiResponses.matchResumes;
    } else {
      const payload = {
        job_description: jobDescription,
      };

      if (resumeIds && resumeIds.length > 0) {
        payload.resume_ids = resumeIds;
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.MATCH,
        payload
      );
      return response.data;
    }
  }

  async downloadResume(resumeId, format = "pdf") {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(1000);
      // Generate mock download URL
      return {
        success: true,
        download_url: `mock-download-url-${resumeId}.${format}`,
        filename: `resume_${resumeId}.${format}`,
      };
    } else {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.RESUMES.DOWNLOAD.replace("{id}", resumeId),
        { params: { format } }
      );
      return response.data;
    }
  }

  // Job APIs
  async createJob(title, description) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return {
        success: true,
        message: "Job description saved successfully",
        data: {
          id: Date.now(),
          title: title,
          description: description,
          created_at: new Date().toISOString(),
        },
      };
    } else {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.JOBS.CREATE, {
        title: title,
        description: description,
      });
      return response.data;
    }
  }

  async getJobs() {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return {
        success: true,
        data: {
          jobs: [
            {
              id: 1,
              title: "Senior Software Developer",
              description:
                "We are looking for a senior software developer with 5+ years of experience in Python, React, and AWS...",
              created_at: "2024-01-01T00:00:00Z",
              last_used: "2024-01-02T10:30:00Z",
            },
            {
              id: 2,
              title: "Full Stack Engineer",
              description:
                "Join our team as a Full Stack Engineer working with modern technologies...",
              created_at: "2024-01-15T00:00:00Z",
              last_used: "2024-01-16T14:20:00Z",
            },
          ],
        },
      };
    } else {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.JOBS.LIST);
      return response.data;
    }
  }

  // Job Description APIs
  async processJobText(jobDescription, title = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return {
        success: true,
        message: "Job description processed successfully",
        data: {
          job_id: Date.now(),
          title: title || "Untitled Job",
          extracted_text: jobDescription,
          key_skills: ["Python", "React", "AWS", "Docker", "REST APIs"],
          experience_level: "Senior",
          job_category: "Software Development",
          created_at: new Date().toISOString(),
        },
      };
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.JOBS.PROCESS_TEXT,
        {
          job_description: jobDescription,
          title: title,
        }
      );
      return response.data;
    }
  }

  async processJobFile(file, title = null) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(2000);
      return {
        success: true,
        message: "Job description file processed successfully",
        data: {
          job_id: Date.now(),
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          original_filename: file.name,
          file_size: file.size,
          extracted_text:
            "Senior Software Developer Position\n\nWe are looking for an experienced software developer...",
          key_skills: ["Python", "React", "AWS", "Docker", "REST APIs"],
          experience_level: "Senior",
          job_category: "Software Development",
          content_extracted: true,
          created_at: new Date().toISOString(),
        },
      };
    } else {
      const formData = new FormData();
      formData.append("file", file);
      if (title) {
        formData.append("title", title);
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.JOBS.PROCESS_FILE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    }
  }

  // Process job description (unified method)
  async processJobDescription(data) {
    if (data.file) {
      return this.processJobFile(data.file, data.title);
    } else if (data.job_description) {
      return this.processJobText(data.job_description, data.title);
    } else {
      throw new Error("Either job_description text or file must be provided");
    }
  }

  // Legacy method for backward compatibility
  async uploadJobDescription(jobData) {
    return this.processJobDescription(jobData);
  }
}

const apiService = new ApiService();
export default apiService;

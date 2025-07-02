// API Service for Frontend-to-Python Backend Communication
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import mockApiService, { USE_MOCK_DATA } from "./mockApiService";

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

// API Service Class
class ApiService {
  // Authentication (dummy - frontend only)
  async login(credentials) {
    // No real backend auth - using dummy system
    return { success: true, message: "Using dummy authentication" };
  }

  async register(userData) {
    // No real backend auth - using dummy system
    return { success: true, message: "Using dummy authentication" };
  }

  // Resume APIs
  async uploadResumes(files) {
    if (USE_MOCK_DATA) {
      return mockApiService.uploadResumes(files);
    }

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

  async uploadSingleResume(file, metadata = null) {
    if (USE_MOCK_DATA) {
      return mockApiService.uploadResumes([file]);
    }

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

  async uploadFromUrls(urls, options = {}) {
    if (USE_MOCK_DATA) {
      return mockApiService.uploadFromUrls(urls, options);
    }

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

  async getResumes(page = 1, limit = 10) {
    console.log("ApiService.getResumes called. USE_MOCK_DATA:", USE_MOCK_DATA);
    if (USE_MOCK_DATA) {
      console.log("Using mock data for getResumes");
      return mockApiService.getResumes(page, limit);
    }

    console.log("Using real API for getResumes");
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESUMES.LIST, {
      params: { page, limit },
    });
    return response.data;
  }

  async matchResumes(jobDescription, resumeIds = null) {
    if (USE_MOCK_DATA) {
      return mockApiService.matchResumes(jobDescription, resumeIds);
    }

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

  // New unified method: Process Job Description (text or file) and match resumes
  async processJobAndMatch(jobData, resumeIds = null) {
    if (USE_MOCK_DATA) {
      return mockApiService.processJobAndMatch(jobData, resumeIds);
    }

    let formData;
    let endpoint;

    if (jobData.file) {
      // Handle file-based job description
      formData = new FormData();
      formData.append("file", jobData.file);
      if (jobData.title) {
        formData.append("title", jobData.title);
      }
      if (resumeIds && resumeIds.length > 0) {
        formData.append("resume_ids", JSON.stringify(resumeIds));
      }
      endpoint = API_CONFIG.ENDPOINTS.JOBS.PROCESS_FILE_AND_MATCH;
    } else {
      // Handle text-based job description
      const payload = {
        job_description: jobData.job_description,
      };
      if (jobData.title) {
        payload.title = jobData.title;
      }
      if (resumeIds && resumeIds.length > 0) {
        payload.resume_ids = resumeIds;
      }
      endpoint = API_CONFIG.ENDPOINTS.JOBS.PROCESS_TEXT_AND_MATCH;
      formData = payload;
    }

    const response = await apiClient.post(
      endpoint,
      formData,
      jobData.file ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return response.data;
  }

  async downloadResume(resumeId, format = "pdf") {
    if (USE_MOCK_DATA) {
      return mockApiService.downloadResume(resumeId, format);
    }

    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.RESUMES.DOWNLOAD.replace("{id}", resumeId),
      { params: { format } }
    );
    return response.data;
  }

  // Job APIs
  async getJobs() {
    if (USE_MOCK_DATA) {
      return mockApiService.getJobs();
    }

    const response = await apiClient.get(API_CONFIG.ENDPOINTS.JOBS.LIST);
    return response.data;
  }

  // Job Description APIs
  async processJobText(jobDescription, title = null) {
    if (USE_MOCK_DATA) {
      return mockApiService.processJobDescription({
        job_description: jobDescription,
        title,
      });
    }

    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.JOBS.PROCESS_TEXT,
      {
        job_description: jobDescription,
        title: title,
      }
    );
    return response.data;
  }

  async processJobFile(file, title = null) {
    if (USE_MOCK_DATA) {
      return mockApiService.processJobDescription({ file, title });
    }

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

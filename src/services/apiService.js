// API Service for Frontend-to-Python Backend Communication
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import mockApiService, { USE_MOCK_DATA } from "./mockApiService";

// Create axios instance for Python backend
console.log("ENV API URL:", process.env.REACT_APP_API_URL);
console.log("API_CONFIG BASE_URL:", API_CONFIG.BASE_URL);
console.log("Initializing API client with BASE_URL:", API_CONFIG.BASE_URL);

// Force axios to use the hardcoded URL
const apiClient = axios.create({
  baseURL: "http://192.168.1.36:8000/api", // Explicitly set to avoid any confusion
  timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: false,
});

// Simple request interceptor (no authentication)
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `Making API call to: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    console.log("Full URL:", `${config.baseURL}${config.url}`);
    console.log("API Config BASE_URL:", API_CONFIG.BASE_URL);
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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API error response:`, {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`API error (no response):`, error.request);
      console.error(
        `API connection error. Please check if the backend server is running at ${API_CONFIG.BASE_URL}`
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`API error (setup):`, error.message);
    }
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
      API_CONFIG.ENDPOINTS.RESUMES.UPLOAD,
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

    // Use the same endpoint as uploadResumes, just with a single file
    const formData = new FormData();
    formData.append("files", file); // Using the same key name 'files' for consistency
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.RESUMES.UPLOAD,
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

    try {
      let formData;
      let endpoint;
      console.log("Processing job and matching with resumeIds:", resumeIds);

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

        console.log(`Making API call to ${endpoint} with file upload`);
        const response = await apiClient.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Process job and match response:", response.data);
        return response.data;
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

        console.log(`Making API call to ${endpoint} with text data:`, payload);
        const response = await apiClient.post(endpoint, payload);
        console.log("Process job and match response:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error processing job and matching resumes:", error);
      return {
        success: false,
        message: "Failed to process job description and match resumes",
        error: error.message,
      };
    }
  }

  async downloadResume(resumeId, format = "pdf") {
    if (USE_MOCK_DATA) {
      return mockApiService.downloadResume(resumeId, format);
    }

    try {
      // Using response type blob to handle binary file data
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.RESUMES.DOWNLOAD.replace("{id}", resumeId),
        {
          params: { format },
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${resumeId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true, message: "Resume downloaded successfully" };
    } catch (error) {
      console.error("Error downloading resume:", error);
      return { success: false, error: error.message };
    }
  }

  async downloadAllResumes(resumeIds = null, format = "zip") {
    if (USE_MOCK_DATA) {
      return mockApiService.downloadAllResumes(resumeIds, format);
    }

    try {
      // Create request payload
      const payload = resumeIds ? { resume_ids: resumeIds } : {};

      // Make API call with blob response type for binary data
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.DOWNLOAD_ALL,
        payload,
        {
          params: { format },
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a download link for the ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `all_resumes.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true, message: "All resumes downloaded successfully" };
    } catch (error) {
      console.error("Error downloading all resumes:", error);
      return { success: false, error: error.message };
    }
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

// API Service Layer
// This service layer handles both mock and real API calls based on configuration

import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import { mockApiResponses } from "../utils/mockData";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Simulate API delay for mock calls
const simulateApiDelay = (ms = API_CONFIG.MOCK_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// API Service class
class ApiService {
  // Authentication APIs
  async login(credentials) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      // Mock login logic (existing)
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
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      return response.data;
    }
  }

  async register(userData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      // Mock registration logic
      const mockResponse = {
        success: true,
        data: {
          user: { id: 2, email: userData.email, name: userData.fullName },
          token: "mock-jwt-token-67890",
        },
      };
      localStorage.setItem("authToken", mockResponse.data.token);
      return mockResponse;
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.data.token);
      }
      return response.data;
    }
  }

  // Resume APIs
  async uploadResumes(files) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      // Use existing mock logic
      const mockUploadedResumes = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        description: `Professional resume uploaded: ${file.name}`,
        avatar: file.name.charAt(0).toUpperCase(),
        uploadDate: new Date().toISOString(),
        source: "file",
        fileSize: `${Math.round(file.size / 1024)}KB`,
      }));

      return {
        success: true,
        data: {
          uploaded_count: files.length,
          resumes: mockUploadedResumes,
        },
      };
    } else {
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
  }

  async uploadFromUrls(urls, options = {}) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      // Use existing mock logic from Dashboard
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
            name: `${candidateName}_${filename}${fileExt}`,
            description: `Professional ${
              Math.random() > 0.5 ? "Software Engineer" : "Data Scientist"
            } with ${
              Math.floor(Math.random() * 8) + 2
            } years of experience. Downloaded from ${domain}.`,
            avatar: candidateName.charAt(0).toUpperCase(),
            uploadDate: new Date().toISOString(),
            source: "url",
            originalUrl: url,
            fileSize: `${Math.floor(Math.random() * 500) + 100}KB`,
            status: "success",
          };
        })
      );

      return {
        success: true,
        data: {
          uploaded_count: urls.length,
          failed_count: 0,
          resumes: mockUploadedResumes,
          failed_downloads: [],
        },
      };
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.UPLOAD_FROM_URLS,
        {
          urls,
          options: {
            ...API_CONFIG.REQUEST_CONFIG,
            ...options,
          },
        }
      );
      return response.data;
    }
  }

  async getResumes() {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(500);
      // Return stored resumes from localStorage or empty array
      const storedResumes = JSON.parse(
        localStorage.getItem("uploadedResumes") || "[]"
      );
      return {
        success: true,
        data: { resumes: storedResumes },
      };
    } else {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESUMES.LIST);
      return response.data;
    }
  }

  async matchResumes(jobDescription, options = {}) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay(2000);
      // Use existing mock response
      return mockApiResponses.matchResumes;
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.RESUMES.MATCH,
        {
          job_description: jobDescription,
          ...options,
        }
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
  async uploadJobDescription(jobData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      await simulateApiDelay();
      return {
        success: true,
        data: {
          job_id: Date.now(),
          extracted_text: jobData.job_description || "[File content extracted]",
          key_skills: ["Python", "React", "AWS", "Docker"],
          created_at: new Date().toISOString(),
        },
      };
    } else {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.JOBS.UPLOAD,
        jobData
      );
      return response.data;
    }
  }
}

const apiService = new ApiService();
export default apiService;

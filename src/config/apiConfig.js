// API Configuration
// This file controls whether to use mock data or real API calls

const API_CONFIG = {
  // Set to false for production with real backend
  USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === "true",

  // API Base URLs
  BASE_URL: process.env.REACT_APP_API_URL || "https://your-api-domain.com/api",
  MOCK_DELAY: parseInt(process.env.REACT_APP_MOCK_API_DELAY) || 1500, // Simulate API delay in milliseconds

  // Feature flags
  FEATURES: {
    ENABLE_URL_UPLOAD: process.env.REACT_APP_ENABLE_URL_UPLOAD === "true",
    ENABLE_BULK_DOWNLOAD: process.env.REACT_APP_ENABLE_BULK_DOWNLOAD === "true",
    ENABLE_ZIP_DOWNLOAD: process.env.REACT_APP_ENABLE_ZIP_DOWNLOAD === "true",
    ENABLE_AI_CHAT: process.env.REACT_APP_ENABLE_AI_CHAT === "true",
  },

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
    },
    RESUMES: {
      UPLOAD: "/resumes/upload",
      UPLOAD_FROM_URLS: "/resumes/upload-from-urls",
      LIST: "/resumes",
      DOWNLOAD: "/resumes/{id}/download",
      DELETE: "/resumes/{id}",
      MATCH: "/resumes/match",
    },
    JOBS: {
      UPLOAD: "/jobs/upload",
      LIST: "/jobs",
    },
  },

  // Request configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000,
    MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760, // 10MB default
    ALLOWED_FILE_TYPES: (
      process.env.REACT_APP_ALLOWED_FILE_TYPES || "pdf,doc,docx,txt"
    ).split(","),
  },
};

export default API_CONFIG;

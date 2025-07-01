// API Configuration for Frontend-to-Python Backend Communication
const API_CONFIG = {
  // Set to false when connecting to Python backend
  USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === "true",

  // Python backend URL
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  MOCK_DELAY: parseInt(process.env.REACT_APP_MOCK_API_DELAY) || 1500,

  // Clean API Endpoints for Python Backend
  ENDPOINTS: {
    // Resume endpoints
    RESUMES: {
      UPLOAD_MULTIPLE: "/resumes/upload",
      UPLOAD_SINGLE: "/resumes/upload-single",
      UPLOAD_FROM_URLS: "/resumes/upload-urls",
      LIST: "/resumes",
      MATCH: "/resumes/match",
      DOWNLOAD: "/resumes/{id}/download",
    },

    // Job description endpoints
    JOBS: {
      PROCESS_TEXT: "/jobs/process-text",
      PROCESS_FILE: "/jobs/process-file",
      LIST: "/jobs",
    },
  },

  // Request configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000,
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_FILE_TYPES: ["pdf", "doc", "docx", "txt"],
  },
};

export default API_CONFIG;

// API Configuration for Frontend-to-Python Backend Communication
const API_CONFIG = {
  // Python backend URL
  BASE_URL: process.env.REACT_APP_API_URL || "http://192.168.1.36:8000/api",

  // Clean API Endpoints for Python Backend
  ENDPOINTS: {
    // Resume endpoints
    RESUMES: {
      UPLOAD: "/resumes/upload", // Combined endpoint for both single and multiple uploads
      UPLOAD_FROM_URLS: "/resumes/upload-urls",
      LIST: "/resumes",
      MATCH: "/resumes/match",
      DOWNLOAD: "/resumes/{id}/download",
      DOWNLOAD_ALL: "/resumes/download-all",
    },

    // Job description endpoints
    JOBS: {
      PROCESS_TEXT: "/jobs/process-text",
      PROCESS_FILE: "/jobs/process-file",
      PROCESS_TEXT_AND_MATCH: "/jobs/process-text-and-match",
      PROCESS_FILE_AND_MATCH: "/jobs/process-file-and-match",
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

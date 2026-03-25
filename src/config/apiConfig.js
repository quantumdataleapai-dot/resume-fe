// API Configuration for Frontend-to-Python Backend Communication
const API_CONFIG = {
  // Python backend URL
  BASE_URL: "http://10.30.0.104:8010/api", // Force to use the new URL

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
      DELETE: "/resumes/{id}/delete",
      DOWNLOAD_FROM_CEIPAL: "/resumes/download-from-db",
      UPLOAD_FROM_CACHE: "/resumes/upload-from-cache",
      LOCK: "/resumes/{id}/lock",
    },

    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      SIGNUP: "/auth/signup",
      REGISTER: "/auth/signup",
      FORGOT_PASSWORD: "/auth/forgot-password",
      VERIFY_OTP: "/auth/verify-otp",
      RESET_PASSWORD: "/auth/reset-password",
    },

    // Admin endpoints
    ADMIN: {
      USERS: "/admin/users",
      CREATE_USER: "/admin/users",
      PENDING_USERS: "/admin/users/pending",
      APPROVE_USER: "/admin/users/{id}/approve",
      REJECT_USER: "/admin/users/{id}/reject",
      DEACTIVATE_USER: "/admin/users/{id}/deactivate",
      ACTIVATE_USER: "/admin/users/{id}/activate",
      PATCH_USER_ROLE: "/admin/users/{id}/role",
      DELETE_USER: "/admin/users/{id}",
      STATS: "/admin/stats",
      LOCKS: "/admin/locks",
      FORCE_UNLOCK: "/admin/locks/{resume_id}",
      UNLOCK_ALL_USER: "/admin/locks/user/{user_id}",
      ACTIVITY: "/admin/activity",
      DOWNLOADS: "/admin/downloads",
      DOWNLOADS_USER: "/admin/downloads/user/{user_id}",
    },

    // Connector endpoints
    CONNECTORS: {
      SUPPORTED_TYPES: "/connectors/supported-types",
      DISCOVER: "/connectors/discover",
      AUTO_MAP: "/connectors/auto-map",
      QUICK_SETUP: "/connectors/quick-setup",
      CREATE: "/connectors",
      LIST: "/connectors",
      TEST: "/connectors/{id}/test",
      SYNC: "/connectors/{id}/sync",
      SYNC_STATUS: "/connectors/{id}/sync/status",
      DELETE: "/connectors/{id}",
      REDISCOVER: "/connectors/{id}/discover",
      REMAP: "/connectors/{id}/remap",
    },

    // User endpoints
    USER: {
      DASHBOARD: "/user/dashboard",
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
    TIMEOUT: 5 * 60 * 1000,
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_FILE_TYPES: ["pdf", "doc", "docx", "txt"],
  },
};

export default API_CONFIG;

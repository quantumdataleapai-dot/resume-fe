// API Service for Frontend-to-Python Backend Communication
import axios from "axios";
import API_CONFIG from "../config/apiConfig";
import mockApiService, { USE_MOCK_DATA } from "./mockApiService";

// Force axios to use the hardcoded URL
const apiClient = axios.create({
  baseURL: "https://app.abhinay.online/api", // Explicitly set to avoid any confusion
  timeout: API_CONFIG.REQUEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: false,
});

// Request interceptor - attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
  // Authentication
  async login(credentials) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || "Invalid email or password",
        };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async register(userData) {
    return this.signup(userData);
  }

  async signup(userData) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
        userData
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || "Registration failed",
        };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Forgot Password Flow
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.detail || error.response.data.message || "Failed to send OTP",
          status: error.response.status,
        };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async verifyOtp(email, otp) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
        { email, otp }
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.detail || error.response.data.message || "OTP verification failed",
          status: error.response.status,
        };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { email, otp, new_password: newPassword }
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.detail || error.response.data.message || "Password reset failed",
          status: error.response.status,
        };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Admin - Activity
  async getAdminActivity({ action, user_id, days, page, limit } = {}) {
    try {
      const params = {};
      if (action) params.action = action;
      if (user_id) params.user_id = user_id;
      if (days) params.days = days;
      if (page) params.page = page;
      if (limit) params.limit = limit;
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.ACTIVITY, { params });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch activity" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Admin - Downloads
  async getAdminDownloads(days = 30) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.DOWNLOADS, { params: { days } });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch downloads" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async getAdminDownloadsUser(userId, { page, limit } = {}) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.DOWNLOADS_USER.replace("{user_id}", userId);
      const params = {};
      if (page) params.page = page;
      if (limit) params.limit = limit;
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch user downloads" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Admin - Locks
  async getAdminLocks() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.LOCKS);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch locks" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async forceUnlock(resumeId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.FORCE_UNLOCK.replace("{resume_id}", resumeId);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to unlock resume" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async unlockAllByUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.UNLOCK_ALL_USER.replace("{user_id}", userId);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to unlock user's resumes" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // ─── Connectors ───

  async getSupportedConnectorTypes() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CONNECTORS.SUPPORTED_TYPES);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Failed to fetch supported types" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async connectorQuickSetup(payload) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONNECTORS.QUICK_SETUP, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Quick setup failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async getConnectors() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CONNECTORS.LIST);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Failed to fetch connectors" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async testConnector(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONNECTORS.TEST.replace("{id}", id);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Connection test failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async syncConnector(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONNECTORS.SYNC.replace("{id}", id);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Sync failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async getSyncStatus(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONNECTORS.SYNC_STATUS.replace("{id}", id);
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.message || "Failed to get sync status" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async discoverSchema(payload) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONNECTORS.DISCOVER, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.detail || error.response.data.message || "Schema discovery failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async autoMapFields(payload) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONNECTORS.AUTO_MAP, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.detail || error.response.data.message || "Auto-map failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async createConnector(payload) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONNECTORS.CREATE, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.detail || error.response.data.message || "Failed to create connector" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async remapConnector(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONNECTORS.REMAP.replace("{id}", id);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.detail || error.response.data.message || "Re-map failed" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async deleteConnector(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONNECTORS.DELETE.replace("{id}", id);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) return { success: false, message: error.response.data.detail || error.response.data.message || "Failed to delete connector" };
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // User Dashboard
  async getUserDashboard() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER.DASHBOARD);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch dashboard" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Admin - Users
  async getUsers() {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ADMIN.USERS
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch users" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async createUser(userData) {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ADMIN.CREATE_USER,
        userData
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to create user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  // Admin - Pending Users
  async getPendingUsers() {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ADMIN.PENDING_USERS
      );
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch pending users" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async approveUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.APPROVE_USER.replace("{id}", userId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to approve user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async rejectUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.REJECT_USER.replace("{id}", userId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to reject user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async deactivateUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.DEACTIVATE_USER.replace("{id}", userId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to deactivate user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async activateUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.ACTIVATE_USER.replace("{id}", userId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to activate user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async patchUserRole(userId, role) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.PATCH_USER_ROLE.replace("{id}", userId);
      const response = await apiClient.patch(endpoint, { role });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to update user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async getAdminStats() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.STATS);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to fetch stats" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async deleteUser(userId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.ADMIN.DELETE_USER.replace("{id}", userId);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to delete user" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
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
    if (USE_MOCK_DATA) {
      return mockApiService.getResumes(page, limit);
    }

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

      if (jobData.file) {
        // Handle file-based job description
        formData = new FormData();
        formData.append("file", jobData.file);
        formData.append("title", jobData.title || "");
        formData.append("resume_ids", JSON.stringify(resumeIds || []));
        formData.append("visa_type", jobData.visa_type || "");
        formData.append("location", jobData.location || "");
        endpoint = API_CONFIG.ENDPOINTS.JOBS.PROCESS_FILE_AND_MATCH;

        const response = await apiClient.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
      } else {
        // Handle text-based job description
        const payload = {
          job_description: jobData.job_description,
          title: "",
          resume_ids: resumeIds || [],
          visa_type: jobData.visa_type || "",
          location: jobData.location || "",
        };
        endpoint = API_CONFIG.ENDPOINTS.JOBS.PROCESS_TEXT_AND_MATCH;

        const response = await apiClient.post(endpoint, payload);
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

  // Resume Lock/Unlock
  async lockResume(resumeId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.RESUMES.LOCK.replace("{id}", resumeId);
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to lock resume" };
      }
      return { success: false, message: "Unable to connect to server" };
    }
  }

  async unlockResume(resumeId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.RESUMES.LOCK.replace("{id}", resumeId);
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return { success: false, message: error.response.data.message || "Failed to unlock resume" };
      }
      return { success: false, message: "Unable to connect to server" };
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

  async deleteResume(resumeId) {
    if (USE_MOCK_DATA) {
      return mockApiService.deleteResume(resumeId);
    }

    const endpoint = API_CONFIG.ENDPOINTS.RESUMES.DELETE.replace(
      "{id}",
      resumeId
    );
    const response = await apiClient.delete(endpoint);
    return response.data;
  }

  async downloadFromCeipal() {
    try {
      const response = await apiClient.post("/resumes/download-from-db");
      return {
        success: true,
        data: response.data,
        message: "Resumes from Ceipal downloaded successfully",
      };
    } catch (error) {
      console.error("Error downloading resumes from Ceipal:", error);
      return { success: false, error: error.message };
    }
  }

  async uploadFromCeipalCache() {
    try {
      const response = await apiClient.post("/resumes/upload-from-cache");
      return {
        success: true,
        data: response.data,
        message: "Resumes uploaded from Ceipal cache successfully",
      };
    } catch (error) {
      console.error("Error uploading resumes from Ceipal cache:", error);
      return { success: false, error: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;

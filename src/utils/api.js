import apiClient from "./apiClient";

export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", {
        full_name: userData.fullName,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Token refresh failed" };
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server, we'll clear local storage
      console.error("Logout error:", error);
    }
  },
};

export const resumeAPI = {
  // Upload resumes
  uploadResumes: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("resumes", file);
      });

      const response = await apiClient.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Resume upload failed" };
    }
  },

  // Match resumes against job description
  matchResumes: async (jobDescription, resumeIds = []) => {
    try {
      const response = await apiClient.post("/resumes/match", {
        job_description: jobDescription,
        resume_ids: resumeIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Resume matching failed" };
    }
  },

  // Get user's resumes
  getResumes: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/resumes?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch resumes" };
    }
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    try {
      const response = await apiClient.delete(`/resumes/${resumeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete resume" };
    }
  },
};

export const jobAPI = {
  // Save job description
  saveJobDescription: async (jobDescription, title = "") => {
    try {
      const response = await apiClient.post("/jobs", {
        title,
        description: jobDescription,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to save job description" }
      );
    }
  },

  // Get saved job descriptions
  getJobDescriptions: async () => {
    try {
      const response = await apiClient.get("/jobs");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch job descriptions" }
      );
    }
  },
};

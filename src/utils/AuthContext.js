import React, { createContext, useContext, useState, useEffect } from "react";
import ApiService from "../services/apiService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Use ApiService for authentication
      const response = await ApiService.login({ email, password });

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setIsAuthenticated(true);
        setUser(user);
        return { success: true };
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const signup = async (userData) => {
    try {
      // Use ApiService for registration
      const response = await ApiService.register(userData);

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setIsAuthenticated(true);
        setUser(user);
        return { success: true };
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      // API logout call could be added here if needed
      // await ApiService.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

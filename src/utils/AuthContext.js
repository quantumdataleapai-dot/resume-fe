import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "./api";

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
      // For demo purposes, keep the demo login
      if (email === "demo@fisecglobal.net" && password === "password") {
        const userData = {
          id: 1,
          name: "Demo User",
          email: email,
        };

        localStorage.setItem("token", "demo-token");
        localStorage.setItem("user", JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      }

      // Real API integration (uncomment when backend is ready)
      /*
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setIsAuthenticated(true);
        setUser(user);
        return { success: true };
      }
      */

      // If not demo credentials and no API, show error
      throw new Error("Invalid credentials");
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const signup = async (userData) => {
    try {
      // Demo signup (for development)
      const newUser = {
        id: Date.now(),
        name: userData.fullName,
        email: userData.email,
      };

      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify(newUser));

      setIsAuthenticated(true);
      setUser(newUser);
      return { success: true };

      // Real API integration (uncomment when backend is ready)
      /*
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setIsAuthenticated(true);
        setUser(user);
        return { success: true };
      }
      */
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      // Call API to logout (uncomment when backend is ready)
      // await authAPI.logout();
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

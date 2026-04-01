import { createContext, useContext, useState, useEffect } from "react";
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

  const login = async (email, password, selectedRole = "admin") => {
    try {
      const response = await ApiService.login({ email, password });

      // API returns: { access_token, token_type, role }
      if (response.access_token) {
        // Use the role from API response, fallback to selectedRole
        const role = response.role === "admin" ? "admin" : "recruiter";
        const loggedInUser = {
          name: email.split("@")[0],
          email,
          role,
        };

        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setIsAuthenticated(true);
        setUser(loggedInUser);

        return { success: true };
      }

      // Handle pending approval
      if (response.pending_approval) {
        return {
          success: false,
          error: "Your account is pending approval from the Admin. Please try again later.",
        };
      }

      return {
        success: false,
        error: response.message || "Invalid email or password",
      };
    } catch (error) {
      return { success: false, error: error.message || "Something went wrong" };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await ApiService.signup({
        email: userData.email,
        password: userData.password,
      });

      if (response.success) {
        return {
          success: true,
          message:
            response.message ||
            "Sign-up successful! Your account is pending Admin approval. You will be able to login once approved.",
        };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      // API logout call could be added here if needed
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === "admin";

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

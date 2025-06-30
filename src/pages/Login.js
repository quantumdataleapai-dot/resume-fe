import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import SignupModal from "../components/SignupModal";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <i className="fas fa-file-alt"></i>
            <span>Resume</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your resume matching dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="demo@fisecglobal.net"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert("Forgot password functionality would be implemented here")
              }
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="signup-link">
            Don't have an account?
            <button
              type="button"
              className="signup-btn"
              onClick={() => setShowSignup(true)}
            >
              Sign up
            </button>
          </div>

          <div className="demo-credentials">
            <small>Demo: email: demo@fisecglobal.net, password: password</small>
          </div>
        </form>
      </div>

      {showSignup && (
        <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
      )}
    </div>
  );
};

export default Login;

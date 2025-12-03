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
      {/* Left side: Branding and Features */}
      <div className="login-features">
        <div className="features-content">
          <div className="features-header">
            <div className="logo">
              <i className="fas fa-file-alt"></i>
              <span>ResumeMatch</span>
            </div>
            <h1>
              AI-Powered<br />
              <span>Resume Analysis</span>
            </h1>
          </div>
          <p className="features-subtitle">
            Upload resumes, match against job descriptions, and let AI help you find the perfect candidates faster than ever.
          </p>
          <div className="features-list">
            <div className="feature-item">
              <i className="fas fa-bolt"></i>
              <span>Instant resume scoring & ranking</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-brain"></i>
              <span>AI-powered skill matching</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-boxes"></i>
              <span>Bulk resume processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
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

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button type="button" className="google-btn">
            <i className="fab fa-google"></i>
            Continue with Google
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

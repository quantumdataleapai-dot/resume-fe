import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import "../styles/Modal.css";

const SignupModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await signup(formData);

    if (result.success) {
      // Show success message and close modal
      alert("Account created successfully! Please log in with your credentials.");
      onClose();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div className="login-header" style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f1724", marginBottom: "8px" }}>
            Create Account
          </h2>
          <p style={{ fontSize: "13px", color: "#60708a", marginBottom: "0" }}>
            Join us to start matching resumes efficiently
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ marginBottom: "16px" }}>{error}</div>}

          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              style={{
                width: "100%",
                padding: "12px",
                height: "48px",
                border: "1px solid #e6eefc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
                color: "#0f1724",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              style={{
                width: "100%",
                padding: "12px",
                height: "48px",
                border: "1px solid #e6eefc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
                color: "#0f1724",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px", position: "relative" }}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={{
                width: "100%",
                padding: "12px",
                height: "48px",
                border: "1px solid #e6eefc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
                color: "#0f1724",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              style={{
                width: "100%",
                padding: "12px",
                height: "48px",
                border: "1px solid #e6eefc",
                borderRadius: "8px",
                fontSize: "15px",
                background: "#fff",
                color: "#0f1724",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{
              width: "100%",
              height: "48px",
              padding: "12px",
              background: loading ? "#5b8dff" : "linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;

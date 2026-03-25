import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import apiService from "../services/apiService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Flow state: 1 = email, 2 = OTP, 3 = new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sendCooldown, setSendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);

  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);
  const expiryRef = useRef(null);

  // Cooldown timer for Send OTP / Resend OTP button
  const startCooldown = useCallback(() => {
    setSendCooldown(60);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setSendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // OTP expiry countdown (10 minutes)
  const startExpiryTimer = useCallback(() => {
    setOtpExpiry(600);
    clearInterval(expiryRef.current);
    expiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(expiryRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(cooldownRef.current);
      clearInterval(expiryRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Step 1: Send OTP ───
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    const result = await apiService.forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      startCooldown();
      startExpiryTimer();
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      if (result.status === 404) {
        setErrorMessage("No account found with this email.");
      } else if (result.status === 403) {
        setErrorMessage("Your account is deactivated. Please contact admin.");
      } else if (result.status === 500) {
        setErrorMessage("Unable to send OTP. Please try again later.");
      } else {
        setErrorMessage(result.message || "Something went wrong. Please try again.");
      }
    }
  };

  // ─── Step 2: Verify OTP ───
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setErrorMessage("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (value && index === 5 && updated.every((d) => d !== "")) {
      handleVerifyOtp(updated);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtp(updated);

    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(updated);
    }
  };

  const handleVerifyOtp = async (otpDigits) => {
    const code = (otpDigits || otp).join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    const result = await apiService.verifyOtp(email, code);
    setIsLoading(false);

    if (result.success) {
      setStep(3);
      setErrorMessage("");
    } else {
      const msg = result.message || "";
      if (msg.includes("expired")) {
        setErrorMessage("Code expired. Please resend.");
        clearInterval(expiryRef.current);
        setOtpExpiry(0);
      } else if (msg.includes("No OTP requested")) {
        setErrorMessage("Session expired. Please request a new code.");
        setTimeout(() => { setStep(1); setOtp(["", "", "", "", "", ""]); }, 2000);
      } else {
        setErrorMessage("Incorrect code. Please try again.");
        // Shake + clear
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleResendOtp = () => {
    if (sendCooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
    handleSendOtp();
  };

  // ─── Step 3: Reset Password ───
  const passwordValid = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!passwordValid) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const code = otp.join("");
    const result = await apiService.resetPassword(email, code, newPassword);
    setIsLoading(false);

    if (result.success) {
      navigate("/login", {
        state: { toast: "Password reset successfully! Please login." },
      });
    } else {
      const msg = result.message || "";
      if (msg.includes("not verified")) {
        setStep(2);
        setErrorMessage("Please verify your OTP first.");
      } else if (msg.includes("expired") || msg.includes("No OTP session") || msg.includes("Invalid OTP") || msg.includes("not found")) {
        setErrorMessage("Session expired. Please try again.");
        setTimeout(() => {
          setStep(1);
          setOtp(["", "", "", "", "", ""]);
          setNewPassword("");
          setConfirmPassword("");
        }, 2000);
      } else {
        setErrorMessage(msg || "Password reset failed. Please try again.");
      }
    }
  };

  // ─── Styles ───
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafb",
    padding: "24px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    padding: "40px 36px",
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f1724",
    marginBottom: "8px",
    textAlign: "center",
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#60708a",
    marginBottom: "28px",
    textAlign: "center",
    lineHeight: 1.6,
  };

  const inputStyle = {
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
  };

  const primaryBtnStyle = {
    width: "100%",
    height: "48px",
    padding: "12px",
    background: "linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const disabledBtnStyle = {
    ...primaryBtnStyle,
    background: "#5b8dff",
    cursor: "not-allowed",
    opacity: 0.7,
  };

  const linkStyle = {
    background: "none",
    border: "none",
    color: "#0b5fff",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
  };

  const errorStyle = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#dc2626",
    fontSize: "13px",
  };

  // ─── Step indicators ───
  const renderSteps = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 600,
              background: step >= s ? "linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)" : "#e6eefc",
              color: step >= s ? "#fff" : "#60708a",
              transition: "all 0.3s ease",
            }}
          >
            {step > s ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              style={{
                width: 32,
                height: 2,
                background: step > s ? "#0b5fff" : "#e6eefc",
                borderRadius: "1px",
                transition: "background 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .otp-input:focus {
          border-color: #0b5fff !important;
          box-shadow: 0 0 0 3px rgba(11,95,255,0.12) !important;
        }
      `}</style>

      <div style={cardStyle}>
        {renderSteps()}

        {/* ─── Screen 1: Enter Email ─── */}
        {step === 1 && (
          <>
            <h2 style={titleStyle}>Forgot Password</h2>
            <p style={subtitleStyle}>
              Enter your registered email to receive a reset code
            </p>

            {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                placeholder="Email address"
                disabled={isLoading}
                style={{ ...inputStyle, opacity: isLoading ? 0.6 : 1 }}
                autoFocus
              />

              <button
                type="submit"
                disabled={isLoading || sendCooldown > 0}
                style={isLoading || sendCooldown > 0 ? disabledBtnStyle : primaryBtnStyle}
              >
                {isLoading
                  ? "SENDING..."
                  : sendCooldown > 0
                  ? `RESEND IN ${sendCooldown}s`
                  : "SEND OTP"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={() => navigate("/login")} style={linkStyle}>
                Back to Login
              </button>
            </div>
          </>
        )}

        {/* ─── Screen 2: Enter OTP ─── */}
        {step === 2 && (
          <>
            <h2 style={titleStyle}>Verify Code</h2>
            <p style={subtitleStyle}>
              Enter the 6-digit code sent to<br />
              <strong style={{ color: "#0f1724" }}>{email}</strong>
            </p>

            {otpExpiry > 0 && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: otpExpiry < 60 ? "#dc2626" : "#60708a",
                  fontWeight: 500,
                }}
              >
                Code expires in {formatTime(otpExpiry)}
              </div>
            )}

            {otpExpiry === 0 && step === 2 && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#dc2626",
                  fontWeight: 500,
                }}
              >
                Code expired.{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={sendCooldown > 0}
                  style={{ ...linkStyle, color: sendCooldown > 0 ? "#9aa6bd" : "#0b5fff" }}
                >
                  Resend?
                </button>
              </div>
            )}

            {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={isLoading}
                  style={{
                    width: "48px",
                    height: "56px",
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    border: "2px solid #e6eefc",
                    borderRadius: "10px",
                    outline: "none",
                    color: "#0f1724",
                    transition: "all 0.2s ease",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otp.some((d) => d === "")}
              style={
                isLoading || otp.some((d) => d === "")
                  ? disabledBtnStyle
                  : primaryBtnStyle
              }
            >
              {isLoading ? "VERIFYING..." : "VERIFY OTP"}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleResendOtp}
                disabled={sendCooldown > 0}
                style={{
                  ...linkStyle,
                  color: sendCooldown > 0 ? "#9aa6bd" : "#0b5fff",
                  cursor: sendCooldown > 0 ? "not-allowed" : "pointer",
                }}
              >
                {sendCooldown > 0 ? `Resend in ${sendCooldown}s` : "Resend OTP"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setOtp(["", "", "", "", "", ""]);
                  setErrorMessage("");
                }}
                style={linkStyle}
              >
                Change email
              </button>
            </div>
          </>
        )}

        {/* ─── Screen 3: New Password ─── */}
        {step === 3 && (
          <>
            <h2 style={titleStyle}>Reset Password</h2>
            <p style={subtitleStyle}>Create a new password for your account</p>

            {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* New Password */}
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(""); }}
                  placeholder="New Password"
                  disabled={isLoading}
                  style={{ ...inputStyle, paddingRight: "48px", opacity: isLoading ? 0.6 : 1 }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#60708a",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showNewPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(""); }}
                  placeholder="Confirm Password"
                  disabled={isLoading}
                  style={{ ...inputStyle, paddingRight: "48px", opacity: isLoading ? 0.6 : 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#60708a",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>

              {/* Validation checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: passwordValid ? "#16a34a" : "#9aa6bd" }}>
                  <span>{passwordValid ? "✓" : "✗"}</span>
                  <span>Minimum 6 characters</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: passwordsMatch ? "#16a34a" : "#9aa6bd" }}>
                  <span>{passwordsMatch ? "✓" : "✗"}</span>
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordValid || !passwordsMatch}
                style={
                  isLoading || !passwordValid || !passwordsMatch
                    ? disabledBtnStyle
                    : primaryBtnStyle
                }
              >
                {isLoading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={() => navigate("/login")} style={linkStyle}>
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScores, setShowScores] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    // Navigate directly to dashboard without delay
    navigate("/dashboard");
  };

  // Sign-up helpers
  const GOOGLE_FORM_URL = "https://forms.gle/YOUR_GOOGLE_FORM_LINK"; // replace with your Google Form URL

  const openSignup = () => {
    // clear any previous values and open modal
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setShowSignupModal(true);
  };

  const closeSignup = () => {
    // clear values when closing as well
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setShowSignupModal(false);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      alert("Please fill in all sign-up fields.");
      return;
    }

    // Simulate sign-up — replace with API call / OAuth flow in production
    alert("Sign-up successful (simulated). Redirecting to dashboard...");
    setShowSignupModal(false);
    navigate("/dashboard");
  };

  const openExternal = (url) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      // fallback
      window.location.href = url;
    }
  };

  const handleOAuthPlaceholder = (provider) => {
    // These are placeholders — real OAuth requires client_id, redirect_uri and server-side handling.
    const origin = window?.location?.origin || "";
    const redirect = `${origin}/auth/callback`;
    let url = "#";
    switch (provider) {
      case "google":
        url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=profile%20email`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirect)}&scope=r_liteprofile%20r_emailaddress`;
        break;
      case "office365":
        url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=openid%20profile%20email`;
        break;
      case "azure":
        url = `https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(redirect)}`;
        break;
      default:
        url = "#";
    }

    alert(`${provider} sign-up will open in a new tab. Replace the placeholder client IDs with your app credentials.`);
    openExternal(url);
  };

  const robotStyle = {
    animation: "float 3s ease-in-out infinite",
  };

  const getScoreCardAnimation = (delay) => {
    return `slideIn 0.6s ease-out ${delay}s forwards, float 3s ease-in-out ${delay}s infinite`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", backgroundColor: "#fff" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(-70%); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scan {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        
        @keyframes paperMove {
          0% { transform: translate(0px, 0px) rotate(-2deg); }
          50% { transform: translate(-8px, -6px) rotate(2deg); }
          100% { transform: translate(0px, 0px) rotate(-2deg); }
        }

        @keyframes scanline {
          0% { transform: translateX(-120%); opacity: 0.6; }
          50% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(120%); opacity: 0.6; }
        }
        /* Modal styles for Sign Up */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 36, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-card {
          width: 420px;
          max-width: calc(100% - 32px);
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(2,6,23,0.12);
          padding: 20px;
          border: 1px solid #e6eefc;
        }
        .modal-actions { display:flex; gap:8px; margin-top:12px; }
        .modal-social { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px }
        .btn-ghost { background:#fff; border:1px solid #e6eefc; padding:10px; border-radius:8px; cursor:pointer }
      `}</style>

      {/* Left Panel - Features */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px", backgroundColor: "#f8fafb", overflow: "hidden" }}>
        <div style={{ maxWidth: "500px", textAlign: "center", zIndex: 10 }}>
          {/* <h1 style={{ fontSize: "32px", fontWeight: "800", lineHeight: 1.2, marginBottom: "48px", color: "#0f1724" }}>
            Fully Scalable, Fully Integrated<br />Applicant Tracking System
          </h1> */}

          {/* Illustration Area */}
          <div style={{ position: "relative", width: "100%", height: "320px", marginBottom: "32px" }}>
            {/* Badge */}
            <div style={{ 
              position: "absolute", 
              top: 0, 
              left: 16, 
              background: "#fff", 
              borderRadius: "9999px", 
              padding: "8px 16px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)", 
              border: "1px solid #e5e7eb", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              animation: showScores ? "scan 1.5s ease-in-out infinite" : "none"
            }}>
              <div style={{ width: 20, height: 20, background: "rgba(255,107,53,0.2)", borderRadius: "4px" }}></div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#0f1724" }}>Resume Match</span>
            </div>

            {/* Score Card 1 - Top Right */}
            <div style={{ 
              position: "absolute", 
              top: 32, 
              right: 80,
              opacity: showScores ? 1 : 0,
              animation: getScoreCardAnimation(0),
            }}>
              <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ff6b35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>👤</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "12px", color: "#60708a" }}>Match</div>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ff6b35" }}>85%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Card 2 - Left Center */}
            <div style={{ 
              position: "absolute", 
              left: 32, 
              top: 96,
              opacity: showScores ? 1 : 0,
              animation: getScoreCardAnimation(0.3),
            }}>
              <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>👤</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "12px", color: "#60708a" }}>Skills</div>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#16a34a" }}>92%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Card 3 - Bottom Left */}
            <div style={{ 
              position: "absolute", 
              left: 64, 
              bottom: 64,
              opacity: showScores ? 1 : 0,
              animation: getScoreCardAnimation(0.6),
            }}>
              <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🤖</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "12px", color: "#60708a" }}>AI Score</div>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ca8a04" }}>78%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small resume/text paper */}
            <div style={{
              position: "absolute",
              right: "160px",
              top: "58%",
              transform: "translateY(-50%)",
              width: "80px",
              height: "100px",
              borderRadius: "4px",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #ddd",
              padding: "8px",
              zIndex: 5,
              animation: "paperMove 3.5s ease-in-out infinite"
            }}>
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "2px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "6px", color: "#444", fontSize: 10, lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, color: "#222", fontSize: 7 }}>...</div>
                  <div style={{ color: "#6b7280" , fontSize: 8}}>Software Engineer</div>
                  <div style={{ height: "2px" }}></div>
                  <div style={{ color: "#9ca3af" , fontSize: 9}}>Experienced in React, Node.js, and cloud integrations.</div>
                  <div style={{ color: "#e5e7eb", fontSize: 9}}>──────────────────────────</div>
                  <div style={{ color: "#9ca3af", fontSize: 9}}>Contact: john.doe@example.com</div>
                </div>
                <div style={{ position: "absolute", left: "-120%", top: 0, bottom: 0, width: "120%", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(11,95,255,0.1) 50%, rgba(255,255,255,0) 100%)", animation: "scanline 1.6s linear 0.25s infinite" }}></div>
              </div>
            </div>

            {/* Robot - Floating */}
            <div style={{ 
              position: "absolute", 
              right: 48, 
              top: "50%", 
              transform: "translateY(-50%)", 
              fontSize: "80px",
              ...robotStyle
            }}>🤖</div>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0b5fff", marginBottom: "16px" }}>AI Matching & Ranking</h2>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#60708a", maxWidth: "400px", margin: "0 auto" }}>
             AI enables better candidate sourcing for recruiters. AI Matching lets recruiters source suitable candidates and rank the candidate's skill set with the job requirements.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", backgroundColor: "#fff" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              {/* <img src="/logo.png" alt="FiSec Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} /> */}
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#000000ff" }}>Welcome Back</span>
            </div>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f1724", marginBottom: "8px" }}>Sign In</h2>
          <p style={{ fontSize: "13px", color: "#60708a", marginBottom: "32px" }}>
            Don't have an account yet?{" "}
            <button onClick={openSignup} style={{ background: "none", border: "none", color: "#0b5fff", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
              Sign Up
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="User Name"
                disabled={isLoading}
                style={{ width: "100%", padding: "12px", height: "48px", border: "1px solid #e6eefc", borderRadius: "8px", fontSize: "15px", background: "#fff", color: "#0f1724", boxSizing: "border-box", opacity: isLoading ? 0.6 : 1, cursor: isLoading ? "not-allowed" : "text" }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
                style={{ width: "100%", padding: "12px 48px 12px 12px", height: "48px", border: "1px solid #e6eefc", borderRadius: "8px", fontSize: "15px", background: "#fff", color: "#0f1724", boxSizing: "border-box", opacity: isLoading ? 0.6 : 1, cursor: isLoading ? "not-allowed" : "text" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: isLoading ? "not-allowed" : "pointer", color: "#60708a", opacity: isLoading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: 16, height: 16, cursor: isLoading ? "not-allowed" : "pointer", accentColor: "#0b5fff", opacity: isLoading ? 0.6 : 1 }}
                />
                <label htmlFor="remember" style={{ fontSize: "13px", color: "#0f1724", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 }}>
                  Remember me
                </label>
              </div>
              <button type="button" disabled={isLoading} style={{ background: "none", border: "none", color: "#0b5fff", fontSize: "13px", cursor: isLoading ? "not-allowed" : "pointer", textDecoration: "underline", opacity: isLoading ? 0.6 : 1 }}>
                Forgot Credentials?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", height: "48px", padding: "12px", background: isLoading ? "#5b8dff" : "linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em", opacity: isLoading ? 0.8 : 1 }}
            >
              {isLoading ? "SIGNING IN..." : "SIGN IN"}
            </button>

            

            <div style={{ position: "relative", margin: "24px 0" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "#e6eefc" }}></div>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <span style={{ background: "#fff", padding: "0 16px", color: "#9aa6bd", fontSize: "13px" }}>or Sign in with</span>
              </div>
            </div>

            {/* Social Grid - only Google (others removed per request) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              <button type="button" disabled={isLoading} onClick={() => handleOAuthPlaceholder('google')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#fff", border: "1px solid #e6eefc", padding: "12px", borderRadius: "8px", cursor: isLoading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 500, opacity: isLoading ? 0.6 : 1 }}>
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>
          {/* Sign Up Modal */}
          {showSignupModal && (
            <div className="modal-overlay" onClick={closeSignup}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Create an account</h3>
                <p style={{ margin: 0, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>Use the form below or sign up with Google.</p>
                <form autoComplete="off" onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input autoComplete="name" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Full name" style={{ padding: 10, borderRadius: 8, border: '1px solid #e6eefc' }} />
                  <input autoComplete="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="Email" type="email" style={{ padding: 10, borderRadius: 8, border: '1px solid #e6eefc' }} />
                  <input autoComplete="new-password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Password" type="password" style={{ padding: 10, borderRadius: 8, border: '1px solid #e6eefc' }} />
                  <div className="modal-actions">
                    <button type="submit" style={{ flex: 1, padding: 10, background: 'linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Sign up</button>
                    <button type="button" onClick={closeSignup} className="btn-ghost">Cancel</button>
                  </div>
                </form>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: '#9aa6bd' }}>Or use a form / social account</div>
                  <div className="modal-actions" style={{ marginTop: 8 }}>
                    <button type="button" className="btn-ghost" onClick={() => handleOAuthPlaceholder('google')}>Google Account</button>
                  </div>
                  {/* Only Google sign-up options are available per request */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

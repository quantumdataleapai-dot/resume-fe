import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { useTheme } from "../utils/ThemeContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../styles/Login.css";
import logo from "../logo.png";

/* ═══ ANIMATED LEFT PANEL ═══ */
const AnimatedPanel = () => {
  const { isDark } = useTheme();
  const [phase, setPhase] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  const startAutoAdvance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
      setAnimKey((k) => k + 1);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoAdvance();
    return () => clearInterval(timerRef.current);
  }, [startAutoAdvance]);

  const goToStep = (idx) => {
    setPhase(idx);
    setAnimKey((k) => k + 1);
    startAutoAdvance(); // reset timer so it waits full 5s from click
  };

  const dots = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 4 + 2, d: Math.random() * 20 + 10, dl: Math.random() * -15,
      color: ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"][Math.floor(Math.random() * 4)],
    })), []);

  const steps = [
    { icon: "fas fa-cloud-upload-alt", label: "Upload JD", color: "#6366f1" },
    { icon: "fas fa-search", label: "AI Match", color: "#3b82f6" },
    { icon: "fas fa-lock", label: "Lock Talent", color: "#ef4444" },
    { icon: "fas fa-chart-pie", label: "Analytics", color: "#10b981" },
  ];

  return (
    <div className="lp-hero">
      {/* Background blobs */}
      <div className="lp-blob lp-blob--1"></div>
      <div className="lp-blob lp-blob--2"></div>
      <div className="lp-blob lp-blob--3"></div>

      {/* Floating dots */}
      <div className="lp-dots-bg">
        {dots.map((d) => (
          <div key={d.id} className="lp-bg-dot" style={{
            left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s,
            background: d.color, animationDuration: `${d.d}s`, animationDelay: `${d.dl}s`,
          }} />
        ))}
      </div>

      <div className="lp-hero-inner">
        {/* Brand */}
        <div className="lp-brand-row">
          <div className="lp-brand-logo"><img src={logo} alt="Intelli-Hire" className="lp-brand-img" /></div>
          <div>
            <h1 className="lp-brand-name">Intelli-Hire</h1>
            <span className="lp-brand-sub">AI-Powered Recruitment Platform</span>
          </div>
        </div>

        {/* ── Phase 0: Upload & Parse ── */}
        {phase === 0 && (
          <div className="lp-scene" key={`s0-${animKey}`}>
            <div className="lp-upload-demo">
              <div className="lp-upload-zone lp-anim-scaleIn">
                <div className="lp-upload-icon"><i className="fas fa-cloud-upload-alt"></i></div>
                <span>Drop your Job Description</span>
              </div>
              <div className="lp-upload-arrow lp-anim-fadeIn" style={{ animationDelay: "0.6s" }}>
                <svg width="60" height="24"><path d="M0,12 L50,12" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" fill="none" /><path d="M45,6 L55,12 L45,18" stroke="#6366f1" strokeWidth="2" fill="none" /></svg>
              </div>
              <div className="lp-parsed-card lp-anim-slideLeft" style={{ animationDelay: "0.8s" }}>
                <div className="lp-parsed-header"><i className="fas fa-magic" style={{ color: "#8b5cf6" }}></i> AI Parsed</div>
                <div className="lp-parsed-tags">
                  {["React", "Java", "AWS", "Python"].map((t, i) => (
                    <span key={t} className="lp-tag lp-anim-popIn" style={{ animationDelay: `${1.2 + i * 0.15}s` }}>{t}</span>
                  ))}
                </div>
                <div className="lp-parsed-bars">
                  {[{ w: 90, l: "Experience" }, { w: 75, l: "Education" }, { w: 85, l: "Skills" }].map((b, i) => (
                    <div key={b.l} className="lp-parsed-bar-row">
                      <span>{b.l}</span>
                      <div className="lp-parsed-bar-bg">
                        <div className="lp-parsed-bar-fill lp-anim-barGrow" style={{ width: `${b.w}%`, animationDelay: `${1.5 + i * 0.2}s` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 1: AI Matching ── */}
        {phase === 1 && (
          <div className="lp-scene" key={`s1-${animKey}`}>
            <div className="lp-match-demo">
              <div className="lp-match-center lp-anim-scaleIn">
                <div className="lp-match-brain">
                  <i className="fas fa-brain"></i>
                  <div className="lp-match-pulse"></div>
                </div>
                <span>AI Matching</span>
              </div>
              <div className="lp-match-results">
                {[
                  { name: "Sarah K.", role: "Senior React Dev", score: 95, color: "#10b981" },
                  { name: "John D.", role: "Full Stack Engineer", score: 87, color: "#3b82f6" },
                  { name: "Emma W.", role: "ML Engineer", score: 72, color: "#f59e0b" },
                ].map((c, i) => (
                  <div key={c.name} className="lp-match-row lp-anim-slideRight" style={{ animationDelay: `${0.5 + i * 0.25}s` }}>
                    <div className="lp-match-avatar" style={{ background: `${c.color}15`, color: c.color }}>{c.name[0]}</div>
                    <div className="lp-match-meta">
                      <span className="lp-match-name">{c.name}</span>
                      <span className="lp-match-role">{c.role}</span>
                    </div>
                    <div className="lp-match-score-wrap">
                      <svg width="44" height="44" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke={isDark ? "#334155" : "#e5e7eb"} strokeWidth="3" />
                        <circle cx="22" cy="22" r="18" fill="none" stroke={c.color} strokeWidth="3"
                          strokeDasharray={`${(c.score / 100) * 113} 113`} strokeLinecap="round"
                          transform="rotate(-90 22 22)" className="lp-score-ring-anim"
                          style={{ animationDelay: `${0.8 + i * 0.25}s` }} />
                        <text x="22" y="26" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill={isDark ? "#ffffff" : "#1e293b"}>{c.score}</text>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 2: Lock & Manage ── */}
        {phase === 2 && (
          <div className="lp-scene" key={`s2-${animKey}`}>
            <div className="lp-lock-demo">
              {[
                { name: "Sarah K.", locked: true, by: "You", time: "Just now" },
                { name: "John D.", locked: false, by: "", time: "Available" },
                { name: "Emma W.", locked: true, by: "Alex", time: "2h ago" },
              ].map((c, i) => (
                <div key={c.name} className={`lp-lock-row lp-anim-slideUp ${c.locked ? "lp-lock-row--locked" : ""}`} style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className="lp-lock-left">
                    <div className={`lp-lock-badge ${c.locked ? "lp-lock-badge--red" : "lp-lock-badge--green"}`}>
                      <i className={`fas fa-${c.locked ? "lock" : "lock-open"}`}></i>
                    </div>
                    <div>
                      <span className="lp-lock-name">{c.name}</span>
                      <span className="lp-lock-sub">{c.locked ? `Locked by ${c.by}` : c.time}</span>
                    </div>
                  </div>
                  <span className={`lp-lock-status ${c.locked ? "lp-lock-status--locked" : ""}`}>
                    {c.locked ? "Reserved" : "Available"}
                  </span>
                </div>
              ))}
              <div className="lp-lock-info lp-anim-fadeIn" style={{ animationDelay: "0.8s" }}>
                <i className="fas fa-info-circle"></i>
                <span>Locked resumes are hidden from other recruiters' search results</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 3: Analytics ── */}
        {phase === 3 && (
          <div className="lp-scene" key={`s3-${animKey}`}>
            <div className="lp-analytics-demo">
              <div className="lp-analytics-cards">
                {[
                  { icon: "fas fa-download", val: "247", label: "Downloads", color: "#8b5cf6" },
                  { icon: "fas fa-lock", val: "18", label: "Active Locks", color: "#ef4444" },
                  { icon: "fas fa-search", val: "56", label: "Matches", color: "#3b82f6" },
                ].map((s, i) => (
                  <div key={s.label} className="lp-an-card lp-anim-scaleIn" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="lp-an-icon" style={{ background: `${s.color}12`, color: s.color }}><i className={s.icon}></i></div>
                    <span className="lp-an-val">{s.val}</span>
                    <span className="lp-an-label">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="lp-an-chart lp-anim-fadeIn" style={{ animationDelay: "0.5s" }}>
                <div className="lp-an-chart-header">
                  <span>Weekly Trend</span>
                  <span className="lp-an-up"><i className="fas fa-arrow-up"></i> 12%</span>
                </div>
                <svg viewBox="0 0 280 80" className="lp-an-svg">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 Q40,55 70,40 T140,30 T210,20 T280,15" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" className="lp-line-draw" />
                  <path d="M0,60 Q40,55 70,40 T140,30 T210,20 T280,15 L280,80 L0,80Z" fill="url(#areaGrad)" className="lp-area-fade" />
                  {[{ x: 70, y: 40 }, { x: 140, y: 30 }, { x: 210, y: 20 }, { x: 280, y: 15 }].map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#3b82f6" strokeWidth="2"
                      className="lp-chart-dot" style={{ animationDelay: `${1.2 + i * 0.2}s` }} />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="lp-steps-row">
          {steps.map((s, i) => (
            <div key={i} className={`lp-step-item ${phase === i ? "lp-step-item--active" : ""}`}
              onClick={() => goToStep(i)} style={{ cursor: "pointer" }}>
              <div className="lp-step-dot" style={{ background: phase === i ? s.color : "#d1d5db" }}>
                {phase === i && <div className="lp-step-ring" style={{ borderColor: s.color }}></div>}
              </div>
              <span style={{ color: phase === i ? s.color : "#94a3b8" }}>{s.label}</span>
            </div>
          ))}
          <div className="lp-step-track">
            <div className="lp-step-track-fill" style={{ width: `${(phase / 3) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══ LOGIN PAGE ═══ */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const { login, signup } = useAuth();
  const { isDark } = useTheme();

  // Theme-aware colors for inline styles
  const t = {
    bg: isDark ? "#0f172a" : "#fff",
    cardBg: isDark ? "#1e293b" : "#fff",
    text: isDark ? "#e2e8f0" : "#0f1724",
    textSec: isDark ? "#94a3b8" : "#60708a",
    textMuted: isDark ? "#64748b" : "#9aa6bd",
    inputBg: isDark ? "#0f172a" : "#fff",
    inputBorder: isDark ? "#334155" : "#e6eefc",
    toggleBg: isDark ? "#1e293b" : "#f1f5f9",
    infoBg: isDark ? "#1e1b4b" : "#f0f5ff",
    infoBorder: isDark ? "#3730a3" : "#c6d8ff",
    errorBg: isDark ? "#7f1d1d" : "#fef2f2",
    errorBorder: isDark ? "#991b1b" : "#fecaca",
    errorText: isDark ? "#fca5a5" : "#dc2626",
    divider: isDark ? "#334155" : "#e6eefc",
    labelColor: isDark ? "#e2e8f0" : "#1e293b",
    successBg: isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)",
    successHeading: isDark ? "#e2e8f0" : "#1e293b",
    successText: isDark ? "#94a3b8" : "#64748b",
    oauthBg: isDark ? "#1e293b" : "#fff",
    oauthBorder: isDark ? "#334155" : "#e6eefc",
  };

  useEffect(() => {
    if (location.state?.toast) {
      setToastMessage(location.state.toast);
      window.history.replaceState({}, document.title);
      setTimeout(() => setToastMessage(""), 4000);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrorMessage("");
    if (!username || !password) { setErrorMessage("Please fill in all fields"); return; }
    setIsLoading(true);
    const result = await login(username, password, selectedRole);
    setIsLoading(false);
    if (result.success) navigate("/dashboard");
    else setErrorMessage(result.error || "Login failed. Please check your credentials.");
  };

  const openSignup = () => { setSignupName(""); setSignupEmail(""); setSignupPassword(""); setShowSignupModal(true); };
  const closeSignup = () => { setSignupName(""); setSignupEmail(""); setSignupPassword(""); setShowSignupModal(false); };

  const handleSignupSubmit = async (e) => {
    e.preventDefault(); setSignupMessage("");
    if (!signupName || !signupEmail || !signupPassword) { setSignupMessage("Please fill in all sign-up fields."); return; }
    const result = await signup({ name: signupName, email: signupEmail, password: signupPassword });
    if (result.success) { setShowSuccessCard(true); setTimeout(() => { setShowSuccessCard(false); closeSignup(); }, 3500); }
    else setSignupMessage(result.error || "Sign-up failed. Please try again.");
  };

  const handleOAuthPlaceholder = (provider) => {
    const origin = window?.location?.origin || "";
    const redirect = `${origin}/auth/callback`;
    const url = provider === "google" ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=profile%20email` : "#";
    alert(`${provider} sign-up will open in a new tab.`);
    try { window.open(url, "_blank", "noopener,noreferrer"); } catch { window.location.href = url; }
  };

  return (
    <div className="lp-container">
      {toastMessage && <div className="lp-toast">{toastMessage}</div>}
      <AnimatedPanel />
      <div className="lp-right">
        <div className="lp-form-wrap">
          {/* ═══ SIGN IN VIEW ═══ */}
          {!showSignupModal ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: t.text }}>Welcome Back</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 10 }}>Sign In</h2>
              <p style={{ fontSize: 15, color: t.textSec, marginBottom: 28 }}>
                {selectedRole === "user" ? (
                  <>Don't have an account yet?{" "}<button onClick={openSignup} style={{ background: "none", border: "none", color: "#0b5fff", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Sign Up</button></>
                ) : "Sign in with your Admin credentials"}
              </p>
              <div style={{ display: "flex", background: t.toggleBg, borderRadius: 12, padding: 4, marginBottom: 28 }}>
                {["admin", "user"].map((r) => (
                  <button key={r} type="button" onClick={() => { setSelectedRole(r); setErrorMessage(""); setUsername(""); setPassword(""); }}
                    style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      background: selectedRole === r ? "linear-gradient(135deg, #0b5fff, #0950d1)" : "transparent",
                      color: selectedRole === r ? "#fff" : t.textSec, boxShadow: selectedRole === r ? "0 2px 8px rgba(11,95,255,0.25)" : "none" }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              {selectedRole === "admin" && (
                <div style={{ background: t.infoBg, border: `1px solid ${t.infoBorder}`, borderRadius: 10, padding: "14px 18px", marginBottom: 18, fontSize: 15, color: t.text, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0b5fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Demo Admin Credentials</div>
                  <div><span style={{ fontWeight: 600, color: t.textSec }}>Username:</span> gowrav@gmail.com</div>
                  <div><span style={{ fontWeight: 600, color: t.textSec }}>Password:</span> 12345678</div>
                </div>
              )}
              {errorMessage && <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 8, padding: 12, marginBottom: 16, color: t.errorText, fontSize: 13 }}>{errorMessage}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" disabled={isLoading}
                  style={{ width: "100%", padding: 14, height: 54, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 16, background: t.inputBg, color: t.text, boxSizing: "border-box", opacity: isLoading ? 0.6 : 1 }} />
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" disabled={isLoading}
                    style={{ width: "100%", padding: "14px 52px 14px 14px", height: 54, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 16, background: t.inputBg, color: t.text, boxSizing: "border-box", opacity: isLoading ? 0.6 : 1 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                    style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textSec, padding: 0, display: "flex" }}>
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: t.text, cursor: "pointer" }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} style={{ width: 18, height: 18, accentColor: "#0b5fff" }} />Remember me
                  </label>
                  <button type="button" disabled={isLoading} onClick={() => navigate("/forgot-password")}
                    style={{ background: "none", border: "none", color: "#0b5fff", fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Forgot Password?</button>
                </div>
                <button type="submit" disabled={isLoading}
                  style={{ width: "100%", height: 54, background: isLoading ? "#5b8dff" : "linear-gradient(135deg, #0b5fff, #0950d1)", color: "#fff", border: "none", borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </button>
                {selectedRole === "user" && (
                  <>
                    <div style={{ position: "relative", margin: "24px 0" }}>
                      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: t.divider }}></div>
                      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                        <span style={{ background: t.bg, padding: "0 16px", color: t.textMuted, fontSize: 13 }}>or Sign in with</span>
                      </div>
                    </div>
                    <button type="button" disabled={isLoading} onClick={() => handleOAuthPlaceholder("google")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: t.oauthBg, border: `1px solid ${t.oauthBorder}`, padding: 12, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 500, color: t.text }}>Sign in with Google</button>
                  </>
                )}
              </form>
            </>
          ) : (
            /* ═══ SIGN UP VIEW (inline, replaces login form) ═══ */
            <div style={{ position: "relative" }}>
              {showSuccessCard && (
                <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: t.successBg, borderRadius: 16, backdropFilter: "blur(6px)" }}>
                  <div style={{ textAlign: "center", padding: "32px 24px", animation: "lp-scaleIn 0.35s ease" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: isDark ? "#064e3b" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, color: "#059669" }}>
                      <i className="fas fa-check"></i>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: t.successHeading, margin: "0 0 8px" }}>Request Submitted</h3>
                    <p style={{ margin: 0, fontSize: 14, color: t.successText, lineHeight: 1.6 }}>An admin must approve your account<br />before you can sign in.</p>
                  </div>
                </div>
              )}
              <h2 style={{ fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 8 }}>Create your account</h2>
              <p style={{ fontSize: 15, color: t.textSec, marginBottom: 32 }}>Get started with AI-powered recruiting</p>
              {signupMessage && <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 10, padding: 12, marginBottom: 16, color: t.errorText, fontSize: 14 }}>{signupMessage}</div>}
              <form autoComplete="off" onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: t.labelColor, marginBottom: 6 }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <i className="fas fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}></i>
                    <input autoComplete="name" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your full name"
                      style={{ width: "100%", padding: "14px 14px 14px 40px", height: 54, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 16, background: t.inputBg, color: t.text, boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: t.labelColor, marginBottom: 6 }}>Work Email</label>
                  <div style={{ position: "relative" }}>
                    <i className="fas fa-envelope" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}></i>
                    <input autoComplete="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@company.com" type="email"
                      style={{ width: "100%", padding: "14px 14px 14px 40px", height: 54, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 16, background: t.inputBg, color: t.text, boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: t.labelColor, marginBottom: 6 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <i className="fas fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}></i>
                    <input autoComplete="new-password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Create a strong password" type="password"
                      style={{ width: "100%", padding: "14px 14px 14px 40px", height: 54, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 16, background: t.inputBg, color: t.text, boxSizing: "border-box" }} />
                  </div>
                </div>
                <button type="submit"
                  style={{ width: "100%", height: 54, background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none", borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.02em" }}>
                  Create Account <i className="fas fa-arrow-right"></i>
                </button>
              </form>
              <div style={{ textAlign: "center", marginTop: 28 }}>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: t.divider }}></div>
                  <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                    <span style={{ background: t.bg, padding: "0 16px", color: t.textMuted, fontSize: 14 }}>or</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: t.successText, margin: 0 }}>
                  Already have an account?{" "}
                  <button onClick={closeSignup} style={{ background: "none", border: "none", color: "#0b5fff", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: 15 }}>Sign in</button>
                </p>
                <p style={{ fontSize: 13, color: t.textMuted, marginTop: 12 }}>Admin portal access</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

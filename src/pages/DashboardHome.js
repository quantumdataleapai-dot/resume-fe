import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/DashboardHome.css";

// Sidebar navigation items
const navItems = [
  { label: "Dashboard", icon: "fas fa-th-large", path: "/dashboard" },
  { label: "Resume Matcher", icon: "fas fa-file-alt", path: "/resume-matcher" },
  { label: "Open Roles", icon: "fas fa-briefcase", path: "/open-roles" },
  { label: "Talent Pool", icon: "fas fa-users", path: "/talent-pool" },
  { label: "Analytics", icon: "fas fa-chart-bar", path: "/analytics" },
  { label: "Settings", icon: "fas fa-cog", path: "/settings" },
];

// Stats data
const pipelineStats = [
  { label: "TOTAL RESUMES", value: "1,284", sub: "+42 today", icon: "fas fa-file-alt" },
  { label: "HIGH MATCHES", value: "124", sub: "+12% vs last week", icon: "fas fa-user-check" },
  { label: "CALLS SCHEDULED", value: "38", sub: "8 pending", icon: "fas fa-phone-alt" },
  { label: "AVG. SCORE", value: "74%", sub: "+3% this month", icon: "fas fa-chart-line" },
];

// Experience levels data
const experienceLevels = [
  { range: "0\u20132 yrs", count: 0, color: "#0d9488" },
  { range: "3\u20135 yrs", count: 0, color: "#2563eb" },
  { range: "6\u20139 yrs", count: 0, color: "#7c3aed" },
  { range: "10+ yrs", count: 0, color: "#ea580c" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getLast7DayLabels() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(days[d.getDay()]);
  }
  return labels;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Upload activity for last 7 days (0 = no uploads yet)
  const uploadActivity = [0, 0, 0, 0, 0, 0, 0];
  const dayLabels = getLast7DayLabels();
  const maxUpload = Math.max(...uploadActivity, 1);
  const totalResumes = experienceLevels.reduce((sum, l) => sum + l.count, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dh-layout">
      {/* Sidebar */}
      <aside className="dh-sidebar">
        <div className="dh-sidebar-logo" onClick={() => navigate("/dashboard")}>
          <span className="dh-logo-text">Resume Matcher</span>
        </div>
        <nav className="dh-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`dh-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => handleNavClick(item.path)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="dh-main">
        {/* Top header */}
        <header className="dh-header">
          <h1 className="dh-header-title">Resume Matcher</h1>
          <div className="dh-header-right">
            <div className="dh-search-bar">
              <i className="fas fa-search dh-search-icon"></i>
              <input
                type="text"
                placeholder="Search candidates, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="dh-user-profile">
              <div className="dh-user-avatar">
                {user?.name ? getInitials(user.name) : "DU"}
              </div>
              <span className="dh-user-name">{user?.name || "Demo User"}</span>
              <i className="fas fa-chevron-down dh-user-chevron"></i>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="dh-content">
          {/* Pipeline Overview */}
          <section className="dh-section">
            <h2 className="dh-section-title">Pipeline Overview</h2>
            <p className="dh-section-subtitle">134 new candidates analyzed in the last 24 hours.</p>

            <div className="dh-stats-grid">
              {pipelineStats.map((stat, i) => (
                <div key={i} className="dh-stat-card">
                  <div className="dh-stat-info">
                    <span className="dh-stat-label">{stat.label}</span>
                    <span className="dh-stat-value">{stat.value}</span>
                    <span className="dh-stat-sub">{stat.sub}</span>
                  </div>
                  <div className="dh-stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom section: Upload Activity + Experience Levels */}
          <div className="dh-bottom-grid">
            {/* Upload Activity - Area Chart */}
            <section className="dh-card">
              <div className="dh-card-header">
                <div className="dh-card-title-row">
                  <i className="fas fa-chart-area dh-card-title-icon"></i>
                  <h3>Upload Activity</h3>
                </div>
                <span className="dh-card-subtitle">Last 7 days</span>
              </div>
              <div className="dh-area-chart-wrapper">
                <svg
                  className="dh-area-chart"
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                >
                  {/* Horizontal grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 50}
                      x2="600"
                      y2={i * 50}
                      stroke="#eef1ef"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Area fill */}
                  <path
                    d={(() => {
                      const stepX = 600 / (uploadActivity.length - 1 || 1);
                      const points = uploadActivity.map((val, i) => {
                        const x = i * stepX;
                        const y = maxUpload > 0 ? 200 - (val / maxUpload) * 170 : 200;
                        return `${x},${y}`;
                      });
                      return `M0,200 L${points.join(" L")} L600,200 Z`;
                    })()}
                    fill="url(#areaGradient)"
                  />
                  {/* Line */}
                  <polyline
                    points={(() => {
                      const stepX = 600 / (uploadActivity.length - 1 || 1);
                      return uploadActivity
                        .map((val, i) => {
                          const x = i * stepX;
                          const y = maxUpload > 0 ? 200 - (val / maxUpload) * 170 : 200;
                          return `${x},${y}`;
                        })
                        .join(" ");
                    })()}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {uploadActivity.map((val, i) => {
                    const stepX = 600 / (uploadActivity.length - 1 || 1);
                    const x = i * stepX;
                    const y = maxUpload > 0 ? 200 - (val / maxUpload) * 170 : 200;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#ffffff"
                        stroke="#14b8a6"
                        strokeWidth="2"
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="dh-area-chart-labels">
                  {dayLabels.map((label, i) => (
                    <span key={i} className="dh-chart-label">{label}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Experience Levels */}
            <section className="dh-card">
              <div className="dh-card-header">
                <div className="dh-card-title-row">
                  <i className="fas fa-user-friends dh-card-title-icon"></i>
                  <h3>Experience Levels</h3>
                </div>
                <span className="dh-card-subtitle">{totalResumes} resumes</span>
              </div>
              <div className="dh-exp-list">
                {experienceLevels.map((level, i) => {
                  const pct = totalResumes > 0 ? Math.round((level.count / totalResumes) * 100) : 0;
                  return (
                    <div key={i} className="dh-exp-row">
                      <span className="dh-exp-range">{level.range}</span>
                      <span
                        className="dh-exp-dot"
                        style={{ backgroundColor: level.color }}
                      ></span>
                      <div className="dh-bar-track">
                        <div
                          className="dh-bar-fill"
                          style={{
                            width: pct > 0 ? `${pct}%` : "0%",
                            background: level.color,
                            opacity: 0.6,
                          }}
                        ></div>
                      </div>
                      <span className="dh-exp-count">
                        {level.count} <span className="dh-exp-pct">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

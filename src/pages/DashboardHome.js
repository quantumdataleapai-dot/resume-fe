import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../utils/AuthContext";
import apiService from "../services/apiService";
import "../styles/DashboardHome.css";

// ── Helpers ─────────────────────────────────────────────
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `Week of ${fmt(monday)} – ${fmt(sunday)}`;
}

function fmtNum(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString();
}

function renderActivityText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Interactive SVG Donut ────────────────────────────────
function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, outerR, innerR, startDeg, endDeg) {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.99;
  const [x1, y1] = polarToCartesian(cx, cy, outerR, startDeg);
  const [x2, y2] = polarToCartesian(cx, cy, outerR, endDeg);
  const [x3, y3] = polarToCartesian(cx, cy, innerR, endDeg);
  const [x4, y4] = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x1},${y1} A${outerR},${outerR} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${large} 0 ${x4},${y4} Z`;
}

// Hexagon clip path points for a regular hexagon centered at (cx, cy) with radius r
function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

let donutIdCounter = 0;

function DonutChart({ data, label }) {
  const [hovered, setHovered] = useState(null);
  const [uniqueId] = useState(() => `hex-${donutIdCounter++}`);
  const total = data.reduce((s, d) => s + d.count, 0);
  const CX = 100, CY = 100, OR = 90, IR = 55, HOR = 95;

  const nonZero = data.filter((d) => d.count > 0);
  let cum = 0;
  const slices = nonZero.map((d, i) => {
    const angle = total > 0 ? (d.count / total) * 360 : 0;
    const start = cum;
    const end = cum + angle;
    cum += angle;
    const midAngle = (start + end) / 2;
    return { ...d, start, end, midAngle, i };
  });

  const hoveredSlice = hovered !== null ? slices.find((s) => s.i === hovered) : null;

  return (
    <div className="dh-hex-container">
      {/* Hexagon border glow */}
      <svg viewBox="0 0 200 200" className="dh-hex-bg">
        <polygon points={hexPoints(CX, CY, 97)} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 200 200" className="dh-hex-chart" style={{ overflow: "visible" }}>
        <defs>
          {slices.map((s) => (
            <linearGradient key={`grad-${s.i}`} id={`${uniqueId}-grad-${s.i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={s.color} stopOpacity="1" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.75" />
            </linearGradient>
          ))}
          <filter id={`${uniqueId}-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${uniqueId}-clip`}>
            <polygon points={hexPoints(CX, CY, 93)} />
          </clipPath>
        </defs>

        {/* Clipped to hexagon */}
        <g clipPath={`url(#${uniqueId}-clip)`}>
          {/* Background ring */}
          <circle cx={CX} cy={CY} r={(OR + IR) / 2} fill="none" stroke="#f1f5f9" strokeWidth={OR - IR} />

          {/* Slices */}
          {slices.map((s) => (
            <path
              key={s.i}
              d={arcPath(CX, CY, hovered === s.i ? HOR : OR, IR, s.start, s.end)}
              fill={`url(#${uniqueId}-grad-${s.i})`}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              style={{
                transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                cursor: "pointer",
                filter: hovered === s.i ? `url(#${uniqueId}-glow)` : "none",
                opacity: hovered !== null && hovered !== s.i ? 0.45 : 1,
              }}
              onMouseEnter={() => setHovered(s.i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </g>

        {/* Hexagon outline */}
        <polygon points={hexPoints(CX, CY, 93)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

        {/* Inner hexagon */}
        <polygon points={hexPoints(CX, CY, IR - 2)} fill="#fff" stroke="#f1f5f9" strokeWidth="1" />

        {/* Center content */}
        {hoveredSlice ? (
          <>
            <text x={CX} y={CY - 5} textAnchor="middle" fontSize="24" fontWeight="800" fill={hoveredSlice.color}
              style={{ fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
              {hoveredSlice.count}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fontSize="9" fontWeight="500" fill="#64748b"
              style={{ fontFamily: "Inter, sans-serif" }}>
              {hoveredSlice.name}
            </text>
          </>
        ) : (
          <>
            <text x={CX} y={CY - 5} textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a"
              style={{ fontFamily: "Inter, sans-serif" }}>
              {total}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fontSize="9.5" fontWeight="500" fill="#94a3b8"
              style={{ fontFamily: "Inter, sans-serif" }}>
              {label || "total"}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Mini bar chart ──────────────────────────────────────
function MiniBarChart({ data }) {
  if (!data || data.length === 0) return <span className="dh-no-data">No trend data</span>;
  const max = Math.max(...data.map((d) => d.downloads), 1);
  return (
    <div className="dh-mini-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="dh-mini-bar-col">
          <div className="dh-mini-bar-wrapper">
            <div
              className="dh-mini-bar"
              style={{ height: `${(d.downloads / max) * 100}%` }}
              title={`${d.date}: ${d.downloads} downloads`}
            />
          </div>
          <span className="dh-mini-bar-label">
            {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────
function ConfirmModal({ open, title, message, detail, confirmText, cancelText, variant, onConfirm, onCancel }) {
  if (!open) return null;
  const isDanger = variant === "danger";
  return (
    <div className="dh-modal-overlay" onClick={onCancel}>
      <div className="dh-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dh-modal-icon-wrap" style={{ background: isDanger ? "#FEF2F2" : "#EFF6FF" }}>
          <i
            className={isDanger ? "fas fa-exclamation-triangle" : "fas fa-info-circle"}
            style={{ color: isDanger ? "#DC2626" : "#2563EB", fontSize: 22 }}
          />
        </div>
        <h3 className="dh-modal-title">{title}</h3>
        <p className="dh-modal-message">{message}</p>
        {detail && <p className="dh-modal-detail">{detail}</p>}
        <div className="dh-modal-actions">
          <button className="dh-btn dh-modal-cancel" onClick={onCancel}>
            {cancelText || "Cancel"}
          </button>
          <button
            className={`dh-btn ${isDanger ? "dh-btn--danger-solid" : "dh-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast notification ───────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`dh-toast dh-toast--${type || "info"}`}>
      <i className={type === "error" ? "fas fa-times-circle" : "fas fa-check-circle"} />
      <span>{message}</span>
      <button className="dh-toast-close" onClick={onClose}><i className="fas fa-times" /></button>
    </div>
  );
}

// ── Recent Activity Card (fixed height, scrollable) ──────
function RecentActivityCard({ items, subtitle, showUser }) {
  return (
    <div className="dh-card">
      <div className="dh-card-header">
        <h3 className="dh-card-title">
          <i className="fas fa-bolt" style={{ color: "#f59e0b", marginRight: 8 }}></i>
          Recent activity
        </h3>
        <span className="dh-card-subtitle">{subtitle}</span>
      </div>
      <div className="dh-activity-scroll">
        <div className="dh-activity-list">
          {items.length > 0 ? items.map((item, i) => (
            <div key={i} className="dh-activity-row">
              <div className="dh-activity-dot" style={{ backgroundColor: item.color }} />
              <div className="dh-activity-info">
                <span className="dh-activity-text">{renderActivityText(item.text)}</span>
                <span className="dh-activity-time">
                  {item.time}{showUser && item.user ? ` · ${item.user}` : ""}
                </span>
              </div>
            </div>
          )) : (
            <span className="dh-no-data">No recent activity</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────
const tabs = [
  { label: "Dashboard", icon: "fas fa-chart-line", id: "dashboard" },
  { label: "Locks", icon: "fas fa-lock", id: "locks" },
  { label: "Activity", icon: "fas fa-bolt", id: "activity" },
  { label: "Download Analytics", icon: "fas fa-download", id: "downloads" },
];

// ══════════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════
function AdminDashboard({ stats, barsVisible }) {
  const s = stats || {};

  const statsCards = [
    {
      label: "TOTAL RESUMES", value: fmtNum(s.total_resumes),
      sub: s.resumes_this_month != null ? `${fmtNum(s.resumes_this_month)} this month` : "",
      arrow: s.resumes_this_month > 0 ? "up" : null, color: "#0d9488",
    },
    {
      label: "JOBS ANALYSED", value: fmtNum(s.jobs_analysed),
      sub: `${fmtNum(s.total_connectors || 0)} connectors active`,
      arrow: null, color: "#7c3aed", subColor: "#059669",
    },
    {
      label: "MATCHES MADE", value: fmtNum(s.matches_made),
      sub: s.matches_growth != null ? `${s.matches_growth}% vs last month` : "",
      arrow: s.matches_growth > 0 ? "up" : null, color: "#d97706",
    },
    {
      label: "AVG. MATCH SCORE",
      value: s.avg_match_score != null ? `${s.avg_match_score}%` : "—",
      sub: s.avg_match_score != null ? "Stable" : "No data",
      arrow: null, color: "#6B7280",
      subColor: s.avg_match_score != null ? "#9CA3AF" : "#6B7280",
    },
  ];

  const platformMetrics = [
    { label: "Resumes", value: fmtNum(s.total_resumes), color: "#0d9488", bg: "#f0fdfa" },
    { label: "JDs Analyzed", value: fmtNum(s.jobs_analysed), color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Matches", value: fmtNum(s.matches_made), color: "#059669", bg: "#ecfdf5" },
    { label: "Downloads", value: fmtNum(s.total_downloads), color: "#d97706", bg: "#fffbeb" },
  ];

  const maxBarVal = Math.max(s.total_resumes || 1, 1);
  const platformBars = [
    { label: "Resumes in DB", value: fmtNum(s.total_resumes), pct: 100 },
    { label: "JDs analyzed", value: fmtNum(s.jobs_analysed), pct: ((s.jobs_analysed || 0) / maxBarVal) * 100 },
    { label: "Matches generated", value: fmtNum(s.matches_made), pct: ((s.matches_made || 0) / maxBarVal) * 100 },
    { label: "Resumes downloaded", value: fmtNum(s.total_downloads), pct: ((s.total_downloads || 0) / maxBarVal) * 100 },
    { label: "Active locks", value: fmtNum(s.active_locks), pct: ((s.active_locks || 0) / maxBarVal) * 100 },
  ];

  const systemOverview = [
    { name: "Active users", count: s.active_users || 0, color: "#4F7DF3" },
    { name: "Pending approval", count: s.pending_approval || 0, color: "#F59E0B" },
    { name: "Locked resumes", count: s.active_locks || 0, color: "#EF4444" },
    { name: "Connectors", count: s.total_connectors || 0, color: "#10B981" },
    { name: "Logins (24h)", count: s.logins_last_24h || 0, color: "#8B5CF6" },
  ];

  const aboveColor = { bar: "linear-gradient(90deg, #34d399, #6ee7b7)", shadow: "rgba(52, 211, 153, 0.25)" };
  const belowColor = { bar: "linear-gradient(90deg, #93c5fd, #60a5fa)", shadow: "rgba(147, 197, 253, 0.25)" };
  const topSkills = (s.top_skills || []).map((sk) => ({
    name: sk.name, pct: sk.percentage,
    color: sk.percentage >= 70 ? aboveColor : belowColor,
  }));
  const recentActivity = (s.recent_activity || []).map((a) => ({
    text: a.text, time: a.time, user: a.user, color: a.color || "#6B7280",
  }));

  return (
    <>
      <div className="dh-stats-grid">
        {statsCards.map((stat, i) => (
          <div key={i} className="dh-stat-card">
            <span className="dh-stat-label" style={{ color: stat.color }}>{stat.label}</span>
            <span className="dh-stat-value">{stat.value}</span>
            <span className="dh-stat-sub" style={{ color: stat.subColor || "#059669" }}>
              {stat.arrow === "up" && <i className="fas fa-arrow-up dh-arrow-icon"></i>}
              {" "}{stat.sub}
            </span>
          </div>
        ))}
      </div>

      <div className="dh-mid-grid">
        <div className="dh-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-chart-bar" style={{ color: "#6366f1", marginRight: 8 }}></i>
              Platform usage
            </h3>
            <span className="dh-card-subtitle">Key metrics across the system</span>
          </div>
          <div className="dh-platform-pills">
            {platformMetrics.map((m) => (
              <div key={m.label} className="dh-platform-pill" style={{ backgroundColor: m.bg }}>
                <span className="dh-pill-value" style={{ color: m.color }}>{m.value}</span>
                <span className="dh-pill-label">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="dh-platform-bars">
            {platformBars.map((bar, i) => (
              <div key={bar.label} className="dh-platform-bar-row">
                <span className="dh-platform-bar-label">{bar.label}</span>
                <div className="dh-platform-bar-track">
                  <div className="dh-platform-bar-fill" style={{
                    width: barsVisible ? `${Math.max(bar.pct, bar.pct > 0 ? 1 : 0)}%` : "0%",
                    transition: `width 0.7s ease ${i * 0.08}s`,
                  }} />
                </div>
                <span className="dh-platform-bar-value">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dh-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-server" style={{ color: "#10b981", marginRight: 8 }}></i>
              System overview
            </h3>
            <span className="dh-card-subtitle">Platform resource distribution</span>
          </div>
          <div className="dh-system-content">
            <DonutChart data={systemOverview} />
            <div className="dh-system-legend">
              {systemOverview.map((item) => (
                <div key={item.name} className="dh-system-row">
                  <span className="dh-system-dot" style={{ backgroundColor: item.color }} />
                  <span className="dh-system-name">{item.name}</span>
                  <span className="dh-system-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dh-bottom-grid">
        <div className="dh-card dh-skills-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-fire" style={{ color: "#f59e0b", marginRight: 8 }}></i>
              Top skills in demand
            </h3>
            <span className="dh-card-subtitle">Extracted from JDs this month</span>
          </div>
          <div className="dh-skills-scroll">
            <div className="dh-skills-list">
              {topSkills.length > 0 ? topSkills.map((skill, i) => (
                <div key={skill.name} className="dh-skill-row">
                  <span className="dh-skill-rank">{i + 1}</span>
                  <span className="dh-skill-name">{skill.name}</span>
                  <div className="dh-skill-bar-track">
                    <div className="dh-skill-bar-fill" style={{
                      width: barsVisible ? `${skill.pct}%` : "0%",
                      background: skill.color.bar,
                      boxShadow: `0 1px 4px ${skill.color.shadow}`,
                      transition: `width 0.75s cubic-bezier(.4,0,.2,1) ${i * 0.08}s`,
                    }} />
                  </div>
                  <span className="dh-skill-pct">{skill.pct}%</span>
                </div>
              )) : (
                <span className="dh-no-data">No skill data available</span>
              )}
            </div>
          </div>
        </div>

        <RecentActivityCard
          items={recentActivity}
          subtitle="Actions across the platform"
          showUser
        />
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
//  USER DASHBOARD
// ══════════════════════════════════════════════════════════
function UserDashboard({ data, barsVisible }) {
  const d = data || {};
  const st = d.stats || {};

  const statsCards = [
    { label: "ACTIVE LOCKS", value: fmtNum(st.active_locks), color: "#EF4444" },
    { label: "TOTAL DOWNLOADS", value: fmtNum(st.total_downloads), sub: `${fmtNum(st.downloads_today || 0)} today`, color: "#8B5CF6", arrow: st.downloads_today > 0 ? "up" : null },
    { label: "MATCHES RUN", value: fmtNum(st.matches_run), color: "#059669" },
    { label: "JDs ANALYZED", value: fmtNum(st.jds_analyzed), color: "#d97706" },
  ];

  const downloadOverview = [
    { name: "Today", count: st.downloads_today || 0, color: "#4F7DF3" },
    { name: "This week", count: st.downloads_this_week || 0, color: "#8B5CF6" },
    { name: "This month", count: st.downloads_this_month || 0, color: "#F59E0B" },
    { name: "All time", count: st.total_downloads || 0, color: "#10B981" },
  ];

  const lockedResumes = d.locked_resumes || [];
  const recentDownloads = d.recent_downloads || [];
  const recentActivity = (d.recent_activity || []).map((a) => ({
    text: a.text, time: a.time, action: a.action, color: a.color || "#6B7280",
  }));
  const dailyTrend = d.daily_download_trend || [];

  return (
    <>
      <div className="dh-stats-grid">
        {statsCards.map((stat, i) => (
          <div key={i} className="dh-stat-card">
            <span className="dh-stat-label" style={{ color: stat.color }}>{stat.label}</span>
            <span className="dh-stat-value">{stat.value}</span>
            {stat.sub && (
              <span className="dh-stat-sub" style={{ color: "#059669" }}>
                {stat.arrow === "up" && <i className="fas fa-arrow-up dh-arrow-icon"></i>}
                {" "}{stat.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="dh-mid-grid">
        <div className="dh-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-lock" style={{ color: "#ef4444", marginRight: 8 }}></i>
              My locked resumes
            </h3>
            <span className="dh-card-subtitle">Resumes currently locked by you</span>
          </div>
          {lockedResumes.length > 0 ? (
            <div className="dh-table-wrap">
              <table className="dh-table">
                <thead>
                  <tr><th>Candidate</th><th>Title</th><th>Locked at</th></tr>
                </thead>
                <tbody>
                  {lockedResumes.map((r) => (
                    <tr key={r.resume_id}>
                      <td>
                        <div className="dh-candidate-cell">
                          <span className="dh-candidate-name">{r.candidate_name}</span>
                          <span className="dh-candidate-email">{r.candidate_email}</span>
                        </div>
                      </td>
                      <td>{r.candidate_title}</td>
                      <td className="dh-date-cell">{formatDate(r.locked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="dh-no-data">No locked resumes</span>
          )}
        </div>

        <div className="dh-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-download" style={{ color: "#8b5cf6", marginRight: 8 }}></i>
              Download overview
            </h3>
            <span className="dh-card-subtitle">Your download activity</span>
          </div>
          <div className="dh-system-content">
            <DonutChart data={downloadOverview} />
            <div className="dh-system-legend">
              {downloadOverview.map((item) => (
                <div key={item.name} className="dh-system-row">
                  <span className="dh-system-dot" style={{ backgroundColor: item.color }} />
                  <span className="dh-system-name">{item.name}</span>
                  <span className="dh-system-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          {dailyTrend.length > 0 && (
            <div className="dh-trend-section">
              <span className="dh-trend-label">Daily trend</span>
              <MiniBarChart data={dailyTrend} />
            </div>
          )}
        </div>
      </div>

      <div className="dh-bottom-grid">
        <div className="dh-card">
          <div className="dh-card-header">
            <h3 className="dh-card-title">
              <i className="fas fa-history" style={{ color: "#3b82f6", marginRight: 8 }}></i>
              Recent downloads
            </h3>
            <span className="dh-card-subtitle">Your latest downloaded resumes</span>
          </div>
          {recentDownloads.length > 0 ? (
            <div className="dh-table-wrap">
              <table className="dh-table">
                <thead>
                  <tr><th>Candidate</th><th>Title</th><th>Downloaded</th></tr>
                </thead>
                <tbody>
                  {recentDownloads.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div className="dh-candidate-cell">
                          <span className="dh-candidate-name">{r.candidate_name}</span>
                          <span className="dh-candidate-email">{r.resume_name}</span>
                        </div>
                      </td>
                      <td>{r.candidate_title}</td>
                      <td className="dh-date-cell">{formatDate(r.downloaded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="dh-no-data">No recent downloads</span>
          )}
        </div>

        <RecentActivityCard
          items={recentActivity}
          subtitle="Your recent actions"
        />
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
//  LOCKS TAB (Admin)
// ══════════════════════════════════════════════════════════
function LocksTab() {
  const [locks, setLocks] = useState([]);
  const [totalLocks, setTotalLocks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(null);
  const [unlockingUser, setUnlockingUser] = useState(null);
  const [confirm, setConfirm] = useState(null);   // { title, message, detail, confirmText, variant, onConfirm }
  const [toast, setToast] = useState(null);        // { message, type }

  const fetchLocks = useCallback(async () => {
    try {
      const data = await apiService.getAdminLocks();
      if (data && data.success !== false) {
        setLocks(data.locks || []);
        setTotalLocks(data.total_locks || 0);
      }
    } catch (err) {
      console.error("Failed to fetch locks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocks(); }, [fetchLocks]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const requestForceUnlock = (lock) => {
    setConfirm({
      title: "Force unlock resume",
      message: `Remove the lock on this resume? It will become available in match results again.`,
      detail: `${lock.candidate_name} — locked by ${lock.locked_by || "unknown"}`,
      confirmText: "Unlock",
      variant: "danger",
      onConfirm: () => executeForceUnlock(lock.resume_id),
    });
  };

  const executeForceUnlock = async (resumeId) => {
    setConfirm(null);
    setUnlocking(resumeId);
    try {
      const res = await apiService.forceUnlock(resumeId);
      if (res && res.success !== false) {
        showToast(res.message || "Resume unlocked successfully");
        await fetchLocks();
      } else {
        showToast(res?.message || "Failed to unlock resume", "error");
      }
    } catch (err) {
      console.error("Force unlock failed:", err);
      showToast("Failed to unlock resume", "error");
    } finally {
      setUnlocking(null);
    }
  };

  const requestUnlockAllByUser = (userId, recruiterEmail, lockCount) => {
    setConfirm({
      title: "Release all locks",
      message: `This will release all ${lockCount} lock${lockCount !== 1 ? "s" : ""} held by this recruiter. All their locked resumes will become available again.`,
      detail: recruiterEmail,
      confirmText: "Release All",
      variant: "danger",
      onConfirm: () => executeUnlockAllByUser(userId),
    });
  };

  const executeUnlockAllByUser = async (userId) => {
    setConfirm(null);
    setUnlockingUser(userId);
    try {
      const res = await apiService.unlockAllByUser(userId);
      if (res && res.success !== false) {
        showToast(res.message || "All locks released successfully");
        await fetchLocks();
      } else {
        showToast(res?.message || "Failed to release locks", "error");
      }
    } catch (err) {
      console.error("Unlock all failed:", err);
      showToast("Failed to release locks", "error");
    } finally {
      setUnlockingUser(null);
    }
  };

  // Group locks by recruiter (keyed by user_id for the unlock-all API)
  const byRecruiter = {};
  locks.forEach((lock) => {
    const key = lock.locked_by || "Unknown";
    if (!byRecruiter[key]) {
      byRecruiter[key] = { userId: lock.locked_by_user_id, locks: [] };
    }
    byRecruiter[key].locks.push(lock);
  });

  if (loading) {
    return <div className="dh-loading">Loading locks...</div>;
  }

  return (
    <div className="dh-locks-tab">
      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        detail={confirm?.detail}
        confirmText={confirm?.confirmText}
        variant={confirm?.variant}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Summary banner */}
      <div className="dh-locks-banner">
        <div className="dh-locks-banner-left">
          <div className="dh-locks-banner-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="dh-locks-banner-info">
            <h3>{totalLocks} Active Lock{totalLocks !== 1 ? "s" : ""}</h3>
            <p>Locks prevent multiple recruiters from working on the same candidate</p>
          </div>
        </div>
        <div className="dh-locks-banner-badges">
          <span className="dh-locks-badge dh-locks-badge--recruiters">
            <i className="fas fa-users"></i> {Object.keys(byRecruiter).length} Recruiter{Object.keys(byRecruiter).length !== 1 ? "s" : ""}
          </span>
          <span className="dh-locks-badge dh-locks-badge--resumes">
            <i className="fas fa-file-alt"></i> {totalLocks} Resume{totalLocks !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {locks.length === 0 ? (
        <div className="dh-locks-empty-state">
          <div className="dh-locks-empty-icon">
            <i className="fas fa-lock-open"></i>
          </div>
          <h3>All Clear</h3>
          <p>No resumes are currently locked. All candidates are available for matching.</p>
        </div>
      ) : (
        Object.entries(byRecruiter).map(([email, { userId, locks: recruiterLocks }]) => (
          <div key={email} className="dh-locks-recruiter-card">
            <div className="dh-locks-recruiter-header">
              <div className="dh-locks-recruiter-profile">
                <div className="dh-locks-avatar">
                  {(email[0] || "?").toUpperCase()}
                </div>
                <div className="dh-locks-recruiter-meta">
                  <span className="dh-locks-recruiter-name">{email}</span>
                  <span className="dh-locks-recruiter-label">
                    <i className="fas fa-lock"></i> {recruiterLocks.length} lock{recruiterLocks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button
                className="dh-locks-release-all-btn"
                onClick={() => requestUnlockAllByUser(userId, email, recruiterLocks.length)}
                disabled={unlockingUser === userId}
              >
                {unlockingUser === userId ? (
                  <><i className="fas fa-spinner fa-spin"></i> Releasing...</>
                ) : (
                  <><i className="fas fa-unlock-alt"></i> Release All</>
                )}
              </button>
            </div>

            <div className="dh-locks-cards-grid">
              {recruiterLocks.map((lock) => (
                <div key={lock.resume_id} className="dh-locks-item-card">
                  <div className="dh-locks-item-top">
                    <div className="dh-locks-item-avatar">
                      {(lock.candidate_name?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="dh-locks-item-info">
                      <span className="dh-locks-item-name">{lock.candidate_name}</span>
                      <span className="dh-locks-item-title">{lock.candidate_title || "No title"}</span>
                    </div>
                  </div>
                  <div className="dh-locks-item-bottom">
                    <span className="dh-locks-item-time">
                      <i className="far fa-clock"></i> {formatDate(lock.locked_at)}
                    </span>
                    <button
                      className="dh-locks-unlock-btn"
                      onClick={() => requestForceUnlock(lock)}
                      disabled={unlocking === lock.resume_id}
                      title="Unlock this resume"
                    >
                      {unlocking === lock.resume_id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <><i className="fas fa-unlock"></i> Unlock</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  ACTIVITY TAB
// ══════════════════════════════════════════════════════════
const ACTION_TYPES = [
  { value: "", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "signup", label: "Signup" },
  { value: "lock", label: "Lock" },
  { value: "unlock", label: "Unlock" },
  { value: "download", label: "Download" },
  { value: "match", label: "Match" },
  { value: "jd_analyze", label: "JD Analyze" },
  { value: "upload", label: "Upload" },
  { value: "generate_questions", label: "Generate Questions" },
  { value: "evaluate_answers", label: "Evaluate Answers" },
  { value: "admin_create_user", label: "Admin: Create User" },
  { value: "admin_approve_user", label: "Admin: Approve User" },
  { value: "admin_reject_user", label: "Admin: Reject User" },
  { value: "admin_delete_user", label: "Admin: Delete User" },
  { value: "admin_change_role", label: "Admin: Change Role" },
  { value: "admin_deactivate_user", label: "Admin: Deactivate" },
  { value: "admin_activate_user", label: "Admin: Activate" },
  { value: "admin_force_unlock", label: "Admin: Force Unlock" },
  { value: "admin_unlock_all", label: "Admin: Unlock All" },
];

const DAYS_OPTIONS = [
  { value: 1, label: "Last 24 hours" },
  { value: 3, label: "Last 3 days" },
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

const ACTION_META = {
  login:       { icon: "fas fa-sign-in-alt", color: "#3B82F6", bg: "#EFF6FF" },
  signup:      { icon: "fas fa-user-plus",   color: "#8B5CF6", bg: "#F5F3FF" },
  lock:        { icon: "fas fa-lock",        color: "#EF4444", bg: "#FEF2F2" },
  unlock:      { icon: "fas fa-unlock",      color: "#10B981", bg: "#ECFDF5" },
  download:    { icon: "fas fa-download",    color: "#8B5CF6", bg: "#F5F3FF" },
  match:       { icon: "fas fa-check-double",color: "#059669", bg: "#ECFDF5" },
  jd_analyze:  { icon: "fas fa-file-alt",    color: "#D97706", bg: "#FFFBEB" },
  upload:      { icon: "fas fa-upload",      color: "#0D9488", bg: "#F0FDFA" },
  generate_questions: { icon: "fas fa-question-circle", color: "#6366F1", bg: "#EEF2FF" },
  evaluate_answers:   { icon: "fas fa-clipboard-check", color: "#059669", bg: "#ECFDF5" },
  admin_create_user:    { icon: "fas fa-user-plus",    color: "#2563EB", bg: "#EFF6FF" },
  admin_approve_user:   { icon: "fas fa-user-check",   color: "#10B981", bg: "#ECFDF5" },
  admin_reject_user:    { icon: "fas fa-user-times",   color: "#EF4444", bg: "#FEF2F2" },
  admin_delete_user:    { icon: "fas fa-user-slash",   color: "#EF4444", bg: "#FEF2F2" },
  admin_change_role:    { icon: "fas fa-user-cog",     color: "#D97706", bg: "#FFFBEB" },
  admin_deactivate_user:{ icon: "fas fa-user-lock",    color: "#6B7280", bg: "#F3F4F6" },
  admin_activate_user:  { icon: "fas fa-user-check",   color: "#10B981", bg: "#ECFDF5" },
  admin_force_unlock:   { icon: "fas fa-unlock-alt",   color: "#EF4444", bg: "#FEF2F2" },
  admin_unlock_all:     { icon: "fas fa-lock-open",    color: "#EF4444", bg: "#FEF2F2" },
};

function formatActionLabel(action) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDetailText(action, detail) {
  if (!detail) return null;
  switch (action) {
    case "download":
      return `Resume: ${detail.resume_name || detail.resume_id}`;
    case "lock":
    case "unlock":
      return `Resume ID: ${detail.resume_id}`;
    case "match":
      return `${detail.title} — ${detail.total_matched} matched (score: ${detail.match_score}%)`;
    case "jd_analyze":
      return `JD: ${detail.title}`;
    case "upload":
      return `File: ${detail.filename}`;
    default:
      if (detail.target_email) return `User: ${detail.target_email}${detail.role ? ` (${detail.role})` : ""}`;
      if (detail.target_user_id) return `User ID: ${detail.target_user_id}`;
      return null;
  }
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ActivityTab() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState(7);
  const LIMIT = 25;

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getAdminActivity({
        action: actionFilter || undefined,
        days: daysFilter,
        page,
        limit: LIMIT,
      });
      if (data && data.success !== false) {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, daysFilter, page]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="dh-activity-tab">
      {/* Banner */}
      <div className="dh-activity-banner">
        <div className="dh-activity-banner-left">
          <div className="dh-activity-banner-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="dh-activity-banner-info">
            <h3>Activity Log</h3>
            <p>Track all platform actions across users and admins</p>
          </div>
        </div>
        <span className="dh-activity-event-count">
          <i className="fas fa-stream"></i> {total} event{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="dh-activity-filters">
        <div className="dh-filter-group">
          <label className="dh-filter-label">
            <i className="fas fa-filter"></i> Action type
          </label>
          <select
            className="dh-select"
            value={actionFilter}
            onChange={handleFilterChange(setActionFilter)}
          >
            {ACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="dh-filter-group">
          <label className="dh-filter-label">
            <i className="far fa-calendar-alt"></i> Time period
          </label>
          <select
            className="dh-select"
            value={daysFilter}
            onChange={handleFilterChange(setDaysFilter)}
          >
            {DAYS_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="dh-loading">Loading activity...</div>
      ) : entries.length === 0 ? (
        <div className="dh-activity-empty">
          <div className="dh-activity-empty-icon">
            <i className="fas fa-inbox"></i>
          </div>
          <h3>No activity found</h3>
          <p>Try adjusting the filters to see more results</p>
        </div>
      ) : (
        <div className="dh-activity-timeline">
          {entries.map((entry) => {
            const meta = ACTION_META[entry.action] || { icon: "fas fa-circle", color: "#6B7280", bg: "#F3F4F6" };
            const detailText = formatDetailText(entry.action, entry.detail);
            return (
              <div key={entry.id} className="dh-timeline-entry">
                <div className="dh-timeline-card">
                  <div className="dh-timeline-card-header">
                    <div className="dh-timeline-left">
                      <div className="dh-log-icon" style={{ background: meta.bg, color: meta.color }}>
                        <i className={meta.icon}></i>
                      </div>
                      <div className="dh-timeline-meta">
                        <span className="dh-log-action-badge" style={{ background: meta.bg, color: meta.color }}>
                          {formatActionLabel(entry.action)}
                        </span>
                        <span className="dh-log-user">{entry.user_email || "System"}</span>
                      </div>
                    </div>
                    <div className="dh-timeline-right">
                      {entry.ip_address && (
                        <span className="dh-log-ip">{entry.ip_address}</span>
                      )}
                      <span className="dh-log-time">
                        <i className="far fa-clock"></i> {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  {detailText && <p className="dh-log-detail">{detailText}</p>}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="dh-pagination-bar">
              <button
                className="dh-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <div className="dh-page-indicators">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) { pageNum = i + 1; }
                  else if (page <= 3) { pageNum = i + 1; }
                  else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                  else { pageNum = page - 2 + i; }
                  return (
                    <button
                      key={pageNum}
                      className={`dh-page-dot ${page === pageNum ? "dh-page-dot--active" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="dh-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  DOWNLOADS TAB
// ══════════════════════════════════════════════════════════
const DL_DAYS_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 365, label: "Last year" },
];

function DownloadsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  // User drill-down
  const [selectedUser, setSelectedUser] = useState(null); // { user_id, email }
  const [userDownloads, setUserDownloads] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userLoading, setUserLoading] = useState(false);
  const USER_LIMIT = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminDownloads(days);
      if (res && res.success !== false) setData(res);
    } catch (err) {
      console.error("Failed to fetch download analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchUserDownloads = useCallback(async () => {
    if (!selectedUser) return;
    setUserLoading(true);
    try {
      const res = await apiService.getAdminDownloadsUser(selectedUser.user_id, { page: userPage, limit: USER_LIMIT });
      if (res && res.success !== false) {
        setUserDownloads(res.downloads || []);
        setUserTotal(res.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch user downloads:", err);
    } finally {
      setUserLoading(false);
    }
  }, [selectedUser, userPage]);

  useEffect(() => { fetchUserDownloads(); }, [fetchUserDownloads]);

  const openUserDetail = (user) => {
    setSelectedUser(user);
    setUserPage(1);
    setUserDownloads([]);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
    setUserDownloads([]);
    setUserTotal(0);
    setUserPage(1);
  };

  if (loading) return <div className="dh-loading">Loading download analytics...</div>;
  if (!data) return <div className="dh-loading">No data available</div>;

  const { total_downloads = 0, per_user = [], top_resumes = [], daily_trend = [] } = data;
  const userTotalPages = Math.ceil(userTotal / USER_LIMIT);

  return (
    <div className="dh-downloads-tab">
      {/* User detail modal */}
      {selectedUser && (
        <div className="dh-modal-overlay" onClick={closeUserDetail}>
          <div className="dh-modal dh-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="dh-modal-header-row">
              <div>
                <h3 className="dh-modal-title" style={{ textAlign: "left", marginBottom: 2 }}>Download History</h3>
                <p className="dh-modal-message" style={{ textAlign: "left", margin: 0 }}>{selectedUser.email}</p>
              </div>
              <button className="dh-modal-close-btn" onClick={closeUserDetail}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            {userLoading ? (
              <div className="dh-loading" style={{ height: 120 }}>Loading...</div>
            ) : userDownloads.length === 0 ? (
              <p className="dh-no-data">No downloads found</p>
            ) : (
              <>
                <div className="dh-table-wrap">
                  <table className="dh-table">
                    <thead>
                      <tr>
                        <th>Resume</th>
                        <th>Downloaded at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDownloads.map((dl, i) => (
                        <tr key={i}>
                          <td>
                            <div className="dh-candidate-cell">
                              <span className="dh-candidate-name">{dl.resume_name}</span>
                              <span className="dh-candidate-email">{dl.resume_id}</span>
                            </div>
                          </td>
                          <td className="dh-date-cell">{formatDate(dl.downloaded_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {userTotalPages > 1 && (
                  <div className="dh-pagination" style={{ borderTop: "none", background: "transparent", paddingTop: 8 }}>
                    <button className="dh-btn dh-btn--sm dh-pagination-btn" disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}>
                      <i className="fas fa-chevron-left"></i> Prev
                    </button>
                    <span className="dh-pagination-info">Page {userPage} of {userTotalPages}</span>
                    <button className="dh-btn dh-btn--sm dh-pagination-btn" disabled={userPage >= userTotalPages} onClick={() => setUserPage((p) => p + 1)}>
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="dh-dl-banner">
        <div className="dh-dl-banner-left">
          <div className="dh-dl-banner-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="dh-dl-banner-info">
            <h3>Download Analytics</h3>
            <p>Track resume download trends and user activity</p>
          </div>
        </div>
        <div className="dh-dl-banner-badges">
          <span className="dh-dl-badge dh-dl-badge--total">
            <i className="fas fa-download"></i> {fmtNum(total_downloads)} Downloads
          </span>
          <span className="dh-dl-badge dh-dl-badge--users">
            <i className="fas fa-users"></i> {per_user.length} User{per_user.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Period filter */}
      <div className="dh-activity-filters">
        <div className="dh-filter-group">
          <label className="dh-filter-label">
            <i className="far fa-calendar-alt"></i> Time period
          </label>
          <select className="dh-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DL_DAYS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="dh-dl-stats-row">
        <div className="dh-dl-stat-card">
          <div className="dh-dl-stat-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
            <i className="fas fa-download"></i>
          </div>
          <div className="dh-dl-stat-info">
            <span className="dh-dl-stat-value">{fmtNum(total_downloads)}</span>
            <span className="dh-dl-stat-label">Total Downloads</span>
          </div>
        </div>
        <div className="dh-dl-stat-card">
          <div className="dh-dl-stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="dh-dl-stat-info">
            <span className="dh-dl-stat-value">{top_resumes.length}</span>
            <span className="dh-dl-stat-label">Unique Resumes</span>
          </div>
        </div>
        <div className="dh-dl-stat-card">
          <div className="dh-dl-stat-icon" style={{ background: "#d1fae5", color: "#059669" }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="dh-dl-stat-info">
            <span className="dh-dl-stat-value">{per_user.length}</span>
            <span className="dh-dl-stat-label">Active Users</span>
          </div>
        </div>
        <div className="dh-dl-stat-card">
          <div className="dh-dl-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="dh-dl-stat-info">
            <span className="dh-dl-stat-value">{daily_trend.length > 0 ? Math.round(total_downloads / daily_trend.length) : 0}</span>
            <span className="dh-dl-stat-label">Avg / Day</span>
          </div>
        </div>
      </div>

      {/* Trend chart - line/area */}
      <div className="dh-dl-trend-card">
        <div className="dh-dl-trend-header">
          <div>
            <h3 className="dh-dl-trend-title">
              <i className="fas fa-chart-area" style={{ color: "#6366f1", marginRight: 8 }}></i>
              Daily Download Trend
            </h3>
            <span className="dh-dl-trend-sub">Downloads per day over the selected period</span>
          </div>
        </div>
        {daily_trend.length > 0 ? (() => {
          const trendData = daily_trend.slice().reverse();
          const n = trendData.length;
          const W = 800, H = 240, padL = 45, padR = 20, padT = 30, padB = 40;
          const chartW = W - padL - padR, chartH = H - padT - padB;
          const maxVal = Math.max(...trendData.map((d) => d.downloads), 1);
          const gridLines = 5;
          const _stepY = maxVal / gridLines;

          const pts = trendData.map((d, i) => ({
            x: padL + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2),
            y: padT + chartH - (d.downloads / maxVal) * chartH,
            val: d.downloads,
            date: d.date,
          }));

          // Smooth curve using cubic bezier
          const buildPath = (points) => {
            if (points.length < 2) return `M${points[0].x},${points[0].y}`;
            let path = `M${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
              const p0 = points[Math.max(i - 1, 0)];
              const p1 = points[i];
              const p2 = points[i + 1];
              const p3 = points[Math.min(i + 2, points.length - 1)];
              const tension = 0.3;
              const cp1x = p1.x + (p2.x - p0.x) * tension;
              const cp1y = p1.y + (p2.y - p0.y) * tension;
              const cp2x = p2.x - (p3.x - p1.x) * tension;
              const cp2y = p2.y - (p3.y - p1.y) * tension;
              path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
            }
            return path;
          };

          const linePath = buildPath(pts);
          const areaPath = `${linePath} L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;

          return (
            <div className="dh-dl-line-chart-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="dh-dl-line-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {Array.from({ length: gridLines + 1 }, (_, i) => {
                  const y = padT + (i / gridLines) * chartH;
                  const val = Math.round(maxVal - (i / gridLines) * maxVal);
                  return (
                    <g key={i}>
                      <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={padL - 10} y={y + 4} textAnchor="end" className="dh-dl-svg-label">{val}</text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {pts.map((p, i) => {
                  const showLabel = n <= 10 || i % Math.ceil(n / 8) === 0 || i === n - 1;
                  if (!showLabel) return null;
                  return (
                    <text key={i} x={p.x} y={H - 8} textAnchor="middle" className="dh-dl-svg-label">
                      {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </text>
                  );
                })}

                {/* Area fill */}
                <path d={areaPath} fill="url(#areaGrad)" />

                {/* Line */}
                <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {pts.map((p, i) => (
                  <g key={i} className="dh-dl-point-group">
                    <circle cx={p.x} cy={p.y} r="12" fill="transparent" className="dh-dl-point-hover" />
                    <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2" className="dh-dl-point" />
                    <g className="dh-dl-tooltip-group">
                      <rect x={p.x - 28} y={p.y - 32} width="56" height="22" rx="6" fill="#1e293b" />
                      <text x={p.x} y={p.y - 17} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">{p.val}</text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          );
        })() : (
          <div className="dh-dl-empty">
            <i className="fas fa-chart-line"></i>
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Two-col: Top resumes + Per-user leaderboard */}
      <div className="dh-dl-two-col">
        {/* Top resumes */}
        <div className="dh-dl-section-card">
          <div className="dh-dl-section-header">
            <h3>
              <i className="fas fa-trophy" style={{ color: "#f59e0b", marginRight: 8 }}></i>
              Most Downloaded
            </h3>
            <span className="dh-dl-section-sub">Top resumes by download count</span>
          </div>
          {top_resumes.length > 0 ? (
            <div className="dh-dl-resume-list">
              {top_resumes.slice(0, 10).map((r, i) => (
                <div key={r.resume_id} className="dh-dl-resume-item">
                  <div className={`dh-dl-medal ${i < 3 ? `dh-dl-medal--${i + 1}` : ""}`}>
                    {i + 1}
                  </div>
                  <div className="dh-dl-resume-info">
                    <span className="dh-dl-resume-name">{r.resume_name}</span>
                    <span className="dh-dl-resume-id">{r.resume_id}</span>
                  </div>
                  <div className="dh-dl-resume-stats">
                    <span className="dh-dl-resume-count">{r.download_count}</span>
                    <span className="dh-dl-resume-unique"><i className="fas fa-user"></i> {r.unique_users}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dh-dl-empty">
              <i className="fas fa-file-download"></i>
              <p>No resume downloads yet</p>
            </div>
          )}
        </div>

        {/* Per-user leaderboard */}
        <div className="dh-dl-section-card">
          <div className="dh-dl-section-header">
            <h3>
              <i className="fas fa-user-chart" style={{ color: "#6366f1", marginRight: 8 }}></i>
              Downloads by User
            </h3>
            <span className="dh-dl-section-sub">Click a user to view their full history</span>
          </div>
          {per_user.length > 0 ? (
            <div className="dh-dl-user-list">
              {per_user.map((u, i) => (
                <div key={u.user_id} className="dh-dl-user-item" onClick={() => openUserDetail(u)}>
                  <div className="dh-dl-user-avatar">
                    {(u.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="dh-dl-user-meta">
                    <span className="dh-dl-user-email">{u.email}</span>
                    <span className="dh-dl-user-sub">{u.unique_resumes} unique resume{u.unique_resumes !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="dh-dl-user-count-wrap">
                    <span className="dh-dl-count-badge">{u.download_count}</span>
                    <i className="fas fa-chevron-right" style={{ color: "#d1d5db", fontSize: 11 }}></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dh-dl-empty">
              <i className="fas fa-users"></i>
              <p>No download data for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN DASHBOARD (role-aware, tabbed)
// ══════════════════════════════════════════════════════════
const validTabs = ["dashboard", "locks", "activity", "downloads"];

export default function DashboardHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [barsVisible, setBarsVisible] = useState(false);
  const [activeTab, setActiveTabState] = useState(
    validTabs.includes(tabFromUrl) ? tabFromUrl : "dashboard"
  );
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const admin = isAdmin();

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (tabId === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const data = admin
        ? await apiService.getAdminStats()
        : await apiService.getUserDashboard();
      if (data && !data.message) {
        setDashData(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Header title/subtitle per tab
  const headerByTab = {
    dashboard: { title: "Dashboard", subtitle: getCurrentWeekRange() },
    locks: { title: "Lock Management", subtitle: "Manage all active resume locks" },
    activity: { title: "Activity", subtitle: "Platform activity log" },
    downloads: { title: "Download Analytics", subtitle: "Track resume download activity across the platform" },
  };
  const header = headerByTab[activeTab] || headerByTab.dashboard;

  if (loading && activeTab === "dashboard") {
    return (
      <div className="dh-layout">
        <Sidebar />
        <div className="dh-main">
          {admin && (
            <div className="dh-tab-bar">
              {tabs.map((tab) => (
                <button key={tab.id} className={`dh-tab ${tab.id === "dashboard" ? "dh-tab--active" : ""}`}>
                  <i className={tab.icon}></i> {tab.label}
                </button>
              ))}
            </div>
          )}
          <div className="dh-loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dh-layout">
      <Sidebar />
      <div className="dh-main">
        {admin && (
          <div className="dh-tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`dh-tab ${activeTab === tab.id ? "dh-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <header className="dh-header">
          <div className="dh-header-left">
            <h1 className="dh-header-title">{header.title}</h1>
            <span className="dh-header-subtitle">{header.subtitle}</span>
          </div>
          <div className="dh-header-right">
            {!admin && user && (
              <span className="dh-user-badge">
                <i className="fas fa-user"></i> {user.email || user.name}
              </span>
            )}
          </div>
        </header>

        <main className="dh-content">
          {activeTab === "dashboard" && (
            admin
              ? <AdminDashboard stats={dashData} barsVisible={barsVisible} />
              : <UserDashboard data={dashData} barsVisible={barsVisible} />
          )}
          {activeTab === "locks" && <LocksTab />}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "downloads" && <DownloadsTab />}
        </main>
      </div>
    </div>
  );
}

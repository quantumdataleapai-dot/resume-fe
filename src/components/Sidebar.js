import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import logo from "../logo.png";
import "../styles/Sidebar.css";

const mainNav = [
  { label: "Dashboard", icon: "fas fa-th-large", path: "/dashboard" },
  { label: "Resume Matcher", icon: "fas fa-search", path: "/resume-matcher" },
];

const adminNav = [
  { label: "Users & Roles", icon: "fas fa-user-friends", path: "/users" },
  { label: "Pending Users", icon: "fas fa-user-clock", path: "/pending-users" },
  { label: "Resume Database", icon: "far fa-copy", path: "/resume-database" },
  { label: "Data Connectors", icon: "fas fa-plug", path: "/data-connectors" },
];

const userNav = [
  { label: "Resume Database", icon: "far fa-copy", path: "/resume-database" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");
  const dropdownRef = useRef(null);

  const userName = user?.name || "M. Chandra";
  const userRole = user?.role === "admin" ? "Admin" : "Recruiter";

  useEffect(() => {
    document.body.classList.toggle("sidebar-is-collapsed", collapsed);
    localStorage.setItem("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <i className={`fas fa-chevron-${collapsed ? "right" : "left"}`}></i>
      </button>
      <div className="sidebar-top">
        <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
          <img src={logo} alt="Intelli-Hire" className="sidebar-logo-img" />
          <div className="sidebar-logo-info">
            <span className="sidebar-logo-text">Intelli-Hire</span>
            <span className="sidebar-logo-role">{user?.role === "admin" ? "HR ADMIN" : "RECRUITER"}</span>
          </div>
        </div>

        <div className="sidebar-nav-section">
          <span className="sidebar-nav-label">MAIN</span>
          <nav className="sidebar-nav">
            {mainNav.map((item) => (
              <button
                key={item.label}
                className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {user?.role === "admin" ? (
          <div className="sidebar-nav-section">
            <span className="sidebar-nav-label">ADMIN</span>
            <nav className="sidebar-nav">
              {adminNav.map((item) => (
                <button
                  key={item.label}
                  className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
                </button>
              ))}
            </nav>
          </div>
        ) : (
          <div className="sidebar-nav-section">
            <span className="sidebar-nav-label">RECRUITER</span>
            <nav className="sidebar-nav">
              {userNav.map((item) => (
                <button
                  key={item.label}
                  className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="sidebar-user-wrapper" ref={dropdownRef}>
        {showDropdown && (
          <div className="sidebar-user-dropdown">
            {collapsed && (
              <>
                <div className="sidebar-dropdown-profile">
                  <div className="sidebar-dropdown-avatar">{getInitials(userName)}</div>
                  <div className="sidebar-dropdown-info">
                    <span className="sidebar-dropdown-name">{userName}</span>
                    <span className="sidebar-dropdown-email">{user?.email || ""}</span>
                  </div>
                </div>
                <div className="sidebar-dropdown-divider"></div>
              </>
            )}
            {!collapsed && user?.email && (
              <>
                <div className="sidebar-dropdown-email-row">
                  <i className="fas fa-envelope"></i>
                  <span>{user.email}</span>
                </div>
                <div className="sidebar-dropdown-divider"></div>
              </>
            )}
            <button className="sidebar-dropdown-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign out</span>
            </button>
          </div>
        )}
        <div
          className="sidebar-user"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <div className="sidebar-avatar">{getInitials(userName)}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{userName}</span>
            <span className="sidebar-user-role">{userRole}</span>
          </div>
          <i className={`fas fa-chevron-down sidebar-user-chevron ${showDropdown ? "rotated" : ""}`}></i>
        </div>
      </div>
    </aside>
  );
}

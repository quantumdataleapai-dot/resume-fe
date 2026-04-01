import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ApiService from "../services/apiService";
import { useTheme } from "../utils/ThemeContext";
import "../styles/UsersRoles.css";

const FILTERS = ["All", "Admin", "Recruiter", "Active", "Inactive"];

const AVATAR_COLORS = [
  { bg: "#F0EDEA", text: "#5C6356" },
  { bg: "#FEF3E2", text: "#B45309" },
  { bg: "#FDE8E8", text: "#B91C1C" },
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#D1FAE5", text: "#047857" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#E0E7FF", text: "#3730A3" },
];

function getInitials(email) {
  if (!email) return "?";
  const name = email.split("@")[0];
  return name.split(/[._-]/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarStyle(email) {
  let hash = 0;
  for (let i = 0; i < (email || "").length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { backgroundColor: c.bg, color: c.text };
}

function getRoleLabel(role) {
  if (role === "admin") return "Admin";
  return "Recruiter";
}

function getStatus(user) {
  if (!user.is_active) return "Inactive";
  if (!user.is_approved) return "Pending";
  return "Active";
}

export default function UsersRoles() {
  const { isDark } = useTheme();
  const _t = isDark ? "#e2e8f0" : "#1f2937";
  const _bg = isDark ? "#1e293b" : "#fff";
  const _border = isDark ? "#334155" : "#e5e7eb";
  const _textSec = isDark ? "#94a3b8" : "#374151";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("recruiter");
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await ApiService.getUsers();
      // API returns an array directly
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.success === false) {
        setError(response.message || "Failed to load users");
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!`${u.email} ${u.role}`.toLowerCase().includes(q)) return false;
    }
    const status = getStatus(u);
    if (activeFilter === "All") return true;
    if (activeFilter === "Admin") return u.role === "admin";
    if (activeFilter === "Recruiter") return u.role === "recruiter";
    if (activeFilter === "Active") return status === "Active";
    if (activeFilter === "Inactive") return status === "Inactive";
    return true;
  }).sort((a, b) => {
    // Deactivated recruiters on top
    if (a.role === "recruiter" && b.role === "recruiter") {
      if (!a.is_active && b.is_active) return -1;
      if (a.is_active && !b.is_active) return 1;
    }
    return 0;
  });

  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const recruiters = users.filter((u) => u.role === "recruiter").length;
  const activeUsers = users.filter((u) => u.is_approved && u.is_active).length;

  const statsCards = [
    { label: "Total Users", value: totalUsers, sub: "All registered", color: "#6B7280" },
    { label: "Admins", value: admins, sub: "Full access", color: "#6B7280" },
    { label: "Recruiters", value: recruiters, sub: "Regular access", color: "#10B981" },
    { label: "Active", value: activeUsers, sub: "Currently active", color: "#0b5fff" },
  ];

  const getStatusClass = (status) => {
    if (status === "Active") return "ur-status-active";
    if (status === "Inactive") return "ur-status-inactive";
    if (status === "Pending") return "ur-status-pending";
    return "";
  };

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "ur-role-admin";
    return "ur-role-recruiter";
  };

  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await ApiService.deactivateUser(userId);
      if (response.success) {
        fetchUsers();
      } else {
        alert(response.message || "Failed to deactivate user");
      }
    } catch {
      alert("Failed to deactivate user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await ApiService.activateUser(userId);
      if (response.success) {
        fetchUsers();
      } else {
        alert(response.message || "Failed to activate user");
      }
    } catch {
      alert("Failed to activate user");
    } finally {
      setActionLoading(null);
    }
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
  };

  const handlePatch = (userId) => {
    showConfirm(
      "Change Role",
      "Are you sure you want to promote this recruiter to Admin?",
      async () => {
        closeConfirm();
        setActionLoading(userId);
        try {
          const response = await ApiService.patchUserRole(userId, "admin");
          if (response.success) {
            fetchUsers();
          } else {
            alert(response.message || "Failed to change role");
          }
        } catch {
          alert("Failed to change role");
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateMessage({ type: "", text: "" });
    if (!newEmail || !newPassword) {
      setCreateMessage({ type: "error", text: "Please fill in email and password." });
      return;
    }
    setCreateLoading(true);
    try {
      const response = await ApiService.createUser({ email: newEmail, password: newPassword, role: newRole });
      if (response.success) {
        setCreateMessage({ type: "success", text: response.message || "User created successfully!" });
        setNewEmail("");
        setNewPassword("");
        setNewRole("recruiter");
        fetchUsers();
      } else {
        setCreateMessage({ type: "error", text: response.message || "Failed to create user" });
      }
    } catch {
      setCreateMessage({ type: "error", text: "Failed to create user" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = (userId) => {
    showConfirm(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      async () => {
        closeConfirm();
        setActionLoading(userId);
        try {
          const response = await ApiService.deleteUser(userId);
          if (response.success) {
            setUsers((prev) => prev.filter((u) => u.id !== userId));
          } else {
            alert(response.message || "Failed to delete user");
          }
        } catch {
          alert("Failed to delete user");
        } finally {
          setActionLoading(null);
        }
      }
    );
  };


  return (
    <div className="ur-layout">
      <Sidebar />
      <div className="ur-main">
        <header className="ur-header">
          <div className="ur-header-left">
            <h1 className="ur-header-title">Users & Roles</h1>
            <span className="ur-header-subtitle">Manage team access and permissions</span>
          </div>
        </header>

        <main className="ur-content">
          <div className="ur-stats-grid">
            {statsCards.map((stat, i) => (
              <div key={i} className="ur-stat-card">
                <span className="ur-stat-label">{stat.label}</span>
                <span className="ur-stat-value">{stat.value}</span>
                <span className="ur-stat-sub" style={{ color: stat.color }}>
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Create New User */}
          <div className="ur-table-card" style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px 0" }}>
              <div>
                <h3 className="ur-table-title" style={{ marginBottom: "0", fontSize: "14px" }}>Create New User</h3>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>Add a new admin or recruiter (auto-approved)</p>
              </div>
              {createMessage.text && (
                <div style={{
                  padding: "4px 12px", borderRadius: "6px", fontSize: "12px",
                  background: createMessage.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${createMessage.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                  color: createMessage.type === "success" ? "#16a34a" : "#dc2626",
                }}>
                  {createMessage.text}
                </div>
              )}
            </div>
            <form onSubmit={handleCreateUser} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px 12px" }}>
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={createLoading}
                style={{
                  flex: 2, padding: "7px 12px", borderRadius: "7px", border: `1px solid ${_border}`,
                  fontSize: "13px", color: _t, background: _bg, outline: "none",
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={createLoading}
                style={{
                  flex: 2, padding: "7px 12px", borderRadius: "7px", border: `1px solid ${_border}`,
                  fontSize: "13px", color: _t, background: _bg, outline: "none",
                }}
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={createLoading}
                style={{
                  flex: 1, padding: "7px 12px", borderRadius: "7px", border: `1px solid ${_border}`,
                  fontSize: "13px", color: _t, background: _bg, cursor: "pointer",
                }}
              >
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  padding: "7px 20px", borderRadius: "7px", border: "none",
                  background: "#10B981", color: "#fff", fontSize: "13px", fontWeight: 600,
                  cursor: createLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                  opacity: createLoading ? 0.7 : 1,
                }}
              >
                {createLoading ? "Creating..." : "Create"}
              </button>
            </form>
          </div>

          <div className="ur-table-card">
            <div className="ur-table-header">
              <h3 className="ur-table-title">All users</h3>
              <button className="ur-invite-btn" onClick={fetchUsers} disabled={loading}>
                <i className="fas fa-sync-alt" style={{ marginRight: 6 }}></i>
                Refresh
              </button>
            </div>

            {error && (
              <div style={{ padding: "12px 20px", background: "#fef2f2", borderBottom: "1px solid #fecaca", color: "#dc2626", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <div className="ur-search-bar">
              <i className="fas fa-search ur-search-icon"></i>
              <input
                type="text"
                placeholder="Search by email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="ur-filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`ur-filter-chip ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="ur-table-wrapper">
              <table className="ur-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIVE LOCKS</th>
                    <th>DOWNLOADS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="ur-empty">Loading users...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="ur-empty">No users match your search or filter.</td>
                    </tr>
                  ) : (
                    filtered.map((user) => {
                      const status = getStatus(user);
                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="ur-user-cell">
                              <div className="ur-user-avatar" style={getAvatarStyle(user.email)}>
                                {getInitials(user.email)}
                              </div>
                              <span className="ur-user-name">
                                {user.email.split("@")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="ur-email">{user.email}</td>
                          <td>
                            <span className={`ur-role-badge ${getRoleBadgeClass(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td>
                            <span className={`ur-status-badge ${getStatusClass(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="ur-last-active">{user.created_at || "—"}</td>
                          <td className="ur-matches">
                            {user.active_locks > 0 ? (
                              <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                background: "#fef3c7",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                borderRadius: "12px",
                                padding: "2px 10px",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}>
                                <i className="fas fa-lock" style={{ fontSize: "11px" }}></i>
                                {user.active_locks}
                              </span>
                            ) : (
                              <span style={{ color: "#9ca3af" }}>—</span>
                            )}
                          </td>
                          <td className="ur-matches">{user.total_downloads || "—"}</td>
                          <td>
                            {user.role === "recruiter" && (
                              <div className="ur-actions">
                                {user.is_active ? (
                                  <button
                                    className="ur-action-btn ur-action-deactivate"
                                    onClick={() => handleDeactivate(user.id)}
                                    disabled={actionLoading === user.id}
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    className="ur-action-btn"
                                    style={{ background: "#10B981", color: "#fff", border: "none" }}
                                    onClick={() => handleActivate(user.id)}
                                    disabled={actionLoading === user.id}
                                  >
                                    Activate
                                  </button>
                                )}
                                <button
                                  className="ur-action-btn"
                                  title="Change Role to Admin"
                                  onClick={() => handlePatch(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  Patch
                                </button>
                                <button
                                  className="ur-action-btn"
                                  style={{ color: "#DC2626", borderColor: "#fecaca" }}
                                  onClick={() => handleDelete(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 36, 0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
          onClick={closeConfirm}
        >
          <div
            style={{
              background: _bg, borderRadius: "16px", padding: "28px 32px",
              width: "400px", maxWidth: "calc(100% - 32px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: `1px solid ${_border}`,
              animation: "slideIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: confirmModal.title === "Delete User" ? "#fef2f2" : "#f0f5ff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i
                  className={confirmModal.title === "Delete User" ? "fas fa-trash-alt" : "fas fa-user-shield"}
                  style={{
                    color: confirmModal.title === "Delete User" ? "#DC2626" : "#0b5fff",
                    fontSize: "16px",
                  }}
                ></i>
              </div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: _t }}>
                {confirmModal.title}
              </h3>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: isDark ? "#94a3b8" : "#6b7280", lineHeight: 1.6 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={closeConfirm}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: `1px solid ${_border}`,
                  background: _bg, color: _textSec, fontSize: "14px", fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "none",
                  background: confirmModal.title === "Delete User"
                    ? "linear-gradient(135deg, #DC2626 0%, #b91c1c 100%)"
                    : "linear-gradient(135deg, #0b5fff 0%, #0950d1 100%)",
                  color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  boxShadow: confirmModal.title === "Delete User"
                    ? "0 2px 8px rgba(220,38,38,0.25)"
                    : "0 2px 8px rgba(11,95,255,0.25)",
                }}
              >
                {confirmModal.title === "Delete User" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

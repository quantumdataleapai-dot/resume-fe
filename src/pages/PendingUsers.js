import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ApiService from "../services/apiService";
import "../styles/UsersRoles.css";

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
  return name.slice(0, 2).toUpperCase();
}

function getAvatarStyle(email) {
  let hash = 0;
  for (let i = 0; i < (email || "").length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { backgroundColor: c.bg, color: c.text };
}

export default function PendingUsers() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await ApiService.getPendingUsers();
      if (response.success) {
        setPendingUsers(response.pending_users || []);
      } else {
        setError(response.message || "Failed to load pending users");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await ApiService.approveUser(userId);
      if (response.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(response.message || "Failed to approve user");
      }
    } catch {
      alert("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await ApiService.rejectUser(userId);
      if (response.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(response.message || "Failed to reject user");
      }
    } catch {
      alert("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ur-layout">
      <Sidebar />
      <div className="ur-main">
        <header className="ur-header">
          <div className="ur-header-left">
            <h1 className="ur-header-title">Pending Users</h1>
            <span className="ur-header-subtitle">
              Review and approve user registration requests
            </span>
          </div>
        </header>

        <main className="ur-content">
          {/* Stats */}
          <div className="ur-stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className="ur-stat-card">
              <span className="ur-stat-label">Pending Requests</span>
              <span className="ur-stat-value">{pendingUsers.length}</span>
              <span className="ur-stat-sub" style={{ color: pendingUsers.length > 0 ? "#DC2626" : "#10B981" }}>
                {pendingUsers.length > 0 ? "Awaiting your approval" : "All caught up"}
              </span>
            </div>
            <div className="ur-stat-card">
              <span className="ur-stat-label">Latest Request</span>
              <span className="ur-stat-value" style={{ fontSize: "16px" }}>
                {pendingUsers.length > 0 ? pendingUsers[0].created_at : "—"}
              </span>
              <span className="ur-stat-sub" style={{ color: "#6B7280" }}>
                {pendingUsers.length > 0 ? pendingUsers[0].email : "No pending requests"}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="ur-table-card">
            <div className="ur-table-header">
              <h3 className="ur-table-title">Pending Approvals</h3>
              <button
                className="ur-invite-btn"
                onClick={fetchPendingUsers}
                disabled={loading}
              >
                <i className="fas fa-sync-alt" style={{ marginRight: 6 }}></i>
                Refresh
              </button>
            </div>

            {error && (
              <div style={{ padding: "12px 20px", background: "#fef2f2", borderBottom: "1px solid #fecaca", color: "#dc2626", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <div className="ur-table-wrapper">
              <table className="ur-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>REQUESTED ON</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="ur-empty">
                        Loading pending users...
                      </td>
                    </tr>
                  ) : pendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="ur-empty">
                        No pending user requests.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="ur-user-cell">
                            <div
                              className="ur-user-avatar"
                              style={getAvatarStyle(user.email)}
                            >
                              {getInitials(user.email)}
                            </div>
                            <span className="ur-user-name">
                              {user.name || user.email.split("@")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="ur-email">{user.email}</td>
                        <td>
                          <span className="ur-role-badge ur-role-recruiter">
                            {user.role || "Recruiter"}
                          </span>
                        </td>
                        <td className="ur-last-active">
                          {user.created_at || "—"}
                        </td>
                        <td>
                          <div className="ur-actions">
                            <button
                              className="ur-action-btn"
                              style={{
                                background: "#10B981",
                                color: "#fff",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: actionLoading === user.id ? "not-allowed" : "pointer",
                                opacity: actionLoading === user.id ? 0.6 : 1,
                              }}
                              onClick={() => handleApprove(user.id)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? "..." : "Approve"}
                            </button>
                            <button
                              className="ur-action-btn"
                              style={{
                                background: "#fff",
                                color: "#DC2626",
                                border: "1px solid #fecaca",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: actionLoading === user.id ? "not-allowed" : "pointer",
                                opacity: actionLoading === user.id ? 0.6 : 1,
                              }}
                              onClick={() => handleReject(user.id)}
                              disabled={actionLoading === user.id}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

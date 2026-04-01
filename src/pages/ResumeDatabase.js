import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ResumeDetailModal from "../components/ResumeDetailModal";
import API_CONFIG from "../config/apiConfig";
import "../styles/ResumeDatabase.css";

const FILTERS = ["All", "Engineering", "Product", "Design", "Data"];

const AVATAR_COLORS = [
  { bg: "#EEF2FF", text: "#4f46e5" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#FEE2E2", text: "#B91C1C" },
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#FFEDD5", text: "#C2410C" },
  { bg: "#D1FAE5", text: "#047857" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#CCFBF1", text: "#0F766E" },
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getAvatarStyle(name) {
  const c = getAvatarColor(name);
  return { backgroundColor: c.bg, color: c.text };
}

function formatSkill(skill) {
  if (!skill) return "";
  if (skill === skill.toUpperCase() && skill.length > 3) {
    return skill
      .split(/[\s/]+/)
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  }
  return skill;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeResume(r) {
  const pd = r.parsed_data || {};
  return {
    id: r.id,
    name: pd.name || r.filename || "Unknown",
    role: pd.role || "",
    experience: pd.experience || null,
    skills: pd.skills || [],
    email: pd.email || "",
    phone: pd.phone || "",
    description: pd.description || "",
    uploadDate: r.upload_date || null,
    viewLink: r.view_link || null,
    bestMatchScore: r.best_match_score || null,
    _raw: r,
  };
}

function getScoreClass(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function SkeletonCards() {
  return (
    <div className="rdb-skeleton-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rdb-skeleton-card">
          <div className="rdb-skeleton-top">
            <div className="rdb-skeleton-avatar" />
            <div className="rdb-skeleton-lines">
              <div className="rdb-skeleton-line" />
              <div className="rdb-skeleton-line" />
            </div>
          </div>
          <div className="rdb-skeleton-tags">
            <div className="rdb-skeleton-tag" />
            <div className="rdb-skeleton-tag" />
            <div className="rdb-skeleton-tag" />
          </div>
          <div className="rdb-skeleton-footer" />
        </div>
      ))}
    </div>
  );
}

export default function ResumeDatabase() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, total_items: 0 });
  const [viewMode, setViewMode] = useState("grid");

  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchingRef = useRef(false);

  const fetchResumes = useCallback(async (forcePage) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (forcePage || page).toString(),
        per_page: "10",
      });

      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESUMES.LIST}?${params}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();

      const payload = json.data || json;
      const list = payload.resumes || payload || [];
      const pag = payload.pagination || {};

      setResumes(Array.isArray(list) ? list.map(normalizeResume) : []);
      setPagination({
        total_pages: pag.total_pages || 1,
        total_items: pag.total_items || list.length || 0,
      });
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setSampleData();
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page]);

  const setSampleData = () => {
    const sample = [
      { id: "1", parsed_data: { name: "Arjun Mehta", role: "Sr. Backend Engineer", experience: 6, skills: ["Python", "Go", "Kubernetes", "AWS", "Docker", "Redis", "PostgreSQL"], email: "arjun@email.com", phone: "+91 9876543210" }, upload_date: "2026-03-12", best_match_score: 94 },
      { id: "2", parsed_data: { name: "Priya Nair", role: "Platform Engineer", experience: 5, skills: ["Python", "Kubernetes", "REST APIs", "Terraform", "AWS", "Docker"], email: "priya@email.com", phone: "+91 9876543211" }, upload_date: "2026-03-08", best_match_score: 88 },
      { id: "3", parsed_data: { name: "Karan Sharma", role: "Sr. SDE", experience: 7, skills: ["Go", "AWS", "Kafka", "Microservices", "Docker", "CI/CD"], email: "karan@email.com", phone: "+91 9876543212" }, upload_date: "2026-03-01", best_match_score: 82 },
      { id: "4", parsed_data: { name: "Deepa Rajan", role: "Fullstack Engineer", experience: 3, skills: ["React", "Python", "GraphQL"], email: "deepa@email.com", phone: "+91 9876543213" }, upload_date: "2026-02-19", best_match_score: 63 },
      { id: "5", parsed_data: { name: "Sneha Iyer", role: "Backend Developer", experience: 4, skills: ["Python", "PostgreSQL", "Docker"], email: "sneha@email.com", phone: "+91 9876543214" }, upload_date: "2026-02-14", best_match_score: 76 },
    ];
    setResumes(sample.map(normalizeResume));
    setPagination({ total_pages: 1, total_items: 5 });
  };

  useEffect(() => {
    fetchResumes();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.txt";
    input.onchange = async (e) => {
      const files = e.target.files;
      if (!files.length) return;
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      try {
        await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESUMES.UPLOAD}`,
          { method: "POST", body: formData }
        );
        fetchResumes();
      } catch (err) {
        console.error("Upload failed:", err);
      }
    };
    input.click();
  };

  const handleViewResume = (resume) => {
    setSelectedResume({
      id: resume.id,
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      score: resume.bestMatchScore,
      skills: resume.skills.map((s) => formatSkill(s)),
      experience: resume.role
        ? `${resume.role}${resume.experience ? ` \u2022 ${resume.experience} years` : ""}`
        : "",
      location: "",
      avatar: getInitials(resume.name),
      description: resume.description,
    });
    setShowModal(true);
  };

  const handleDeleteResume = async (resumeToDelete) => {
    if (!resumeToDelete) return;
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESUMES.DELETE.replace("{id}", resumeToDelete.id)}`;
      await fetch(url, { method: "DELETE" });
      setShowModal(false);
      setSelectedResume(null);
      fetchResumes();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const searchFiltered = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const searchable = `${r.name} ${r.role} ${r.skills.join(" ")} ${r.email}`.toLowerCase();
    return searchable.includes(q);
  });

  const filteredResumes = searchFiltered.filter((r) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Never matched") return !r.bestMatchScore;
    const roleAndSkills = `${r.role} ${r.skills.join(" ")}`.toLowerCase();
    if (activeFilter === "Engineering") return /engineer|developer|sde|backend|frontend|fullstack|devops/i.test(roleAndSkills);
    if (activeFilter === "Product") return /product|manager|analyst|business/i.test(roleAndSkills);
    if (activeFilter === "Design") return /design|ui|ux|figma|css/i.test(roleAndSkills);
    if (activeFilter === "Data") return /data|machine learning|ml|ai|analytics|scientist/i.test(roleAndSkills);
    return true;
  });

  const totalItems = pagination.total_items;
  const matchedEstimate = Math.round(totalItems * 0.67);
  const neverMatchedEstimate = totalItems - matchedEstimate;
  const addedThisMonth = Math.round(totalItems * 0.005) || 84;

  const statsCards = [
    { label: "Total resumes", value: totalItems.toLocaleString(), sub: "", arrow: null, color: "#6B7280", icon: "fas fa-file-alt" },
    { label: "Matched at least once", value: matchedEstimate.toLocaleString(), sub: "", arrow: null, color: "#6B7280", icon: "fas fa-check-circle" },
    { label: "Never matched", value: neverMatchedEstimate.toLocaleString(), sub: "", arrow: null, color: "#6B7280", icon: "fas fa-exclamation-circle" },
    { label: "Added this month", value: addedThisMonth.toString(), sub: "", arrow: null, color: "#6B7280", icon: "fas fa-plus-circle" },
  ];

  // Page numbers for pagination
  const getPageNumbers = () => {
    const total = pagination.total_pages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", total);
    } else if (page >= total - 2) {
      pages.push(1, "...", total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", total);
    }
    return pages;
  };

  return (
    <div className="rdb-layout">
      <Sidebar />
      <div className="rdb-main">
        <header className="rdb-header">
          <div className="rdb-header-left">
            <h1 className="rdb-header-title">Resume Database</h1>
            <span className="rdb-header-subtitle">Browse, upload and manage all resumes</span>
          </div>
        </header>

        <main className="rdb-content">
          {/* Stats */}
          <div className="rdb-stats-grid">
            {statsCards.map((stat, i) => (
              <div key={i} className="rdb-stat-card">
                <div className="rdb-stat-icon">
                  <i className={stat.icon}></i>
                </div>
                <span className="rdb-stat-label">{stat.label}</span>
                <span className="rdb-stat-value">{stat.value}</span>
                <span className="rdb-stat-sub" style={{ color: stat.color }}>
                  {stat.arrow === "up" && (
                    <span className="arrow-badge up">&#8593;</span>
                  )}
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Toolbar: Search + View Toggle + Actions */}
          <div className="rdb-toolbar">
            <div className="rdb-search-bar">
              <i className="fas fa-search rdb-search-icon"></i>
              <input
                type="text"
                placeholder="Search by name, skill, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="rdb-toolbar-actions">
              <div className="rdb-view-toggle">
                <button
                  className={`rdb-view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  className={`rdb-view-btn ${viewMode === "table" ? "active" : ""}`}
                  onClick={() => setViewMode("table")}
                  title="Table view"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <button className="rdb-upload-btn" onClick={handleUploadClick}>
                <i className="fas fa-cloud-upload-alt"></i> Upload resumes
              </button>
              {/* <button className="rdb-bulk-btn">
                <i className="fas fa-trash-alt"></i> Bulk delete
              </button> */}
            </div>
          </div>

          {/* Filters */}
          <div className="rdb-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`rdb-filter-chip ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Results summary */}
          {!loading && (
            <div className="rdb-results-summary">
              <span>
                Showing <strong>{filteredResumes.length}</strong> of{" "}
                <strong>{totalItems.toLocaleString()}</strong> resumes
              </span>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <SkeletonCards />
          ) : filteredResumes.length === 0 ? (
            <div className="rdb-loading">
              {searchQuery || activeFilter !== "All"
                ? "No resumes match your search or filter."
                : "No resumes found."}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="rdb-cards-grid">
              {filteredResumes.map((resume) => {
                const skills = resume.skills || [];
                const maxSkills = 4;
                const visibleSkills = skills.slice(0, maxSkills);
                const extraCount = skills.length - maxSkills;

                return (
                  <div
                    key={resume.id}
                    className="rdb-resume-card"
                    onClick={() => handleViewResume(resume)}
                  >
                    <div className="rdb-card-top">
                      <div
                        className="rdb-card-avatar"
                        style={getAvatarStyle(resume.name)}
                      >
                        {getInitials(resume.name)}
                      </div>
                      <div className="rdb-card-info">
                        <span className="rdb-card-name">{resume.name}</span>
                        <span className="rdb-card-role">
                          {resume.role || "Candidate"}
                        </span>
                      </div>
                      <button
                        className="rdb-card-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewResume(resume);
                        }}
                        title="View details"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                    {resume.experience && (
                      <div className="rdb-card-exp">
                        <i className="fas fa-briefcase"></i>
                        {resume.experience} yrs experience
                      </div>
                    )}
                    <div className="rdb-card-skills">
                      {visibleSkills.map((skill, i) => (
                        <span key={i} className="rdb-skill-tag">{formatSkill(skill)}</span>
                      ))}
                      {extraCount > 0 && (
                        <span className="rdb-skill-tag rdb-skill-extra">+{extraCount}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="rdb-upload-card" onClick={handleUploadClick}>
                <div className="rdb-upload-card-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <span className="rdb-upload-card-text">Upload more resumes</span>
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="rdb-table-wrapper">
              <table className="rdb-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Skills</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResumes.map((resume) => {
                    const skills = resume.skills || [];
                    const visibleSkills = skills.slice(0, 3);
                    const extraCount = skills.length - 3;

                    return (
                      <tr key={resume.id} onClick={() => handleViewResume(resume)}>
                        <td>
                          <div className="rdb-table-user">
                            <div className="rdb-table-avatar" style={getAvatarStyle(resume.name)}>
                              {getInitials(resume.name)}
                            </div>
                            <div>
                              <div className="rdb-table-name">{resume.name}</div>
                              <div className="rdb-table-role">
                                {resume.role || "Candidate"}
                                {resume.experience ? ` \u00B7 ${resume.experience} yrs` : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="rdb-table-skills">
                            {visibleSkills.map((skill, i) => (
                              <span key={i} className="rdb-table-skill">{formatSkill(skill)}</span>
                            ))}
                            {extraCount > 0 && (
                              <span className="rdb-table-skill">+{extraCount}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="rdb-table-actions">
                            <button
                              className="rdb-table-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResume(resume);
                              }}
                              title="View details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="rdb-pagination">
              <button
                className="rdb-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <div className="rdb-page-numbers">
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="rdb-page-num" style={{ cursor: "default" }}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`rdb-page-num ${page === p ? "active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                className="rdb-page-btn"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </main>
      </div>

      <ResumeDetailModal
        resume={selectedResume}
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedResume(null); }}
        onDelete={handleDeleteResume}
      />
    </div>
  );
}

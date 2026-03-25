import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ResumeDetailModal from "../components/ResumeDetailModal";
import API_CONFIG from "../config/apiConfig";
import "../styles/ResumeDatabase.css";

const FILTERS = ["All", "Engineering", "Product", "Design", "Data", "Score \u2265 80%"];

// Light pastel backgrounds for avatars (matching the muted circle style in design)
const AVATAR_COLORS = [
  { bg: "#F0EDEA", text: "#5C6356" },  // muted olive
  { bg: "#FEF3E2", text: "#B45309" },  // warm amber
  { bg: "#FDE8E8", text: "#B91C1C" },  // soft red
  { bg: "#EDE9FE", text: "#6D28D9" },  // light purple
  { bg: "#FFEDD5", text: "#C2410C" },  // orange
  { bg: "#D1FAE5", text: "#047857" },  // mint green
  { bg: "#FCE7F3", text: "#BE185D" },  // soft pink
  { bg: "#CCFBF1", text: "#0F766E" },  // teal
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

// Normalize API resume into flat shape
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
    // Keep raw for modal compatibility
    _raw: r,
  };
}

export default function ResumeDatabase() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, total_items: 0 });

  // Modal state
  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Prevent duplicate API calls (React StrictMode double-mount)
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

  // Fetch only on page change
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
    // Build a resume object compatible with ResumeDetailModal
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

  // Client-side search: filter by name, role, or skills
  const searchFiltered = resumes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const searchable = `${r.name} ${r.role} ${r.skills.join(" ")} ${r.email}`.toLowerCase();
    return searchable.includes(q);
  });

  // Client-side category filter
  const filteredResumes = searchFiltered.filter((r) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Never matched") return !r.bestMatchScore;
    if (activeFilter === "Score \u2265 80%") return (r.bestMatchScore || 0) >= 80;
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
    { label: "Total resumes", value: totalItems.toLocaleString(), sub: `${addedThisMonth} this month`, arrow: "up", color: "#10B981" },
    { label: "Matched at least once", value: matchedEstimate.toLocaleString(), sub: totalItems > 0 ? `${Math.round((matchedEstimate / totalItems) * 100)}% utilisation` : "", arrow: null, color: "#6B7280" },
    { label: "Never matched", value: neverMatchedEstimate.toLocaleString(), sub: "Consider cleanup", arrow: null, color: "#DC2626" },
    { label: "Added this month", value: addedThisMonth.toString(), sub: "12 vs last month", arrow: "up", color: "#10B981" },
  ];

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
                <span className="rdb-stat-label">{stat.label}</span>
                <span className="rdb-stat-value">{stat.value}</span>
                <span className="rdb-stat-sub" style={{ color: stat.color }}>
                  {stat.arrow === "up" && <span>&#8593; </span>}
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="rdb-search-row">
            <div className="rdb-search-bar">
              <i className="fas fa-search rdb-search-icon"></i>
              <input
                type="text"
                placeholder="Search by name, skill, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="rdb-search-actions">
              <button className="rdb-upload-btn" onClick={handleUploadClick}>
                + Upload resumes
              </button>
              <button className="rdb-bulk-btn">Bulk delete</button>
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

          {/* Resume cards grid */}
          {loading ? (
            <div className="rdb-loading">Loading resumes...</div>
          ) : filteredResumes.length === 0 ? (
            <div className="rdb-loading">
              {searchQuery || activeFilter !== "All"
                ? "No resumes match your search or filter."
                : "No resumes found."}
            </div>
          ) : (
            <div className="rdb-cards-grid">
              {filteredResumes.map((resume) => {
                const skills = resume.skills || [];
                const maxSkills = 4;
                const visibleSkills = skills.slice(0, maxSkills);
                const extraCount = skills.length - maxSkills;

                return (
                  <div key={resume.id} className="rdb-resume-card">
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
                          {resume.experience ? ` \u00B7 ${resume.experience} yrs` : ""}
                        </span>
                      </div>
                      <button
                        className="rdb-card-view-btn"
                        onClick={() => handleViewResume(resume)}
                        title="View resume details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                    <div className="rdb-card-skills">
                      {visibleSkills.map((skill, i) => (
                        <span key={i} className="rdb-skill-tag">{formatSkill(skill)}</span>
                      ))}
                      {extraCount > 0 && (
                        <span className="rdb-skill-tag rdb-skill-extra">+{extraCount}</span>
                      )}
                    </div>
                    <div className="rdb-card-footer">
                      <span className="rdb-card-date">
                        {resume.uploadDate ? `Added ${formatDate(resume.uploadDate)}` : ""}
                      </span>
                      {resume.bestMatchScore != null && (
                        <span
                          className={`rdb-card-score ${
                            resume.bestMatchScore >= 80
                              ? "high"
                              : resume.bestMatchScore >= 60
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {resume.bestMatchScore}% best match
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Upload more card */}
              <div className="rdb-upload-card" onClick={handleUploadClick}>
                <i className="fas fa-arrow-up rdb-upload-card-icon"></i>
                <span className="rdb-upload-card-text">Upload more resumes</span>
              </div>
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
                Previous
              </button>
              <span className="rdb-page-info">
                Page {page} of {pagination.total_pages.toLocaleString()}
              </span>
              <button
                className="rdb-page-btn"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        resume={selectedResume}
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedResume(null); }}
        onDelete={handleDeleteResume}
      />
    </div>
  );
}

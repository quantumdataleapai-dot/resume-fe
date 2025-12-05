import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AIChat from "../components/AIChat";
import FileUpload from "../components/FileUpload";
import apiService from "../services/apiService";
import API_CONFIG from "../config/apiConfig";
import "../styles/DashboardNew.css";

// Sample data
const sampleResumes = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    score: 92,
    skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"],
    experience: "Senior Frontend Developer • 6 years",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    location: "Seattle, WA",
    score: 85,
    skills: ["Python", "React", "Django", "PostgreSQL"],
    experience: "Full Stack Developer • 4 years",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 987-6543",
    location: "Austin, TX",
    score: 78,
    skills: ["JavaScript", "Vue.js", "CSS", "Figma"],
    experience: "UI Developer • 3 years",
    avatar: "ER",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "+1 (555) 456-7890",
    location: "New York, NY",
    score: 65,
    skills: ["Java", "Spring Boot", "MySQL", "REST APIs"],
    experience: "Backend Developer • 2 years",
    avatar: "JW",
  },
  {
    id: 5,
    name: "Lisa Park",
    email: "lisa.park@email.com",
    phone: "+1 (555) 678-9012",
    location: "Los Angeles, CA",
    score: 88,
    skills: ["React Native", "TypeScript", "Firebase", "Redux"],
    experience: "Mobile Developer • 5 years",
    avatar: "LP",
  },
];

export default function DashboardNew() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visaRequirement, setVisaRequirement] = useState("H1 Visa");
  const [jobLocation, setJobLocation] = useState("all");

  const handleLogout = () => {
    navigate("/");
  };

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      window.alert("Please enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Prepare JSON payload for API request
      const payload = {
        job_description: jobDescription,
        visa_requirement: visaRequirement,
        job_location: jobLocation,
      };

      // Make API call to process job description and match resumes
      const response = await fetch(
        "http://10.30.0.104:8006/api/jobs/process-text-and-match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Job matching response:", result);

      // The backend may return matches under various keys. Try several common shapes.
      let items = [];
      if (Array.isArray(result)) items = result;
      else if (Array.isArray(result.matches)) items = result.matches;
      else if (result.data && Array.isArray(result.data.matches)) items = result.data.matches;
      else if (Array.isArray(result.data)) items = result.data;
      else if (Array.isArray(result.matched_resumes)) items = result.matched_resumes;
      else if (Array.isArray(result.matched)) items = result.matched;
      else if (Array.isArray(result.items)) items = result.items;
      else if (Array.isArray(result.results)) items = result.results;

      if (items.length === 0) {
        // No array found — try to see if API returned a single object with a "match" field
        if (result.match && Array.isArray(result.match)) items = result.match;
      }

      if (items.length > 0) {
        const normalized = items.map((r, idx) => ({
          id: r.id || r._id || idx + 1,
          name: r.name || r.original_name || r.filename || r.title || "Unknown",
          email: r.email || r.parsed_data?.email || r.contact_email || "",
          phone: r.phone || r.contact_number || r.parsed_data?.contact_number || "",
          location: r.location || r.parsed_data?.location || r.city || "",
          score: r.score || r.match_score || r.similarity || 0,
          skills: r.skills || r.parsed_data?.skills || r.tags || [],
          experience: r.experience || r.experience_years || r.parsed_data?.experience_years || "",
          avatar: (r.name || r.original_name) ? ((r.name || r.original_name).split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
        }));
        setResumes(normalized);
        // clear search to ensure matched resumes are visible
        setSearchQuery("");
      } else {
        // No matched items — show message and keep existing resumes
        console.warn("No matched resumes returned from API");
        window.alert("No matched resumes were returned by the server.");
      }
    } catch (err) {
      console.error("Job analysis error:", err);
      setError(err.message || "Failed to analyze job and match resumes");
      window.alert("Error: " + (err.message || "Failed to analyze job"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setError(null);
      const response = await fetch(
        "http://10.30.0.104:8006/api/resumes/download-all?format=zip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Resumes downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download resumes");
      window.alert("Error: " + (err.message || "Failed to download resumes"));
    }
  };

  const handleUploadResume = async () => {
    try {
      setError(null);

      // Create an invisible file input to prompt user
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf,.doc,.docx";

      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const formData = new FormData();
        // use 'files' field name - backend may accept other names
        files.forEach((f) => formData.append("files", f));

        try {
          const resp = await fetch("http://10.30.0.104:8006/api/resumes/upload", {
            method: "POST",
            body: formData,
          });

          if (!resp.ok) {
            const txt = await resp.text();
            console.error("Upload error response:", txt);
            throw new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
          }

          // On success, refresh resume list
          const data = await apiService.getResumes(1, 10);
          let items = [];
          if (!data) items = [];
          else if (Array.isArray(data)) items = data;
          else if (data.resumes && Array.isArray(data.resumes)) items = data.resumes;
          else if (data.data && Array.isArray(data.data)) items = data.data;

          const normalized = items.map((r, idx) => ({
            id: r.id || r._id || idx + 1,
            name: r.name || r.original_name || r.filename || "Unknown",
            email: r.email || r.parsed_data?.email || "",
            phone: r.phone || r.contact_number || r.parsed_data?.contact_number || "",
            location: r.location || r.parsed_data?.location || "",
            score: r.score || r.match_score || 0,
            skills: r.skills || r.parsed_data?.skills || [],
            experience: r.experience || r.experience_years || r.parsed_data?.experience_years || "",
            avatar: (r.name || r.original_name) ? ((r.name || r.original_name).split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
          }));

          setResumes(normalized);
          window.alert("Upload successful");
        } catch (uploadErr) {
          console.error("Upload failed:", uploadErr);
          window.alert("Upload failed: " + (uploadErr.message || "Unknown error"));
        }
      };

      // Trigger file picker
      input.click();
    } catch (err) {
      console.error("Upload resume handler error:", err);
      setError(err.message || "Failed to upload resume");
      window.alert("Error: " + (err.message || "Failed to upload resume"));
    }
  };

  // Use resumes from backend; do not fall back to sample data so dashboard shows real data
  const sourceResumes = resumes;

  const filteredResumes = sourceResumes.filter((resume) =>
    (resume.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resume.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "score-excellent";
    if (score >= 70) return "score-good";
    return "score-fair";
  };

  // Fetch resumes from backend when dashboard loads
  React.useEffect(() => {
    let mounted = true;
    const fetchResumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESUMES.LIST}`;
        const resp = await fetch(url, { method: "GET" });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`Failed to fetch resumes: ${resp.status} ${resp.statusText} ${txt}`);
        }

        const data = await resp.json();

        // API returns { success: true, data: { resumes: [...], pagination: {...} } }
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data.resumes)) {
          items = data.resumes;
        } else if (data.data && Array.isArray(data.data.resumes)) {
          items = data.data.resumes;
        } else if (Array.isArray(data.data)) {
          items = data.data;
        } else if (Array.isArray(data.items)) {
          items = data.items;
        } else if (Array.isArray(data.results)) {
          items = data.results;
        }

        const normalized = items.map((r, idx) => {
          const p = r.parsed_data || {};
          return {
            id: r.id || r._id || idx + 1,
            name: p.name || r.name || r.filename || "Unknown",
            email: p.email || r.email || "",
            phone: p.contact_number || r.contact_number || "",
            location: p.location || p.description || r.location || "",
            score: (r.match_score || r.score || 0) || 0,
            skills: Array.isArray(p.skills) ? p.skills : (r.skills || []),
            experience: p.experience_years || r.experience || "",
            avatar: (p.name || r.name || r.filename) ? ((p.name || r.name || r.filename).split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
          };
        });

        if (mounted) setResumes(normalized);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
        if (mounted) setError(err.message || "Failed to load resumes");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchResumes();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: "Total Resumes", value: sourceResumes.length, icon: "📄" },
    { label: "Excellent Matches", value: sourceResumes.filter(r=> (r.score||0) >= 85).length, icon: "📈" },
    { label: "Candidates Reviewed", value: sourceResumes.length, icon: "👥" },
  ];


  return (
    <div className="dashboard-new-container">
      <Header userName="Demo User" onLogout={handleLogout} />

      <main className="dashboard-new-main">
        {/* Stats Section */}
        <div className="stats-section">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Job Description & Upload */}
          <div className="left-column">
            {/* Job Description Card */}
            <div className="job-card">
              <div className="job-header">
                <h2>📄 Job Description</h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to match against resumes..."
                className="job-textarea"
              />
              <div className="job-footer">
                <span>{jobDescription.length} characters</span>
                <button className="upload-link">Upload file</button>
              </div>

              {/* Visa Requirement & Job Location */}
              <div className="job-filters-section">
                <div className="filter-group">
                  <label>💼 Visa Requirement</label>
                  <select
                    value={visaRequirement}
                    onChange={(e) => setVisaRequirement(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    <option value="US Citizen">US Citizen</option>
                    <option value="US Citizenship">US Citizenship</option>
                    <option value="US Authorized">US Authorized</option>
                    <option value="Canadian Citizen">Canadian Citizen</option>
                    <option value="Canadian Authorized">Canadian Authorized</option>
                    <option value="Green Card Holder">Green Card Holder</option>
                    <option value="GC">GC</option>
                    <option value="GC-EAD">GC-EAD</option>
                    <option value="Employment Auth Document">Employment Auth Document</option>
                    <option value="OPT-EAD">OPT-EAD</option>
                    <option value="H4-EAD">H4-EAD</option>
                    <option value="L2-EAD">L2-EAD</option>
                    <option value="H1 visa">H1 visa</option>
                    <option value="H1-B">H1-B</option>
                    <option value="Need H1 visa">Need H1 visa</option>
                    <option value="Have H1 visa">Have H1 visa</option>
                    <option value="B1">B1</option>
                    <option value="L1-A">L1-A</option>
                    <option value="L2-B">L2-B</option>
                    <option value="TN Visa">TN Visa</option>
                    <option value="TN Permit Holder">TN Permit Holder</option>
                    <option value="Can work for any employer">Can work for any employer</option>
                    <option value="Indian Authorized">Indian Authorized</option>
                    <option value="United Kingdom Authorized">United Kingdom Authorized</option>
                    <option value="France Authorized">France Authorized</option>
                    <option value="Sponsership Required">Sponsership Required</option>
                    <option value="Unspecified Work Authorization">Unspecified Work Authorization</option>
                    <option value="Not Specified">Not Specified</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>📍 Job Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Enter job location"
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            {/* OR Divider */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Upload Resumes Card */}
            <div className="upload-card">
              <div className="upload-header">
                <h2>👥 Upload Resumes</h2>
              </div>
              <div className="upload-area">
                <FileUpload onFilesSelected={handleFilesSelected} />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "🔄 Analyzing..." : "✨ Analyze & Match"}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="right-column">
            <div className="results-card">
              {/* Action Buttons */}
              <div className="results-action-buttons">
                <button 
                  className="action-btn download-btn"
                  onClick={handleDownloadAll}
                >
                  ⬇️ Download All ({filteredResumes.length})
                </button>
                <button className="action-btn">Upload from Ceipal</button>
                <button className="action-btn">Get Resumes from Ceipal</button>
                <button className="action-btn upload-resume-btn" onClick={handleUploadResume}>
                  ⬆️ Upload Resume
                </button>
              </div>

              {/* Search & Filter */}
              <div className="search-filter-bar">
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="filter-btn">Filters</button>
                <select className="sort-select">
                  <option>Show top candidates: All candidates</option>
                  <option>Top 5</option>
                  <option>Top 10</option>
                  <option>Top 20</option>
                </select>
                <select className="sort-select">
                  <option>Sort by: Score (High to Low)</option>
                  <option>Score (Low to High)</option>
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                </select>
              </div>

              {/* Results Header */}
              <div className="results-header">
                <h2>Matched Candidates</h2>
                <span className="result-count">{filteredResumes.length} results</span>
              </div>

              {/* Resume Cards */}
              <div className="resume-list">
                {filteredResumes.map((resume) => (
                  <div key={resume.id} className="resume-item">
                    <div className="resume-avatar">{resume.avatar}</div>
                    <div className="resume-info">
                      <div className="resume-top">
                        <div>
                          <h3 className="resume-name">{resume.name}</h3>
                        </div>
                        <div className={`score-badge ${getScoreBadgeClass(resume.score)}`}>
                          ⭐ {resume.score}%
                        </div>
                      </div>
                      <div className="resume-details">
                        <span className="detail-item">📧 {resume.email}</span>
                        <span className="detail-item">📞 {resume.phone}</span>
                        <span className="detail-item">📍 {resume.location}</span>
                      </div>
                      {/* skills and summary removed per request */}
                    </div>
                    <button className="view-details-btn">View Details →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat FAB */}
      <button
        className="ai-chat-fab"
        onClick={() => setShowAIChat(true)}
      >
        💬
      </button>

      {/* AI Chat Modal */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  );
}

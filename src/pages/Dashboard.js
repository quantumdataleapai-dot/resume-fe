import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AIChat from "../components/AIChat";
import FileUpload from "../components/FileUpload";
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

  const handleLogout = () => {
    navigate("/");
  };

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      window.alert("Please enter a job description");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1200);
  };

  const filteredResumes = sampleResumes.filter((resume) =>
    resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resume.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

 

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "score-excellent";
    if (score >= 70) return "score-good";
    return "score-fair";
  };

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
                          <p className="resume-role">{resume.experience}</p>
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
                      <div className="skills-section">
                        {resume.skills.slice(0, 5).map((skill, i) => (
                          <span key={i} className="skill-chip">{skill}</span>
                        ))}
                      </div>
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

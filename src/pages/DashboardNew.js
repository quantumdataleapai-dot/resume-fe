import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import Header from "../components/Header";
import AIChat from "../components/AIChat";
import FileUpload from "../components/FileUpload";
import apiService from "../services/apiService";
import ResumeDetailModal from "../components/ResumeDetailModal";

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
    const [showDetailModal, setShowDetailModal] = useState(false);
  
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
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");

  
  const handleViewDetails = (resume) => {
    setSelectedResume(resume);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedResume(null);
  };
  const handleLogout = () => {
    navigate("/");
  };

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleAnalyze = async () => {
    // Check if either job description OR files are provided
    if (!jobDescription.trim() && uploadedFiles.length === 0) {
      window.alert("Please enter a job description or upload resume files");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let result;

      // If files are uploaded, use file-based API
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        
        // Add job description if provided
        if (jobDescription.trim()) {
          formData.append("job_description", jobDescription);
        }
        
        // Add resume files
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
        
        // Add filters
        formData.append("visa_requirement", visaRequirement);
        formData.append("job_location", jobLocation);
        if (expectedSalary) formData.append("expected_salary", expectedSalary);
        if (noticePeriod) formData.append("notice_period", noticePeriod);

        console.log("Uploading files for processing...");
        const response = await fetch(
          "http://10.30.0.104:8006/api/jobs/process-file-and-match",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API error response:", errorData);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        result = await response.json();
        console.log("File matching response:", result);
      } else {
        // Use text-based API for job description
        const payload = {
          job_description: jobDescription,
          visa_requirement: visaRequirement,
          job_location: jobLocation,
          ...(expectedSalary && { expected_salary: expectedSalary }),
          ...(noticePeriod && { notice_period: noticePeriod }),
        };

        console.log("Sending text job description for processing...");
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

        result = await response.json();
        console.log("Job matching response:", result);
      }

      // Process the response - extract matched resumes
      let items = [];
      
      // Try to extract matched resumes from various possible response structures
      if (result.data && result.data.matched_resumes && Array.isArray(result.data.matched_resumes)) {
        items = result.data.matched_resumes;
      } else if (Array.isArray(result.matched_resumes)) {
        items = result.matched_resumes;
      } else if (result.data && Array.isArray(result.data)) {
        items = result.data;
      } else if (Array.isArray(result.matches)) {
        items = result.matches;
      } else if (Array.isArray(result)) {
        items = result;
      }

      if (items.length > 0) {
        const normalized = items.map((r, idx) => {
          const parsed = r.parsed_data || {};
          const name = r.name || parsed.name || r.original_name || r.filename || r.title || "Unknown";
          return {
            id: r.id || r._id || idx + 1,
            filename: r.filename || "",
            upload_date: r.upload_date || "",
            name: name,
            email: parsed.email || r.email || r.contact_email || "",
            contact_number: parsed.contact_number || r.phone || r.contact_number || "",
            location: parsed.location || r.location || r.city || "",
            score: r.match_score || r.score || r.similarity || 0,
            skills: parsed.skills || r.skills || r.tags || [],
            experience_years: parsed.experience_years || r.experience_years || r.experience || "",
            description: parsed.description || r.description || "",
            linkedin: parsed.linkedin || r.linkedin || "",
            visa_type: parsed.visa_type || r.visa_type || "",
            education: parsed.education || r.education || "",
            matchingSkills: r.matchingSkills || r.matching_skills || [],
            missingSkills: r.missingSkills || r.missing_skills || [],
            questionsToAsk: r.questionsToAsk || r.questions_to_ask || [],
            generated_questions: r.generated_questions || [],
            avatar: name ? (name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
          };
        });
        setResumes(normalized);
        // Clear search to ensure matched resumes are visible
        setSearchQuery("");
        // Clear uploaded files after successful analysis
        setUploadedFiles([]);
        // Clear form fields after successful analysis
        setJobDescription("");
        setVisaRequirement("H1 Visa");
        setJobLocation("all");
        setExpectedSalary("");
        setNoticePeriod("");
        window.alert(`Successfully matched ${normalized.length} resumes!`);
      } else {
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

  const filteredResumes = sourceResumes
    .filter((resume) =>
      (resume.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resume.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (b.score || 0) - (a.score || 0));

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
          const name = p.name || r.name || r.filename || "Unknown";
          return {
            id: r.id || r._id || idx + 1,
            filename: r.filename || "",
            upload_date: r.upload_date || "",
            name: name,
            email: p.email || r.email || "",
            contact_number: p.contact_number || r.contact_number || "",
            location: p.location || r.location || "",
            score: (r.match_score || r.score || 0) || 0,
            skills: Array.isArray(p.skills) ? p.skills : (r.skills || []),
            experience_years: p.experience_years || r.experience_years || r.experience || "",
            description: p.description || r.description || "",
            linkedin: p.linkedin || r.linkedin || "",
            visa_type: p.visa_type || r.visa_type || "",
            education: p.education || r.education || "",
            matchingSkills: r.matchingSkills || [],
            missingSkills: r.missingSkills || [],
            questionsToAsk: r.questionsToAsk || [],
            generated_questions: r.generated_questions || [],
            avatar: name ? (name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
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
        {/* <div className="stats-section">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div> */}

        <div className="dashboard-grid">
          {/* Left Column - Job Description & Upload */}
          <div className="left-column">
            {/* Job Description Card */}
            <div className="job-card">
              <div className="job-header">
                <h2>Job Description</h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to match against resumes..."
                className="job-textarea"
              />
              <div className="job-footer">
                <span>{jobDescription.length} characters</span>
                <button 
                  className="upload-link"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf,.doc,.docx,.txt";
                    input.onchange = (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setJobDescription(event.target?.result || "");
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  Upload file
                </button>
              </div>

              {/* Visa Requirement & Job Location */}
              <div className="job-filters-section">
                <div className="filter-group">
                  <label>Visa Requirement</label>
                  <select

                    value={visaRequirement}
                    onChange={(e) => setVisaRequirement(e.target.value)}
                    className="filter-select"
                      style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#262639",
                      color: "#fff",
                    }}
                  >
                    <option value="all">All</option>
                    <optgroup label="Citizens and Permanent Residents">
                      <option value="us-citizen">US Citizen</option>
                      <option value="us-citizenship">US Citizenship</option>
                      <option value="us-authorized">US Authorized</option>
                      <option value="canadian-citizen">Canadian Citizen</option>
                      <option value="canada-authorized">
                        Canada Authorized
                      </option>
                      <option value="citizen">Citizen</option>
                    </optgroup>
                    <optgroup label="Green Card and EAD">
                      <option value="green-card">Green Card</option>
                      <option value="green-card-holder">
                        Green Card Holder
                      </option>
                      <option value="gc">GC</option>
                      <option value="gc-ead">GC-EAD</option>
                      <option value="employment-auth-document">
                        Employment Auth Document
                      </option>
                      <option value="opt-ead">OPT-EAD</option>
                      <option value="h4-ead">H4-EAD</option>
                      <option value="l2-ead">L2-EAD</option>
                    </optgroup>
                    <optgroup label="H1 Related">
                      <option value="h1-visa">H1 Visa</option>
                      <option value="h1b">H1-B</option>
                      <option value="have-h1">Have H1</option>
                      <option value="have-h1-visa">Have H1 Visa</option>
                      <option value="need-h1">Need H1</option>
                      <option value="need-h1-visa">Need H1 Visa</option>
                      <option value="need-h1-visa-sponsor">
                        Need H1 Visa Sponsor
                      </option>
                    </optgroup>
                    <optgroup label="Other Visas">
                      <option value="b1">B1</option>
                      <option value="l1a">L1-A</option>
                      <option value="l2b">L2-B</option>
                      <option value="tn-visa">TN Visa</option>
                      <option value="tn-permit-holder">TN Permit Holder</option>
                    </optgroup>
                    <optgroup label="Work Authorization">
                      <option value="can-work-for-any-employer">
                        Can work for any employer
                      </option>
                      <option value="current-employer-only">
                        Current Employer Only
                      </option>
                      <option value="sponsorship-required">
                        Sponsorship Required
                      </option>
                      <option value="france-authorized">
                        France Authorized
                      </option>
                      <option value="india-authorized">India Authorized</option>
                      <option value="kazakhstan-authorized">
                        Kazakhstan Authorized
                      </option>
                      <option value="united-kingdom-authorized">
                        United Kingdom Authorized
                      </option>
                      <option value="venezuela-authorized">
                        Venezuela Authorized
                      </option>
                      <option value="unspecified-work-authorization">
                        Unspecified Work Authorization
                      </option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="not-specified">Not Specified</option>
                      <option value="unspecified">Unspecified</option>
                    </optgroup>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Job Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Enter job location"
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Expected Salary</label>
                  <select
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#262639",
                      color: "#fff",
                    }}
                  >
                    <option value="">Select Salary Range</option>
                    <option value="40000-60000">$40K - $60K</option>
                    <option value="60000-80000">$60K - $80K</option>
                    <option value="80000-100000">$80K - $100K</option>
                    <option value="100000-120000">$100K - $120K</option>
                    <option value="120000-150000">$120K - $150K</option>
                    <option value="150000+">$150K+</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#262639",
                      color: "#fff",
                    }}
                  >
                    <option value="">Select Notice Period</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">1 Week</option>
                    <option value="2-weeks">2 Weeks</option>
                    <option value="1-month">1 Month</option>
                    <option value="2-months">2 Months</option>
                    <option value="3-months">3 Months</option>
                  </select>
                </div>
              </div>
            </div>

            

            {/* Analyze Button */}
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze & Match"}
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
                  ⬇ Download All ({filteredResumes.length})
                </button>
                <button className="action-btn">Upload from Ceipal</button>
                <button className="action-btn">Get Resumes from Ceipal</button>
                <button className="action-btn upload-resume-btn" onClick={handleUploadResume}>
                  ⬆ Upload Resume
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

              {/* Results Header - Only show if resumes exist */}
              {filteredResumes.length > 0 && (
                <div className="results-header">
                  <h2>Matched Candidates</h2>
                  <span className="result-count">{filteredResumes.length} results</span>
                </div>
              )}

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
                      </div>
                      <div className="resume-details">
                        {resume.email && (
                          <span className="detail-item">
                            <MdEmail size={14} /> {resume.email}
                          </span>
                        )}
                        {resume.contact_number && (
                          <span className="detail-item">
                            <MdPhone size={14} /> {resume.contact_number}
                          </span>
                        )}
                        {resume.location && (
                          <span className="detail-item">
                            <MdLocationOn size={14} /> {resume.location}
                          </span>
                        )}
                      </div>
                      {resume.skills && resume.skills.length > 0 && (
                        <div className="skills-section">
                          {resume.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="skill-chip">{skill}</span>
                          ))}
                          {resume.skills.length > 5 && (
                            <span className="skill-chip">+{resume.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="resume-actions">
                      {resume.score > 0 && (
                        <div className={`score-badge ${getScoreBadgeClass(resume.score)}`}>
                          ⭐ {resume.score.toFixed(1)}%
                        </div>
                      )}
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(resume)}
                      >
                        View Details
                      </button>
                    </div>
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

        {/* Resume Detail Modal */}
      <ResumeDetailModal
        resume={selectedResume}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}

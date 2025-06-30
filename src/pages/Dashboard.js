import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import ResumeCard from "../components/ResumeCard";
import AIChat from "../components/AIChat";
import { mockApiResponses } from "../utils/mockData";
import ApiService from "../services/apiService";
import JSZip from "jszip";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [jobFile, setJobFile] = useState(null);
  const [uploadType, setUploadType] = useState("Upload multiples");
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [allResumes, setAllResumes] = useState([]);
  const [matchedResumes, setMatchedResumes] = useState([]);
  const [showMatched, setShowMatched] = useState(false);
  const [topFilter, setTopFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score-desc");
  const [showAIChat, setShowAIChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedResumes, setSelectedResumes] = useState(new Set());
  const [urlList, setUrlList] = useState("");
  const fileInputRef = useRef(null);
  const jobFileInputRef = useRef(null);
  const uploadDropdownRef = useRef(null);

  // Handle click outside to close upload dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        uploadDropdownRef.current &&
        !uploadDropdownRef.current.contains(event.target)
      ) {
        setShowUploadDropdown(false);
      }
    };

    if (showUploadDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUploadDropdown]);

  // Simulate API delay
  const simulateApiDelay = (ms = 1500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const response = mockApiResponses.uploadResumes;
      // Use API service
      // const response = await ApiService.uploadResumes(files);
      alert(`${response.data.uploaded_count} resume(s) uploaded successfully!`);

      // Load all resumes after upload
      await loadAllResumes();
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllResumes = async () => {
    try {
      // Use API service
      const response = mockApiResponses.getResumes;
      // const response = await ApiService.getResumes();
      const transformedResumes = response.data.resumes.map((resume) => ({
        id: resume.id,
        name: resume.original_name,
        score: 0, // No score yet until matched
        maxScore: 100,
        description:
          "Upload date: " + new Date(resume.upload_date).toLocaleDateString(),
        avatar: "📄",
      }));

      setAllResumes(transformedResumes);
    } catch (error) {
      alert("Failed to load resumes: " + error.message);
    }
  };

  const chooseFiles = () => {
    fileInputRef.current.click();
  };

  const uploadJobDescription = async () => {
    if (!jobDescription.trim() && !jobFile) {
      alert("Please enter a job description or upload a job description file");
      return;
    }

    setLoading(true);
    try {
      // Use API service for matching
      const response = mockApiResponses.matchResumes;
      // const response = await ApiService.matchResumes(
      //   jobDescription.trim() || jobFile?.name
      // );

      // Transform matched resumes to component format
      const transformedMatches = response.data.matched_resumes.map(
        (resume) => ({
          id: resume.id,
          name: resume.original_name,
          score: resume.match_score,
          maxScore: resume.max_score,
          description: resume.summary,
          avatar: "📄",
          matchingSkills: resume.matching_skills,
          missingSkills: resume.missing_skills,
          experienceMatch: resume.experience_match,
          strengths: resume.strengths,
          weaknesses: resume.weaknesses,
        })
      );

      setMatchedResumes(transformedMatches);
      setShowMatched(true);
      setSortBy("score-desc"); // Default to score-based sorting for matched resumes

      alert(
        `Resume matching completed! Found ${transformedMatches.length} resumes with match scores.`
      );
    } catch (error) {
      alert("Resume matching failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL upload
  const handleUrlUpload = async () => {
    if (!urlList.trim()) {
      alert("Please enter URLs to upload resumes from");
      return;
    }

    const urls = urlList
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      alert("Please enter valid URLs");
      return;
    }

    setLoading(true);
    try {
      // Validate URLs
      const validUrls = [];
      const invalidUrls = [];

      for (const url of urls) {
        try {
          const urlObj = new URL(url);
          // Check if it's a valid HTTP/HTTPS URL
          if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
            validUrls.push(url);
          } else {
            invalidUrls.push(url);
          }
        } catch {
          invalidUrls.push(url);
        }
      }

      if (invalidUrls.length > 0) {
        alert(
          `Invalid URLs found:\n${invalidUrls.join(
            "\n"
          )}\n\nPlease ensure all URLs start with http:// or https://`
        );
        setLoading(false);
        return;
      }

      // Simulate API call to fetch resumes from URLs
      await simulateApiDelay(1500);

      // Enhanced mock upload with more realistic data
      const mockUploadedResumes = await Promise.all(
        validUrls.map(async (url, index) => {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;

          // Generate more realistic resume data based on URL
          const candidateNames = [
            "John Smith",
            "Sarah Johnson",
            "Michael Brown",
            "Emma Davis",
            "David Wilson",
            "Lisa Anderson",
            "James Taylor",
            "Jennifer Martinez",
          ];

          const candidateName = candidateNames[index % candidateNames.length];
          const filename = urlObj.pathname.split("/").pop() || "resume";

          // Simulate different file types
          const fileExtensions = [".pdf", ".doc", ".docx", ".txt"];
          const fileExt = fileExtensions[index % fileExtensions.length];

          return {
            id: Date.now() + index,
            name: `${candidateName}_${filename}${fileExt}`,
            description: `Professional ${
              Math.random() > 0.5 ? "Software Engineer" : "Data Scientist"
            } with ${
              Math.floor(Math.random() * 8) + 2
            } years of experience. Downloaded from ${domain}.`,
            avatar: candidateName.charAt(0).toUpperCase(),
            uploadDate: new Date().toISOString(),
            source: "url",
            originalUrl: url,
            fileSize: `${Math.floor(Math.random() * 500) + 100}KB`,
            downloadTime: new Date().toISOString(),
            status: "success",
          };
        })
      );

      // Add to allResumes
      setAllResumes((prev) => [...prev, ...mockUploadedResumes]);

      alert(
        `Successfully uploaded ${
          validUrls.length
        } resume(s) from URLs!\n\nFiles downloaded:\n${mockUploadedResumes
          .map((r) => `• ${r.name}`)
          .join("\n")}`
      );
      setUrlList("");

      // In a real application, you would call:
      /*
      const response = await fetch('/api/resumes/upload-from-urls', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ 
          urls: validUrls,
          options: {
            maxFileSize: '10MB',
            allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
            timeout: 30000
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setAllResumes(prev => [...prev, ...result.uploadedResumes]);
      */
    } catch (error) {
      console.error("URL upload error:", error);
      alert(
        "Failed to upload resumes from URLs. Please check the URLs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for selection

  // Selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      const resumeIds = new Set(
        getDisplayedResumes().map((resume) => resume.id)
      );
      setSelectedResumes(resumeIds);
    } else {
      setSelectedResumes(new Set());
    }
  };

  const handleSelectResume = (resumeId, checked) => {
    const newSelected = new Set(selectedResumes);
    if (checked) {
      newSelected.add(resumeId);
    } else {
      newSelected.delete(resumeId);
    }
    setSelectedResumes(newSelected);
  };

  const isAllSelected = () => {
    const filtered = getDisplayedResumes();
    return (
      filtered.length > 0 &&
      filtered.every((resume) => selectedResumes.has(resume.id))
    );
  };

  const isSomeSelected = () => {
    return selectedResumes.size > 0 && !isAllSelected();
  };

  // Download selected resumes
  const handleDownloadSelected = async () => {
    if (selectedResumes.size === 0) {
      alert("Please select resumes to download");
      return;
    }

    try {
      const resumesToDownload = getDisplayedResumes().filter((resume) =>
        selectedResumes.has(resume.id)
      );

      if (resumesToDownload.length === 1) {
        // Single file - download directly
        const resume = resumesToDownload[0];
        await downloadSingleResume(resume);
      } else {
        // Multiple files - download as ZIP
        await downloadAsZip(resumesToDownload);
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    }
  };

  // Download single resume
  const downloadSingleResume = async (resume) => {
    const content = `Resume: ${resume.name}\n\nScore: ${
      resume.score || "N/A"
    }%\nDescription: ${resume.description}\n\n${
      resume.matchingSkills
        ? `Matching Skills: ${resume.matchingSkills.join(", ")}\n`
        : ""
    }${
      resume.experienceMatch ? `Experience: ${resume.experienceMatch}\n` : ""
    }\nGenerated on: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.name.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert("Resume downloaded successfully!");
  };

  // Download multiple resumes as ZIP
  const downloadAsZip = async (resumes) => {
    alert(`Preparing ZIP file with ${resumes.length} resume(s)...`);

    try {
      // Create JSZip instance
      const zip = new JSZip();

      // Create individual resume files
      const files = resumes.map((resume) => ({
        name: `${resume.name.replace(/[^a-z0-9]/gi, "_")}.txt`,
        content: `Resume: ${resume.name}\n\nScore: ${
          resume.score || "N/A"
        }%\nDescription: ${resume.description}\n\n${
          resume.matchingSkills
            ? `Matching Skills: ${resume.matchingSkills.join(", ")}\n`
            : ""
        }${
          resume.experienceMatch
            ? `Experience: ${resume.experienceMatch}\n`
            : ""
        }${
          resume.strengths
            ? `\nStrengths:\n${resume.strengths
                .map((s) => `• ${s}`)
                .join("\n")}\n`
            : ""
        }${
          resume.weaknesses
            ? `\nAreas for Improvement:\n${resume.weaknesses
                .map((w) => `• ${w}`)
                .join("\n")}\n`
            : ""
        }\nGenerated on: ${new Date().toLocaleString()}`,
      }));

      // Add files to ZIP
      files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      // Create a manifest/summary file
      const manifest = `Resume Download Package Summary
===========================================

Date: ${new Date().toLocaleString()}
Total Files: ${files.length}

Files Included:
${files.map((f, i) => `${i + 1}. ${f.name}`).join("\n")}

Download Summary:
${
  showMatched
    ? "These resumes were matched against the job description."
    : "All uploaded resumes."
}
${
  showMatched && topFilter !== "all"
    ? `Filtered to show top ${topFilter} candidates.`
    : ""
}
Sorted by: ${sortBy
        .replace("-", " ")
        .replace("desc", "descending")
        .replace("asc", "ascending")}

Generated by Resume Matcher Tool
Visit: https://your-resume-matcher.com
`;

      zip.file("README.txt", manifest);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Resume_Package_${
        new Date().toISOString().split("T")[0]
      }_${resumes.length}files.zip`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(
        `ZIP file with ${resumes.length} resume(s) downloaded successfully!`
      );
    } catch (error) {
      console.error("ZIP creation error:", error);
      throw error;
    }
  };

  // Get filtered and sorted resumes based on top N filter and sort criteria
  const getDisplayedResumes = () => {
    const resumesToShow = showMatched ? matchedResumes : allResumes;

    // Apply sorting
    let sortedResumes = [...resumesToShow];

    switch (sortBy) {
      case "score-desc":
        sortedResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case "score-asc":
        sortedResumes.sort((a, b) => (a.score || 0) - (b.score || 0));
        break;
      case "name-asc":
        sortedResumes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedResumes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default to score descending for matched resumes
        if (showMatched) {
          sortedResumes.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
    }

    // Apply top N filter
    if (topFilter === "all") {
      return sortedResumes;
    }

    const topN = parseInt(topFilter);
    return sortedResumes.slice(0, topN);
  };

  const toggleAIChat = () => {
    setShowAIChat(!showAIChat);
  };

  const resetToAllResumes = () => {
    setShowMatched(false);
    setTopFilter("all");
    setSortBy("name-asc"); // Reset to name sorting for all resumes
    if (allResumes.length === 0) {
      loadAllResumes();
    }
  };

  const handleJobFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a PDF, DOC, DOCX, or TXT file for the job description."
      );
      return;
    }

    setJobFile(file);
    setJobDescription(""); // Clear text input when file is selected

    // Simulate file reading for demo
    const reader = new FileReader();
    reader.onload = (e) => {
      // In real implementation, this would be sent to backend for processing
      setJobDescription(
        `[Uploaded file: ${file.name}]\n\nFile content would be extracted here...`
      );
    };
    reader.readAsText(file);
  };

  const chooseJobFile = () => {
    jobFileInputRef.current.click();
  };

  const clearJobFile = () => {
    setJobFile(null);
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = "";
    }
  };

  const handleBulkDownload = async () => {
    const resumesToDownload = getDisplayedResumes();

    if (resumesToDownload.length === 0) {
      alert("No resumes to download");
      return;
    }

    try {
      setLoading(true);

      // Use the same ZIP download functionality
      await downloadAsZip(resumesToDownload);
    } catch (error) {
      console.error("Bulk download error:", error);
      alert("Bulk download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />

      <main className="main-content">
        <div className="content-wrapper">
          {/* Job Description Section */}
          <section className="job-section">
            <div className="section-header">
              <h2>Job Description</h2>
              <p className="section-subtitle">
                <i className="fas fa-info-circle"></i>
                Enter job description text OR upload a document file
              </p>
            </div>

            <div className="job-input-container">
              {/* Text Input Option */}
              <div className="job-option">
                <h3 className="option-title">
                  <i className="fas fa-keyboard"></i>
                  Paste Text
                </h3>
                <div className="job-input-area">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (e.target.value.trim() && jobFile) {
                        clearJobFile(); // Clear file when text is entered
                      }
                    }}
                    placeholder="Paste your job description here..."
                    className="job-textarea"
                    disabled={jobFile !== null}
                  />
                  <button className="external-link-btn" title="External link">
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
              </div>

              {/* OR Separator */}
              <div className="or-separator">
                <span className="or-line"></span>
                <span className="or-text">OR</span>
                <span className="or-line"></span>
              </div>

              {/* File Upload Option */}
              <div className="job-option">
                <h3 className="option-title">
                  <i className="fas fa-file-upload"></i>
                  Upload Document
                </h3>
                <div className="job-file-area">
                  {jobFile ? (
                    <div className="uploaded-file-info">
                      <div className="file-details">
                        <i className="fas fa-file-alt"></i>
                        <span className="file-name">{jobFile.name}</span>
                        <span className="file-size">
                          ({(jobFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        className="remove-file-btn"
                        onClick={clearJobFile}
                        title="Remove file"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="job-upload-area" onClick={chooseJobFile}>
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>Click to upload job description</span>
                      <small>PDF, DOC, DOCX, or TXT files</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="upload-job-btn"
                onClick={uploadJobDescription}
                disabled={!jobDescription.trim() && !jobFile}
              >
                <i className="fas fa-search"></i>
                Process Job Description
              </button>
            </div>
          </section>

          {/* Upload Section */}
          <section className="upload-section">
            <div className="section-header">
              <h2>Uploads</h2>
            </div>

            <div className="upload-container">
              <div className="upload-dropdown" ref={uploadDropdownRef}>
                <div
                  className="custom-select"
                  onClick={() => setShowUploadDropdown(!showUploadDropdown)}
                >
                  <span>{uploadType}</span>
                  <i
                    className={`fas fa-chevron-down ${
                      showUploadDropdown ? "rotated" : ""
                    }`}
                  ></i>
                </div>

                {showUploadDropdown && (
                  <div className="custom-dropdown-menu">
                    {[
                      "Upload multiples",
                      "Upload single",
                      "Upload from URL",
                    ].map((option) => (
                      <div
                        key={option}
                        className={`custom-dropdown-item ${
                          uploadType === option ? "selected" : ""
                        }`}
                        onClick={() => {
                          setUploadType(option);
                          setShowUploadDropdown(false);
                          // Clear URL list when switching away from URL upload
                          if (
                            uploadType === "Upload from URL" &&
                            option !== "Upload from URL"
                          ) {
                            setUrlList("");
                          }
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {uploadType === "Upload from URL" ? (
                <div className="url-upload-section">
                  <div className="url-input-container">
                    <textarea
                      className="url-textarea"
                      value={urlList}
                      onChange={(e) => setUrlList(e.target.value)}
                      placeholder="Enter resume URLs (one per line):&#10;https://example.com/resume1.pdf&#10;https://example.com/resume2.pdf&#10;https://linkedin.com/in/johndoe/resume"
                      rows={4}
                    />
                  </div>
                  <div className="url-upload-actions">
                    <button
                      className="upload-from-urls-btn"
                      onClick={handleUrlUpload}
                      disabled={loading || !urlList.trim()}
                    >
                      <i className="fas fa-cloud-download-alt"></i>
                      {loading ? "Uploading..." : "Upload from URLs"}
                    </button>
                    <button
                      className="clear-urls-btn"
                      onClick={() => setUrlList("")}
                      disabled={!urlList.trim()}
                    >
                      <i className="fas fa-eraser"></i>
                      Clear
                    </button>
                  </div>
                  <div className="url-upload-info">
                    <small>
                      <i className="fas fa-info-circle"></i>
                      Supported: Direct links to PDF, DOC, DOCX files or public
                      resume URLs
                    </small>
                  </div>
                </div>
              ) : (
                <button className="choose-files-btn" onClick={chooseFiles}>
                  <i className="fas fa-upload"></i>
                  Choose Files
                </button>
              )}
            </div>
          </section>

          {/* Matched Resumes Section */}
          <section className="matched-resumes-section">
            <div className="section-header">
              <div className="section-title">
                <h2>
                  {showMatched ? "Matched Resumes" : "All Resumes"}
                  {loading && (
                    <span className="loading-text"> (Loading...)</span>
                  )}
                </h2>
                {showMatched && (
                  <p className="section-subtitle">
                    <i className="fas fa-bullseye"></i>
                    Job description matched with resumes in database. Review
                    scores and candidate details below.
                  </p>
                )}
              </div>
              <div className="header-controls">
                {getDisplayedResumes().length > 0 && (
                  <button
                    className="download-all-btn"
                    onClick={handleBulkDownload}
                    disabled={loading}
                    title={`Download ${getDisplayedResumes().length} resume(s)`}
                  >
                    <i className="fas fa-download"></i>
                    Download All ({getDisplayedResumes().length})
                  </button>
                )}
                {showMatched && (
                  <button className="reset-btn" onClick={resetToAllResumes}>
                    <i className="fas fa-list"></i>
                    Show All
                  </button>
                )}
                {!showMatched && allResumes.length === 0 && (
                  <button className="load-btn" onClick={loadAllResumes}>
                    <i className="fas fa-refresh"></i>
                    Load All Resumes
                  </button>
                )}
                <div className="arrow-indicator">
                  <i className="fas fa-arrow-down"></i>
                </div>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="filter-controls">
              <div className="filter-section">
                <div className="filter-group">
                  <label htmlFor="topFilter">
                    <i className="fas fa-filter"></i>
                    Show top candidates:
                  </label>
                  <select
                    id="topFilter"
                    value={topFilter}
                    onChange={(e) => setTopFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All candidates</option>
                    <option value="3">Top 3</option>
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sortBy">
                    <i className="fas fa-sort"></i>
                    Sort by:
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="score-desc">Score (High to Low)</option>
                    <option value="score-asc">Score (Low to High)</option>
                    <option value="name-asc">Name (A to Z)</option>
                    <option value="name-desc">Name (Z to A)</option>
                  </select>
                </div>
              </div>

              {showMatched && (
                <div
                  className="stats-info"
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <span className="stat">
                    <i className="fas fa-users"></i>
                    {getDisplayedResumes().length} of {matchedResumes.length}{" "}
                    shown
                  </span>
                  <span className="stat">
                    <i className="fas fa-chart-line"></i>
                    Avg Score:{" "}
                    {Math.round(
                      getDisplayedResumes().reduce(
                        (sum, r) => sum + (r.score || 0),
                        0
                      ) / getDisplayedResumes().length || 0
                    )}
                    %
                  </span>
                  <span className="stat">
                    <i className="fas fa-trophy"></i>
                    Best Score:{" "}
                    {Math.max(
                      ...getDisplayedResumes().map((r) => r.score || 0)
                    )}
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="resumes-table">
              <div
                className={`table-header ${
                  showMatched ? "matched-layout" : ""
                }`}
              >
                <div className="table-col select-col">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      ref={(checkboxRef) => {
                        if (checkboxRef) {
                          checkboxRef.indeterminate = isSomeSelected();
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  {selectedResumes.size > 0 && (
                    <button
                      className="download-selected-btn"
                      onClick={handleDownloadSelected}
                      title={`Download ${selectedResumes.size} selected resume(s)`}
                    >
                      <i className="fas fa-download"></i>
                      <span className="btn-text">
                        Download ({selectedResumes.size})
                      </span>
                    </button>
                  )}
                </div>
                <div className="table-col">
                  <i className="fas fa-user"></i>
                  Resume Name
                </div>
                {showMatched && (
                  <div className="table-col">
                    <i className="fas fa-chart-bar"></i>
                    Match Score
                  </div>
                )}
                <div className="table-col">
                  <i className="fas fa-info-circle"></i>
                  {showMatched ? "Details" : "Status"}
                </div>
                <div className="table-col">
                  <i className="fas fa-cog"></i>
                  Actions
                </div>
              </div>

              <div className="table-body">
                {loading ? (
                  <div className="loading-message">
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </div>
                ) : getDisplayedResumes().length === 0 ? (
                  <div className="empty-message">
                    {showMatched
                      ? "No matched resumes. Try uploading a job description."
                      : "No resumes found. Upload some resumes to get started."}
                  </div>
                ) : (
                  getDisplayedResumes().map((resume, index) => (
                    <div key={resume.id} className="resume-item-wrapper">
                      {showMatched && topFilter !== "all" && (
                        <div className="rank-badge">#{index + 1}</div>
                      )}
                      <ResumeCard
                        resume={resume}
                        showMatched={showMatched}
                        isSelected={selectedResumes.has(resume.id)}
                        onSelect={(checked) =>
                          handleSelectResume(resume.id, checked)
                        }
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* AI Chat Button */}
      <button className="ai-chat-btn" onClick={toggleAIChat}>
        <i className="fas fa-robot"></i>
        <span>ChatBot</span>
      </button>

      {/* AI Chat Modal */}
      {showAIChat && <AIChat onClose={toggleAIChat} />}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={jobFileInputRef}
        onChange={handleJobFileUpload}
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={jobFileInputRef}
        onChange={handleJobFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Dashboard;

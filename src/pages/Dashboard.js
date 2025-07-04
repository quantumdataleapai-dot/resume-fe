import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import ResumeCard from "../components/ResumeCard";
import AIChat from "../components/AIChat";
import ApiService from "../services/apiService";

import "../styles/Dashboard.css";
import "../styles/Pagination.css";
import { MdOutlineDocumentScanner, MdInsertDriveFile } from "react-icons/md";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Load resumes on component mount
  useEffect(() => {
    loadAllResumes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, topFilter, showMatched]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(
        (showMatched ? matchedResumes.length : allResumes.length) / itemsPerPage
      )
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [matchedResumes, showMatched, allResumes, itemsPerPage, currentPage]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const response = await ApiService.uploadResumes(files);
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
      const response = await ApiService.getResumes();

      const transformedResumes = response.data.resumes.map((resume) => ({
        id: resume.id,
        name:
          resume.original_name || resume.parsed_data?.name || resume.filename,
        filename: resume.filename,
        upload_date: new Date(resume.upload_date).toLocaleDateString(),
        score: resume.match_score || 0, // No score yet until matched
        maxScore: 100,
        description:
          resume.parsed_data?.current_position ||
          "Upload date: " + new Date(resume.upload_date).toLocaleDateString(),
        avatar: <MdOutlineDocumentScanner />,
        email: resume.parsed_data?.email,
        phone: resume.parsed_data?.phone,
        skills: resume.parsed_data?.skills || [],
        experience: resume.parsed_data?.experience_years || 0,
        education: resume.parsed_data?.education,
        location: resume.parsed_data?.location,
        // Ensure arrays for modal compatibility
        strengths: Array.isArray(resume.strengths)
          ? resume.strengths
          : ["General experience in the field"],
        weaknesses: Array.isArray(resume.weaknesses)
          ? resume.weaknesses
          : ["No specific weaknesses identified"],
        matchingSkills: resume.matching_skills || [],
        missingSkills: resume.missing_skills || [],
      }));

      setAllResumes(transformedResumes);
      console.log("Loaded resumes:", transformedResumes);
    } catch (error) {
      console.error("Failed to load resumes:", error);
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
      // Prepare job data for unified processing
      const jobData = jobFile
        ? { file: jobFile, title: jobDescription.trim() || null }
        : { job_description: jobDescription.trim() };

      // Use unified API service for job processing and matching
      const response = await ApiService.processJobAndMatch(jobData);

      // Transform matched resumes to component format
      const transformedMatches = response.data.matched_resumes.map(
        (resume) => ({
          id: resume.id,
          name: resume.parsed_data?.name || resume.filename,
          score: resume.match_score,
          maxScore: 100,
          description: resume.parsed_data?.current_position || "No description",
          avatar: <MdInsertDriveFile />,
          matchingSkills: resume.matching_skills || [],
          missingSkills: resume.missing_skills || [],
          experienceMatch: resume.match_details?.experience_match || 0,
          strengths: Array.isArray(resume.strengths)
            ? resume.strengths
            : [resume.match_details?.overall_fit || "Good fit"],
          weaknesses: Array.isArray(resume.weaknesses)
            ? resume.weaknesses
            : Array.isArray(resume.missing_skills) &&
              resume.missing_skills.length > 0
            ? resume.missing_skills
            : ["No specific areas identified"],
          email: resume.parsed_data?.email,
          phone: resume.parsed_data?.phone,
          location: resume.parsed_data?.location,
          skills: resume.parsed_data?.skills || [],
          experience: resume.parsed_data?.experience_years || 0,
          education: resume.parsed_data?.education,
        })
      );

      setMatchedResumes(transformedMatches);
      setShowMatched(true);
      setSortBy("score-desc"); // Default to score-based sorting for matched resumes
      setJobDescription("");
      clearJobFile();

      alert(
        `Job processing completed! Found ${transformedMatches.length} matching resumes.`
      );
    } catch (error) {
      alert("Job processing failed: " + error.message);
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

      // Use API service to upload from URLs
      const response = await ApiService.uploadFromUrls(validUrls);

      // Transform response to component format
      const uploadedResumes = response.data.resumes.map((resume) => ({
        id: resume.id,
        name: resume.original_name || resume.filename,
        filename: resume.filename,
        upload_date: new Date(resume.upload_date).toLocaleDateString(),
        description: `Downloaded from URL. Upload date: ${new Date(
          resume.upload_date
        ).toLocaleDateString()}`,
        avatar: <MdInsertDriveFile />,
      }));

      // Add to allResumes
      setAllResumes((prev) => [...prev, ...uploadedResumes]);

      alert(
        `Successfully uploaded ${response.data.uploaded_count} resume(s) from URLs!`
      );
      setUrlList("");
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

  // Download single resume (common function to be used by both table and modal)
  const handleDownloadResume = async (resumeId, format = "pdf") => {
    try {
      setLoading(true);
      // Use the API service to download the resume
      const result = await ApiService.downloadResume(resumeId, format);

      if (result.success) {
        console.log(`Resume ${resumeId} downloaded successfully`);
      } else {
        console.error("Failed to download resume:", result.error);
        alert("Download failed. Please try again.");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Download single resume
  const downloadSingleResume = async (resume) => {
    return handleDownloadResume(resume.id);
  };

  // Download multiple resumes as ZIP using the API
  const downloadAsZip = async (resumes) => {
    try {
      setLoading(true);

      // Extract IDs from the resume objects
      const resumeIds = resumes.map((resume) => resume.id);

      console.log(`Downloading ${resumeIds.length} resumes as ZIP...`);
      alert(`Preparing ZIP file with ${resumes.length} resume(s)...`);

      // Call the API service to download all selected resumes
      const result = await ApiService.downloadAllResumes(resumeIds, "zip");

      if (result.success) {
        console.log(
          `ZIP file with ${resumes.length} resume(s) downloaded successfully!`
        );
      } else {
        console.error("Failed to download ZIP file:", result.error);
        alert("Download failed. Please try again.");
      }
    } catch (error) {
      console.error("Download ZIP error:", error);
      alert("Failed to download ZIP file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get filtered and sorted resumes based on top N filter and sort criteria
  const getDisplayedResumes = (paginated = true) => {
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
    if (topFilter !== "all") {
      const topN = parseInt(topFilter);
      sortedResumes = sortedResumes.slice(0, topN);

      const totalFilteredResumes = sortedResumes.length;
      if (paginated) {
        const startIndex = (currentPage - 1) * itemsPerPage; // should i add +1
        const endIndex = startIndex + itemsPerPage;

        return {
          paginatedResumes: sortedResumes.slice(startIndex, endIndex),
          totalResumes: totalFilteredResumes,
        };
      }

      return {
        paginatedResumes: sortedResumes,
        totalResumes: totalFilteredResumes,
      };
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
    setCurrentPage(1);
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
    const resumesToDownload = getDisplayedResumes(false).paginatedResumes;

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    const tableElement = document.querySelector(".resumes-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth" });
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
                {getDisplayedResumes().paginatedResumes.length > 0 && (
                  <button
                    className="download-all-btn"
                    onClick={handleBulkDownload}
                    disabled={loading}
                    title={`Download ${
                      getDisplayedResumes(false).paginatedResumes.length
                    } resume(s)`}
                  >
                    <i className="fas fa-download"></i>
                    Download All (
                    {getDisplayedResumes(false).paginatedResumes.length})
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
                    {getDisplayedResumes().paginatedResumes.length} of{" "}
                    {getDisplayedResumes().totalResumes}
                    shown
                  </span>
                  <span className="stat">
                    <i className="fas fa-chart-line"></i>
                    Avg Score:{" "}
                    {Math.round(
                      getDisplayedResumes().paginatedResumes.reduce(
                        (sum, r) => sum + (r.score || 0),
                        0
                      ) / getDisplayedResumes().paginatedResumes.length || 0
                    )}
                    %
                  </span>
                  <span className="stat">
                    <i className="fas fa-trophy"></i>
                    Best Score:{" "}
                    {Math.max(
                      ...getDisplayedResumes().paginatedResumes.map(
                        (r) => r.score || 0
                      )
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
                style={{
                  display: "grid",
                  gridTemplateColumns: showMatched
                    ? "80px 1fr 120px 100px"
                    : "80px 1fr 100px",
                  gap: "1rem",
                  padding: "1rem",
                  alignItems: "center",
                }}
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
                  <div className="table-col" style={{ textAlign: "center" }}>
                    <i className="fas fa-chart-bar"></i>
                    Match Score
                  </div>
                )}
                <div className="table-col" style={{ textAlign: "center" }}>
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
                ) : getDisplayedResumes().totalResumes === 0 ? (
                  <div className="empty-message">
                    {showMatched
                      ? "No matched resumes. Try uploading a job description."
                      : "No resumes found. Upload some resumes to get started."}
                  </div>
                ) : (
                  getDisplayedResumes().paginatedResumes.map(
                    (resume, index) => (
                      <div
                        key={resume.id}
                        className={`resume-item-wrapper ${
                          index % 2 === 0 ? "row-even" : "row-odd"
                        }`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: showMatched
                            ? "80px 1fr 120px 100px"
                            : "80px 1fr 100px",
                          gap: "1rem",
                          padding: "1rem",
                          alignItems: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {showMatched && topFilter !== "all" && (
                          <div className="rank-badge">
                            #{(currentPage - 1) * itemsPerPage + index + 1}
                          </div>
                        )}
                        <ResumeCard
                          resume={resume}
                          showMatched={showMatched}
                          isSelected={selectedResumes.has(resume.id)}
                          onSelect={(checked) =>
                            handleSelectResume(resume.id, checked)
                          }
                          handleDownload={() =>
                            handleDownloadResume(resume.id, "pdf")
                          }
                        />
                      </div>
                    )
                  )
                )}
              </div>
              {getDisplayedResumes().totalResumes > itemsPerPage && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    showing{" "}
                    {Math.min(
                      itemsPerPage,
                      getDisplayedResumes().paginatedResumes.length
                    )}{" "}
                    of {getDisplayedResumes().totalResumes} resumes
                  </div>
                  <div className="pagination-buttons">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      title="First Page"
                    >
                      <i className="fas fa-angle-double-left"></i>
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() =>
                        handlePageChange(Math.max(currentPage - 1, 1))
                      }
                      disabled={currentPage === 1}
                      title="Previous Page"
                    >
                      <i className="fas fa-angle-left"></i>
                    </button>

                    <div className="pagination-pages">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            Math.ceil(
                              getDisplayedResumes().totalResumes / itemsPerPage
                            )
                          ),
                        },
                        (_, i) => {
                          let pageNum;
                          const totalPages = Math.ceil(
                            getDisplayedResumes().totalResumes / itemsPerPage
                          );

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`pagination-btn page-num ${
                                pageNum === currentPage ? "active" : ""
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            currentPage + 1,
                            Math.ceil(
                              getDisplayedResumes().totalResumes / itemsPerPage
                            )
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getDisplayedResumes().totalResumes / itemsPerPage
                        )
                      }
                      title="Next Page"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getDisplayedResumes().totalResumes / itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getDisplayedResumes().totalResumes / itemsPerPage
                        )
                      }
                      title="last Page"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                  <div className="items-per-page">
                    <label htmlFor="itemsPerPage">Items per page:</label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
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

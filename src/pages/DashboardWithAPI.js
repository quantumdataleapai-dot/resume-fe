// Example integration for Dashboard component with API calls
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { resumeAPI, jobAPI } from "../utils/api";
import Header from "../components/Header";
import ResumeCard from "../components/ResumeCard";
import AIChat from "../components/AIChat";
import "../styles/Dashboard.css";

const DashboardWithAPI = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadType, setUploadType] = useState("Upload multiples");
  const [resumes, setResumes] = useState([]);
  const [matchedResumes, setMatchedResumes] = useState([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();

  // Load resumes on component mount
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumes();
      if (response.success) {
        setResumes(response.data.resumes);
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);
      alert("Failed to load resumes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploadLoading(true);
      const response = await resumeAPI.uploadResumes(files);

      if (response.success) {
        alert(
          `${response.data.uploaded_count} resume(s) uploaded successfully!`
        );
        // Reload resumes to show newly uploaded files
        await loadResumes();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const chooseFiles = () => {
    fileInputRef.current.click();
  };

  const uploadJobDescription = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description first");
      return;
    }

    try {
      // Save job description
      await jobAPI.saveJobDescription(jobDescription, "Untitled Job");

      // Match resumes against job description
      await matchResumes();
    } catch (error) {
      console.error("Job description processing error:", error);
      alert("Failed to process job description: " + error.message);
    }
  };

  const matchResumes = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description first");
      return;
    }

    try {
      setMatchLoading(true);
      const response = await resumeAPI.matchResumes(jobDescription);

      if (response.success) {
        setMatchedResumes(response.data.matched_resumes);
        alert(
          `Found ${response.data.matched_resumes.length} matching resumes!`
        );
      }
    } catch (error) {
      console.error("Resume matching error:", error);
      alert("Resume matching failed: " + error.message);
    } finally {
      setMatchLoading(false);
    }
  };

  const toggleAIChat = () => {
    setShowAIChat(!showAIChat);
  };

  return (
    <div className="dashboard-container">
      <Header />

      <main className="main-content">
        <div className="content-wrapper">
          {/* Job Description Section */}
          <section className="job-section">
            <div className="section-header">
              <h2>Paste or Upload Job Description</h2>
            </div>

            <div className="job-input-container">
              <div className="job-input-area">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter job description here..."
                  className="job-textarea"
                />
                <button className="external-link-btn">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>

              <button
                className="upload-job-btn"
                onClick={uploadJobDescription}
                disabled={matchLoading}
              >
                {matchLoading ? "Processing..." : "Analyze Job & Match Resumes"}
              </button>
            </div>
          </section>

          {/* Upload Section */}
          <section className="upload-section">
            <div className="section-header">
              <h2>Upload Resumes</h2>
            </div>

            <div className="upload-container">
              <div className="upload-dropdown">
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option>Upload multiples</option>
                  <option>Upload single</option>
                  <option>Upload from URL</option>
                </select>
                <i className="fas fa-chevron-down"></i>
              </div>

              <button
                className="choose-files-btn"
                onClick={chooseFiles}
                disabled={uploadLoading}
              >
                {uploadLoading ? "Uploading..." : "Choose Files"}
              </button>
            </div>
          </section>

          {/* Matched Resumes Section */}
          <section className="matched-resumes-section">
            <div className="section-header">
              <h2>
                {matchedResumes.length > 0 ? "Matched Resumes" : "All Resumes"}
                {loading && <span> (Loading...)</span>}
              </h2>
              <div className="arrow-indicator">
                <i className="fas fa-arrow-down"></i>
              </div>
            </div>

            <div className="resumes-table">
              <div className="table-header">
                <div className="table-col">Resume Name</div>
                <div className="table-col">Match Score</div>
              </div>

              <div className="table-body">
                {loading ? (
                  <div className="loading-message">Loading resumes...</div>
                ) : (
                  (matchedResumes.length > 0
                    ? matchedResumes
                    : resumes.map((resume) => ({
                        ...resume,
                        match_score: 0,
                        max_score: 100,
                        summary: "No job description provided for matching",
                      }))
                  ).map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={{
                        id: resume.id,
                        name: resume.original_name || resume.filename,
                        score: resume.match_score || 0,
                        maxScore: resume.max_score || 100,
                        description: resume.summary || "No analysis available",
                        avatar: "📄",
                      }}
                    />
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
        <span>ai</span>
      </button>

      {/* AI Chat Modal */}
      {showAIChat && <AIChat onClose={toggleAIChat} />}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default DashboardWithAPI;

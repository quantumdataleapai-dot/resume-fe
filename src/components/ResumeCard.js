import React, { useState, useEffect, useRef } from "react";
import ResumeDetailModal from "./ResumeDetailModal";

const ResumeCard = ({
  resume,
  showMatched = false,
  isSelected = false,
  onSelect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#FF9800"; // Orange
    if (score >= 40) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleDownload = async () => {
    try {
      // In a real application, this would make an API call to get the file
      // For demo purposes, we'll simulate a download

      // Simulate API call to get resume file
      const response = await fetch(`/api/resumes/${resume.id}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = resume.name || `resume_${resume.id}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);

      // Fallback: Create a dummy file for demo purposes
      const dummyContent = `Resume: ${
        resume.name
      }\n\nThis is a demo download.\nIn a real application, this would be the actual resume file.\n\nGenerated on: ${new Date().toLocaleString()}`;
      const blob = new Blob([dummyContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.name.replace(/[^a-z0-9]/gi, "_")}.txt`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show user feedback
      alert("Resume downloaded successfully! (Demo version)");
    }
  };

  const handleDownloadFormat = async (format) => {
    setShowDropdown(false);

    try {
      let content, mimeType, extension;

      switch (format) {
        case "pdf":
          content = `PDF Resume: ${resume.name}\n\nThis would be the original PDF file in a real application.`;
          mimeType = "application/pdf";
          extension = "pdf";
          break;
        case "txt":
          content = `Resume: ${resume.name}\n\nScore: ${
            resume.score || "N/A"
          }%\nDescription: ${resume.description}\n\n${
            resume.matchingSkills
              ? `Matching Skills: ${resume.matchingSkills.join(", ")}\n`
              : ""
          }${
            resume.experienceMatch
              ? `Experience: ${resume.experienceMatch}\n`
              : ""
          }\nGenerated on: ${new Date().toLocaleString()}`;
          mimeType = "text/plain";
          extension = "txt";
          break;
        case "json":
          content = JSON.stringify(
            {
              name: resume.name,
              score: resume.score,
              description: resume.description,
              matchingSkills: resume.matchingSkills,
              missingSkills: resume.missingSkills,
              experienceMatch: resume.experienceMatch,
              strengths: resume.strengths,
              weaknesses: resume.weaknesses,
              downloadedAt: new Date().toISOString(),
            },
            null,
            2
          );
          mimeType = "application/json";
          extension = "json";
          break;
        default:
          return handleDownload();
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.name.replace(/[^a-z0-9]/gi, "_")}.${extension}`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Resume downloaded as ${format.toUpperCase()}! (Demo version)`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <div className={`resume-card ${showMatched ? "matched-layout" : ""}`}>
        <div className="resume-checkbox">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect && onSelect(e.target.checked)}
            />
            <span className="checkmark"></span>
          </label>
        </div>

        <div className="resume-info">
          <div className="resume-avatar">
            <span>{resume.avatar}</span>
          </div>
          <div className="resume-details">
            <div className="resume-name">{resume.name}</div>
            <div className="resume-description">{resume.description}</div>
          </div>
        </div>

        {showMatched && (
          <div className="resume-score-column">
            {resume.score > 0 ? (
              <div className="score-container">
                <span
                  className="score-value prominent"
                  style={{
                    color: getScoreColor(resume.score),
                    textShadow: `0 0 10px ${getScoreColor(resume.score)}40`,
                  }}
                >
                  {resume.score}%
                </span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${resume.score}%`,
                      backgroundColor: getScoreColor(resume.score),
                      boxShadow: `0 0 8px ${getScoreColor(resume.score)}60`,
                    }}
                  ></div>
                </div>
                <span className="score-label">Match Score</span>
              </div>
            ) : (
              <div className="score-container no-score">
                <span className="score-value">N/A</span>
                <span className="score-label">No Score</span>
              </div>
            )}
          </div>
        )}

        <div className="resume-status">
          {showMatched ? (
            <div className="match-summary">
              {resume.experienceMatch && (
                <div className="experience-info">
                  <i className="fas fa-briefcase"></i>
                  {resume.experienceMatch}
                </div>
              )}
              {resume.matchingSkills?.length > 0 && (
                <div className="skills-preview">
                  <i className="fas fa-check-circle"></i>
                  {resume.matchingSkills.slice(0, 3).join(", ")}
                  {resume.matchingSkills.length > 3 && "..."}
                </div>
              )}
            </div>
          ) : (
            <div className="status-info">
              <span className="status-badge active">Active</span>
            </div>
          )}
        </div>

        <div className="resume-actions">
          {resume.matchingSkills && (
            <button
              className="details-btn"
              onClick={openModal}
              title="View Details"
            >
              <i className="fas fa-eye"></i>
            </button>
          )}
          <div className="download-container" ref={dropdownRef}>
            <button
              className="download-btn"
              onClick={handleDownload}
              title="Quick Download"
            >
              <i className="fas fa-download"></i>
            </button>
            <button
              className="download-options-btn"
              onClick={toggleDropdown}
              title="Download Options"
            >
              <i className="fas fa-chevron-down"></i>
            </button>
            {showDropdown && (
              <div className="dropdown-menu" ref={dropdownRef}>
                <button
                  className="dropdown-item"
                  onClick={() => handleDownloadFormat("pdf")}
                >
                  <i className="fas fa-file-pdf"></i>
                  Download as PDF
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleDownloadFormat("txt")}
                >
                  <i className="fas fa-file-alt"></i>
                  Download as TXT
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleDownloadFormat("json")}
                >
                  <i className="fas fa-file-code"></i>
                  Download as JSON
                </button>
              </div>
            )}
          </div>
          <button className="action-btn" title="More Actions">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        resume={resume}
        isOpen={showModal}
        onClose={closeModal}
      />
    </>
  );
};

export default ResumeCard;

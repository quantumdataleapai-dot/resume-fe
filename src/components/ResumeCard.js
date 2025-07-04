import React, { useState, useEffect, useRef } from "react";
import ResumeDetailModal from "./ResumeDetailModal";
import { MdOutlineInsertDriveFile } from "react-icons/md";

const ResumeCard = ({
  resume,
  showMatched = false,
  isSelected = false,
  onSelect,
  handleDownload,
  handleDeleteClick,
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

  const handleDownloadClick = async () => {
    if (handleDownload) {
      // Use the common download handler passed from the parent
      handleDownload();
    } else {
      try {
        // Fallback to the old implementation if no handler is provided
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
    }
  };

  return (
    <>
      {/* Checkbox column */}
      <div style={{ display: "flex" }}>
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect && onSelect(e.target.checked)}
          />
          <span className="checkmark"></span>
        </label>
      </div>

      {/* Resume info column */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div className="resume-avatar">
          <span style={{ fontSize: "1.5rem" }}>
            {resume.avatar || <MdOutlineInsertDriveFile />}
          </span>
        </div>
        <div className="resume-details">
          <div
            className="resume-name"
            style={{ fontWeight: "500", marginBottom: "0.25rem" }}
          >
            {resume.filename || resume.name}
          </div>
          <div
            className="resume-description"
            style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}
          >
            {resume.upload_date
              ? `Upload date: ${resume.upload_date}`
              : resume.description}
          </div>
        </div>
      </div>

      {/* Match score column (only when showMatched is true) */}
      {showMatched && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {resume.score > 0 ? (
            <div className="score-container" style={{ textAlign: "center" }}>
              <span
                className="score-value prominent"
                style={{
                  color: getScoreColor(resume.score),
                  textShadow: `0 0 10px ${getScoreColor(resume.score)}40`,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {resume.score}%
              </span>
            </div>
          ) : (
            <div
              className="score-container no-score"
              style={{ textAlign: "center" }}
            >
              <span className="score-value">N/A</span>
            </div>
          )}
        </div>
      )}

      {/* Actions column */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {resume.matchingSkills && (
          <button
            className="details-btn"
            onClick={openModal}
            title="View Details"
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-eye"></i>
          </button>
        )}
        <button
          className="download-btn"
          onClick={handleDownloadClick}
          title="Quick Download"
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "none",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <i className="fas fa-download"></i>
        </button>
        <button
          className="download-btn"
          onClick={handleDeleteClick}
          title="Delete Resume"
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "none",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#f44336",
            cursor: "pointer",
          }}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>

      {/* Resume Detail Modal */}
      <ResumeDetailModal
        resume={resume}
        isOpen={showModal}
        onClose={closeModal}
        handleDownload={handleDownload}
      />
    </>
  );
};

export default ResumeCard;

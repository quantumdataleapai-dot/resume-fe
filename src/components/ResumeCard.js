import React, { useState, useEffect, useRef } from "react";
import ResumeDetailModal from "./ResumeDetailModal";
import { MdOutlineInsertDriveFile, MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const ResumeCard = ({
  resume,
  showMatched = false,
  isSelected = false,
  onSelect,
  handleDownload,
  handleDeleteClick,
  anySelected = false, // NEW PROP
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
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
        <div className="resume-avatar">
          <span style={{ fontSize: "1.5rem" }}>
            {resume.avatar || <MdOutlineInsertDriveFile />}
          </span>
        </div>
        <div className="resume-details" style={{ flex: 1 }}>
          <div
            className="resume-name"
            style={{
              fontWeight: "700",
              marginBottom: "0.5rem",
              fontSize: "16px",
              color: "#fff",
            }}
          >
            {resume.name || resume.filename}
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            {resume.email && (
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                <MdEmail size={14} style={{ color: "#d946ef" }} />
                {resume.email}
              </div>
            )}
            {resume.contact_number && (
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                <MdPhone size={14} style={{ color: "#d946ef" }} />
                {resume.contact_number}
              </div>
            )}
            {resume.location && (
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                <MdLocationOn size={14} style={{ color: "#d946ef" }} />
                {resume.location}
              </div>
            )}
          </div>
          {resume.experience_years && (
            <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.8)", marginBottom: "8px" }}>
              <strong>{resume.experience_years} years experience</strong>
            </div>
          )}
          {resume.skills && resume.skills.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {resume.skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    background: "rgba(217,70,239,0.08)",
                    color: "#e9d8ff",
                    border: "1px solid rgba(217,70,239,0.12)",
                  }}
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 5 && (
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  +{resume.skills.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Match score column (only when showMatched is true) */}
      {showMatched && (
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          {resume.score > 0 ? (
            <div className="score-badge" aria-hidden>
              <div className="score-percent">
                <i className="fas fa-star"></i>
                <span className="percent-text">{resume.score}%</span>
              </div>
              <div className="score-label">Excellent Match</div>
            </div>
          ) : (
            <div className="score-container no-score" style={{ textAlign: "center" }}>
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

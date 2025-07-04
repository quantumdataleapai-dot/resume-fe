import ModalPortal from "./ModalPortal";
import { IoIosClose } from "react-icons/io";
import { GrUserExpert } from "react-icons/gr";
import { FaBullseye, FaTimesCircle } from "react-icons/fa";
import {
  MdOutlineSummarize,
  MdOutlineInsertDriveFile,
  MdDateRange,
  MdOutlineEmail,
  MdCheck,
  MdOutlineClose,
} from "react-icons/md";

const ResumeDetailModal = ({ resume, isOpen, onClose, handleDownload }) => {
  if (!isOpen || !resume) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#FF9800"; // Orange
    if (score >= 40) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Comprehensive inline styles to completely override any external CSS
  const overlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "20px",
    boxSizing: "border-box",
    transform: "none",
    transition: "none",
    animation: "none",
  };

  const modalStyles = {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderRadius: "16px",
    width: "800px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    opacity: 1,
    transform: "none",
    transition: "none",
    animation: "none",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  };

  const headerStyles = {
    padding: "20px 30px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "transparent",
    transform: "none",
    transition: "none",
  };

  const bodyStyles = {
    padding: "30px",
    maxHeight: "calc(90vh - 200px)",
    overflowY: "auto",
    background: "transparent",
    transform: "none",
    transition: "none",
    flex: 1,
    minHeight: "200px", // Ensure minimum height for content
    display: "flex",
    flexDirection: "column",
  };

  const sectionStyles = {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    margin: "15px 0",
    transition: "none",
    transform: "none",
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: "rgba(244, 67, 54, 0.2)",
    border: "1px solid rgba(244, 67, 54, 0.3)",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "16px",
    transition: "none",
    transform: "none",
  };

  const footerStyles = {
    padding: "20px 30px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    transform: "none",
    transition: "none",
    flexShrink: 0,
  };

  const buttonStyles = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "none",
    transform: "none",
  };

  const primaryButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
  };

  const secondaryButtonStyles = {
    ...buttonStyles,
    background: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  };

  const successButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
    color: "white",
  };

  const infoButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #2196F3, #0D47A1)",
    color: "white",
  };

  const skillTagStyles = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    margin: "4px",
    transform: "none",
    transition: "none",
  };

  const matchingSkillStyles = {
    ...skillTagStyles,
    background: "rgba(76, 175, 80, 0.2)",
    color: "#4CAF50",
    border: "1px solid rgba(76, 175, 80, 0.3)",
  };

  const missingSkillStyles = {
    ...skillTagStyles,
    background: "rgba(244, 67, 54, 0.2)",
    color: "#F44336",
    border: "1px solid rgba(244, 67, 54, 0.3)",
  };

  // Helper function to get section background color (alternating)
  const getSectionBackground = (index) => {
    const colors = [
      "rgba(102, 126, 234, 0.08)", // Blue
      "rgba(118, 75, 162, 0.08)", // Purple
      "rgba(255, 152, 0, 0.08)", // Orange
      "rgba(76, 175, 80, 0.08)", // Green
      "rgba(244, 67, 54, 0.08)", // Red
    ];
    return colors[index % colors.length];
  };

  const getSectionBorderColor = (index) => {
    const colors = [
      "rgba(102, 126, 234, 0.15)", // Blue
      "rgba(118, 75, 162, 0.15)", // Purple
      "rgba(255, 152, 0, 0.15)", // Orange
      "rgba(76, 175, 80, 0.15)", // Green
      "rgba(244, 67, 54, 0.15)", // Red
    ];
    return colors[index % colors.length];
  };

  return (
    <ModalPortal>
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div style={modalStyles}>
          {/* Close Button */}
          <button style={closeButtonStyles} onClick={onClose}>
            <IoIosClose />
          </button>

          {/* Modal Header */}
          <div style={headerStyles}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "white",
                }}
              >
                {resume.avatar}
              </div>
              <div>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "24px",
                    fontWeight: "600",
                    margin: "0 0 8px 0",
                  }}
                >
                  {resume.name}
                </h2>
                {resume.email && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.7)",
                      margin: "0 0 6px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ opacity: 0.8 }}>
                      <MdOutlineEmail />{" "}
                    </span>{" "}
                    {resume.email}
                  </div>
                )}
                {resume.upload_date && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.6)",
                      marginBottom: "6px",
                    }}
                  >
                    <MdDateRange /> Uploaded: {resume.upload_date}
                  </div>
                )}
                {resume.score > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        color: getScoreColor(resume.score),
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {resume.score}%
                    </span>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "14px",
                      }}
                    >
                      Match Score
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div style={bodyStyles}>
            {/* Summary Section */}
            {resume.description && (
              <div
                style={{
                  ...sectionStyles,
                  background: getSectionBackground(0),
                  border: `1px solid ${getSectionBorderColor(0)}`,
                  marginTop: 0,
                }}
              >
                <h3
                  style={{
                    color: "#667eea",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <MdOutlineSummarize />
                  Summary
                </h3>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    margin: 0,
                  }}
                >
                  {resume.description}
                </p>
              </div>
            )}

            {/* Contact Information & Details */}
            <div
              style={{
                ...sectionStyles,
                background: getSectionBackground(1),
                border: `1px solid ${getSectionBorderColor(1)}`,
              }}
            >
              <h3
                style={{
                  color: "#764ba2",
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0 0 15px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <MdOutlineInsertDriveFile />
                Resume Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                {resume.filename && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Filename
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.filename}
                    </div>
                  </div>
                )}

                {resume.phone && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Phone
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.phone}
                    </div>
                  </div>
                )}

                {resume.location && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Location
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.location}
                    </div>
                  </div>
                )}

                {resume.education && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Education
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.education}
                    </div>
                  </div>
                )}

                {resume.id && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Resume ID
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.id}
                    </div>
                  </div>
                )}
                {resume.email && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Email ID
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.email}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            {(resume.experienceMatch || resume.experience) && (
              <div
                style={{
                  ...sectionStyles,
                  background: "rgba(118, 75, 162, 0.15)",
                  border: `1px solid rgba(118, 75, 162, 0.3)`,
                  padding: "25px",
                }}
              >
                <h3
                  style={{
                    color: "#9575CD",
                    fontSize: "20px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <GrUserExpert /> Experience
                </h3>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontWeight: "500",
                  }}
                >
                  {resume.experienceMatch ||
                    resume.experience ||
                    "No experience information available"}
                </p>
              </div>
            )}

            {/* Skills Section */}
            {resume.skills?.length > 0 && (
              <div
                style={{
                  ...sectionStyles,
                  background: getSectionBackground(2),
                  border: `1px solid ${getSectionBorderColor(2)}`,
                }}
              >
                <h3
                  style={{
                    color: "#FF9800",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaBullseye /> Skills ({resume.skills.length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {resume.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        ...skillTagStyles,
                        background: "rgba(255, 152, 0, 0.2)",
                        color: "#FF9800",
                        border: "1px solid rgba(255, 152, 0, 0.3)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Skills Section */}
            {resume.matchingSkills?.length > 0 && (
              <div
                style={{
                  ...sectionStyles,
                  background: getSectionBackground(3),
                  border: `1px solid ${getSectionBorderColor(3)}`,
                }}
              >
                <h3
                  style={{
                    color: "#4CAF50",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaBullseye /> Matching Skills ({resume.matchingSkills.length}
                  )
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {resume.matchingSkills.map((skill, index) => (
                    <span key={index} style={matchingSkillStyles}>
                      <MdCheck /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills Section */}
            {resume.missingSkills?.length > 0 && (
              <div
                style={{
                  ...sectionStyles,
                  background: getSectionBackground(3),
                  border: `1px solid ${getSectionBorderColor(3)}`,
                }}
              >
                <h3
                  style={{
                    color: "#4CAF50",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaTimesCircle /> Missing Skills (
                  {resume.missingSkills.length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {resume.missingSkills.map((skill, index) => (
                    <span key={index} style={missingSkillStyles}>
                      <MdOutlineClose />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={footerStyles}>
            <button style={secondaryButtonStyles} onClick={onClose}>
              Close
            </button>
            <button
              style={primaryButtonStyles}
              onClick={handleDownload} //handleDownload common from
            >
              Download Resume
            </button>
            {resume.email && (
              <button
                style={infoButtonStyles}
                onClick={() =>
                  (window.location.href = `mailto:${resume.email}`)
                }
              >
                Contact Candidate
              </button>
            )}
            <button style={successButtonStyles}>Schedule Interview</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ResumeDetailModal;

import ModalPortal from "./ModalPortal";
import { IoIosClose } from "react-icons/io";
import { GrUserExpert } from "react-icons/gr";
import {
  FaBullseye,
  FaTimesCircle,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import {
  MdOutlineSummarize,
  MdOutlineInsertDriveFile,
  MdDateRange,
  MdOutlineEmail,
  MdCheck,
  MdOutlineClose,
  MdHelpOutline,
  MdPictureAsPdf,
  MdDownload,
} from "react-icons/md";
import { useState } from "react";
import axios from "axios";

const ResumeDetailModal = ({ resume, isOpen, onClose, handleDownload }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [resumeBlob, setResumeBlob] = useState(null);

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

  const handleViewResume = async () => {
    setLoadingResume(true);
    try {
      console.log("Starting to fetch resume for ID:", resume.id);
      
      // Fetch the resume file from the backend using axios
      const response = await axios.get(
        `http://10.20.0.58:8000/api/resumes/${resume.id}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data type:", response.data.type);

      if (response.status === 200) {
        // response.data is already a blob
        const blob = response.data;
        console.log("Resume blob received - Type:", blob.type, "Size:", blob.size);
        
        // Check if it's actually a PDF
        if (blob.size === 0) {
          console.error("Empty blob received");
          alert("Resume file is empty. Please try again.");
          setLoadingResume(false);
          return;
        }
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        console.log("Resume URL created:", url);
        
        setResumeBlob(blob);
        setResumeUrl(url);
        setShowResumeViewer(true);
      } else {
        console.error("Failed to fetch resume:", response.status);
        alert("Failed to load resume. Status: " + response.status);
      }
    } catch (error) {
      console.error("Error loading resume:", error);
      alert("Error loading resume: " + error.message);
    } finally {
      setLoadingResume(false);
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

                {resume.contact_number && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Contact Number
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.contact_number}
                    </div>
                  </div>
                )}

                {resume.linkedin && (
                  <a
                    href={resume.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginLeft: 12,
                      color: "#0A66C2",
                      verticalAlign: "middle",
                    }}
                    title="LinkedIn Profile"
                  >
                    <FaLinkedin size={22} />
                  </a>
                )}

                {resume.visa_type && (
                  <div>
                    <div
                      style={{
                        color: "#9575CD",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      VISA
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "15px",
                      }}
                    >
                      {resume.visa_type}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            {resume.experience_years && (
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
                  {resume.experience_years}
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

            {/* Questions to Ask Section */}
            {resume.questionsToAsk?.length > 0 && (
              <div
                style={{
                  ...sectionStyles,
                  background: getSectionBackground(4),
                  border: `1px solid ${getSectionBorderColor(4)}`,
                }}
              >
                <h3
                  style={{
                    color: "#FF6B6B",
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  ❓ Questions to Ask ({resume.questionsToAsk.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {resume.questionsToAsk.map((question, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(255, 107, 107, 0.1)",
                        border: "1px solid rgba(255, 107, 107, 0.2)",
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ marginRight: "8px", fontWeight: "bold", color: "#FF6B6B" }}>
                        Q{index + 1}.
                      </span>
                      {question}
                    </div>
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
              onClick={handleViewResume}
              disabled={loadingResume}
            >
              <MdPictureAsPdf /> {loadingResume ? "Loading..." : "View Resume"}
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
            {resume.contact_number && (
              <button
                style={successButtonStyles}
                onClick={() =>
                  (window.location.href = `tel:${resume.contact_number}`)
                }
              >
                Call Candidate
              </button>
            )}
            {resume.generated_questions?.length > 0 && (
              <button
                style={{
                  ...buttonStyles,
                  background: "linear-gradient(135deg, #FF9800, #F57C00)",
                  color: "white",
                }}
                onClick={() => setShowQuestions(true)}
              >
                <MdHelpOutline /> Questions
              </button>
            )}
            <button style={successButtonStyles}>Schedule Interview</button>
          </div>
        </div>

        {/* Questions Modal */}
        {showQuestions && resume.generated_questions?.length > 0 && (
          <div style={overlayStyles} onClick={() => setShowQuestions(false)}>
            <div
              style={{
                ...modalStyles,
                maxHeight: "85vh",
                width: "900px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Questions Modal Header */}
              <div style={headerStyles}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MdHelpOutline style={{ fontSize: "24px", color: "#FF9800" }} />
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "24px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    Interview Questions - {resume.name}
                  </h2>
                </div>
              </div>

              {/* Questions Modal Body */}
              <div style={bodyStyles}>
                {resume.generated_questions.map((questionObj, index) => (
                  <div
                    key={questionObj.id || index}
                    style={{
                      ...sectionStyles,
                      background:
                        questionObj.type === "technical"
                          ? "rgba(102, 126, 234, 0.1)"
                          : "rgba(76, 175, 80, 0.1)",
                      border:
                        questionObj.type === "technical"
                          ? "1px solid rgba(102, 126, 234, 0.3)"
                          : "1px solid rgba(76, 175, 80, 0.3)",
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "15px",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            questionObj.type === "technical"
                              ? "rgba(102, 126, 234, 0.3)"
                              : "rgba(76, 175, 80, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color:
                            questionObj.type === "technical"
                              ? "#667eea"
                              : "#4CAF50",
                          fontWeight: "bold",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#fff",
                            fontSize: "15px",
                            lineHeight: "1.6",
                            marginBottom: "10px",
                          }}
                        >
                          {questionObj.question}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background:
                              questionObj.type === "technical"
                                ? "rgba(102, 126, 234, 0.3)"
                                : "rgba(76, 175, 80, 0.3)",
                            color:
                              questionObj.type === "technical"
                                ? "#667eea"
                                : "#4CAF50",
                            textTransform: "capitalize",
                          }}
                        >
                          {questionObj.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Questions Modal Footer */}
              <div style={footerStyles}>
                <button
                  style={secondaryButtonStyles}
                  onClick={() => setShowQuestions(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resume Viewer Modal */}
        {showResumeViewer && (
          <div style={overlayStyles} onClick={() => setShowResumeViewer(false)}>
            <div
              style={{
                ...modalStyles,
                width: "95vw",
                maxWidth: "1400px",
                height: "95vh",
                maxHeight: "95vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Resume Viewer Header */}
              <div style={headerStyles}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MdPictureAsPdf style={{ fontSize: "24px", color: "#667eea" }} />
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "24px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    Resume - {resume.name}
                  </h2>
                </div>
              </div>

              {/* Resume Viewer Body */}
              <div style={bodyStyles}>
                {loadingResume ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "15px",
                        animation: "spin 2s linear infinite",
                      }}
                    >
                      ⏳
                    </div>
                    <p>Loading resume...</p>
                  </div>
                ) : resumeUrl ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <iframe
                      src={`${resumeUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                      type="application/pdf"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        borderRadius: "8px",
                        flex: 1,
                      }}
                      title="Resume PDF Viewer"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <MdPictureAsPdf style={{ fontSize: "48px", marginBottom: "15px", color: "#667eea" }} />
                    <p>Resume could not be loaded</p>
                    <small style={{ marginTop: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
                      Check your internet connection and try again
                    </small>
                  </div>
                )}
              </div>

              {/* Resume Viewer Footer */}
              <div style={footerStyles}>
                <button
                  style={secondaryButtonStyles}
                  onClick={() => {
                    setShowResumeViewer(false);
                    if (resumeUrl) {
                      URL.revokeObjectURL(resumeUrl);
                      setResumeUrl(null);
                      setResumeBlob(null);
                    }
                  }}
                >
                  Close
                </button>
                {resumeBlob && (
                  <button
                    style={successButtonStyles}
                    onClick={() => {
                      // Download the blob
                      const url = URL.createObjectURL(resumeBlob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${resume.name}_resume.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <MdDownload /> Download Resume
                  </button>
                )}
                {resumeUrl && (
                  <button
                    style={{
                      ...buttonStyles,
                      background: "linear-gradient(135deg, #FF9800, #F57C00)",
                      color: "white",
                    }}
                    onClick={() => {
                      // Open in new tab as fallback
                      window.open(resumeUrl, '_blank');
                    }}
                  >
                    Open in New Tab
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};

export default ResumeDetailModal;

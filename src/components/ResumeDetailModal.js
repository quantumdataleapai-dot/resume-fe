import ModalPortal from "./ModalPortal";
import { IoIosClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";
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

const ResumeDetailModal = ({ resume, isOpen, onClose, handleDownload, onDelete }) => {
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
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
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
    background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
    borderRadius: "16px",
    width: "800px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
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
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
    transform: "none",
    transition: "none",
  };

  const bodyStyles = {
    padding: "30px",
    maxHeight: "calc(90vh - 200px)",
    overflowY: "auto",
    background: "#ffffff",
    transform: "none",
    transition: "none",
    flex: 1,
    minHeight: "200px", // Ensure minimum height for content
    display: "flex",
    flexDirection: "column",
  };

  const sectionStyles = {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    margin: "15px 0",
    transition: "none",
    transform: "none",
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#dc2626",
    fontSize: "16px",
    transition: "all 0.3s ease",
    transform: "none",
  };

  const footerStyles = {
    padding: "20px 30px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
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
    background: "linear-gradient(135deg, #667eea, #8b5cf6)",
    color: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  };

  const secondaryButtonStyles = {
    ...buttonStyles,
    background: "#f3f4f6",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
  };

  const successButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "white",
    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
  };

  const infoButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "white",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
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
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
  };

  const missingSkillStyles = {
    ...skillTagStyles,
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
  };

  // Helper function to get section background color (alternating)
  const getSectionBackground = (index) => {
    const colors = [
      "#eff6ff", // Blue
      "#f0f9ff", // Light Blue
      "#fffbeb", // Orange
      "#f0fdf4", // Green
      "#fee2e2", // Red
    ];
    return colors[index % colors.length];
  };

  const getSectionBorderColor = (index) => {
    const colors = [
      "#bfdbfe", // Blue
      "#bfdbfe", // Light Blue
      "#fde68a", // Orange
      "#bbf7d0", // Green
      "#fca5a5", // Red
    ];
    return colors[index % colors.length];
  };

  return (
    <ModalPortal>
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div style={modalStyles}>
          {/* Delete and Close Buttons Container */}
          <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px", alignItems: "center", zIndex: 10 }}>
            {onDelete && (
              <button 
                style={{
                  background: "transparent",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  color: "#dc2626",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                }}
                onClick={() => {
                  onDelete(resume.id, resume.name);
                  onClose();
                }}
                title="Delete resume"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(220, 38, 38, 0.15)";
                  e.currentTarget.style.boxShadow = "0 0 8px rgba(220, 38, 38, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <MdDelete size={18} />
              </button>
            )}
            <button 
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#dc2626",
                fontSize: "18px",
                transition: "all 0.3s ease",
                padding: 0,
              }} 
              onClick={onClose}
            >
              <IoIosClose />
            </button>
          </div>

          {/* Modal Header */}
          <div style={headerStyles}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea, #8b5cf6)",
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
                    color: "#1f2937",
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
                      color: "#6b7280",
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
                      color: "#9ca3af",
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
                        color: "#6b7280",
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
                    color: "#0284c7",
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
                    color: "#4b5563",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    margin: 0,
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
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
                background: "#f0f9ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <h3
                style={{
                  color: "#0284c7",
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
                        color: "#0284c7",
                        fontSize: "14px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Location
                    </div>
                    <div
                      style={{
                        color: "#1f2937",
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
                        color: "#0284c7",
                        fontSize: "14px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Education
                    </div>
                    <div
                      style={{
                        color: "#1f2937",
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
                        color: "#0284c7",
                        fontSize: "14px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Email ID
                    </div>
                    <div
                      style={{
                        color: "#1f2937",
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
                        color: "#0284c7",
                        fontSize: "14px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Contact Number
                    </div>
                    <div
                      style={{
                        color: "#1f2937",
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
                        color: "#0284c7",
                        fontSize: "14px",
                        marginBottom: "4px",
                        fontWeight: "500",
                      }}
                    >
                      VISA
                    </div>
                    <div
                      style={{
                        color: "#1f2937",
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
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  padding: "25px",
                }}
              >
                <h3
                  style={{
                    color: "#667eea",
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
                    color: "#1f2937",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontWeight: "500",
                  }}
                >
                  {typeof resume.experience_years === 'number' 
                    ? `${resume.experience_years} years of experience`
                    : resume.experience_years
                  }
                </p>
              </div>
            )}

            {/* Skills Section */}
            {resume.skills?.length > 0 && (
              <div
                style={{
                  ...sectionStyles,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                }}
              >
                <h3
                  style={{
                    color: "#d97706",
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
                        background: "#fef3c7",
                        color: "#d97706",
                        border: "1px solid #fde68a",
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
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <h3
                  style={{
                    color: "#16a34a",
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
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                }}
              >
                <h3
                  style={{
                    color: "#dc2626",
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
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                }}
              >
                <h3
                  style={{
                    color: "#dc2626",
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
                        background: "#fecaca",
                        border: "1px solid #fca5a5",
                        color: "#1f2937",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ marginRight: "8px", fontWeight: "bold", color: "#dc2626" }}>
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
                style={{
                  ...buttonStyles,
                  background: "linear-gradient(135deg, rgb(33 207 210), rgb(133 173 167 / 87%))",
                  color: "white",
                }}
                onClick={() =>
                  (window.location.href = `tel:${resume.contact_number}`)
                }
              >
                Call Candidate
              </button>
            )}
            {(resume.generated_questions?.length > 0 || resume.questions?.hr_general_questions?.length > 0) && (
              <button
                style={{
                  ...buttonStyles,
                  background: "linear-gradient(135deg, #d97706, #b45309)",
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
        {showQuestions && (resume.generated_questions?.length > 0 || resume.questions?.hr_general_questions?.length > 0) && (
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
                  <MdHelpOutline style={{ fontSize: "24px", color: "#d97706" }} />
                  <h2
                    style={{
                      color: "#1f2937",
                      fontSize: "24px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    Interview Questions {resume.questions?.role && `- ${resume.questions.role}`} - {resume.name}
                  </h2>
                </div>
              </div>

              {/* Questions Modal Body */}
              <div style={bodyStyles}>
                {/* Handle new format: hr_general_questions */}
                {resume.questions?.hr_general_questions?.length > 0 ? (
                  <>
                    <div style={{ marginBottom: "10px" }}>
                      <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 10px 0" }}>
                        Role: <strong>{resume.questions.role}</strong>
                      </p>
                    </div>
                    {resume.questions.hr_general_questions.map((question, index) => (
                      <div
                        key={index}
                        style={{
                          ...sectionStyles,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
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
                              background: "#f0fdf4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#16a34a",
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
                                color: "#1f2937",
                                fontSize: "15px",
                                lineHeight: "1.6",
                                marginBottom: "10px",
                              }}
                            >
                              {question}
                            </div>
                            <div
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500",
                                background: "#f0fdf4",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              HR General
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Handle old format: generated_questions */
                  resume.generated_questions.map((questionObj, index) => (
                    <div
                      key={questionObj.id || index}
                      style={{
                        ...sectionStyles,
                        background:
                          questionObj.type === "technical"
                            ? "#eff6ff"
                            : "#f0fdf4",
                        border:
                          questionObj.type === "technical"
                            ? "1px solid #bfdbfe"
                            : "1px solid #bbf7d0",
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
                                ? "#eff6ff"
                                : "#f0fdf4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color:
                              questionObj.type === "technical"
                                ? "#0284c7"
                                : "#16a34a",
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
                              color: "#1f2937",
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
                                  ? "#eff6ff"
                                  : "#f0fdf4",
                              color:
                                questionObj.type === "technical"
                                  ? "#0284c7"
                                  : "#16a34a",
                              border:
                                questionObj.type === "technical"
                                  ? "1px solid #bfdbfe"
                                  : "1px solid #bbf7d0",
                              textTransform: "capitalize",
                            }}
                          >
                            {questionObj.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                  <MdPictureAsPdf style={{ fontSize: "24px", color: "#0284c7" }} />
                  <h2
                    style={{
                      color: "#1f2937",
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
                      color: "#6b7280",
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
                      color: "#6b7280",
                      fontSize: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <MdPictureAsPdf style={{ fontSize: "48px", marginBottom: "15px", color: "#0284c7" }} />
                    <p>Resume could not be loaded</p>
                    <small style={{ marginTop: "10px", color: "#9ca3af" }}>
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
                      background: "linear-gradient(135deg, #d97706, #b45309)",
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

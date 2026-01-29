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
import { useState, useRef } from "react";
import axios from "axios";
import * as mammoth from "mammoth";

const ResumeDetailModal = ({ resume, isOpen, onClose, handleDownload, onDelete, jdId }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [resumeBlob, setResumeBlob] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [resumeFileType, setResumeFileType] = useState(null);
  const [wordDocHtml, setWordDocHtml] = useState(null);
  const wordDocContainerRef = useRef(null);

  if (!isOpen || !resume) return null;

  console.log("ResumeDetailModal - jdId prop:", jdId);
  console.log("ResumeDetailModal - resume.questions:", resume.questions);
  console.log("ResumeDetailModal - generatedQuestions:", generatedQuestions);

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
        `http://10.30.0.104:8006/api/resumes/download/${resume.id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.status === 200) {
        // response.data is already a blob
        const blob = response.data;
        console.log("Resume blob received - Type:", blob.type, "Size:", blob.size);
        
        // Check if blob is empty
        if (blob.size === 0) {
          console.error("Empty blob received");
          alert("Resume file is empty. Please try again.");
          setLoadingResume(false);
          return;
        }
        
        // Determine file type from Content-Type header or blob type
        let contentType = response.headers["content-type"] || blob.type;
        console.log("Content-Type:", contentType);
        
        // Normalize content type
        let fileType = "unknown";
        if (contentType.includes("pdf")) {
          fileType = "pdf";
        } else if (
          contentType.includes("wordprocessingml") ||
          contentType.includes("msword") ||
          contentType.includes("word")
        ) {
          fileType = "word";
        } else if (contentType.includes("plain")) {
          fileType = "text";
        }
        
        console.log("Detected file type:", fileType);
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        console.log("Resume URL created:", url);
        
        setResumeBlob(blob);
        setResumeUrl(url);
        setResumeFileType(fileType);
        
        // For Word documents, convert to HTML
        if (fileType === "word") {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            console.log("Word document converted to HTML");
            setWordDocHtml(result.value);
          } catch (conversionError) {
            console.error("Error converting Word document:", conversionError);
            setWordDocHtml("<p>Error converting Word document. Please try downloading the file instead.</p>");
          }
        } else {
          setWordDocHtml(null);
        }
        
        // Show the resume viewer
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

  const handleGenerateQuestions = async () => {
    // Always call API to get fresh questions for this specific candidate
    if (!jdId || !resume?.id) {
      setQuestionsError("Missing required information to generate questions");
      alert("Missing JD ID or Resume ID. Please ensure job description is processed first.");
      return;
    }

    setLoadingQuestions(true);
    setQuestionsError(null);

    try {
      const response = await fetch(
        "http://10.30.0.104:8006/api/jobs/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jd_id: jdId,
            resume_id: resume.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Questions response for resume:", resume.id, result);

      // Store the generated questions in local state
      // API returns { data: { role, technical_questions, general_questions } }
      if (result.data) {
        setGeneratedQuestions(result.data);
        setShowQuestions(true);
      } else if (result.questions) {
        setGeneratedQuestions(result.questions);
        setShowQuestions(true);
      } else {
        throw new Error("No questions data in response");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setQuestionsError(error.message || "Failed to generate questions");
      alert("Error: " + (error.message || "Failed to generate questions"));
    } finally {
      setLoadingQuestions(false);
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
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    transform: "none",
    transition: "none",
    flexShrink: 0,
    flexWrap: "wrap",
    alignItems: "center",
  };

  const buttonStyles = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    transform: "none",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };

  const primaryButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #667eea, #8b5cf6)",
    color: "white",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
  };

  const secondaryButtonStyles = {
    ...buttonStyles,
    background: "#ffffff",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  const successButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "white",
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
  };

  const infoButtonStyles = {
    ...buttonStyles,
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "white",
    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
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
            {/* {resume.matchingSkills?.length > 0 && (
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
            )} */}

            {/* Missing Skills Section */}
            {/* {resume.missingSkills?.length > 0 && (
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
            )} */}

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
            {/* <button style={secondaryButtonStyles} onClick={onClose}>
              Close
            </button> */}
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
            <button
              style={{
                ...buttonStyles,
                background: "linear-gradient(135deg, #e0a7edff, #7b09b4b8)",
                color: "white",
                opacity: loadingQuestions ? 0.7 : 1,
              }}
              onClick={handleGenerateQuestions}
              disabled={loadingQuestions}
            >
              <MdHelpOutline /> {loadingQuestions ? "Generating..." : "Questions"}
            </button>
            <button style={successButtonStyles}>Schedule Interview</button>
          </div>
        </div>

        {/* Questions Modal */}
        {showQuestions && (generatedQuestions || resume.questions || resume.generated_questions?.length > 0) && (
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
                    Interview Questions {(generatedQuestions?.role || resume.questions?.role) && `- ${generatedQuestions?.role || resume.questions?.role}`} - {resume.name}
                  </h2>
                </div>
              </div>

              {/* Questions Modal Body */}
              <div style={bodyStyles}>
                {/* New Format: Technical Questions Section */}
                {generatedQuestions?.technical_questions && (
                  <div style={{ marginBottom: "30px" }}>
                    <h3
                      style={{
                        color: "#1f2937",
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "20px",
                        paddingBottom: "12px",
                        borderBottom: "3px solid #0284c7",
                      }}
                    >
                      Technical Questions
                    </h3>

                    {/* Project-Based Questions */}
                    {generatedQuestions.technical_questions.project_based?.length > 0 && (
                      <div style={{ marginBottom: "25px" }}>
                        <h4
                          style={{
                            color: "#0284c7",
                            fontSize: "15px",
                            fontWeight: "600",
                            marginBottom: "15px",
                            marginLeft: "10px",
                          }}
                        >
                          🎯 Project-Based Questions
                        </h4>
                        {generatedQuestions.technical_questions.project_based.map((project, projectIdx) => (
                          <div key={projectIdx} style={{ marginBottom: "20px", marginLeft: "20px" }}>
                            <div
                              style={{
                                background: "#eff6ff",
                                border: "2px solid #0284c7",
                                borderRadius: "8px",
                                padding: "12px 15px",
                                marginBottom: "12px",
                              }}
                            >
                              <p
                                style={{
                                  color: "#0284c7",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  margin: 0,
                                }}
                              >
                                {project.project_name}
                              </p>
                            </div>
                            {project.questions.map((question, qIdx) => (
                              <div
                                key={`project-${projectIdx}-${qIdx}`}
                                style={{
                                  ...sectionStyles,
                                  background: "#f0f9ff",
                                  border: "1px solid #bfdbfe",
                                  marginBottom: "12px",
                                  marginLeft: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      minWidth: "30px",
                                      height: "30px",
                                      borderRadius: "50%",
                                      background: "#0284c7",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {qIdx + 1}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p
                                      style={{
                                        color: "#1f2937",
                                        fontSize: "14px",
                                        lineHeight: "1.6",
                                        margin: 0,
                                      }}
                                    >
                                      {question}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Experience-Based Questions */}
                    {generatedQuestions.technical_questions.experience_based?.length > 0 && (
                      <div>
                        <h4
                          style={{
                            color: "#0284c7",
                            fontSize: "15px",
                            fontWeight: "600",
                            marginBottom: "15px",
                            marginLeft: "10px",
                          }}
                        >
                          💼 Experience-Based Questions
                        </h4>
                        {generatedQuestions.technical_questions.experience_based.map((exp, expIdx) => (
                          <div key={expIdx} style={{ marginBottom: "20px", marginLeft: "20px" }}>
                            <div
                              style={{
                                background: "#eff6ff",
                                border: "2px solid #0284c7",
                                borderRadius: "8px",
                                padding: "12px 15px",
                                marginBottom: "12px",
                              }}
                            >
                              <p
                                style={{
                                  color: "#0284c7",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  margin: 0,
                                }}
                              >
                                {exp.role}
                              </p>
                            </div>
                            {exp.questions.map((question, qIdx) => (
                              <div
                                key={`exp-${expIdx}-${qIdx}`}
                                style={{
                                  ...sectionStyles,
                                  background: "#f0f9ff",
                                  border: "1px solid #bfdbfe",
                                  marginBottom: "12px",
                                  marginLeft: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      minWidth: "30px",
                                      height: "30px",
                                      borderRadius: "50%",
                                      background: "#0284c7",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {qIdx + 1}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p
                                      style={{
                                        color: "#1f2937",
                                        fontSize: "14px",
                                        lineHeight: "1.6",
                                        margin: 0,
                                      }}
                                    >
                                      {question}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* New Format: General Questions Section */}
                {generatedQuestions?.general_questions && (
                  <div>
                    <h3
                      style={{
                        color: "#1f2937",
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "20px",
                        paddingBottom: "12px",
                        borderBottom: "3px solid #16a34a",
                      }}
                    >
                      General & HR Questions
                    </h3>

                    {/* Visa and Work Authorization */}
                    {generatedQuestions.general_questions.visa_and_work_authorization?.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <h4
                          style={{
                            color: "#16a34a",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            marginLeft: "10px",
                          }}
                        >
                          📋 Visa & Work Authorization
                        </h4>
                        {generatedQuestions.general_questions.visa_and_work_authorization.map((question, idx) => (
                          <div
                            key={`visa-${idx}`}
                            style={{
                              ...sectionStyles,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              marginBottom: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div
                                style={{
                                  minWidth: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  background: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <p style={{ color: "#1f2937", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                {question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Location and Relocation */}
                    {generatedQuestions.general_questions.location_and_relocation?.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <h4
                          style={{
                            color: "#16a34a",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            marginLeft: "10px",
                          }}
                        >
                          📍 Location & Relocation
                        </h4>
                        {generatedQuestions.general_questions.location_and_relocation.map((question, idx) => (
                          <div
                            key={`location-${idx}`}
                            style={{
                              ...sectionStyles,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              marginBottom: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div
                                style={{
                                  minWidth: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  background: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <p style={{ color: "#1f2937", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                {question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Salary Expectations */}
                    {generatedQuestions.general_questions.salary_expectations?.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <h4
                          style={{
                            color: "#16a34a",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            marginLeft: "10px",
                          }}
                        >
                          💰 Salary Expectations
                        </h4>
                        {generatedQuestions.general_questions.salary_expectations.map((question, idx) => (
                          <div
                            key={`salary-${idx}`}
                            style={{
                              ...sectionStyles,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              marginBottom: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div
                                style={{
                                  minWidth: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  background: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <p style={{ color: "#1f2937", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                {question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notice Period and Availability */}
                    {generatedQuestions.general_questions.notice_period_and_availability?.length > 0 && (
                      <div>
                        <h4
                          style={{
                            color: "#16a34a",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            marginLeft: "10px",
                          }}
                        >
                          ⏰ Notice Period & Availability
                        </h4>
                        {generatedQuestions.general_questions.notice_period_and_availability.map((question, idx) => (
                          <div
                            key={`notice-${idx}`}
                            style={{
                              ...sectionStyles,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              marginBottom: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div
                                style={{
                                  minWidth: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  background: "#16a34a",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <p style={{ color: "#1f2937", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                                {question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    {resumeFileType === "pdf" ? (
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
                    ) : resumeFileType === "word" && wordDocHtml ? (
                      <div
                        ref={wordDocContainerRef}
                        style={{
                          width: "100%",
                          height: "100%",
                          overflowY: "auto",
                          padding: "30px",
                          boxSizing: "border-box",
                          background: "#ffffff",
                          borderRadius: "8px",
                          flex: 1,
                          fontSize: "14px",
                          lineHeight: "1.6",
                          color: "#1f2937",
                        }}
                        dangerouslySetInnerHTML={{ __html: wordDocHtml }}
                      />
                    ) : resumeFileType === "word" ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          padding: "20px",
                          boxSizing: "border-box",
                        }}
                      >
                        <MdOutlineInsertDriveFile
                          style={{
                            fontSize: "64px",
                            marginBottom: "15px",
                            color: "#2563eb",
                          }}
                        />
                        <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0" }}>
                          Converting Word Document...
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          padding: "20px",
                          boxSizing: "border-box",
                        }}
                      >
                        <MdOutlineInsertDriveFile
                          style={{
                            fontSize: "64px",
                            marginBottom: "15px",
                            color: "#9ca3af",
                          }}
                        />
                        <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0" }}>
                          Unsupported Format
                        </p>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0", textAlign: "center" }}>
                          This resume format cannot be previewed in the browser.
                        </p>
                        <button
                          onClick={() => {
                            if (resumeUrl) {
                              const link = document.createElement("a");
                              link.href = resumeUrl;
                              link.download = `${resume.name}_resume`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                          style={{
                            ...primaryButtonStyles,
                            padding: "10px 20px",
                          }}
                        >
                          <MdDownload /> Download File
                        </button>
                      </div>
                    )}
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
                      setResumeFileType(null);
                      setWordDocHtml(null);
                    }
                  }}
                >
                  Close
                </button>
                {resumeBlob && resumeFileType === "pdf" && (
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
                {resumeBlob && resumeFileType === "word" && (
                  <button
                    style={successButtonStyles}
                    onClick={() => {
                      // Download the Word document
                      const link = document.createElement("a");
                      link.href = resumeUrl;
                      link.download = `${resume.name}_resume.docx`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <MdDownload /> Download Resume
                  </button>
                )}
                {resumeUrl && resumeFileType === "pdf" && (
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

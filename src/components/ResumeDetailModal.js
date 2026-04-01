import API_CONFIG from "../config/apiConfig";
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
  MdLock,
  MdLockOpen,
} from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { useTheme } from "../utils/ThemeContext";
import apiService from "../services/apiService";
import axios from "axios";
import * as mammoth from "mammoth";

const ResumeDetailModal = ({ resume, isOpen, onClose, handleDownload, onDelete, jdId }) => {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const _t = isDark ? "#e2e8f0" : "#1f2937";
  const _bg = isDark ? "#1e293b" : "#ffffff";
  const _bgSec = isDark ? "#0f172a" : "#f9fafb";
  const _border = isDark ? "#334155" : "#e5e7eb";
  const _textSec = isDark ? "#94a3b8" : "#4b5563";
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
  const [isLocked, setIsLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [lockError, setLockError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const wordDocContainerRef = useRef(null);

  useEffect(() => {
    if (resume && isOpen) {
      setIsLocked(resume.is_locked || false);
      setLockError(null);
    }
  }, [resume, isOpen]);

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

  const handleToggleLock = async () => {
    setLockLoading(true);
    setShowLockConfirm(false);
    try {
      let res;
      if (isLocked) {
        // Admin uses force-unlock API, User uses regular unlock API
        res = isAdmin()
          ? await apiService.forceUnlock(resume.id)
          : await apiService.unlockResume(resume.id);
      } else {
        res = await apiService.lockResume(resume.id);
      }
      if (res?.success) {
        const newLocked = !isLocked;
        setIsLocked(newLocked);
        resume.is_locked = newLocked;
      } else {
        setLockError(res?.message || "Failed to update lock status.");
      }
    } catch (error) {
      console.error("Error toggling lock:", error);
      setLockError(error.response?.data?.message || "Failed to update lock status.");
    } finally {
      setLockLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    setDeleteLoading(true);
    setShowDeleteConfirm(false);
    try {
      const response = await axios.delete(
        `http://10.30.0.104:8010/api/resumes/${resume.id}/delete`
      );
      if (response.data?.success) {
        if (onDelete) {
          onDelete(resume.id, resume.name);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert(error.response?.data?.message || "Failed to delete resume.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewResume = async () => {
    setLoadingResume(true);
    try {
      console.log("Starting to fetch resume for ID:", resume.id);
      
      // Fetch the resume file from the backend using axios
      const response = await axios.get(
        `http://10.30.0.104:8010/api/resumes/download/${resume.id}`,
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
    if (!resume?.id) {
      setQuestionsError("No resume selected.");
      return;
    }

    setLoadingQuestions(true);
    setQuestionsError(null);

    // Build request body — include jd_id if available, always include resume_id
    const requestBody = { resume_id: String(resume.id) };
    if (jdId) requestBody.jd_id = jdId;
    console.log("Generate questions request:", requestBody);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/jobs/generate-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
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
    background: isDark ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
    borderRadius: "16px",
    width: "800px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: isDark ? "0 25px 50px rgba(0, 0, 0, 0.5)" : "0 25px 50px rgba(0, 0, 0, 0.15)",
    border: `1px solid ${_border}`,
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
    borderBottom: `1px solid ${_border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: isDark ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" : "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
    transform: "none",
    transition: "none",
  };

  const bodyStyles = {
    padding: "30px",
    maxHeight: "calc(90vh - 200px)",
    overflowY: "auto",
    background: _bg,
    transform: "none",
    transition: "none",
    flex: 1,
    minHeight: "200px", // Ensure minimum height for content
    display: "flex",
    flexDirection: "column",
  };

  const sectionStyles = {
    background: isDark ? "#0f172a" : "#f9fafb",
    borderRadius: "12px",
    padding: "20px",
    border: `1px solid ${_border}`,
    margin: "15px 0",
    transition: "none",
    transform: "none",
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "15px",
    right: "20px",
    background: isDark ? "#7f1d1d" : "#fee2e2",
    border: isDark ? "1px solid #991b1b" : "1px solid #fca5a5",
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
    borderTop: `1px solid ${_border}`,
    background: isDark ? "#0f172a" : "#f9fafb",
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
    background: _bg,
    color: _textSec,
    border: `1px solid ${_border}`,
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
    background: isDark ? "#052e16" : "#f0fdf4",
    color: "#16a34a",
    border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
  };

  const missingSkillStyles = {
    ...skillTagStyles,
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
  };

  // Helper function to get section background color (alternating)
  const getSectionBackground = (index) => {
    const colors = isDark
      ? ["#0f1a2e", "#0f172a", "#1a1a0f", "#0f1a16", "#1a0f0f"]
      : ["#eff6ff", "#f0f9ff", "#fffbeb", "#f0fdf4", "#fee2e2"];
    return colors[index % colors.length];
  };

  const getSectionBorderColor = (index) => {
    const colors = isDark
      ? ["#1e3a5f", "#1e3a5f", "#3d3400", "#065f46", "#5c1a1a"]
      : ["#bfdbfe", "#bfdbfe", "#fde68a", "#bbf7d0", "#fca5a5"];
    return colors[index % colors.length];
  };

  return (
    <ModalPortal>
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div style={modalStyles}>
          {/* Delete and Close Buttons Container */}
          <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px", alignItems: "center", zIndex: 10 }}>
            {/* Lock/Unlock: Admin can only unlock; User/Recruiter can lock and unlock */}
            {(!isAdmin() || isLocked) && (
              <>
                {isLocked && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#b45309",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Locked
                  </span>
                )}
                <button
                  style={{
                    background: isLocked ? "#fef3c7" : "transparent",
                    border: `1px solid ${isLocked ? "#eab308" : "rgba(107, 114, 128, 0.3)"}`,
                    color: isLocked ? "#b45309" : "#6b7280",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    cursor: lockLoading ? "not-allowed" : "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    width: "36px",
                    height: "36px",
                    minWidth: "36px",
                    opacity: lockLoading ? 0.6 : 1,
                  }}
                  onClick={() => setShowLockConfirm(true)}
                  disabled={lockLoading}
                  title={isLocked ? (isAdmin() ? "Force unlock resume" : "Unlock resume") : "Lock resume"}
                  onMouseEnter={(e) => {
                    if (!lockLoading) {
                      e.currentTarget.style.background = isLocked
                        ? "#fde68a"
                        : "rgba(107, 114, 128, 0.15)";
                      e.currentTarget.style.boxShadow = isLocked
                        ? "0 0 8px rgba(234, 179, 8, 0.4)"
                        : "0 0 8px rgba(107, 114, 128, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isLocked ? "#fef3c7" : "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isLocked ? <MdLock size={18} /> : <MdLockOpen size={18} />}
                </button>
              </>
            )}
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
                onClick={() => setShowDeleteConfirm(true)}
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
                    color: _t,
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
                      color: _textSec,
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
                      color: isDark ? "#64748b" : "#9ca3af",
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
                        color: _textSec,
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
                    color: isDark ? "#7dd3fc" : "#0284c7",
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
                    color: _textSec,
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
                background: isDark ? "#0c1a2e" : "#f0f9ff",
                border: isDark ? "1px solid #1e3a5f" : "1px solid #bfdbfe",
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
                        color: _t,
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
                        color: _t,
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
                        color: _t,
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
                        color: _t,
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
                      Work Authorization
                    </div>
                    <div
                      style={{
                        color: _t,
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
                  background: _bgSec,
                  border: `1px solid ${_border}`,
                  padding: "25px",
                }}
              >
                <h3
                  style={{
                    color: isDark ? "#a5b4fc" : "#667eea",
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
                    color: _t,
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
                  background: isDark ? "#0f172a" : "#fffbeb",
                  border: isDark ? "1px solid #334155" : "1px solid #fde68a",
                }}
              >
                <h3
                  style={{
                    color: isDark ? "#a5b4fc" : "#d97706",
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
                        background: isDark ? "#1e293b" : "#fef3c7",
                        color: isDark ? "#c4b5fd" : "#d97706",
                        border: isDark ? "1px solid #475569" : "1px solid #fde68a",
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
                  background: isDark ? "#052e16" : "#f0fdf4",
                  border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
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
                        background: isDark ? "#7f1d1d" : "#fecaca",
                        border: "1px solid #fca5a5",
                        color: _t,
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
            {jdId && (
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
            )}
            <button style={successButtonStyles}>Schedule Interview</button>
          </div>
        </div>

        {/* Questions Modal */}
        {showQuestions && (generatedQuestions || resume.questions || resume.generated_questions?.length > 0) && (
          <div style={overlayStyles} onClick={() => setShowQuestions(false)}>
            <div
              style={{
                ...modalStyles,
                maxHeight: "99vh",
                width: "990px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Questions Modal Header */}
              <div style={headerStyles}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MdHelpOutline style={{ fontSize: "24px", color: "#d97706" }} />
                  <h2
                    style={{
                      color: _t,
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
                        color: _t,
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
                            color: isDark ? "#7dd3fc" : "#0284c7",
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
                                background: isDark ? "#0c1a2e" : "#eff6ff",
                                border: isDark ? "2px solid #1e3a5f" : "2px solid #0284c7",
                                borderRadius: "8px",
                                padding: "12px 15px",
                                marginBottom: "12px",
                              }}
                            >
                              <p
                                style={{
                                  color: isDark ? "#7dd3fc" : "#0284c7",
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
                                  background: isDark ? "#0f172a" : "#f0f9ff",
                                  border: isDark ? "1px solid #1e3a5f" : "1px solid #bfdbfe",
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
                                        color: _t,
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
                            color: isDark ? "#7dd3fc" : "#0284c7",
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
                                background: isDark ? "#0c1a2e" : "#eff6ff",
                                border: isDark ? "2px solid #1e3a5f" : "2px solid #0284c7",
                                borderRadius: "8px",
                                padding: "12px 15px",
                                marginBottom: "12px",
                              }}
                            >
                              <p
                                style={{
                                  color: isDark ? "#7dd3fc" : "#0284c7",
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
                                  background: isDark ? "#0f172a" : "#f0f9ff",
                                  border: isDark ? "1px solid #1e3a5f" : "1px solid #bfdbfe",
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
                                        color: _t,
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
                        color: _t,
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
                            color: isDark ? "#4ade80" : "#16a34a",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            marginLeft: "10px",
                          }}
                        >
                          📋 Work Authorization
                        </h4>
                        {generatedQuestions.general_questions.visa_and_work_authorization.map((question, idx) => (
                          <div
                            key={`visa-${idx}`}
                            style={{
                              ...sectionStyles,
                              background: isDark ? "#052e16" : "#f0fdf4",
                              border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
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
                              <p style={{ color: _t, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
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
                            color: isDark ? "#4ade80" : "#16a34a",
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
                              background: isDark ? "#052e16" : "#f0fdf4",
                              border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
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
                              <p style={{ color: _t, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
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
                            color: isDark ? "#4ade80" : "#16a34a",
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
                              background: isDark ? "#052e16" : "#f0fdf4",
                              border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
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
                              <p style={{ color: _t, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
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
                            color: isDark ? "#4ade80" : "#16a34a",
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
                              background: isDark ? "#052e16" : "#f0fdf4",
                              border: isDark ? "1px solid #065f46" : "1px solid #bbf7d0",
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
                              <p style={{ color: _t, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
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
                      color: _t,
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
              <div style={{ ...bodyStyles, maxHeight: "none" }}>
                {loadingResume ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: _textSec,
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
                          background: _bg,
                          borderRadius: "8px",
                          flex: 1,
                          fontSize: "14px",
                          lineHeight: "1.6",
                          color: _t,
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
                          background: _bgSec,
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
                          background: _bgSec,
                          borderRadius: "8px",
                          padding: "20px",
                          boxSizing: "border-box",
                        }}
                      >
                        <MdOutlineInsertDriveFile
                          style={{
                            fontSize: "64px",
                            marginBottom: "15px",
                            color: isDark ? "#64748b" : "#9ca3af",
                          }}
                        />
                        <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0" }}>
                          Unsupported Format
                        </p>
                        <p style={{ fontSize: "14px", color: _textSec, margin: "0 0 20px 0", textAlign: "center" }}>
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
                      color: _textSec,
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
                    <small style={{ marginTop: "10px", color: isDark ? "#64748b" : "#9ca3af" }}>
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
        {/* Lock/Unlock Confirmation Popup */}
        {showLockConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
            }}
            onClick={() => setShowLockConfirm(false)}
          >
            <div
              style={{
                background: _bg,
                borderRadius: "12px",
                padding: "30px",
                width: "400px",
                maxWidth: "90vw",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: isLocked ? "#fef3c7" : "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {isLocked ? (
                  <MdLockOpen size={24} style={{ color: "#d97706" }} />
                ) : (
                  <MdLock size={24} style={{ color: "#4f46e5" }} />
                )}
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: _t }}>
                {isLocked
                  ? (isAdmin() ? "Force Unlock Resume?" : "Unlock Resume?")
                  : "Lock Resume?"}
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: "14px", color: _textSec, lineHeight: "1.5" }}>
                {isLocked
                  ? (isAdmin()
                    ? `Are you sure you want to force-unlock the resume for ${resume.name}? It will be visible in match results for all users.`
                    : `Are you sure you want to unlock the resume for ${resume.name}? It will be visible in match results for other users.`)
                  : `Are you sure you want to lock the resume for ${resume.name}? Locked resumes are excluded from match results for other users.`}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: `1px solid ${_border}`,
                    background: _bg,
                    color: _textSec,
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowLockConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: isLocked
                      ? "linear-gradient(135deg, #d97706, #b45309)"
                      : "linear-gradient(135deg, #4f46e5, #4338ca)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={handleToggleLock}
                >
                  {isLocked ? (isAdmin() ? "Yes, Force Unlock" : "Yes, Unlock") : "Yes, Lock"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lock Error Toast */}
        {lockError && (
          <div
            style={{
              position: "fixed",
              bottom: 28,
              right: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              zIndex: 1000000,
            }}
          >
            <FaTimesCircle style={{ color: "#DC2626", fontSize: 16 }} />
            <span>{lockError}</span>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B", opacity: 0.5, fontSize: 12, marginLeft: 6 }}
              onClick={() => setLockError(null)}
            >✕</button>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999999,
            }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              style={{
                background: _bg,
                borderRadius: "12px",
                padding: "30px",
                width: "400px",
                maxWidth: "90vw",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <MdDelete size={24} style={{ color: "#dc2626" }} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: _t }}>
                Delete Resume?
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: "14px", color: _textSec, lineHeight: "1.5" }}>
                Are you sure you want to delete the resume for <strong>{resume.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: `1px solid ${_border}`,
                    background: _bg,
                    color: _textSec,
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: deleteLoading ? "not-allowed" : "pointer",
                    opacity: deleteLoading ? 0.7 : 1,
                  }}
                  onClick={handleDeleteResume}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};

export default ResumeDetailModal;

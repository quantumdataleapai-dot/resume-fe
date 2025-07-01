import React from "react";
import "../styles/Modal.css";

const ResumeDetailModal = ({ resume, isOpen, onClose }) => {
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

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content resume-detail-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="resume-avatar-large">
              <span>{resume.avatar}</span>
            </div>
            <div className="title-info">
              <h2>{resume.name}</h2>
              {resume.score > 0 && (
                <div className="score-display">
                  <span
                    className="score-value-large"
                    style={{
                      color: getScoreColor(resume.score),
                      textShadow: `0 0 15px ${getScoreColor(resume.score)}40`,
                    }}
                  >
                    {resume.score}%
                  </span>
                  <span className="score-label-large">Match Score</span>
                </div>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {resume.description && (
            <div className="detail-section summary-section">
              <h3>
                <i className="fas fa-file-alt"></i>
                Summary
              </h3>
              <p className="summary-text">{resume.description}</p>
            </div>
          )}

          <div className="details-grid">
            {/* Track section index for alternating colors */}
            {[
              resume.experienceMatch && {
                type: "experience",
                content: (
                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-briefcase"></i>
                      Experience
                    </h3>
                    <p className="experience-text">{resume.experienceMatch}</p>
                  </div>
                ),
              },
              resume.matchingSkills?.length > 0 && {
                type: "matching-skills",
                content: (
                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-check-circle"></i>
                      Matching Skills ({resume.matchingSkills.length})
                    </h3>
                    <div className="skills-grid">
                      {resume.matchingSkills.map((skill, index) => (
                        <span key={index} className="skill-tag matching">
                          <i className="fas fa-check"></i>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              },
              resume.missingSkills?.length > 0 && {
                type: "missing-skills",
                content: (
                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-times-circle"></i>
                      Missing Skills ({resume.missingSkills.length})
                    </h3>
                    <div className="skills-grid">
                      {resume.missingSkills.map((skill, index) => (
                        <span key={index} className="skill-tag missing">
                          <i className="fas fa-times"></i>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              },
              Array.isArray(resume.strengths) &&
                resume.strengths.length > 0 && {
                  type: "strengths",
                  content: (
                    <div className="detail-section">
                      <h3>
                        <i className="fas fa-plus-circle"></i>
                        Key Strengths
                      </h3>
                      <ul className="points-list">
                        {resume.strengths.map((strength, index) => (
                          <li key={index}>
                            <i className="fas fa-check-circle"></i>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
              Array.isArray(resume.weaknesses) &&
                resume.weaknesses.length > 0 && {
                  type: "weaknesses",
                  content: (
                    <div className="detail-section">
                      <h3>
                        <i className="fas fa-minus-circle"></i>
                        Areas for Improvement
                      </h3>
                      <ul className="points-list">
                        {resume.weaknesses.map((weakness, index) => (
                          <li key={index}>
                            <i className="fas fa-exclamation-triangle"></i>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
            ]
              .filter(Boolean) // Remove falsy values
              .map((section, index) => (
                <div
                  key={section.type}
                  className={`detail-section-wrapper ${
                    index % 2 === 0 ? "section-even" : "section-odd"
                  }`}
                >
                  {section.content}
                </div>
              ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i>
              Close
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-download"></i>
              Download Resume
            </button>
            <button className="btn btn-success" disabled>
              <i className="fas fa-calendar-plus"></i>
              Schedule Interview
            </button>
            <button className="btn btn-info" disabled>
              <i className="fas fa-envelope"></i>
              Contact Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailModal;

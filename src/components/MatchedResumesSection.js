import React from "react";
import ResumeCard from "./ResumeCard";

const MatchedResumesSection = ({
  showMatched,
  locationFilter,
  setLocationFilter,
  visaFilter,
  setVisaFilter,
  filteredResumes,
  onViewProfile,
}) => {
  if (!showMatched) return null;

  return (
    <div className="matched-resumes-section">
      <h2>Matched Resumes</h2>
      <p>View and manage candidates matched to your job description.</p>

      <div className="resume-filters">
        <div className="location-filter">
          <input
            type="text"
            placeholder="e.g., New York, NY"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <div className="visa-filter">
          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="h1b">H1B</option>
            <option value="green_card">Green Card</option>
            <option value="us_citizen">US Citizen</option>
            <option value="opt">OPT</option>
          </select>
        </div>
      </div>

      <div className="matched-resumes-grid">
        {filteredResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={{
              ...resume,
              matchScore: resume.score,
            }}
            showMatched={true}
            onViewProfile={() => onViewProfile(resume.id)}
          />
        ))}
        {filteredResumes.length === 0 && (
          <div className="no-matches">No resumes match the current filters</div>
        )}
      </div>
    </div>
  );
};

export default MatchedResumesSection;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdPhone, MdLocationOn, MdDelete } from "react-icons/md";
import mammoth from "mammoth";
import Header from "../components/Header";
import AIChat from "../components/AIChat";
import FileUpload from "../components/FileUpload";
import apiService from "../services/apiService";
import ResumeDetailModal from "../components/ResumeDetailModal";

import API_CONFIG from "../config/apiConfig";
import "../styles/DashboardNew.css";

// Sample data
const sampleResumes = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    score: 92,
    skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"],
    experience: "Senior Frontend Developer • 6 years",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    location: "Seattle, WA",
    score: 85,
    skills: ["Python", "React", "Django", "PostgreSQL"],
    experience: "Full Stack Developer • 4 years",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 987-6543",
    location: "Austin, TX",
    score: 78,
    skills: ["JavaScript", "Vue.js", "CSS", "Figma"],
    experience: "UI Developer • 3 years",
    avatar: "ER",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "+1 (555) 456-7890",
    location: "New York, NY",
    score: 65,
    skills: ["Java", "Spring Boot", "MySQL", "REST APIs"],
    experience: "Backend Developer • 2 years",
    avatar: "JW",
  },
  {
    id: 5,
    name: "Lisa Park",
    email: "lisa.park@email.com",
    phone: "+1 (555) 678-9012",
    location: "Los Angeles, CA",
    score: 88,
    skills: ["React Native", "TypeScript", "Firebase", "Redux"],
    experience: "Mobile Developer • 5 years",
    avatar: "LP",
  },
];

// Location hierarchy data
const locationData = {
  "Canada": {
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Fort McMurray"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna"],
    "Manitoba": ["Winnipeg", "Brandon", "Missoula"],
    "New Brunswick": ["Saint John", "Fredericton", "Moncton"],
    "Newfoundland and Labrador": ["St. John's", "Corner Brook", "Gander"],
    "Northwest Territories": ["Yellowknife", "Hay River"],
    "Nova Scotia": ["Halifax", "Cape Breton", "Sydney"],
    "Nunavut": ["Iqaluit", "Rankin Inlet"],
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Kingston"],
    "Prince Edward Island": ["Charlottetown", "Summerside"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke", "Trois-Rivières"],
    "Saskatchewan": ["Regina", "Saskatoon", "Prince Albert"],
    "Yukon": ["Whitehorse", "Dawson City"],
    "Other": ["Other Cities"]
  },
  "Mexico": {
    "Aguascalientes": ["Aguascalientes City", "Jesús María", "San Francisco de los Romo"],
    "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Rosarito"],
    "Baja California Sur": ["La Paz", "Los Cabos", "Puerto Vallarta"],
    "Campeche": ["Campeche City", "Ciudad del Carmen"],
    "Chiapas": ["Tuxtla Gutiérrez", "San Cristóbal de las Casas", "Comitán"],
    "Chihuahua": ["Chihuahua City", "Ciudad Juárez", "Delicias"],
    "Mexico City": ["Downtown", "Polanco", "Santa Fe", "Roma", "Condesa"],
    "Durango": ["Durango City", "Gómez Palacio", "Lerdo"],
    "Guanajuato": ["Guanajuato City", "León", "Irapuato", "Querétaro"],
    "Guerrero": ["Acapulco", "Zihuatanejo", "Chilpancingo"],
    "Hidalgo": ["Pachuca", "Tulancingo", "Tula"],
    "Jalisco": ["Guadalajara", "Puerto Vallarta", "Zapopan", "Tonalá"],
    "Mexico State": ["Toluca", "Ecatepec", "Naucalpán", "Tlalnepantla"],
    "Michoacán": ["Morelia", "Uruapan", "Zamora"],
    "Morelos": ["Cuernavaca", "Jiutepec", "Emiliano Zapata"],
    "Nayarit": ["Tepic", "Puerto Vallarta", "Sayulita"],
    "Nuevo León": ["Monterrey", "San Pedro Garza García", "Santa Catarina"],
    "Oaxaca": ["Oaxaca City", "Puerto Escondido", "Huatulco"],
    "Puebla": ["Puebla City", "Cholula", "Tehuacán"],
    "Querétaro": ["Querétaro City", "San Juan del Río"],
    "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum", "Cozumel"],
    "San Luis Potosí": ["San Luis Potosí City", "Matehuala"],
    "Sinaloa": ["Culiacán", "Mazatlán", "Los Mochis"],
    "Sonora": ["Hermosillo", "Ciudad Obregón", "Nogales"],
    "Tabasco": ["Villahermosa", "Cárdenas"],
    "Tamaulipas": ["Ciudad Victoria", "Tampico", "Nuevo Laredo"],
    "Tlaxcala": ["Tlaxcala City", "Apizaco"],
    "Veracruz": ["Veracruz City", "Xalapa", "Coatzacoalcos"],
    "Yucatán": ["Mérida", "Cancún", "Chetumal"],
    "Zacatecas": ["Zacatecas City", "Fresnillo"],
    "Other": ["Other Cities"]
  },
  "United States": {
    "California": ["San Francisco", "Los Angeles", "San Diego", "San Jose", "Sacramento"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
    "Illinois": ["Chicago", "Aurora", "Rockford"],
    "Washington": ["Seattle", "Spokane", "Tacoma"],
    "Other": ["Other Cities"]
  },

  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Leeds"],
    "Scotland": ["Edinburgh", "Glasgow"],
    "Wales": ["Cardiff"],
    "Other": ["Other Cities"]
  },
  "India": {
    "Bangalore": ["Bangalore"],
    "Mumbai": ["Mumbai"],
    "Delhi": ["Delhi", "Noida"],
    "Hyderabad": ["Hyderabad"],
    "Pune": ["Pune"],
    "Other": ["Other Cities"]
  }
};

const visaOptions = [
  { category: "Citizens and Permanent Residents", options: ["US Citizen", "US Authorized", "Canadian Citizen", "Canada Authorized"] },
  { category: "Green Card and EAD", options: ["Green Card", "Green Card Holder", "GC", "GC-EAD", "Employment Auth Document", "OPT-EAD", "H4-EAD", "L2-EAD"] },
  { category: "H1 Related", options: ["H1 Visa", "H1-B", "Have H1", "Have H1 Visa", "Need H1", "Need H1 Visa", "Need H1 Visa Sponsor"] },
  { category: "Other Visas", options: ["B1", "L1-A", "L2-B", "TN Visa", "TN Permit Holder", "E3 Visa", "E3 (Australian Citizens)"] },
  { category: "Work Authorization", options: ["Can work for any employer", "Current Employer Only", "Sponsorship Required", "France Authorized", "India Authorized", "Kazakhstan Authorized", "United Kingdom Authorized", "Venezuela Authorized", "Unspecified Work Authorization"] },
  { category: "Other", options: ["Not Specified", "Unspecified"] }
];

const skillsList = [
  "React", "Vue.js", "Angular", "JavaScript", "TypeScript", "Python", "Java", "C++", "C#",
  "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
  "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap",
  "REST APIs", "GraphQL", "Git", "CI/CD", "Jenkins",
  "React Native", "Flutter", "Swift", "Kotlin",
  "Machine Learning", "TensorFlow", "PyTorch", "Data Science",
  "Figma", "Adobe XD", "UI Design", "UX Design",
  "Agile", "Scrum", "Jira", "DevOps"
];

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Senior Developer",
  "Lead Developer",
  "Junior Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Data Scientist",
  "ML Engineer",
  "QA Engineer",
  "Software Engineer",
  "Solutions Architect",
  "Technical Lead",
  "Project Manager",
  "Product Manager",
  "UI/UX Designer"
];

const experienceLevels = [
  { value: "", label: "Select Experience Level" },
  { value: "0-1", label: "0-1 Years (Fresher)" },
  { value: "1-3", label: "1-3 Years (Junior)" },
  { value: "3-5", label: "3-5 Years (Mid-Level)" },
  { value: "5-8", label: "5-8 Years (Senior)" },
  { value: "8-10", label: "8-10 Years (Lead/Architect)" },
  { value: "10+", label: "10+ Years (Principal/Director)" }
];

const recentSearchTimeframes = [
  { value: "", label: "Select Recent Activity" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "60", label: "Last 60 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "180", label: "Last 6 Months" },
  { value: "365", label: "Last 1 Year" }
];

export default function DashboardNew() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visaRequirement, setVisaRequirement] = useState([]);
  const [jobLocation, setJobLocation] = useState([]);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [willingnessToRelocate, setWillingnessToRelocate] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [jdId, setJdId] = useState(null);
  const [showVisaDropdown, setShowVisaDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationDistance, setLocationDistance] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillsSearchInput, setSkillsSearchInput] = useState("");
  const [jobTitleSearchInput, setJobTitleSearchInput] = useState("");
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [recentSearchDays, setRecentSearchDays] = useState("");

  
  const handleViewDetails = (resume) => {
    setSelectedResume(resume);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedResume(null);
  };
  const handleLogout = () => {
    navigate("/");
  };

  const handleDeleteResume = async (resumeId, resumeName) => {
    if (!window.confirm(`Are you sure you want to delete the resume for ${resumeName}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://10.20.0.107:8000/api/resumes/${resumeId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Remove the deleted resume from the list
      setResumes(resumes.filter(r => r.id !== resumeId));
      window.alert(`Resume for ${resumeName} deleted successfully`);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete resume");
      window.alert("Error: " + (err.message || "Failed to delete resume"));
    }
  };

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleAnalyze = async () => {
    // Check if either job description OR files are provided
    if (!jobDescription.trim() && uploadedFiles.length === 0) {
      window.alert("Please enter a job description or upload resume files");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let result;

      // If files are uploaded, use file-based API
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        
        // Add job description if provided
        if (jobDescription.trim()) {
          formData.append("job_description", jobDescription);
        }
        
        // Add resume files
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });
        
        // Add filters
        formData.append("visa_requirement", visaRequirement);
        formData.append("job_location", jobLocation);
        if (expectedSalary) formData.append("expected_salary", expectedSalary);
        if (noticePeriod) formData.append("notice_period", noticePeriod);

        console.log("Uploading files for processing...");
        const response = await fetch(
          "http://10.20.0.107:8000/api/jobs/process-file-and-match",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API error response:", errorData);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        result = await response.json();
        console.log("File matching response:", result);
      } else {
        // Use text-based API for job description
        const payload = {
          job_description: jobDescription,
          visa_requirement: visaRequirement,
          job_location: jobLocation,
          ...(expectedSalary && { expected_salary: expectedSalary }),
          ...(noticePeriod && { notice_period: noticePeriod }),
        };

        console.log("Sending text job description for processing...");
        const response = await fetch(
          "http://10.20.0.107:8000/api/jobs/process-text-and-match",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API error response:", errorData);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        result = await response.json();
        console.log("Job matching response:", result);
      }

      // Process the response - extract matched resumes
      let items = [];
      
      // Try to extract matched resumes from various possible response structures
      if (result.data && result.data.matched_resumes && Array.isArray(result.data.matched_resumes)) {
        items = result.data.matched_resumes;
      } else if (Array.isArray(result.matched_resumes)) {
        items = result.matched_resumes;
      } else if (result.data && Array.isArray(result.data)) {
        items = result.data;
      } else if (Array.isArray(result.matches)) {
        items = result.matches;
      } else if (Array.isArray(result)) {
        items = result;
      }

      if (items.length > 0) {

        // Store the jd_id from the response - it's nested under job_analysis
        if (result.data && result.data.job_analysis && result.data.job_analysis.jd_id) {
          setJdId(result.data.job_analysis.jd_id);
          console.log("JD ID from response:", result.data.job_analysis.jd_id);
        } else if (result.data && result.data.jd_id) {
          // Fallback for alternate response format
          setJdId(result.data.jd_id);
          console.log("JD ID from response (fallback):", result.data.jd_id);
        }
        const normalized = items.map((r, idx) => {
          const parsed = r.parsed_data || {};
          const name = r.name || parsed.name || r.original_name || r.filename || r.title || "Unknown";
          return {
            id: r.id || r._id || idx + 1,
            filename: r.filename || "",
            upload_date: r.upload_date || "",
            name: name,
            email: parsed.email || r.email || r.contact_email || "",
            contact_number: parsed.mobile_no || parsed.contact_number || r.phone || r.contact_number || "",
            location: parsed.location || r.location || r.city || "",
            score: r.match_score || r.score || r.similarity || 0,
            skills: parsed.skills || r.skills || r.tags || [],
            experience_years: parsed.experience_years || r.experience_years || r.experience || "",
            description: parsed.description || r.description || "",
            linkedin: parsed.linkedin || r.linkedin || "",
            visa_type: parsed.visa_type || r.visa_type || "",
            education: parsed.education || r.education || "",
            matchingSkills: r.matchingSkills || r.matching_skills || [],
            missingSkills: r.missingSkills || r.missing_skills || [],
            questionsToAsk: r.questionsToAsk || r.questions_to_ask || [],
            generated_questions: r.generated_questions || [],
            questions: r.questions || null,
            avatar: name ? (name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
          };
        });
        setResumes(normalized);
        setHasAnalyzed(true);
        // Clear search to ensure matched resumes are visible
        setSearchQuery("");
        // Clear uploaded files after successful analysis
        setUploadedFiles([]);
        // Clear form fields after successful analysis
        setJobDescription("");
        setVisaRequirement("H1 Visa");
        setJobLocation("all");
        setExpectedSalary("");
        setNoticePeriod("");
        window.alert(`Successfully matched ${normalized.length} resumes!`);
      } else {
        console.warn("No matched resumes returned from API");
        window.alert("No matched resumes were returned by the server.");
      }
    } catch (err) {
      console.error("Job analysis error:", err);
      setError(err.message || "Failed to analyze job and match resumes");
      window.alert("Error: " + (err.message || "Failed to analyze job"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setError(null);
      const response = await fetch(
        "http://10.20.0.107:8000/api/resumes/download-all?format=zip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Resumes downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download resumes");
      window.alert("Error: " + (err.message || "Failed to download resumes"));
    }
  };

  const handleUploadResume = async () => {
    try {
      setError(null);

      // Create an invisible file input to prompt user
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf,.doc,.docx";

      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const formData = new FormData();
        // use 'files' field name - backend may accept other names
        files.forEach((f) => formData.append("files", f));

        try {
          const resp = await fetch("http://10.20.0.107:8000/api/resumes/upload", {
            method: "POST",
            body: formData,
          });

          const responseData = await resp.json();

          // Check both HTTP status AND response success field
          if (!resp.ok || !responseData.success) {
            const errorMessage = responseData.message || responseData.error?.details?.[0]?.reason || `Upload failed: ${resp.status} ${resp.statusText}`;
            console.error("Upload error response:", responseData);
            throw new Error(errorMessage);
          }

          // Use the uploaded resumes from the response directly
          let uploadedResumes = [];
          if (responseData.data && responseData.data.resumes && Array.isArray(responseData.data.resumes)) {
            uploadedResumes = responseData.data.resumes;
          }

          // Get existing resumes from the current state
          let allResumes = [...resumes];

          // Add newly uploaded resumes
          const normalized = uploadedResumes.map((r, idx) => {
            const parsed = r.parsed_data || {};
            const name = parsed.name || r.name || r.filename || "Unknown";
            return {
              id: r.id || r._id || `resume_${Date.now()}_${idx}`,
              filename: r.filename || "",
              upload_date: r.upload_date || new Date().toISOString().split('T')[0],
              name: name,
              email: parsed.email || r.email || "",
              contact_number: parsed.contact_number || r.contact_number || "",
              location: parsed.location || r.location || "",
              score: r.score || r.match_score || 0,
              skills: Array.isArray(parsed.skills) ? parsed.skills : (r.skills || []),
              experience_years: parsed.experience_years || r.experience_years || r.experience || "",
              description: parsed.description || r.description || "",
              linkedin: parsed.linkedin || r.linkedin || "",
              visa_type: parsed.visa_type || r.visa_type || "",
              education: parsed.education || r.education || "",
              matchingSkills: r.matchingSkills || r.matching_skills || [],
              missingSkills: r.missingSkills || r.missing_skills || [],
              questionsToAsk: r.questionsToAsk || r.questions_to_ask || [],
              generated_questions: r.generated_questions || [],
              questions: r.questions || null,
              avatar: name ? (name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
            };
          });

          // Combine with existing resumes (avoiding duplicates based on ID)
          const existingIds = new Set(allResumes.map(r => r.id));
          const newResumes = normalized.filter(r => !existingIds.has(r.id));
          const combinedResumes = [...newResumes, ...allResumes];

          setResumes(combinedResumes);
          window.alert(`Upload successful! Added ${newResumes.length} new resume(s)`);
        } catch (uploadErr) {
          console.error("Upload failed:", uploadErr);
          window.alert("Upload failed: " + (uploadErr.message || "Unknown error"));
        }
      };

      // Trigger file picker
      input.click();
    } catch (err) {
      console.error("Upload resume handler error:", err);
      setError(err.message || "Failed to upload resume");
      window.alert("Error: " + (err.message || "Failed to upload resume"));
    }
  };

  // Use resumes from backend; do not fall back to sample data so dashboard shows real data
  const sourceResumes = resumes;

  const filteredResumes = sourceResumes
    .filter((resume) =>
      (resume.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resume.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "score-excellent";
    if (score >= 70) return "score-good";
    return "score-fair";
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showVisaDropdown && !e.target.closest('.multi-select-container')) {
        setShowVisaDropdown(false);
      }
      if (showLocationDropdown && !e.target.closest('.multi-select-container')) {
        setShowLocationDropdown(false);
      }
      if (showSkillsDropdown && !e.target.closest('.multi-select-container')) {
        setShowSkillsDropdown(false);
      }
      if (showJobTitleDropdown && !e.target.closest('.multi-select-container')) {
        setShowJobTitleDropdown(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showVisaDropdown, showLocationDropdown, showSkillsDropdown, showJobTitleDropdown]);

  // Fetch resumes from backend when dashboard loads
  React.useEffect(() => {
    let mounted = true;
    const fetchResumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESUMES.LIST}`;
        const resp = await fetch(url, { method: "GET" });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`Failed to fetch resumes: ${resp.status} ${resp.statusText} ${txt}`);
        }

        const data = await resp.json();

        // API returns { success: true, data: { resumes: [...], pagination: {...} } }
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data.resumes)) {
          items = data.resumes;
        } else if (data.data && Array.isArray(data.data.resumes)) {
          items = data.data.resumes;
        } else if (Array.isArray(data.data)) {
          items = data.data;
        } else if (Array.isArray(data.items)) {
          items = data.items;
        } else if (Array.isArray(data.results)) {
          items = data.results;
        }

        const normalized = items.map((r, idx) => {
          const p = r.parsed_data || {};
          const name = p.name || r.name || r.filename || "Unknown";
          return {
            id: r.id || r._id || idx + 1,
            filename: r.filename || "",
            upload_date: r.upload_date || "",
            name: name,
            email: p.email || r.email || "",
            contact_number: p.contact_number || r.contact_number || "",
            location: p.location || r.location || "",
            score: (r.match_score || r.score || 0) || 0,
            skills: Array.isArray(p.skills) ? p.skills : (r.skills || []),
            experience_years: p.experience_years || r.experience_years || r.experience || "",
            description: p.description || r.description || "",
            linkedin: p.linkedin || r.linkedin || "",
            visa_type: p.visa_type || r.visa_type || "",
            education: p.education || r.education || "",
            matchingSkills: r.matchingSkills || [],
            missingSkills: r.missingSkills || [],
            questionsToAsk: r.questionsToAsk || [],
            generated_questions: r.generated_questions || [],
            avatar: name ? (name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()) : "U",
          };
        });

        if (mounted) setResumes(normalized);
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
        if (mounted) setError(err.message || "Failed to load resumes");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchResumes();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: "Total Resumes", value: sourceResumes.length, icon: "📄" },
    { label: "Excellent Matches", value: sourceResumes.filter(r=> (r.score||0) >= 85).length, icon: "📈" },
    { label: "Candidates Reviewed", value: sourceResumes.length, icon: "👥" },
  ];


  return (
    <div className="dashboard-new-container">
      <Header userName="Demo User" onLogout={handleLogout} />

      <main className="dashboard-new-main">
        {/* Stats Section */}
        {/* <div className="stats-section">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div> */}

        <div className="dashboard-grid">
          {/* Left Column - Job Description & Upload */}
          <div className="left-column">
            {/* Job Description Card */}
            <div className="job-card">
              <div className="job-header">
                <h2>Job Description</h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to match against resumes..."
                className="job-textarea"
              />
              <div className="job-footer">
                <span>{jobDescription.length} characters</span>
                <button 
                  className="upload-link"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf,.doc,.docx,.txt";
                    input.onchange = async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          let text = "";
                          
                          // Handle different file types
                          if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
                            // Handle .docx files using mammoth
                            const arrayBuffer = await file.arrayBuffer();
                            const result = await mammoth.extractRawText({ arrayBuffer });
                            text = result.value;
                          } else if (file.type === "application/msword" || file.name.endsWith(".doc")) {
                            // For .doc files, show a message since they need special handling
                            window.alert("Legacy .doc format has limited support. Please use .docx or .txt files for best results.");
                            return;
                          } else {
                            // Handle .txt and other text files
                            text = await file.text();
                          }
                          
                          if (text.trim()) {
                            setJobDescription(text);
                            console.log("File uploaded successfully, extracted text length:", text.length);
                          } else {
                            window.alert("The file appears to be empty or could not be read.");
                          }
                        } catch (error) {
                          console.error("Error reading file:", error);
                          window.alert("Error reading file: " + (error.message || "Unknown error"));
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  Upload file
                </button>
              </div>

              

              {/* Visa Requirement & Job Location */}
              <div className="job-filters-section">
                {/* Work Authorization Multi-Select */}
                  {/* Job Title Filter */}
                <div className="filter-group">
                  <label>Job Title</label>
                  <div className="multi-select-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        value={jobTitleSearchInput}
                        onChange={(e) => setJobTitleSearchInput(e.target.value)}
                        onFocus={() => setShowJobTitleDropdown(true)}
                        placeholder={jobTitle || "Search job titles..."}
                        className="search-filter-input"
                      />
                      {jobTitle && (
                        <button
                          className="clear-input-btn"
                          onClick={() => {
                            setJobTitle("");
                            setJobTitleSearchInput("");
                          }}
                          type="button"
                          title="Clear selection"
                        >
                          ×
                        </button>
                      )}
                      <span className="dropdown-arrow">▼</span>
                    </div>
                    
                    {showJobTitleDropdown && (
                      <div className="multi-select-dropdown job-title-dropdown">
                        {jobTitles
                          .filter((title) =>
                            title.toLowerCase().includes(jobTitleSearchInput.toLowerCase())
                          )
                          .map((title) => (
                            <div
                              key={title}
                              className={`dropdown-item ${jobTitle === title ? 'selected' : ''}`}
                              onClick={() => {
                                setJobTitle(title);
                                setJobTitleSearchInput("");
                                setShowJobTitleDropdown(false);
                              }}
                            >
                              {title}
                            </div>
                          ))}
                        {jobTitles.filter((title) =>
                          title.toLowerCase().includes(jobTitleSearchInput.toLowerCase())
                        ).length === 0 && (
                          <div className="no-results">No job titles found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Skills Multi-Select */}
                <div className="filter-group">
                  <label>Required Skills</label>
                  <div className="multi-select-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        value={skillsSearchInput}
                        onChange={(e) => setSkillsSearchInput(e.target.value)}
                        onFocus={() => setShowSkillsDropdown(true)}
                        placeholder="Search or select skills..."
                        className="search-filter-input"
                      />
                      <span className="dropdown-arrow">▼</span>
                    </div>
                    
                    {/* Display selected skills */}
                    {requiredSkills.length > 0 && (
                      <div className="selected-items-container">
                        {requiredSkills.map((skill) => (
                          <div key={skill} className="selected-tag">
                            <span>{skill}</span>
                            <button
                              className="remove-tag-btn"
                              onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}
                              type="button"
                              aria-label={`Remove ${skill}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showSkillsDropdown && (
                      <div className="multi-select-dropdown skills-dropdown">
                        {skillsList
                          .filter((skill) =>
                            skill.toLowerCase().includes(skillsSearchInput.toLowerCase())
                          )
                          .map((skill) => (
                            <label key={skill} className="checkbox-option">
                              <input
                                type="checkbox"
                                checked={requiredSkills.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRequiredSkills([...requiredSkills, skill]);
                                  } else {
                                    setRequiredSkills(requiredSkills.filter(s => s !== skill));
                                  }
                                }}
                              />
                              <span>{skill}</span>
                            </label>
                          ))}
                        {skillsList.filter((skill) =>
                          skill.toLowerCase().includes(skillsSearchInput.toLowerCase())
                        ).length === 0 && (
                          <div className="no-results">No skills found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="filter-group">
                  <label>Work Authorization</label>
                  <div className="multi-select-container">
                    <button 
                      className="multi-select-button"
                      onClick={() => setShowVisaDropdown(!showVisaDropdown)}
                    >
                      <span className="multi-select-display">
                        {visaRequirement.length === 0 
                          ? "Select work authorization..." 
                          : `${visaRequirement.length} selected`}
                      </span>
                      <span className={`dropdown-arrow ${showVisaDropdown ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    {/* Display selected items */}
                    {visaRequirement.length > 0 && (
                      <div className="selected-items-container">
                        {visaRequirement.map((item) => (
                          <div key={item} className="selected-tag">
                            <span>{item}</span>
                            <button
                              className="remove-tag-btn"
                              onClick={() => setVisaRequirement(visaRequirement.filter(v => v !== item))}
                              type="button"
                              aria-label={`Remove ${item}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showVisaDropdown && (
                      <div className="multi-select-dropdown">
                        {visaOptions.map((group) => (
                          <div key={group.category}>
                            <div className="option-group-label">{group.category}</div>
                            {group.options.map((option) => (
                              <label key={option} className="checkbox-option">
                                <input
                                  type="checkbox"
                                  checked={visaRequirement.includes(option)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setVisaRequirement([...visaRequirement, option]);
                                    } else {
                                      setVisaRequirement(visaRequirement.filter(v => v !== option));
                                    }
                                  }}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Location Multi-Select */}
                <div className="filter-group">
                  <label>Job Location</label>
                  <div className="multi-select-container">
                    <button 
                      className="multi-select-button"
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    >
                      <span className="multi-select-display">
                        {jobLocation.length === 0 
                          ? "Select locations..." 
                          : `${jobLocation.length} selected`}
                      </span>
                      <span className={`dropdown-arrow ${showLocationDropdown ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    {/* Display selected items */}
                    {jobLocation.length > 0 && (
                      <div className="selected-items-container">
                        {jobLocation.map((item) => (
                          <div key={item} className="selected-tag">
                            <span>{item}</span>
                            <button
                              className="remove-tag-btn"
                              onClick={() => setJobLocation(jobLocation.filter(l => l !== item))}
                              type="button"
                              aria-label={`Remove ${item}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showLocationDropdown && (
                      <div className="multi-select-dropdown location-dropdown">
                        {Object.entries(locationData).map(([country, states]) => (
                          <div key={country}>
                            <div className="option-group-label country-label">{country}</div>
                            {Object.entries(states).map(([state, cities]) => (
                              <div key={state} className="state-group">
                                <div className="state-label">{state}</div>
                                {cities.map((city) => {
                                  const locationValue = `${city}, ${state}, ${country}`;
                                  return (
                                    <label key={locationValue} className="checkbox-option city-option">
                                      <input
                                        type="checkbox"
                                        checked={jobLocation.includes(locationValue)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setJobLocation([...jobLocation, locationValue]);
                                          } else {
                                            setJobLocation(jobLocation.filter(l => l !== locationValue));
                                          }
                                        }}
                                      />
                                      <span>{city}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Distance in Miles (Optional) */}
                <div className="filter-group">
                  <label>Distance (Miles)</label>
                  <input
                    type="number"
                    value={locationDistance}
                    onChange={(e) => setLocationDistance(e.target.value)}
                    placeholder="e.g., 50"
                    className="filter-input"
                    min="0"
                    step="5"
                  />
                </div>

                 {/* Expected Salary (Optional) */}
                {/* <div className="filter-group">
                  <label>Expected Salary</label>
                  <select
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffffff",
                      color: "#000000ff",
                    }}
                  >
                    <option value="">Select Salary Range</option>
                    <option value="40000-60000">$40K - $60K</option>
                    <option value="60000-80000">$60K - $80K</option>
                    <option value="80000-100000">$80K - $100K</option>
                    <option value="100000-120000">$100K - $120K</option>
                    <option value="120000-150000">$120K - $150K</option>
                    <option value="150000+">$150K+</option>
                    <option value="others">Others</option>
                  </select>
                </div> */}

                {/* Notice Period Filter */}
                {/* <div className="filter-group">
                  <label>Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffffff",
                      color: "#000000ff",
                    }}
                  >
                    <option value="">Select Notice Period</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">1 Week</option>
                    <option value="2-weeks">2 Weeks</option>
                    <option value="1-month">1 Month</option>
                    <option value="2-months">2 Months</option>
                    <option value="3-months">3 Months</option>
                  </select>
                </div> */}

                <div className="filter-group">
                  <label>Willingness to Relocate</label>
                  <select
                    value={willingnessToRelocate}
                    onChange={(e) => setWillingnessToRelocate(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffffff",
                      color: "#000000ff",
                    }}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div className="filter-group">
                  <label>Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffffff",
                      color: "#000000ff",
                    }}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Recent Search Activity Filter */}
                <div className="filter-group">
                  <label>Recent Job Search Activity</label>
                  <select
                    value={recentSearchDays}
                    onChange={(e) => setRecentSearchDays(e.target.value)}
                    className="filter-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffffff",
                      color: "#000000ff",
                    }}
                  >
                    {recentSearchTimeframes.map((timeframe) => (
                      <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
                    ))}
                  </select>
                </div>

              
              </div>
            </div>

            

            {/* Analyze Button */}
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze & Match"}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="right-column">
            <div className="results-card">
              {/* Action Buttons */}
              <div className="results-action-buttons">
                <button 
                  className="action-btn download-btn"
                  onClick={handleDownloadAll}
                >
                  ⬇ Download All ({filteredResumes.length})
                </button>
                <button className="action-btn">Upload from Ceipal</button>
                <button className="action-btn">Get Resumes from Ceipal</button>
                <button className="action-btn upload-resume-btn" onClick={handleUploadResume}>
                  ⬆ Upload Resume
                </button>
              </div>

              {/* Search & Filter */}
              <div className="search-filter-bar">
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                
                <select className="sort-select">
                  <option>Show top candidates: All candidates</option>
                  <option>Top 5</option>
                  <option>Top 10</option>
                  <option>Top 20</option>
                </select>
                <select className="sort-select">
                  <option>Sort by: Score (High to Low)</option>
                  <option>Score (Low to High)</option>
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                </select>
              </div>

              {/* Results Header - Only show if resumes exist and analysis has been performed */}
              {hasAnalyzed && filteredResumes.length > 0 && (
                <div className="results-header">
                  <h2>Matched Candidates</h2>
                  <span className="result-count">{filteredResumes.length} results</span>
                </div>
              )}

              {/* Resume Cards */}
              <div className="resume-list">
                {filteredResumes.map((resume, index) => (
                  <div key={resume.id} className="resume-item">
                    <div className={`resume-avatar color-${((index % 3) + 1)}`}>{resume.avatar}</div>
                    <div className="resume-info">
                      <div className="resume-top">
                        <div>
                          <h3 className="resume-name">{resume.name}</h3>
                        </div>
                      </div>
                      <div className="resume-details">
                        {resume.email && (
                          <span className="detail-item">
                            <MdEmail size={14} /> {resume.email}
                          </span>
                        )}
                        {resume.contact_number && (
                          <span className="detail-item">
                            <MdPhone size={14} /> {resume.contact_number}
                          </span>
                        )}
                        {resume.location && (
                          <span className="detail-item">
                            <MdLocationOn size={14} /> {resume.location}
                          </span>
                        )}
                      </div>
                      {resume.skills && resume.skills.length > 0 && (
                        <div className="skills-section">
                          {resume.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="skill-chip">{skill}</span>
                          ))}
                          {resume.skills.length > 5 && (
                            <span className="skill-chip">+{resume.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="resume-actions">
                      {resume.score > 0 && (
                        <div className={`score-badge ${getScoreBadgeClass(resume.score)}`}>
                          ⭐ {resume.score.toFixed(1)}%
                        </div>
                      )}
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(resume)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat FAB */}
      <button
        className="ai-chat-fab"
        onClick={() => setShowAIChat(true)}
      >
        💬
      </button>

      {/* AI Chat Modal */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

        {/* Resume Detail Modal */}
      <ResumeDetailModal
        resume={selectedResume}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onDelete={handleDeleteResume}
        jdId={jdId}
      />
    </div>
  );
}

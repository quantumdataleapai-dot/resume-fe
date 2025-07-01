// Mock Data for Development - Remove when backend is ready
export const mockResumes = [
  {
    id: "resume_1",
    filename: "john_doe_resume.pdf",
    upload_date: "2025-07-01T10:30:00Z",
    parsed_data: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0123",
      skills: ["Python", "React", "Node.js", "SQL", "AWS", "Docker"],
      experience_years: 5,
      education: "Bachelor's in Computer Science",
      current_position: "Senior Software Engineer",
      location: "San Francisco, CA",
    },
    match_score: null,
  },
  {
    id: "resume_2",
    filename: "jane_smith_resume.pdf",
    upload_date: "2025-07-01T11:15:00Z",
    parsed_data: {
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1-555-0124",
      skills: ["Python", "Django", "PostgreSQL", "Redis", "Kubernetes"],
      experience_years: 7,
      education: "Master's in Software Engineering",
      current_position: "Lead Backend Developer",
      location: "New York, NY",
    },
    match_score: null,
  },
  {
    id: "resume_3",
    filename: "mike_johnson_resume.pdf",
    upload_date: "2025-07-01T09:45:00Z",
    parsed_data: {
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1-555-0125",
      skills: ["JavaScript", "React", "Vue.js", "CSS", "HTML", "MongoDB"],
      experience_years: 3,
      education: "Bachelor's in Web Development",
      current_position: "Frontend Developer",
      location: "Austin, TX",
    },
    match_score: null,
  },
  {
    id: "resume_4",
    filename: "sarah_wilson_resume.pdf",
    upload_date: "2025-07-01T14:20:00Z",
    parsed_data: {
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1-555-0126",
      skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
      experience_years: 4,
      education: "PhD in Data Science",
      current_position: "Data Scientist",
      location: "Seattle, WA",
    },
    match_score: null,
  },
  {
    id: "resume_5",
    filename: "david_brown_resume.pdf",
    upload_date: "2025-07-01T16:10:00Z",
    parsed_data: {
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1-555-0127",
      skills: ["Java", "Spring Boot", "MySQL", "Jenkins", "Git"],
      experience_years: 6,
      education: "Bachelor's in Computer Engineering",
      current_position: "Backend Java Developer",
      location: "Chicago, IL",
    },
    match_score: null,
  },
];

export const mockMatchedResumes = [
  {
    id: "resume_1",
    filename: "john_doe_resume.pdf",
    match_score: 92.5,
    match_details: {
      skills_match: 95,
      experience_match: 90,
      overall_fit: "Excellent",
    },
    parsed_data: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0123",
      skills: ["Python", "React", "Node.js", "SQL", "AWS", "Docker"],
      experience_years: 5,
      education: "Bachelor's in Computer Science",
      current_position: "Senior Software Engineer",
      location: "San Francisco, CA",
    },
    missing_skills: ["TypeScript"],
    matching_skills: ["Python", "React", "SQL", "AWS"],
    strengths: [
      "Strong full-stack development experience",
      "Excellent cloud platform knowledge (AWS)",
      "Proven track record with modern frameworks",
      "Senior-level problem solving skills",
    ],
    weaknesses: [
      "Missing TypeScript experience",
      "Could benefit from more DevOps knowledge",
    ],
  },
  {
    id: "resume_2",
    filename: "jane_smith_resume.pdf",
    match_score: 88.0,
    match_details: {
      skills_match: 85,
      experience_match: 92,
      overall_fit: "Very Good",
    },
    parsed_data: {
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1-555-0124",
      skills: ["Python", "Django", "PostgreSQL", "Redis", "Kubernetes"],
      experience_years: 7,
      education: "Master's in Software Engineering",
      current_position: "Lead Backend Developer",
      location: "New York, NY",
    },
    missing_skills: ["React", "TypeScript"],
    matching_skills: ["Python", "SQL"],
    strengths: [
      "Extensive backend development expertise",
      "Strong database and caching knowledge",
      "Leadership and mentoring experience",
      "Advanced degree in software engineering",
    ],
    weaknesses: [
      "Limited frontend development experience",
      "Missing modern JavaScript frameworks knowledge",
    ],
  },
  {
    id: "resume_3",
    filename: "mike_johnson_resume.pdf",
    match_score: 75.5,
    match_details: {
      skills_match: 80,
      experience_match: 70,
      overall_fit: "Good",
    },
    parsed_data: {
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1-555-0125",
      skills: ["JavaScript", "React", "Vue.js", "CSS", "HTML", "MongoDB"],
      experience_years: 3,
      education: "Bachelor's in Web Development",
      current_position: "Frontend Developer",
      location: "Austin, TX",
    },
    missing_skills: ["Python", "TypeScript", "SQL"],
    matching_skills: ["React", "JavaScript"],
    strengths: [
      "Strong frontend development skills",
      "Modern JavaScript framework expertise",
      "Good UI/UX implementation abilities",
      "Quick learner with new technologies",
    ],
    weaknesses: [
      "Limited backend development experience",
      "Missing server-side programming languages",
      "Needs more database knowledge",
    ],
  },
];

export const mockJobAnalysis = {
  title: "Full Stack Developer",
  required_skills: ["Python", "React", "SQL", "TypeScript"],
  preferred_skills: ["AWS", "Docker", "Node.js"],
  experience_level: "Mid-level",
  responsibilities: [
    "Develop and maintain web applications",
    "Work with cross-functional teams",
    "Write clean, maintainable code",
    "Participate in code reviews",
  ],
};

export const mockUploadResponse = {
  success: true,
  message: "Files uploaded successfully",
  data: {
    uploaded_count: 2,
    failed_count: 0,
    resumes: [
      {
        id: "resume_new_1",
        filename: "new_resume_1.pdf",
        upload_status: "success",
        parsed_data: {
          name: "Alex Thompson",
          email: "alex.thompson@email.com",
          skills: ["Python", "FastAPI", "PostgreSQL"],
        },
      },
      {
        id: "resume_new_2",
        filename: "new_resume_2.pdf",
        upload_status: "success",
        parsed_data: {
          name: "Lisa Garcia",
          email: "lisa.garcia@email.com",
          skills: ["React", "TypeScript", "Node.js"],
        },
      },
    ],
  },
};

export const mockUrlUploadResponse = {
  success: true,
  message: "URLs processed successfully",
  data: {
    processed_count: 1,
    successful_uploads: [
      {
        url: "https://example.com/resume.pdf",
        id: "resume_url_1",
        filename: "resume.pdf",
        parsed_data: {
          name: "Remote Candidate",
          email: "remote@email.com",
          skills: ["Python", "Django", "React"],
        },
      },
    ],
    failed_uploads: [],
  },
};

// Mock API delay to simulate real API calls
export const simulateApiDelay = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

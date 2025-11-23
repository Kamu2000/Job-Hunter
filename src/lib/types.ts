// ===== JOB TYPES =====
export interface Job {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    location: string;
    locationType: 'Remote' | 'Hybrid' | 'On-site';
    jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    description: string;
    requirements: string[];
    benefits: string[];
    postedDate: string;
    applicationUrl?: string;
    saved: boolean;
    timezoneRequirement?: string; // e.g., "Americas", "Europe", "Flexible"
    isAsync?: boolean; // Async-friendly remote work
}

// ===== APPLICATION TYPES =====
export type ApplicationStatus =
    | 'Wishlist'
    | 'Applied'
    | 'Phone Screen'
    | 'Interview'
    | 'Offer'
    | 'Rejected';

export interface Application {
    id: string;
    jobId?: string;
    jobTitle: string;
    company: string;
    companyLogo?: string;
    location: string;
    status: ApplicationStatus;
    appliedDate: string;
    lastUpdated: string;
    salary?: string;
    jobType?: string;
    notes?: string;
    resumeVersion?: string;
    coverLetter?: string;
    contactPerson?: string;
    contactEmail?: string;
    nextSteps?: string;
    priority: 'Low' | 'Medium' | 'High';
}

// ===== INTERVIEW TYPES =====
export type InterviewType =
    | 'Phone Screen'
    | 'Technical'
    | 'Behavioral'
    | 'System Design'
    | 'Final Round'
    | 'HR Round';

export interface Interview {
    id: string;
    applicationId: string;
    company: string;
    position: string;
    type: InterviewType;
    date: string;
    time: string;
    duration: number; // in minutes
    location?: string;
    meetingLink?: string;
    interviewer?: string;
    interviewerEmail?: string;
    notes?: string;
    preparation?: string[];
    completed: boolean;
    outcome?: 'Passed' | 'Failed' | 'Pending';
}

// ===== TASK TYPES =====
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
    relatedTo?: {
        type: 'job' | 'application' | 'interview';
        id: string;
        name: string;
    };
    createdAt: string;
    completedAt?: string;
}

// ===== COMPANY TYPES =====
export interface Company {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    description?: string;
    culture?: string;
    benefits?: string[];
    glassdoorRating?: number;
    notes?: string;
}

// ===== CONTACT TYPES =====
export interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    company: string;
    linkedIn?: string;
    notes?: string;
    lastContact?: string;
}

// ===== DOCUMENT TYPES =====
export interface Document {
    id: string;
    name: string;
    type: 'Resume' | 'Cover Letter' | 'Portfolio' | 'Other';
    version?: string;
    fileUrl?: string;
    uploadedAt: string;
    usedFor?: string[]; // Application IDs
}

// ===== STATISTICS TYPES =====
export interface Statistics {
    totalApplications: number;
    activeApplications: number;
    interviewsScheduled: number;
    offersReceived: number;
    rejections: number;
    responseRate: number;
    averageResponseTime: number; // in days
    applicationsByStatus: Record<ApplicationStatus, number>;
    applicationsByMonth: { month: string; count: number }[];
    topCompanies: { company: string; count: number }[];
}

// ===== FILTER TYPES =====
export interface JobFilters {
    search?: string;
    location?: string;
    locationType?: string[];
    jobType?: string[];
    salaryMin?: number;
    salaryMax?: number;
    remote?: boolean;
}

export interface ApplicationFilters {
    search?: string;
    status?: ApplicationStatus[];
    priority?: TaskPriority[];
    dateFrom?: string;
    dateTo?: string;
}

// ===== CONTEXT TYPES =====
export interface JobContextType {
    jobs: Job[];
    savedJobs: Job[];
    filters: JobFilters;
    setFilters: (filters: JobFilters) => void;
    saveJob: (jobId: string) => void;
    unsaveJob: (jobId: string) => void;
    applyToJob: (job: Job) => void;
    searchJobs: (query: string) => void;
}

export interface ApplicationContextType {
    applications: Application[];
    addApplication: (application: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated'>) => void;
    updateApplication: (id: string, updates: Partial<Application>) => void;
    deleteApplication: (id: string) => void;
    moveApplication: (id: string, newStatus: ApplicationStatus) => void;
    getApplicationsByStatus: (status: ApplicationStatus) => Application[];
    getStatistics: () => Statistics;
}

export interface InterviewContextType {
    interviews: Interview[];
    addInterview: (interview: Omit<Interview, 'id'>) => void;
    updateInterview: (id: string, updates: Partial<Interview>) => void;
    deleteInterview: (id: string) => void;
    getUpcomingInterviews: () => Interview[];
    getInterviewsByDate: (date: string) => Interview[];
}

export interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskStatus: (id: string) => void;
    getTasksByPriority: (priority: TaskPriority) => Task[];
    getTasksByStatus: (status: TaskStatus) => Task[];
}

// ===== USER PROFILE TYPES =====
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    location: string;
    targetJobTitles: string[]; // e.g., ["Software Engineer", "Full Stack Developer"]
    skills: string[]; // e.g., ["React", "TypeScript", "Node.js"]
    experienceLevel: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    workPreferences: {
        remote: boolean;
        hybrid: boolean;
        onsite: boolean;
    };
    preferredLocations: string[]; // Cities/regions willing to work in
    industries?: string[]; // Preferred industries
    companySize?: ('Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise')[];
    bio?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    timezonePreference?: string[]; // e.g., ["Americas", "Europe", "Asia", "Flexible"]
    remoteWorkExperience?: boolean; // Has prior remote work experience
    remoteWorkSetup?: string; // e.g., "Home office", "Co-working space"
    createdAt: string;
    updatedAt: string;
}

export interface ProfileContextType {
    profile: UserProfile | null;
    createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    deleteProfile: () => void;
    isProfileComplete: () => boolean;
}

// ===== JOB API TYPES =====
export interface JobAPIResponse {
    jobs: Job[];
    source: 'adzuna' | 'themuse' | 'remotive' | 'github';
    totalResults: number;
    page: number;
}

export interface JobFetchOptions {
    profile: UserProfile;
    page?: number;
    limit?: number;
    sources?: ('adzuna' | 'themuse' | 'remotive' | 'github')[];
}

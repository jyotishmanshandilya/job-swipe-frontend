export interface AuthResponse {
  token: string;
  refreshToken: string | null;
  createdAt: string;
}

export interface Profile {
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
}

export interface Preferences {
  id: string;
  userId: string;
  preferredJobTitles: string[] | null;
  preferredLocations: string[] | null;
  employmentType: string[] | null;
  /** Feeds the AI hybrid-search profile embedding (see NEXT_PUBLIC_ENABLE_SKILLS). */
  preferredSkills: string[] | null;
  remoteOk: boolean;
  willingToRelocate: boolean;
  yearsOfExperience: number;
  /** Extra years above own experience still shown (0 = strict). */
  stretchYears: number;
  emailNotificationsEnabled: boolean;
}

export interface PreferencesRequest {
  preferredJobTitles: string[];
  preferredLocations: string[];
  employmentType: string[];
  preferredSkills: string[];
  remoteOk: boolean;
  willingToRelocate: boolean;
  yearsOfExperience: number;
  stretchYears: number;
}

export interface Job {
  id: string;
  companyName: string | null;
  jobTitle: string;
  /** Boards sometimes omit location (nullable since backend V00016). */
  location: string | null;
  applicationUrl: string;
  workplaceType: string | null;
  yearsOfExperience: number | null;
  /**
   * EXTRACTED = regex found it in the posting content; LLM_EXTRACTED = the LLM
   * read it when the regex missed; TITLE_INFERRED = guessed from seniority
   * words. Trust order: EXTRACTED > LLM_EXTRACTED > TITLE_INFERRED.
   */
  yoeSource: "EXTRACTED" | "LLM_EXTRACTED" | "TITLE_INFERRED" | null;
  postedDate: string | null;
  firstSeenAt: string | null;
  /**
   * Whether the current user has already opened this posting. Optional: only
   * present once the backend view-tracking lands (see BACKEND_HANDOFF.md); until
   * then the frontend derives it from localStorage. OR-ed together in JobCard.
   */
  viewed?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number;
}

export type ReportReason =
  | "MISSING_EXPERIENCE"
  | "WRONG_EXPERIENCE"
  | "WRONG_LOCATION"
  | "EXPIRED"
  | "SPAM"
  | "OTHER";

export interface JobReport {
  id: string;
  userId: string;
  companyJobsId: string;
  reason: ReportReason;
  details: string | null;
  createdAt: string;
}

/** Own report + job context (`GET /api/jobs/reports/mine`). Job fields are null if the job was deleted. */
export interface MyJobReport {
  id: string;
  companyJobsId: string;
  reason: ReportReason;
  details: string | null;
  createdAt: string;
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  applicationUrl: string | null;
}

/** Public landing-page counts (`GET /api/jobs/stats`, no auth). */
export interface JobStats {
  totalJobs: number;
  totalBoards: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

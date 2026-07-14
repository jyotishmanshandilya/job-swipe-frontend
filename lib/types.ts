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
  /** EXTRACTED = found in the posting content; TITLE_INFERRED = guessed from seniority words. */
  yoeSource: "EXTRACTED" | "TITLE_INFERRED" | null;
  postedDate: string | null;
  firstSeenAt: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;

export type ApplicationStatus = (typeof STATUSES)[number];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  /** ISO date (yyyy-mm-dd) the application was added or submitted. */
  appliedOn: string;
  /** Expected CTC in LPA, if known. */
  salaryLpa: number | null;
  link: string;
  notes: string;
}

export type JobApplicationInput = Omit<JobApplication, 'id'>;

import { computed, Injectable, signal } from '@angular/core';
import {
  ApplicationStatus,
  JobApplication,
  JobApplicationInput,
  STATUSES,
} from '../models/job-application';
import { isoDaysAgo } from '../utils/date';

export const STORAGE_KEY = 'job-tracker.applications.v1';

type StatusCounts = Record<ApplicationStatus, number>;

/**
 * Signal-based store for job applications, persisted to localStorage.
 * Components read the exposed signals and call the mutators below.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly items = signal<JobApplication[]>(this.load());

  readonly applications = this.items.asReadonly();

  readonly total = computed(() => this.items().length);

  readonly countsByStatus = computed<StatusCounts>(() => {
    const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as StatusCounts;
    for (const item of this.items()) {
      counts[item.status]++;
    }
    return counts;
  });

  /** Applications still in play: applied or interviewing. */
  readonly activeCount = computed(() => {
    const counts = this.countsByStatus();
    return counts.Applied + counts.Interview;
  });

  /** Share of submitted applications (everything except Wishlist) that got any response. */
  readonly responseRate = computed(() => {
    const counts = this.countsByStatus();
    const everSubmitted = this.total() - counts.Wishlist;
    if (everSubmitted === 0) {
      return 0;
    }
    return Math.round(((counts.Interview + counts.Offer + counts.Rejected) / everSubmitted) * 100);
  });

  readonly recent = computed(() =>
    [...this.items()].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)).slice(0, 5),
  );

  getById(id: string): JobApplication | undefined {
    return this.items().find((item) => item.id === id);
  }

  add(input: JobApplicationInput): JobApplication {
    const created: JobApplication = { ...input, id: this.newId() };
    this.commit([created, ...this.items()]);
    return created;
  }

  update(id: string, changes: JobApplicationInput): void {
    this.commit(this.items().map((item) => (item.id === id ? { ...changes, id } : item)));
  }

  updateStatus(id: string, status: ApplicationStatus): void {
    this.commit(this.items().map((item) => (item.id === id ? { ...item, status } : item)));
  }

  remove(id: string): void {
    this.commit(this.items().filter((item) => item.id !== id));
  }

  private commit(next: JobApplication[]): void {
    this.items.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode, quota); the in-memory state still works.
    }
  }

  private load(): JobApplication[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed as JobApplication[];
        }
      }
    } catch {
      // Corrupt data: fall through to the sample data.
    }
    return this.sampleData();
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Fictional sample entries so the app is not empty on first launch. */
  private sampleData(): JobApplication[] {
    const sample = (
      n: number,
      company: string,
      role: string,
      location: string,
      status: ApplicationStatus,
      daysAgo: number,
      salaryLpa: number | null,
      notes = '',
    ): JobApplication => ({
      id: `sample-${n}`,
      company,
      role,
      location,
      status,
      appliedOn: isoDaysAgo(daysAgo),
      salaryLpa,
      link: '',
      notes,
    });

    return [
      sample(1, 'Northwind Labs', 'Frontend Engineer', 'Pune', 'Interview', 3, 14, 'Technical round on Friday.'),
      sample(2, 'Contoso Systems', 'Angular Developer', 'Bengaluru', 'Applied', 5, 12),
      sample(3, 'Fabrikam Digital', 'Full-Stack Developer', 'Remote', 'Applied', 9, 15),
      sample(4, 'Globex Software', 'React Developer', 'Pune', 'Offer', 14, 16, 'Negotiating joining date.'),
      sample(5, 'Initech Services', 'Software Engineer', 'Hyderabad', 'Rejected', 21, null),
      sample(6, 'Umbrella Tech', 'UI Developer', 'Mumbai', 'Wishlist', 1, 13, 'Referral requested.'),
    ];
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ApplicationStatus, JobApplication, STATUSES } from '../../models/job-application';
import { ApplicationService } from '../../services/application.service';
import { DaysAgoPipe } from '../../shared/days-ago/days-ago.pipe';
import { StatusBadge } from '../../shared/status-badge/status-badge';

export type StatusFilter = ApplicationStatus | 'All';
export type SortOrder = 'newest' | 'oldest' | 'company';

@Component({
  selector: 'app-application-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, StatusBadge, DaysAgoPipe],
  templateUrl: './application-list.html',
})
export class ApplicationList {
  private readonly service = inject(ApplicationService);

  readonly statuses = STATUSES;
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusFilter = signal<StatusFilter>('All');
  readonly sortOrder = signal<SortOrder>('newest');

  /** Search text, debounced so filtering does not run on every keystroke. */
  private readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(250),
      map((value) => value.trim().toLowerCase()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  readonly visible = computed(() => {
    const term = this.searchTerm();
    const status = this.statusFilter();

    const filtered = this.service
      .applications()
      .filter((app) => status === 'All' || app.status === status)
      .filter(
        (app) =>
          !term ||
          [app.company, app.role, app.location].some((field) => field.toLowerCase().includes(term)),
      );

    return this.sort(filtered, this.sortOrder());
  });

  protected onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as StatusFilter);
  }

  protected onSort(event: Event): void {
    this.sortOrder.set((event.target as HTMLSelectElement).value as SortOrder);
  }

  protected onStatusChange(app: JobApplication, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;
    this.service.updateStatus(app.id, status);
  }

  protected remove(app: JobApplication): void {
    if (confirm(`Delete the application to ${app.company}?`)) {
      this.service.remove(app.id);
    }
  }

  private sort(items: JobApplication[], order: SortOrder): JobApplication[] {
    const sorted = [...items];
    switch (order) {
      case 'oldest':
        return sorted.sort((a, b) => a.appliedOn.localeCompare(b.appliedOn));
      case 'company':
        return sorted.sort((a, b) => a.company.localeCompare(b.company));
      default:
        return sorted.sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
    }
  }
}

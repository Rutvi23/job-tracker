import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STATUSES, ApplicationStatus } from '../../models/job-application';
import { ApplicationService } from '../../services/application.service';
import { DaysAgoPipe } from '../../shared/days-ago/days-ago.pipe';
import { StatusBadge } from '../../shared/status-badge/status-badge';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusBadge, DaysAgoPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly service = inject(ApplicationService);
  protected readonly statuses = STATUSES;

  protected percentOf(status: ApplicationStatus): number {
    const total = this.service.total();
    return total === 0 ? 0 : Math.round((this.service.countsByStatus()[status] / total) * 100);
  }
}

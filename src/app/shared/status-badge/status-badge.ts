import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ApplicationStatus } from '../../models/job-application';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="cssClass()">{{ status() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<ApplicationStatus>();
  protected readonly cssClass = computed(() => `badge-${this.status().toLowerCase()}`);
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { ApplicationStatus, STATUSES } from '../../models/job-application';
import { ApplicationService } from '../../services/application.service';
import { todayIso } from '../../utils/date';
import { notFutureDate } from '../../validators/date.validators';

@Component({
  selector: 'app-application-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './application-form.html',
})
export class ApplicationForm implements HasUnsavedChanges {
  private readonly service = inject(ApplicationService);
  private readonly router = inject(Router);

  /** Bound from the `:id` route param; undefined when creating a new application. */
  readonly id = input<string>();

  readonly statuses = STATUSES;
  readonly maxDate = todayIso();

  readonly form = new FormGroup({
    company: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    }),
    role: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<ApplicationStatus>('Applied', { nonNullable: true }),
    appliedOn: new FormControl(todayIso(), {
      nonNullable: true,
      validators: [Validators.required, notFutureDate()],
    }),
    salaryLpa: new FormControl<number | null>(null, [Validators.min(0), Validators.max(500)]),
    link: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^(https?:\/\/\S+)?$/)],
    }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });

  private saved = false;

  constructor() {
    // When editing, load the existing record into the form once the route id is known.
    effect(() => {
      const id = this.id();
      if (!id) {
        return;
      }
      const existing = untracked(() => this.service.getById(id));
      if (existing) {
        const { id: _ignored, ...values } = existing;
        this.form.reset(values);
      } else {
        void this.router.navigate(['/applications']);
      }
    });
  }

  get isEdit(): boolean {
    return !!this.id();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  /** Returns the message to show for a control, or null when it is valid or untouched. */
  errorOf(name: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) {
      return null;
    }
    const errors = control.errors;
    if (errors['required']) return 'This field is required.';
    if (errors['minlength']) return `Enter at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Keep it under ${errors['maxlength'].requiredLength} characters.`;
    if (errors['futureDate']) return 'The date cannot be in the future.';
    if (errors['pattern']) return 'Enter a valid link starting with http:// or https://.';
    if (errors['min'] || errors['max']) return 'Enter a realistic amount in LPA.';
    return 'Invalid value.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const id = this.id();
    if (id) {
      this.service.update(id, value);
    } else {
      this.service.add(value);
    }

    this.saved = true;
    void this.router.navigate(['/applications']);
  }
}

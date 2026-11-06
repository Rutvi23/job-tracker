import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { todayIso } from '../utils/date';

/** Fails when the control holds an ISO date later than today. */
export function notFutureDate(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    return value > todayIso() ? { futureDate: true } : null;
  };
}

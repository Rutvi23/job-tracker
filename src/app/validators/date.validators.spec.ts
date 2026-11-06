import { FormControl } from '@angular/forms';
import { toIsoDate } from '../utils/date';
import { notFutureDate } from './date.validators';

describe('notFutureDate', () => {
  const validator = notFutureDate();

  it('accepts today and past dates', () => {
    expect(validator(new FormControl(toIsoDate(new Date())))).toBeNull();
    expect(validator(new FormControl('2020-01-01'))).toBeNull();
  });

  it('rejects a future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(validator(new FormControl(toIsoDate(tomorrow)))).toEqual({ futureDate: true });
  });

  it('ignores empty values so `required` can report them', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });
});

import { DaysAgoPipe } from './days-ago.pipe';

describe('DaysAgoPipe', () => {
  const pipe = new DaysAgoPipe();
  const today = new Date(2026, 5, 20); // 20 Jun 2026

  it.each([
    ['2026-06-20', 'Today'],
    ['2026-06-19', 'Yesterday'],
    ['2026-06-15', '5 days ago'],
    ['2026-06-01', '2 weeks ago'],
    ['2026-03-20', '3 months ago'],
    ['2026-06-25', 'Upcoming'],
  ])('formats %s as "%s"', (iso, expected) => {
    expect(pipe.transform(iso, today)).toBe(expected);
  });
});

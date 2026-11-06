import { Pipe, PipeTransform } from '@angular/core';
import { parseIsoDate } from '../../utils/date';

const MS_PER_DAY = 86_400_000;

/** Turns an ISO date into a friendly relative label such as "3 days ago". */
@Pipe({ name: 'daysAgo' })
export class DaysAgoPipe implements PipeTransform {
  transform(iso: string, today: Date = new Date()): string {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.round((startOfToday.getTime() - parseIsoDate(iso).getTime()) / MS_PER_DAY);

    if (days < 0) return 'Upcoming';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 14) return `${days} days ago`;
    if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApplicationService, STORAGE_KEY } from '../../services/application.service';
import { ApplicationList } from './application-list';

describe('ApplicationList', () => {
  let service: ApplicationService;

  beforeEach(async () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    await TestBed.configureTestingModule({
      imports: [ApplicationList],
      providers: [provideRouter([])],
    }).compileComponents();

    service = TestBed.inject(ApplicationService);
    const base = { location: 'Pune', salaryLpa: null, link: '', notes: '' };
    service.add({ ...base, company: 'Beta Co', role: 'Angular Dev', status: 'Applied', appliedOn: '2026-02-01' });
    service.add({ ...base, company: 'Alpha Co', role: 'React Dev', status: 'Offer', appliedOn: '2026-03-01' });
    service.add({ ...base, company: 'Gamma Co', role: 'Node Dev', status: 'Applied', appliedOn: '2026-01-01' });
  });

  async function render() {
    const fixture = TestBed.createComponent(ApplicationList);
    await fixture.whenStable();
    return fixture;
  }

  const companies = (fixture: { nativeElement: unknown }) =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr td:first-child')).map(
      (td) => td.textContent?.trim(),
    );

  it('lists applications newest first by default', async () => {
    expect(companies(await render())).toEqual(['Alpha Co', 'Beta Co', 'Gamma Co']);
  });

  it('filters by status', async () => {
    const fixture = await render();
    fixture.componentInstance.statusFilter.set('Offer');
    await fixture.whenStable();

    expect(companies(fixture)).toEqual(['Alpha Co']);
  });

  it('sorts by company name', async () => {
    const fixture = await render();
    fixture.componentInstance.sortOrder.set('company');
    await fixture.whenStable();

    expect(companies(fixture)).toEqual(['Alpha Co', 'Beta Co', 'Gamma Co']);
    fixture.componentInstance.sortOrder.set('oldest');
    await fixture.whenStable();
    expect(companies(fixture)).toEqual(['Gamma Co', 'Beta Co', 'Alpha Co']);
  });

  it('shows an empty state when nothing matches', async () => {
    const fixture = await render();
    fixture.componentInstance.statusFilter.set('Wishlist');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No applications match');
  });
});

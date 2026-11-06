import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { STORAGE_KEY } from '../../services/application.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows summary stats from the sample data', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    const values = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.stat-value'),
    ).map((el) => el.textContent?.trim());

    expect(values).toHaveLength(5);
    expect(values[0]).toBe('6');
  });

  it('shows an empty message when there are no applications', async () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nothing yet');
  });
});

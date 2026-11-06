import { TestBed } from '@angular/core/testing';
import { JobApplicationInput } from '../models/job-application';
import { ApplicationService, STORAGE_KEY } from './application.service';

const input = (overrides: Partial<JobApplicationInput> = {}): JobApplicationInput => ({
  company: 'Test Co',
  role: 'Developer',
  location: 'Pune',
  status: 'Applied',
  appliedOn: '2026-01-15',
  salaryLpa: null,
  link: '',
  notes: '',
  ...overrides,
});

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    service = TestBed.inject(ApplicationService);
  });

  it('starts with sample data when storage is empty', () => {
    expect(service.total()).toBeGreaterThan(0);
  });

  it('adds an application at the top of the list', () => {
    const created = service.add(input({ company: 'Added Co' }));

    expect(service.applications()[0]).toEqual(created);
    expect(service.getById(created.id)?.company).toBe('Added Co');
  });

  it('updates an existing application', () => {
    const created = service.add(input());
    service.update(created.id, input({ company: 'Renamed Co', status: 'Offer' }));

    const updated = service.getById(created.id);
    expect(updated?.company).toBe('Renamed Co');
    expect(updated?.status).toBe('Offer');
  });

  it('changes only the status with updateStatus', () => {
    const created = service.add(input({ company: 'Keep Me' }));
    service.updateStatus(created.id, 'Interview');

    expect(service.getById(created.id)).toMatchObject({ company: 'Keep Me', status: 'Interview' });
  });

  it('removes an application', () => {
    const created = service.add(input());
    service.remove(created.id);

    expect(service.getById(created.id)).toBeUndefined();
  });

  it('counts applications per status', () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    TestBed.resetTestingModule();
    const empty = TestBed.inject(ApplicationService);

    empty.add(input({ status: 'Applied' }));
    empty.add(input({ status: 'Applied' }));
    empty.add(input({ status: 'Offer' }));

    expect(empty.countsByStatus()).toEqual({
      Wishlist: 0,
      Applied: 2,
      Interview: 0,
      Offer: 1,
      Rejected: 0,
    });
    expect(empty.activeCount()).toBe(2);
  });

  it('calculates the response rate from submitted applications only', () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    TestBed.resetTestingModule();
    const store = TestBed.inject(ApplicationService);

    expect(store.responseRate()).toBe(0);

    store.add(input({ status: 'Wishlist' })); // not submitted, ignored
    store.add(input({ status: 'Applied' }));
    store.add(input({ status: 'Interview' }));

    expect(store.responseRate()).toBe(50);
  });

  it('persists changes to localStorage and reloads them', () => {
    const created = service.add(input({ company: 'Persisted Co' }));

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(ApplicationService);

    expect(reloaded.getById(created.id)?.company).toBe('Persisted Co');
  });

  it('falls back to sample data when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    TestBed.resetTestingModule();

    expect(TestBed.inject(ApplicationService).total()).toBeGreaterThan(0);
  });
});

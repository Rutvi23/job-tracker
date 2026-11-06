import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ApplicationService, STORAGE_KEY } from '../../services/application.service';
import { todayIso } from '../../utils/date';
import { ApplicationForm } from './application-form';

describe('ApplicationForm', () => {
  beforeEach(async () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    await TestBed.configureTestingModule({
      imports: [ApplicationForm],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(ApplicationForm);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function fillValid(component: ApplicationForm) {
    component.form.patchValue({ company: 'Acme', role: 'Engineer', location: 'Pune' });
  }

  it('is invalid until the required fields are filled', () => {
    const { component } = create();
    expect(component.form.invalid).toBe(true);

    fillValid(component);
    expect(component.form.valid).toBe(true);
  });

  it('rejects a future date and a malformed link', () => {
    const { component } = create();
    fillValid(component);

    component.form.patchValue({ appliedOn: '2999-01-01', link: 'not-a-url' });

    expect(component.form.controls.appliedOn.errors).toEqual({ futureDate: true });
    expect(component.form.controls.link.errors?.['pattern']).toBeTruthy();
  });

  it('shows an error message only after the field is touched', () => {
    const { component } = create();
    expect(component.errorOf('company')).toBeNull();

    component.form.controls.company.markAsTouched();
    expect(component.errorOf('company')).toBe('This field is required.');
  });

  it('does not save an invalid form', () => {
    const { component } = create();
    const service = TestBed.inject(ApplicationService);

    component.submit();

    expect(service.total()).toBe(0);
    expect(component.form.controls.company.touched).toBe(true);
  });

  it('saves a valid form and navigates back to the list', () => {
    const { component } = create();
    const service = TestBed.inject(ApplicationService);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fillValid(component);
    component.submit();

    expect(service.total()).toBe(1);
    expect(service.applications()[0]).toMatchObject({ company: 'Acme', appliedOn: todayIso() });
    expect(navigate).toHaveBeenCalledWith(['/applications']);
  });

  it('loads an existing record when an id is bound', async () => {
    const service = TestBed.inject(ApplicationService);
    const existing = service.add({
      company: 'Loaded Co',
      role: 'Dev',
      location: 'Remote',
      status: 'Interview',
      appliedOn: '2026-01-10',
      salaryLpa: 12,
      link: '',
      notes: '',
    });

    const fixture = TestBed.createComponent(ApplicationForm);
    fixture.componentRef.setInput('id', existing.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.isEdit).toBe(true);
    expect(fixture.componentInstance.form.getRawValue().company).toBe('Loaded Co');
  });

  it('reports unsaved changes only while the form is dirty and unsaved', () => {
    const { component } = create();
    expect(component.hasUnsavedChanges()).toBe(false);

    component.form.controls.company.markAsDirty();
    expect(component.hasUnsavedChanges()).toBe(true);
  });
});

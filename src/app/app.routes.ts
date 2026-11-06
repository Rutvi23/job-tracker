import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Dashboard · JobTracker',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'applications',
    title: 'Applications · JobTracker',
    loadComponent: () =>
      import('./features/application-list/application-list').then((m) => m.ApplicationList),
  },
  {
    path: 'applications/new',
    title: 'Add application · JobTracker',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/application-form/application-form').then((m) => m.ApplicationForm),
  },
  {
    path: 'applications/:id/edit',
    title: 'Edit application · JobTracker',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./features/application-form/application-form').then((m) => m.ApplicationForm),
  },
  { path: '**', redirectTo: '' },
];

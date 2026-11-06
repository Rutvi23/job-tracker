# JobTracker

A job application tracker built with **Angular** to keep a job search organised: add applications, move them through a pipeline (Wishlist → Applied → Interview → Offer / Rejected), search and filter them, and see summary stats on a dashboard.

Data is stored in the browser's `localStorage`, so it runs with no backend. The first launch loads a few fictional sample entries.

## Features

- **Dashboard** with totals, active applications, interviews, offers, response rate, a pipeline breakdown and recent activity
- **Applications list** with debounced search, status filter, sorting, inline status change and delete
- **Add / edit form** built with typed reactive forms, with validation messages and a custom "no future date" validator
- **Unsaved-changes guard** that warns before leaving a dirty form
- **Lazy-loaded routes** for each page, with route params bound directly to component inputs
- **Persistence** to `localStorage` with a safe fallback when storage is unavailable or corrupt

## Tech and Angular concepts used

| Area | What is used |
| --- | --- |
| Components | Standalone components, `OnPush`, new control flow (`@if`, `@for`) |
| State | Signals (`signal`, `computed`, `input`, `effect`), a service-based store |
| RxJS | `debounceTime`, `distinctUntilChanged`, `toSignal` for the search box |
| Forms | Typed reactive forms (`FormGroup`, `FormControl`), custom validator |
| Routing | Lazy `loadComponent`, `withComponentInputBinding`, functional `canDeactivate` guard, page titles |
| Reuse | Shared `StatusBadge` component and `DaysAgo` pipe |
| Testing | Vitest through the Angular test builder, 32 unit and component tests |
| Tooling | Angular CLI, SCSS, GitHub Actions CI |

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:4200
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Run the dev server |
| `npm test` | Run the unit tests |
| `npm run build` | Production build into `dist/` |

## Project structure

```
src/app/
├── features/
│   ├── dashboard/           # stats, pipeline, recent activity
│   ├── application-list/    # search, filter, sort, delete
│   └── application-form/    # add / edit with validation
├── services/                # signal-based ApplicationService (+ localStorage)
├── shared/                  # StatusBadge component, DaysAgo pipe
├── validators/              # notFutureDate
├── guards/                  # unsavedChangesGuard
├── models/                  # JobApplication types
└── utils/                   # date helpers
```

## Possible next steps

- Swap the `localStorage` store for a REST API (the service is the only place that would change)
- Add a Kanban board view with drag and drop
- Add reminders for follow-ups and upcoming interviews

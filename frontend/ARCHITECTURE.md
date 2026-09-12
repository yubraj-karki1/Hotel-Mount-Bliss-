# Frontend architecture

- `app/` — App Router pages, layouts, loading, and error boundaries. Route files should stay thin.
- `components/ui/` — accessible design-system primitives.
- `components/layout/` — public website shells, header, and footer.
- `components/hotel/` — shared hotel-specific presentation.
- `components/rooms/`, `booking/`, `dashboard/`, `admin/`, `auth/` — feature components grouped by domain.
- `services/` — the only modules that call the centralized HTTP client.
- `lib/` — framework-independent utilities and API configuration.
- `constants/` — stable configuration and status mappings.
- `types/` — shared TypeScript contracts.
- `providers/` — application-wide React providers.
- `styles/` — global styles and design tokens.
- `public/` — static images and metadata assets.

## Conventions

Pages compose feature components; they do not contain API calls. Server state belongs in TanStack Query and service modules. UI-only state stays close to its component. Backend authorization, availability, and final pricing remain authoritative.

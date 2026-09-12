# Hotel Mount Bliss API

Express and MongoDB API for authentication, rooms, reservations, service requests, housekeeping, reviews, notifications, enquiries, staff, settings, and booking reports. Payment processing is intentionally not part of this application.

## Commands

- `npm run dev` — development server with reload
- `npm run typecheck` — strict TypeScript validation
- `npm run build` — production compilation
- `npm test` — automated tests
- `npm run seed` — seed rooms, services, and an optional administrator

Copy `.env.example` to `.env`, configure MongoDB and secrets, then run the server. The health endpoint is `GET /health` and API routes use the `/api/v1` prefix.

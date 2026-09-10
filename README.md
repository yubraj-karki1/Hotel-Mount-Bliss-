# Hotel Mount Bliss

A full-stack hotel website and operations system built with Next.js, Express, MongoDB, and TypeScript. Payment processing is intentionally outside the project scope; booking prices are recorded for stay quotations and operational reporting only.

## Features

- Public hotel, room, gallery, service, contact, and booking pages
- Customer registration, login, password reset, profile, favorites, booking lookup, and cancellation
- Room availability checks and server-calculated stay quotations
- Staff dashboard for reservations, rooms, guests, housekeeping, services, reviews, enquiries, reports, settings, and staff accounts
- Role-based authorization for customers, receptionists, housekeepers, managers, and administrators
- Security headers, rate limits, validation, audit logs, and HttpOnly authentication cookies

## Local setup

1. Install Node.js 20+ and MongoDB 7+.
2. Copy `backend/.env.example` to `backend/.env` and configure it.
3. Copy `frontend/.env.example` to `frontend/.env.local`.
4. Run `npm install` in both `backend/` and `frontend/`.
5. Optionally set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run `npm --prefix backend run seed`.
6. Run the backend with `npm run dev:backend` and frontend with `npm run dev:frontend`.

## Verification

- `npm run build:all`
- `npm run lint`
- `npm run test:backend`

CI runs the same checks for every pull request and push to `main`.

## Production checklist

- Use Node.js 20, a managed MongoDB deployment with backups, and HTTPS for both applications.
- Set a unique `JWT_SECRET` of at least 32 characters and production `MONGO_URI`, `CLIENT_URL`, email, API, and site URL values. Never commit `.env` files.
- Deploy the frontend and API on the same site (for example `www.example.com` and `api.example.com`) so secure SameSite cookies work correctly.
- Configure the platform to probe `/health/live` for liveness and `/health/ready` for readiness.
- Run `npm run build:all`, `npm run lint`, and `npm run test:backend` before promotion.
- Enable database backups, log retention/alerts, TLS, and secret rotation in the hosting platform.
- Create the first administrator with the seed command, then remove seed credentials from the environment.

The frontend defaults to `http://localhost:3000`; the API uses the `PORT` configured in `backend/.env`.

# Production deployment

Deploy `frontend/` and `backend/` as separate Node.js 20 services. Use related HTTPS hostnames such as `www.example.com` and `api.example.com` so cookie authentication remains same-site.

## Backend

Build with `npm ci && npm run build` and start with `npm start`. The start command synchronizes MongoDB indexes before accepting traffic.

Required runtime variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<unique random value of at least 32 characters>
JWT_EXPIRES_IN=15m
CLIENT_URL=https://www.example.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
```

Configure the platform health check to request `/health/ready`. Use a managed MongoDB deployment with TLS, backups, monitoring, and restricted network access.

Create the initial administrator once by temporarily adding `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_PHONE`, running `npm run seed`, and then removing those variables.

## Frontend

The public variables must be present at build time:

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

Build with `npm ci && npm run build` and start with `npm start`. If using the Dockerfile, pass both values as build arguments.

## Release checks

From the repository root, run:

```sh
npm run build:all
npm run lint
npm run test:backend
```

After deployment, confirm the frontend loads, `/health/ready` returns HTTP 200, login cookies persist, a booking quote works, and an SMTP test reaches a controlled email address.

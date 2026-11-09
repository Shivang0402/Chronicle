# Chronicle

Chronicle is a private journaling app for writing, organizing, and revisiting journal entries. It includes a React web client, a JSON API, account and email verification flows, journal search and insights, and print-ready PDF export.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [Run with Docker Compose](#run-with-docker-compose)
- [Build and check](#build-and-check)
- [API overview](#api-overview)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## Features

- Create an account, verify an email address, sign in, and manage the profile.
- Create, read, update, delete, and search journal entries.
- Organize entries using moods and tags; review journal statistics and insights.
- Export journal entries as a formatted PDF.
- Request verification and password-reset emails. SMTP is optional for local development.
- Use a responsive web interface built with React.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React, React Router, Vite, Tailwind CSS, Framer Motion |
| API | Node.js 22, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | bcrypt password hashing and signed JWTs |
| PDF generation | Puppeteer and headless Chromium |
| Deployment | Vercel frontend, Render Docker web service |

## Repository layout

```text
.
├── frontend/                 React/Vite application and Vercel configuration
│   ├── public/                Static assets
│   ├── src/                   Pages, components, context, and API client
│   ├── .env.example           Frontend environment variable template
│   └── vercel.json            Client-side route rewrite
├── src/                       Express API
│   ├── config/                 Database connection
│   ├── controllers/            Authentication and journal operations
│   ├── middlewares/            Request authentication and validation
│   ├── models/                 MongoDB models
│   ├── routes/                 API route definitions
│   ├── templates/              PDF and email templates
│   └── utils/                  Shared server utilities
├── tests/                      API tests
├── postman/                    Postman collection and environment examples
├── Dockerfile                  Production API image with Chromium dependencies
├── docker-compose.yml          Local MongoDB, API, and web client stack
├── render.yaml                 Render Blueprint for the API
└── package.json                API scripts and dependencies
```

The frontend is an independent npm project with its own `package.json` and lockfile. Install frontend and backend dependencies from their respective directories.

## Requirements

- Node.js 22 or later and npm.
- MongoDB running locally, a MongoDB Atlas database, or Docker Compose (see below).
- For PDF generation outside Docker, a compatible Chromium installation and its system libraries. The provided production Docker image installs these dependencies.

## Configuration

Copy the example environment files and adjust values for your machine. Do not commit real secrets or production credentials.

### API environment (`.env` in the repository root)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API listen port. Defaults to `4444` in the supplied environment file; the server uses the platform-provided port when deployed. |
| `MONGO_URI` | Yes | MongoDB connection string. The example points to a local `chronicle` database. |
| `JWT` | Yes | Secret used to sign and verify login tokens. Use a long, random value outside local development. |
| `CLIENT_URL` | Recommended | Exact browser app origin allowed by API CORS; also used to create verification and reset links. |
| `APP_URL` | No | Legacy/fallback frontend URL setting. `CLIENT_URL` is used first for email links. |
| `SMTP_HOST` | No | SMTP server hostname. If unset, the mailer logs email links to the API output for development. |
| `SMTP_PORT` | No | SMTP port; defaults to `587`. |
| `SMTP_USER` | No | SMTP username, when authentication is required. |
| `SMTP_PASS` | No | SMTP password, when authentication is required. |
| `SMTP_FROM` | No | Sender name and email address. |

`PUBLIC_CLIENT_URL`, `FRONTEND_PORT`, and `VITE_API_URL` in the root example are used by the Docker Compose setup. Frontend builds use the frontend project environment variable described next.

### Frontend environment (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No locally; set in production | API origin, such as `https://chroniclejournal.onrender.com`. Do not append `/api` or a trailing slash. Leave empty locally to use the Vite `/api` proxy. |
| `VITE_API_PROXY` | No | Local API origin used by the Vite development proxy. Defaults to `http://localhost:4444`. |

Vite embeds `VITE_*` values in the generated frontend at build time. After changing a Vercel environment variable, redeploy the frontend for the change to take effect.

## Run locally

### 1. Configure and start the API

From the repository root:

```sh
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` in place of `cp`. Edit `.env` and set `MONGO_URI` and `JWT`. The API expects MongoDB to be available before it starts. By default, it listens on port `4444` and exposes its health check at `http://localhost:4444/api/health`.

For a production-mode process, use `npm start` instead of `npm run dev`.

### 2. Configure and start the frontend

In a second terminal:

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env`. Open `http://localhost:5173`. Vite forwards requests under `/api` to `http://localhost:4444` by default. Set `VITE_API_PROXY` in `frontend/.env` if your API listens elsewhere.

## Run with Docker Compose

Docker Compose starts a MongoDB container, the API, and the frontend container. It is a convenient way to try the complete stack without installing MongoDB locally.

1. Copy `.env.example` to `.env` and set a local `JWT` value. The compose configuration supplies the API with the Mongo container address, so a local `MONGO_URI` value is not used by the backend container.
2. Start the services from the repository root:

   ```sh
   docker compose up --build
   ```

3. Open `http://localhost:8080`. The API health check is available at `http://localhost:4444/api/health` from the host only if you expose the port; by default, the API is internal to the Compose network and is reached through the frontend proxy.

To stop the stack, press Ctrl+C and run `docker compose down`. The named `mongo-data` volume preserves the local database between runs. To remove that volume and its data, run `docker compose down --volumes`.

## Build and check

Build the frontend production assets:

```sh
cd frontend
npm run build
```

Preview the production build locally with `npm run preview` from `frontend/`.

Run the API test suite from the repository root:

```sh
npm test
```

Run the frontend linter from `frontend/`:

```sh
npm run lint
```

## API overview

All API routes are prefixed by `/api`. Protected routes require an `Authorization: Bearer <token>` header. The login token expires after seven days.

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Service health check. |
| `POST` | `/api/auth/register` | No | Register an account and start email verification. |
| `POST` | `/api/auth/login` | No | Sign in and receive a JWT. Email verification is required. |
| `GET` | `/api/auth/verify-email?token=...` | No | Verify an email address. |
| `POST` | `/api/auth/resend-verification` | No | Request another verification email. |
| `POST` | `/api/auth/forgot-password` | No | Request a password reset link. |
| `POST` | `/api/auth/reset-password` | No | Set a new password using a reset token. |
| `PATCH` | `/api/auth/change-password` | Yes | Change the signed-in user's password. |
| `GET` | `/api/auth/profile` | Yes | Read the signed-in user's profile. |
| `GET` | `/api/chronicle/getchronicles` | Yes | List journal entries. |
| `POST` | `/api/chronicle` | Yes | Create an entry. |
| `GET` | `/api/chronicle/:id` | Yes | Read one entry. |
| `PATCH` | `/api/chronicle/:id` | Yes | Update an entry. |
| `DELETE` | `/api/chronicle/:id` | Yes | Delete an entry. |
| `GET` | `/api/chronicle/search` | Yes | Search entries. |
| `GET` | `/api/chronicle/stats` | Yes | Retrieve journal statistics. |
| `GET` | `/api/chronicle/moods` | Yes | Retrieve available/used moods. |
| `GET` | `/api/chronicle/tags` | Yes | Retrieve tags. |
| `GET` | `/api/chronicle/export` | Yes | Export entries. The web app currently uses PDF export. |

The Postman collection in `postman/` can be used to explore the API. Configure its environment with the local API URL and a token obtained from login where required.

## Deploy

The repository includes a Render Blueprint for the API and Vercel configuration for the frontend. Deploy the API first so its public origin can be configured in Vercel.

### 1. Prepare a production MongoDB database

Create a MongoDB database with a database user for the application. Configure the database network access so the Render service can connect, and copy the connection URI. Use a strong, unique database password and keep the URI private.

### 2. Deploy the API to Render

1. Push the repository to a Git provider supported by Render.
2. In Render, create a **Blueprint** from the repository. Render reads `render.yaml` and creates the `chronicle-api` Docker web service.
3. When prompted, provide:
   - `MONGO_URI`: the production MongoDB connection URI.
   - `CLIENT_URL`: the frontend's exact public origin, for example `https://chronicle.vercel.app`, with no trailing slash.
4. Apply the Blueprint and wait for the service to build and become healthy. The Render health check uses `/api/health`.
5. Copy the deployed service origin, for example `https://chroniclejournal.onrender.com`.

The Blueprint generates a `JWT` secret and sets `NODE_ENV=production`. The Docker image includes Chromium and its runtime libraries for PDF generation. Add the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` environment variables in the Render service settings to enable email delivery. Without SMTP, verification and password-reset links are logged by the API, which is suitable only for development, not normal user-facing production email.

### 3. Deploy the frontend to Vercel

1. Import the same repository as a Vercel project.
2. Set **Root Directory** to `frontend` and enable the option to include files outside that directory if the Vercel interface offers it. No shared root files are needed to build the frontend.
3. Use the Vite defaults, or set:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install` (Vercel detects the lockfile and package manager)
4. Add `VITE_API_URL` to the Vercel project environment variables. Set it to the Render service origin copied above, without `/api` or a trailing slash.
5. Deploy the frontend and copy its production origin.
6. Confirm Render's `CLIENT_URL` matches this origin exactly. If the Vercel domain changes or you add a custom domain, update `CLIENT_URL` in Render and redeploy/restart the API service.

`frontend/vercel.json` rewrites client-side routes to `index.html`, so refreshing a nested app route loads the React application. Add `VITE_API_URL` to Preview deployments only if preview builds should connect to the same API. CORS currently accepts the single origin configured in `CLIENT_URL`, so alternate preview domains will not be allowed unless the server's CORS configuration is extended.

### Production environment checklist

- `MONGO_URI` points to the production database and has not been committed.
- `JWT` is a strong secret generated for the production service.
- `CLIENT_URL` is the exact frontend origin, with HTTPS and no trailing slash.
- Vercel `VITE_API_URL` is the Render origin only; the API client adds `/api` itself.
- SMTP credentials are configured if users need verification and password-reset emails delivered.
- Frontend has been redeployed after any `VITE_API_URL` change.

## Troubleshooting

### The frontend says it cannot reach the server

Check the Render service is healthy and that `VITE_API_URL` contains its public origin, without `/api` and without a trailing slash. Since Vite variables are included at build time, redeploy Vercel after changing the variable.

### The API reports a database connection error

Check `MONGO_URI`, the database username/password, and the database network access rules. Ensure the database is running before starting the API locally.

### Browser requests fail with a CORS error

Set Render's `CLIENT_URL` to the exact website origin, including `https://` and any custom domain, but excluding a trailing slash. The API currently allows one configured origin.

### Verification or password reset emails are not arriving

Without SMTP configuration, the API logs the generated email link instead of sending an email. In production, configure valid SMTP settings and check the provider's sender/domain requirements and service logs.

### PDF export fails in a local environment

PDF export requires Chromium. Use the supplied Docker image/Compose setup, or install the operating system libraries Puppeteer requires for your platform. Check the API logs for Chromium launch errors.

### A nested page returns a 404 on Vercel

Confirm `frontend/vercel.json` is present and that Vercel's Root Directory is `frontend`. The rewrite should route app paths to `index.html`.

## Security and operations notes

- Keep `.env` files, JWT secrets, SMTP credentials, and database credentials out of source control.
- Use HTTPS for the deployed frontend and API.
- Restrict MongoDB network access to the deployment environment where practical.
- Email delivery is disabled unless SMTP is configured; logged development links should not be treated as a production email solution.
- Back up the production MongoDB database independently of the application deployment.

# Chronicle.

<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=Georgia&size=28&duration=3500&pause=1200&color=8B7E74&center=true&vCenter=true&width=750&height=50&lines=A+Quiet+Sanctuary+for+Your+Thoughts.;Your+thoughts.+Your+space.+Your+Chronicle.;Some+things+are+worth+writing+down."
    alt="Chronicle - A Quiet Sanctuary for Your Thoughts."
  />
</p>
<p align="center">
  A personal journaling application built for writing, reflecting, and preserving the moments that matter.
</p>

<p align="center">
  <a href="https://chronicle-jet-ten.vercel.app/">
    <img src="https://img.shields.io/badge/LIVE%20APPLICATION-Visit%20Chronicle-8B7E74?style=for-the-badge&logo=vercel&logoColor=white" alt="Live application"/>
  </a>
  <a href="https://github.com/Shivang0402/Chronicle">
    <img src="https://img.shields.io/badge/SOURCE%20CODE-GitHub-24292F?style=for-the-badge&logo=github&logoColor=white" alt="GitHub repository"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-Language-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
</p>

---

## About Chronicle

Chronicle is a personal digital journaling application designed to give your thoughts, experiences, and reflections a place of their own.

Not everything needs to be shared. Not every thought needs an audience.

In a digital world dominated by social feeds, notifications, and constant interaction, Chronicle takes a different approach. It provides a dedicated space where you can write freely, organize your experiences, revisit old memories, and understand your journaling habits.

From a passing thought to a detailed account of an important day, Chronicle makes it easier to document the things that make up your story.

**It isn't about creating more content. It's about preserving more meaning.**

## Why Chronicle?

Most digital platforms are designed around sharing and interaction. Traditional note-taking applications, on the other hand, often lack the personal experience and reflection that make journaling meaningful.

Chronicle was built around a different philosophy:

- **A personal space:** Your journal belongs to you, without the pressure of sharing.
- **Freedom to write:** A dedicated environment for long-form writing and personal expression.
- **Meaningful organization:** Keep your memories organized through dates, moods, and tags.
- **Reflection through insights:** Understand your writing habits and explore patterns over time.
- **Preserving memories:** Keep your journal accessible and exportable.
- **Control over your data:** Export your journal whenever you like, or permanently delete your account and its entries.

The goal is to make journaling a natural part of everyday life, rather than another task to complete.

---

## Features

<table>
  <tr>
    <td width="50%">
      <h3>Personal Journaling</h3>
      Create, edit, and revisit journal entries with support for long-form writing.
    </td>
    <td width="50%">
      <h3>Search and Organization</h3>
      Find entries using search, filters, sorting, dates, moods, and tags.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Journaling Insights</h3>
      Explore monthly activity, mood distribution, and personal writing statistics.
    </td>
    <td width="50%">
      <h3>PDF Export</h3>
      Generate formatted PDF exports to preserve journal entries outside the application.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Image Attachments</h3>
      Insert images directly into journal entries through authenticated, Cloudinary-backed uploads.
    </td>
    <td width="50%">
      <h3>Account Control</h3>
      Manage your profile and permanently delete your account and journal whenever you choose.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Authentication</h3>
      Account registration, email verification, secure password hashing, and protected API endpoints.
    </td>
    <td width="50%">
      <h3>Responsive Interface</h3>
      A React-based interface with thoughtful interactions and responsive layouts.
    </td>
  </tr>
</table>

---

## Technology Stack

Chronicle is built using the MERN ecosystem, with additional tools for frontend development, authentication, media storage, document generation, testing, and deployment.

### Frontend

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,html,css" alt="Frontend technology logos"/>
</p>

<p align="center">
  React.js &nbsp; | &nbsp; React Router &nbsp; | &nbsp; Vite &nbsp; | &nbsp; Tailwind CSS &nbsp; | &nbsp; Framer Motion
</p>

### Backend and Database

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb" alt="Backend and database technology logos"/>
</p>

<p align="center">
  Node.js &nbsp; | &nbsp; Express.js &nbsp; | &nbsp; MongoDB &nbsp; | &nbsp; Mongoose &nbsp; | &nbsp; Cloudinary
</p>

### Development and Infrastructure

<p align="center">
  <img src="https://skillicons.dev/icons?i=docker,git,github,postman" alt="Development tool logos"/>
</p>

<p align="center">
  Docker &nbsp; | &nbsp; Git &nbsp; | &nbsp; GitHub &nbsp; | &nbsp; Postman
</p>

### Technology Breakdown

| Category | Technologies |
|---|---|
| Frontend | React.js, React Router, Vite |
| Styling and Animation | Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcrypt |
| Email Services | SMTP, Nodemailer |
| Media Storage | Cloudinary, Multer |
| PDF Generation | Puppeteer, Chromium |
| API Testing | Postman |
| Testing | Node.js test runner |
| Containerization | Docker, Docker Compose |
| Deployment | Vercel, Render, MongoDB Atlas |

---

## Application Architecture

Chronicle follows a client-server architecture in which the frontend communicates with the backend through RESTful APIs.

The backend handles authentication, request validation, application logic, database operations, and media uploads. Journal entries and account data live in MongoDB, while entry images are stored in Cloudinary.

```mermaid
flowchart TD
    A["User"] --> B["React Frontend"]
    B --> C["REST API - Express.js"]
    C --> D["Authentication and Validation"]
    D --> E["Controllers"]
    E --> F["Mongoose Models"]
    F --> G[("MongoDB Atlas")]
    E --> H["Puppeteer PDF Generation"]
    E --> I["Email Services"]
    E --> J["Cloudinary Media Storage"]
    G --> F
    F --> E
    E --> C
    C --> B
```

### How It Works

**Authentication**

- Users register using their account details.
- Passwords are hashed using bcrypt.
- Email verification is supported.
- JWTs are issued after successful authentication.
- Protected routes validate authentication before allowing access to user-specific resources.

**Account Deletion**

- Authenticated users can permanently delete their account from the profile page.
- Deletion removes every journal entry associated with the account, followed by the account record itself.
- The action is irreversible, and users are encouraged to export entries they want to keep beforehand.

**Journal Management**

- Users create and manage their journal entries.
- Each entry is associated with its respective user.
- Mongoose handles database interactions.
- Search, filtering, sorting, and pagination help retrieve entries efficiently.

**Image Uploads**

- Images are uploaded through an authenticated endpoint and inserted directly into entry content.
- Multer validates image-only files and enforces a 5 MB size limit.
- Files are streamed from memory to Cloudinary, and the returned secure URL is inserted into the entry content.
- Uploads require a valid JWT and are stored in a dedicated Chronicle media folder.

**Insights and Analytics**

- Journal data is processed through backend aggregation and query logic.
- Monthly activity and mood statistics are generated.
- The frontend presents the resulting insights.

**PDF Generation**

- Journal content is processed by the backend.
- Puppeteer uses headless Chromium to generate formatted PDF documents.
- Users can preserve their written entries outside the application.

---

## Project Structure

```text
Chronicle/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # Entries, profile, and account deletion dialogs
│   │   │   ├── landing/
│   │   │   ├── layout/
│   │   │   └── ui/             # Rich text editor and shared components
│   │   ├── pages/
│   │   ├── context/
│   │   └── lib/
│   ├── .env.production
│   ├── vercel.json
│   └── package.json
│
├── src/
│   ├── config/                 # Database and Cloudinary configuration
│   ├── controllers/            # Auth, journal, and upload handlers
│   ├── middlewares/            # Authentication and Multer upload middleware
│   ├── models/
│   ├── routes/                 # Auth, journal, and upload routes
│   ├── templates/
│   └── utils/
│
├── tests/
├── postman/
├── .postman/
│
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── package.json
├── package-lock.json
└── README.md
```

---

## Getting Started

Want to explore the project locally? Follow these steps.

### Prerequisites

Make sure you have:

- Node.js 22+
- npm
- MongoDB Atlas account or a local MongoDB instance
- Cloudinary account for image uploads
- SMTP credentials for email delivery (optional for local development)
- Git

### Environment Variables

Chronicle reads configuration from environment files. Create a `.env` file in the project root for the backend, and optionally `frontend/.env` for frontend overrides. Never commit real credentials.

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `PORT` | Backend | No | API port. Defaults to `4444`. |
| `MONGO_URI` | Backend | Yes | MongoDB Atlas or local MongoDB connection string. |
| `JWT` | Backend | Yes | Secret used to sign authentication tokens. |
| `CLIENT_URL` | Backend | Yes | Frontend origin used for CORS and email links. |
| `SMTP_HOST` | Backend | No | SMTP server host for email delivery. |
| `SMTP_PORT` | Backend | No | SMTP server port. Defaults to `587`. |
| `SMTP_USER` | Backend | No | SMTP username. |
| `SMTP_PASS` | Backend | No | SMTP password. |
| `SMTP_FROM` | Backend | No | Sender address used in outgoing emails. |
| `CLOUDINARY_CLOUD_NAME` | Backend | For images | Cloudinary cloud name for image uploads. |
| `CLOUDINARY_API_KEY` | Backend | For images | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Backend | For images | Cloudinary API secret. |
| `VITE_API_URL` | Frontend | No | API origin for frontend builds. Local development uses the Vite proxy when omitted. |
| `VITE_API_PROXY` | Frontend | No | Vite development proxy target. Defaults to `http://localhost:4444`. |

Without SMTP configuration, verification and password recovery links are printed to the server console for local development.

### 1. Clone the Repository

```bash
git clone https://github.com/Shivang0402/Chronicle.git

cd Chronicle
```

### 2. Configure the Backend

Install backend dependencies:

```bash
npm ci
```

Create a `.env` file in the project root and provide the backend variables listed in the environment variable table above.

### 3. Start the Backend

```bash
npm run dev
```

The API will be available at:

`http://localhost:4444`

### 4. Configure the Frontend

Open another terminal:

```bash
cd frontend

npm ci
```

No frontend environment file is required for local development. The Vite dev server proxies `/api` requests to `http://localhost:4444`; set `VITE_API_URL` only when targeting a different API origin.

### 5. Start the Frontend

```bash
npm run dev
```

Open the application at:

`http://localhost:5173`

### Running with Docker

Chronicle also includes Docker and Docker Compose configurations.

To start the application stack:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

---

## API Overview

All API endpoints use the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend the email verification message |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| PATCH | `/api/auth/change-password` | Change password |
| GET | `/api/auth/profile` | Retrieve user profile |
| DELETE | `/api/auth/account` | Permanently delete the account and its entries |
| GET | `/api/chronicle/getchronicles` | Retrieve journal entries |
| POST | `/api/chronicle` | Create journal entry |
| GET | `/api/chronicle/:id` | Retrieve an individual entry |
| PATCH | `/api/chronicle/:id` | Update an entry |
| DELETE | `/api/chronicle/:id` | Delete an entry |
| GET | `/api/chronicle/search` | Search journal entries |
| GET | `/api/chronicle/stats` | Retrieve journaling statistics |
| GET | `/api/chronicle/moods` | Retrieve mood information |
| GET | `/api/chronicle/tags` | Retrieve tags |
| GET | `/api/chronicle/export` | Export journal entries |
| POST | `/api/upload` | Upload an image for use in an entry |

Protected endpoints require a valid JWT in the Authorization header:

```http
Authorization: Bearer <your_token>
```

Image uploads use `multipart/form-data` with the file sent in the `image` field. Only image files up to 5 MB are accepted, and the response includes the Cloudinary `url` and `publicId`.

---

## Deployment

Chronicle uses separate hosting services for its frontend and backend.

<p align="center">
  <img src="https://skillicons.dev/icons?i=vercel,docker,mongodb" alt="Deployment technology logos"/>
</p>

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Media Storage | Cloudinary |

The frontend communicates with the deployed API using the `VITE_API_URL` environment variable.

Sensitive configuration, including database credentials, JWT secrets, SMTP credentials, and Cloudinary keys, is maintained through environment variables rather than committed to source control.

---

## Security and Privacy

Chronicle is designed as a personal journaling platform, so protecting user data is an important part of its architecture.

The application incorporates:

- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- User-specific journal data access.
- Authenticated, image-only uploads with a 5 MB size limit.
- Environment-based configuration.
- Database access restrictions.

**Account deletion** gives users direct control over their data. Deleting an account permanently removes the account and all associated journal entries from the application database. Entry images are hosted on Cloudinary, so export or preserve any media you need before deleting your account.

**Privacy is an important design goal, but the current application does not claim end-to-end encryption.** Stored journal content may be accessible to authorized backend, database, and media storage operators.

---

## Future Scope

Chronicle is an evolving project. Some areas that could be explored further include:

- End-to-end encryption for journal entries.
- Advanced writing and formatting capabilities.
- Media management, including cleanup of unused uploads.
- More detailed writing analytics.
- Complete diary backup and export, including attached images.
- Additional personalization and customization.

---

## Author

**Shivang Pandey**

<p align="center">
  <a href="https://github.com/Shivang0402">
    <img src="https://img.shields.io/badge/GitHub-Shivang0402-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub profile"/>
  </a>
</p>

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Georgia&size=22&duration=3500&pause=1500&color=8B7E74&center=true&vCenter=true&width=500&height=40&lines=Some+things+are+worth+writing+down." alt="Some things are worth writing down."/>
  <br/>
  <strong>Chronicle.</strong>
  <br/>
  <a href="https://chronicle-jet-ten.vercel.app/">Explore the application</a>
  <br/><br/>
  <sub>Built with care, one entry at a time.</sub>
</p>

# DeployForge

Self-hosted Git-based application deployment platform. DeployForge lets you register projects linked to Git repositories, build Docker images from those repositories, run containers on allocated host ports, and manage deployments from a web dashboard.

## Main Features

- **User authentication** — Register, sign in, and manage a profile with JWT-based sessions
- **Project management** — Create, view, edit, and delete projects backed by a Git repository URL
- **Project status** — Set project status to `ACTIVE`, `INACTIVE`, or `ARCHIVED`
- **First deploy & redeploy** — Trigger an initial deployment or redeploy the latest version
- **Container lifecycle** — Start and stop running deployments
- **Live deployment logs** — Stream build and runtime logs over Server-Sent Events (SSE)
- **Deployment history** — View past deployments, inspect details, and delete individual records

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Axios |
| Backend | Node.js, Express 5, TypeScript, PostgreSQL (`pg`), JWT, bcrypt |
| Deployment | Docker (image build & container run), Git clone |
| Database | PostgreSQL |

## Project Structure

```
DeployForge/
├── backend/           # Express API (port 4000)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/  # Git, Docker, port allocation, deployment events
│   └── .env.example
├── frontend/          # Next.js dashboard (port 3000)
│   └── src/
│       ├── app/       # Pages (login, projects, deployments)
│       ├── components/
│       └── lib/       # API client
└── database/
    └── schema.sql     # PostgreSQL schema
```

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Docker** installed and running (required for building and running deployed apps)
- **Git** (used by the backend to clone repositories)

## PostgreSQL Setup

1. Create a database:

```bash
createdb deployforge
```

2. Load the schema:

```bash
psql -d deployforge -f database/schema.sql
```

This creates `users`, `projects`, and `deployments` tables with the required constraints and sequences.

## Backend Setup

1. Copy the environment template:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your values:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=deployforge
DB_PASSWORD=your_postgres_password
DB_PORT=5432

JWT_SECRET=replace_with_a_secure_random_secret
```

3. Install dependencies and start the API:

```bash
npm install
npm run dev
```

The backend runs at **http://localhost:4000**.

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend runs at **http://localhost:3000** and expects the backend at **http://localhost:4000**.

## Application & Deployment Flow

1. **Register / sign in** at `/register` or `/login`.
2. **Create a project** with a name and Git repository URL (`/projects/new`).
3. **Open the project dashboard** (`/projects/{id}`).
4. **Deploy** — Click **DEPLOY** to clone the repository, build a Docker image, allocate a host port, and start a container. Live logs stream on the dashboard during the process.
5. **Manage the deployment** — Use **Redeploy**, **Stop**, or **Start** from the dashboard. View full history at `/projects/{id}/deployments`.
6. **Edit project** — Update the project name and status (`ACTIVE` / `INACTIVE` / `ARCHIVED`) from the edit page.

Deployed applications are exposed on dynamically allocated host ports (mapped to port 3000 inside the container).

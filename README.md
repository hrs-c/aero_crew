# AeroCrew — Flight Crew Management (MERN)

A full-stack MERN application for managing airline crew rosters, flight schedules, and
crew-to-flight assignments, with basic duty-time / rest conflict checking.

## Stack

- **MongoDB** + **Mongoose** — data storage
- **Express** + **Node.js** — REST API, JWT auth
- **React** (Vite) + **React Router** — frontend SPA
- **Axios** — API client

## Features

- Email/password auth with JWT, role-based permissions (`admin`, `scheduler`, `viewer`)
- Crew roster CRUD: role, base airport, certifications, qualified aircraft, status, rest tracking
- Flight schedule CRUD: route, aircraft, timing, status
- Crew-to-flight assignments with conflict checks:
  - blocks assigning inactive/on-leave crew
  - blocks assigning crew still on required rest
  - blocks overlapping flight duties (10-hour rest buffer between duties)
- Dashboard with live stats (active crew, upcoming flights, unassigned flights)
- Filtering/search on crew, flights, and assignments

## Project structure

```
flight-crew-management/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # auth, crew, flight, assignment logic
│   ├── middleware/         # JWT auth, error handling
│   ├── models/             # User, Crew, Flight, Assignment (Mongoose schemas)
│   ├── routes/
│   ├── seed.js             # sample data loader
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/      # Layout, ProtectedRoute, StatusBadge
    │   ├── context/AuthContext.jsx
    │   ├── pages/           # Login, Dashboard, Crew, Flights, FlightDetail, Assignments
    │   └── styles/global.css
    └── .env.example
```

## Getting started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd backend
cp .env.example .env       # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed                # optional: loads sample crew/flights + an admin user
npm run dev                 # starts API on http://localhost:5000
```

Seeded login: `admin@aerocrew.com` / `password123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # points to the API, defaults to http://localhost:5000/api
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173 and sign in (or register a new scheduler account).

## API summary

All routes except `/api/auth/register` and `/api/auth/login` require an
`Authorization: Bearer <token>` header.

| Method | Route                  | Description                              |
|--------|-------------------------|-------------------------------------------|
| POST   | /api/auth/register      | Create an account                         |
| POST   | /api/auth/login         | Log in, returns JWT                       |
| GET    | /api/auth/me            | Current user                              |
| GET    | /api/crew               | List crew (filters: search, role, status) |
| GET    | /api/crew/available      | Crew eligible for assignment right now    |
| POST   | /api/crew               | Add crew member                           |
| PUT    | /api/crew/:id           | Update crew member                        |
| DELETE | /api/crew/:id           | Remove crew member (admin only)           |
| GET    | /api/flights            | List flights (filters: status, airports)  |
| GET    | /api/flights/:id        | Flight detail + its assignments           |
| POST   | /api/flights            | Schedule a flight                         |
| PUT    | /api/flights/:id        | Update a flight                           |
| DELETE | /api/flights/:id        | Delete a flight (admin only)              |
| GET    | /api/assignments        | List assignments (filters: flight, crew)  |
| POST   | /api/assignments        | Assign crew to a flight (conflict-checked)|
| PUT    | /api/assignments/:id    | Update assignment status                  |
| DELETE | /api/assignments/:id    | Remove an assignment                      |

## Notes / next steps

- Passwords are hashed with bcrypt; JWTs expire per `JWT_EXPIRES_IN`.
- The rest-conflict rule (10h buffer) lives in `backend/controllers/assignmentController.js`
  and can be tuned or replaced with real aviation duty-time regulations (e.g. FAR 117 / EASA FTL).
- No file uploads or real-time updates are included; consider Socket.IO for live status
  updates across dispatcher screens if you extend this further.

# Reservation Manager

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.119-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=06192E)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

Full‑stack reservation system for organizations, resources, and guest bookings. Built with FastAPI, React, and TypeScript. Features a modern UI, robust API, and no-auth guest booking for easy demos and portfolio use.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
	- [Backend Setup](#backend-setup)
	- [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Security and Auth](#security-and-auth)
- [API Documentation](#api-documentation)
- [Development Notes](#development-notes)
- [Suggested Future Directions](#suggested-future-directions)
- [License](#license)

---

## Overview

Reservation Manager lets you create organizations (e.g., restaurants), define resources (tables, rooms), and book reservations with conflict detection. Designed for easy demoing—no authentication required for guests. Admin UI for setup, clean booking flow, and a modern React frontend.

---

## Features

- Create, view, and manage organizations and resources (admin page)
- Book reservations as a guest (no login needed)
- Prevents double-booking with robust conflict detection
- Search/filter reservations by guest name or resource
- Cancel or delete reservations
- Responsive, modern UI (React + Vite)
- Auto-generated API docs (Swagger/OpenAPI)
- Pytest test suite and Ruff linting
- GitHub Actions CI for lint/test

---

## Architecture

```
┌──────────────────────────────┐
│ Frontend (Vite + React 19)   │
│  TypeScript, Axios, Vite     │
└───────────────┬──────────────┘
				│  HTTP (Axios/Fetch)
				▼
┌──────────────────────────────┐
│ Backend (FastAPI)            │
│ FastAPI, SQLAlchemy, CORS    │
└───────────────┬──────────────┘
				│  SQLAlchemy ORM
				▼
┌──────────────────────────────┐
│      SQLite Database         │
└──────────────────────────────┘
```

---

## Tech Stack

- **Frontend:** React 19, Vite 7, TypeScript 5, Axios, React Router, date-fns
- **Backend:** FastAPI 0.119, SQLAlchemy 2, Pydantic 2, SQLite (default)
- **DevOps:** Ruff, Pytest, GitHub Actions CI

---

## Project Structure

```
reservation-manager/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI routers (organizations, resources, reservations)
│   │   ├── core/                 # Settings (DATABASE_URL)
│   │   ├── db/                   # SQLAlchemy engine/session
│   │   ├── models/               # ORM models
│   │   ├── schemas/              # Pydantic models
│   │   ├── services/             # Business logic layer
│   │   └── main.py               # FastAPI app (routers, CORS, lifespan)
│   ├── tests/                    # pytest suite (API + services)
│   ├── requirements.txt
│   ├── run.py                    # uvicorn dev runner
│   └── API_DOCS.md               # API reference and examples
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingForm.tsx       # Book a reservation
│   │   │   ├── ReservationsList.tsx  # View/manage reservations
│   │   │   └── AdminPage.tsx         # Create orgs/resources
│   │   ├── services/api.ts           # Axios client
│   │   ├── types/api.ts              # TypeScript types
│   │   ├── App.tsx / App.css         # App shell + routes
│   │   └── main.tsx / index.css
│   ├── package.json / vite.config.ts
│   └── README.md
├── .github/workflows/backend.yml     # CI for backend (ruff + pytest)
├── QUICKSTART.md                     # End‑to‑end setup walkthrough
└── PROJECT_SUMMARY.md                # System overview (portfolio ready)
```

---

## Getting Started

### Backend Setup

**Prerequisites:** Python 3.13+

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# Start dev server (auto-reload)
python run.py
# or (equivalent)
PYTHONPATH=$(pwd) uvicorn app.main:app --reload --port 8000
```

Backend available at:
- http://localhost:8000/
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Optional:** configure DB with env var (defaults to SQLite file `backend/reservation.db`):

```bash
export DATABASE_URL="sqlite:///$(pwd)/reservation.db"
```

### Frontend Setup

**Prerequisites:** Node.js 18+

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:5173

---

## Configuration

**Backend:**
- `DATABASE_URL` (default: SQLite file in backend dir)

**Frontend:**
- API base URL is set in `src/services/api.ts` (default: `http://localhost:8000/api`)

---

## Security and Auth

This demo is intentionally unauthenticated to keep the flow simple. Admin actions (creating/deleting organizations and resources) are available from the UI for demonstration.

Future upgrades (for professional/deployment app):
- JWT-based auth (OAuth2PasswordBearer + PyJWT, hashed passwords via Passlib)
- Hosted auth (Auth0/Clerk) with backend JWT verification
- Session cookies with CSRF for form posts
- CORS limited to specific addresses

---

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Full reference:** `backend/API_DOCS.md`

**Key endpoints:**
- `POST /api/organizations/` – Create org
- `POST /api/resources/` – Create resource
- `POST /api/reservations/` – Book reservation
- `GET /api/reservations/` – List/search reservations
- `POST /api/reservations/{id}/cancel` – Cancel
- `DELETE /api/reservations/{id}` – Delete

---

## Development Notes

- Admin page (`/admin`) for org/resource setup
- Booking page (`/`) for guest reservations
- Reservations page (`/reservations`) for search/manage
- CORS enabled for local dev
- No auth by design for demo simplicity; see [Security and Auth](#security-and-auth)
- All backend endpoints tested with pytest
- Linting with Ruff (`ruff check ..`)
- CI: `.github/workflows/backend.yml` (lint + test jobs)

---

## Suggested Future Directions

- Add authentication/authorization (protect Admin)
- Edit/update UI for orgs/resources/reservations
- Alembic migrations (currently using `create_all()`)
- Calendar/availability views on frontend
- Coverage reports in CI, type checking (mypy), deployment guides

---

## License

This project is licensed under the MIT License – see [LICENSE](LICENSE).

---

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the modern Python web framework
- [React](https://react.dev/) for the powerful frontend library
- [SQLAlchemy](https://www.sqlalchemy.org/) for ORM and database management
- [Ruff](https://docs.astral.sh/ruff/) for fast Python linting
- [Pytest](https://docs.pytest.org/) for robust testing
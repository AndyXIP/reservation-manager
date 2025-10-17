# Reservation Manager API Documentation

## Overview

This is a **simple reservation manager without authentication**. It allows guest bookings using name/contact fields instead of requiring user login.

**Base URL**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/docs` (Swagger UI)

## Running the Backend

```bash
cd backend
PYTHONPATH=/path/to/reservation-manager/backend uvicorn app.main:app --reload --port 8000
```

Or use the provided `run.py`:
```bash
cd backend
python run.py
```

## Database

- **Type**: SQLite (default: `backend/reservation.db`)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Not implemented yet (uses `create_all()` on startup)
- Override with environment variable: `DATABASE_URL=sqlite:///path/to/db.db`

## Data Models

### Organization
```json
{
  "id": 1,
  "name": "Restaurant ABC",
  "created_at": "2025-10-17T10:00:00Z",
  "updated_at": "2025-10-17T10:00:00Z"
}
```

### Resource
```json
{
  "id": 1,
  "organization_id": 1,
  "name": "Table 1",
  "type": "table",
  "capacity": 4,
  "created_at": "2025-10-17T10:00:00Z",
  "updated_at": "2025-10-17T10:00:00Z"
}
```

### Reservation
```json
{
  "id": 1,
  "resource_id": 1,
  "user_id": null,
  "start_time": "2025-10-17T18:00:00Z",
  "end_time": "2025-10-17T20:00:00Z",
  "status": "confirmed",
  "notes": "Window seat preferred",
  "guest_last_name": "Smith",
  "guest_first_name": "John",
  "guest_contact": "john@example.com",
  "created_at": "2025-10-17T10:00:00Z",
  "updated_at": "2025-10-17T10:00:00Z"
}
```

**Status values**: `pending`, `confirmed`, `cancelled`

## API Endpoints

### Organizations

#### Create Organization
```http
POST /api/organizations/
Content-Type: application/json

{
  "name": "Restaurant ABC"
}
```
**Response**: `201 Created`

#### List Organizations
```http
GET /api/organizations/
```
**Response**: `200 OK` - Array of organizations

#### Get Organization
```http
GET /api/organizations/{org_id}
```
**Response**: `200 OK` or `404 Not Found`

#### Update Organization
```http
PATCH /api/organizations/{org_id}
Content-Type: application/json

{
  "name": "New Name"
}
```
**Response**: `200 OK` or `404 Not Found`

#### Delete Organization
```http
DELETE /api/organizations/{org_id}
```
**Response**: `204 No Content` or `404 Not Found`

---

### Resources

#### Create Resource
```http
POST /api/resources/
Content-Type: application/json

{
  "organization_id": 1,
  "name": "Table 1",
  "type": "table",
  "capacity": 4
}
```
**Response**: `201 Created`

#### List Resources
```http
GET /api/resources/?organization_id=1
```
**Query params**:
- `organization_id` (optional): Filter by organization

**Response**: `200 OK` - Array of resources

#### Get Resource
```http
GET /api/resources/{resource_id}
```
**Response**: `200 OK` or `404 Not Found`

#### Update Resource
```http
PATCH /api/resources/{resource_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "capacity": 6
}
```
**Response**: `200 OK` or `404 Not Found`

#### Delete Resource
```http
DELETE /api/resources/{resource_id}
```
**Response**: `204 No Content` or `404 Not Found`

---

### Reservations

#### Create Reservation
```http
POST /api/reservations/
Content-Type: application/json

{
  "resource_id": 1,
  "start_time": "2025-10-17T18:00:00",
  "end_time": "2025-10-17T20:00:00",
  "guest_last_name": "Smith",
  "guest_first_name": "John",
  "guest_contact": "john@example.com",
  "notes": "Window seat preferred"
}
```
**Response**: `201 Created` or `400 Bad Request` (conflict)

**Validation**:
- `end_time` must be after `start_time`
- No overlapping reservations for the same resource
- Returns `400` with error message if conflict detected

#### List Reservations
```http
GET /api/reservations/?resource_id=1&guest_last_name=Smith&start=2025-10-17T00:00:00&end=2025-10-18T00:00:00
```
**Query params** (all optional):
- `resource_id`: Filter by resource
- `user_id`: Filter by user (for future auth)
- `start`: Show reservations ending after this time
- `end`: Show reservations starting before this time
- `guest_last_name`: Filter by guest last name (exact match)

**Response**: `200 OK` - Array of reservations

#### Get Reservation
```http
GET /api/reservations/{reservation_id}
```
**Response**: `200 OK` or `404 Not Found`

#### Update Reservation
```http
PATCH /api/reservations/{reservation_id}
Content-Type: application/json

{
  "start_time": "2025-10-17T19:00:00",
  "end_time": "2025-10-17T21:00:00",
  "notes": "Updated notes"
}
```
**Response**: `200 OK`, `400 Bad Request` (conflict), or `404 Not Found`

#### Cancel Reservation
```http
POST /api/reservations/{reservation_id}/cancel
```
**Response**: `200 OK` or `404 Not Found`

Sets `status` to `cancelled`

#### Delete Reservation
```http
DELETE /api/reservations/{reservation_id}
```
**Response**: `204 No Content` or `404 Not Found`

---

## Example Workflow

### 1. Create an Organization
```bash
curl -X POST http://localhost:8000/api/organizations/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Downtown Bistro"}'
```

### 2. Create Resources
```bash
curl -X POST http://localhost:8000/api/resources/ \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": 1,
    "name": "Table 1",
    "type": "table",
    "capacity": 4
  }'
```

### 3. Create a Reservation (Guest Booking)
```bash
curl -X POST http://localhost:8000/api/reservations/ \
  -H "Content-Type: application/json" \
  -d '{
    "resource_id": 1,
    "start_time": "2025-10-17T18:00:00",
    "end_time": "2025-10-17T20:00:00",
    "guest_last_name": "Smith",
    "guest_first_name": "John",
    "guest_contact": "john@example.com"
  }'
```

### 4. List Reservations for a Resource
```bash
curl http://localhost:8000/api/reservations/?resource_id=1
```

### 5. Search Reservations by Guest Name
```bash
curl http://localhost:8000/api/reservations/?guest_last_name=Smith
```

---

## Features Implemented

✅ **CRUD Operations** for Organizations, Resources, Reservations  
✅ **Conflict Detection** - Prevents overlapping reservations  
✅ **Guest Bookings** - No authentication required (uses guest name/contact fields)  
✅ **Query Filters** - Search by resource, date range, guest name  
✅ **Status Management** - Confirm, cancel reservations  
✅ **CORS Enabled** - Frontend can connect from any origin  
✅ **Tests** - Pytest suite with service and API tests  
✅ **Linting** - Ruff configured  
✅ **CI/CD** - GitHub Actions with parallel lint/test jobs

## Features NOT Implemented (Deferred)

❌ **Authentication/JWT** - Explicitly no auth for simplicity  
❌ **User CRUD Endpoints** - User model exists but no routes  
❌ **Alembic Migrations** - Using `create_all()` for now  
❌ **User Management UI**  
❌ **Email Notifications**  
❌ **Payment Integration**

## Frontend Integration Notes

### CORS
CORS is enabled for all origins in development. Update `app/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Date/Time Format
- All timestamps use ISO 8601 format: `2025-10-17T18:00:00`
- Backend uses datetime-aware timestamps (timezone support)
- Frontend should send/receive ISO format strings

### Error Responses
```json
{
  "detail": "Error message here"
}
```
- `400` - Validation error or conflict
- `404` - Resource not found
- `422` - Pydantic validation error (wrong data types)

### Recommended Frontend Tech Stack
Your frontend is already set up with:
- ✅ React 19.1.1
- ✅ TypeScript 5.9.3
- ✅ Vite 7.1.7
- ✅ ESLint configured

**Suggested additions**:
- `axios` or `fetch` for API calls
- `react-router-dom` for routing
- `react-query` or `swr` for data fetching/caching
- `date-fns` or `dayjs` for date handling
- `tailwindcss` or `mui` for styling
- `react-hook-form` for forms
- `zod` for client-side validation

### TypeScript Types (Example)

```typescript
// types/api.ts
export interface Organization {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  organization_id: number;
  name: string;
  type: string | null;
  capacity: number | null;
}

export interface Reservation {
  id: number;
  resource_id: number;
  user_id: number | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  guest_last_name: string | null;
  guest_first_name: string | null;
  guest_contact: string | null;
}

export interface CreateReservation {
  resource_id: number;
  start_time: string;
  end_time: string;
  guest_last_name: string;
  guest_first_name?: string;
  guest_contact?: string;
  notes?: string;
}
```

---

## Testing

Run tests:
```bash
cd backend
pytest -q
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

---

## Development Tips

1. **Swagger UI**: Visit `http://localhost:8000/docs` for interactive API testing
2. **Database Inspection**: Use SQLite browser or `sqlite3 backend/reservation.db`
3. **Hot Reload**: Backend auto-reloads on file changes with `--reload` flag
4. **Logs**: Uvicorn logs all requests with timestamps
5. **Frontend Proxy**: In `vite.config.ts`, add proxy to avoid CORS in dev:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## Summary

Your backend is a **working, tested, linted reservation manager** ready for frontend integration. It's deliberately kept simple without authentication, making it perfect for a portfolio project that demonstrates:

- RESTful API design
- Database modeling with relationships
- Business logic (conflict detection)
- Error handling
- Testing
- CI/CD

Focus your frontend on creating an intuitive booking UI with calendar views, resource selection, and reservation management! 🚀

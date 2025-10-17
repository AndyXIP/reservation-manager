# Tests

This directory contains a minimal pytest suite that validates:

- Service-level CRUD for organizations, resources, and reservations
- Reservation conflict detection
- API-level behavior and HTTP statuses

The tests run against a temporary SQLite database and do not touch your development DB.

Run tests from the `backend/` folder:

```
pytest -q
```

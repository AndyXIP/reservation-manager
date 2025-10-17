# Reservation Manager - Frontend

A React + TypeScript frontend for the Reservation Manager API.

## Features

- 📅 **Book Reservations** - Select resources, date/time, and guest information
- 📋 **View Reservations** - See all reservations with filtering options
- 🔍 **Search** - Filter by guest name or resource
- ✏️ **Manage** - Cancel or delete reservations
- 🎨 **Clean UI** - Modern, responsive design

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Vite 7** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

1. Backend server must be running on `http://localhost:8000`
2. Node.js 18+ installed

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── BookingForm.tsx       # Reservation booking form
│   └── ReservationsList.tsx  # List and manage reservations
├── services/
│   └── api.ts                # Axios API client
├── types/
│   └── api.ts                # TypeScript type definitions
├── App.tsx                   # Main app with routing
├── App.css                   # Component styles
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api`.

**Endpoints used:**
- `GET /api/resources/` - List available resources
- `POST /api/reservations/` - Create new reservation
- `GET /api/reservations/` - List reservations (with filters)
- `POST /api/reservations/{id}/cancel` - Cancel reservation
- `DELETE /api/reservations/{id}` - Delete reservation

## Usage

### Book a Reservation

1. Navigate to home page (Book Reservation)
2. Select a resource from dropdown
3. Choose date and time range
4. Enter guest information (last name required)
5. Add optional contact info and notes
6. Click "Create Reservation"

### View Reservations

1. Navigate to "View Reservations"
2. Use filters to search by guest name or resource
3. Click "Search" to apply filters
4. Each card shows reservation details and status
5. Use "Cancel" or "Delete" buttons to manage reservations

## Development Notes

### TypeScript Configuration

The project uses strict TypeScript with `verbatimModuleSyntax` enabled. This means:
- Type imports must use `import type { ... }`
- No mixing value and type imports

### API Error Handling

The API client automatically handles:
- 400 errors (validation/conflict) - Shows error message
- 404 errors - Resource not found
- Network errors - Connection issues

### Date Formatting

- Backend expects ISO 8601 format: `2025-10-17T18:00:00`
- Frontend displays: `Oct 17, 2025 18:00`
- Uses `date-fns` for formatting

## Future Enhancements

- [ ] Calendar view for reservations
- [ ] Real-time availability checking
- [ ] Email notifications
- [ ] User authentication
- [ ] Multi-organization support
- [ ] Mobile app version
- [ ] Edit reservation functionality

## Troubleshooting

### Backend Connection Issues

If you see "Failed to load resources" or connection errors:
1. Verify backend is running: `http://localhost:8000/docs`
2. Check CORS is enabled in backend
3. Verify API_BASE_URL in `src/services/api.ts`

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## License

MIT

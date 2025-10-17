import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import ReservationsList from './components/ReservationsList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Reservation Manager</h1>
          <nav>
            <Link to="/">Book Reservation</Link>
            <Link to="/reservations">View Reservations</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<BookingForm />} />
            <Route path="/reservations" element={<ReservationsList />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Reservation Manager - Portfolio Project</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

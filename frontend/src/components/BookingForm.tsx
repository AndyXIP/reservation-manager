import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { resourceApi, reservationApi } from '../services/api';
import type { Resource, CreateReservation, Reservation } from '../types/api';

interface BookingFormProps {
  onSuccess?: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dayReservations, setDayReservations] = useState<Reservation[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const [formData, setFormData] = useState({
    resource_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '18:00',
    end_time: '20:00',
    guest_last_name: '',
    guest_first_name: '',
    guest_contact: '',
    notes: '',
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await resourceApi.list();
      setResources(response.data);
    } catch {
      setError('Failed to load resources');
    }
  };

  // Load reservations for selected resource and date (day view)
  const loadDayReservations = async () => {
    // Only fetch when a resource and date are selected
    if (!formData.resource_id || !formData.date) {
      setDayReservations([]);
      return;
    }
    setScheduleLoading(true);
    setScheduleError('');
    try {
      const start = `${formData.date}T00:00:00`;
      const end = `${formData.date}T23:59:59`;
      const res = await reservationApi.list({
        resource_id: parseInt(formData.resource_id),
        start,
        end,
      });
      // Sort by start time ascending
      const sorted = [...res.data].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setDayReservations(sorted);
    } catch {
      setScheduleError('Failed to load schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  // Refresh schedule when resource/date changes
  useEffect(() => {
    loadDayReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.resource_id, formData.date]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const startDateTime = `${formData.date}T${formData.start_time}:00`;
      const endDateTime = `${formData.date}T${formData.end_time}:00`;

      const reservationData: CreateReservation = {
        resource_id: parseInt(formData.resource_id),
        start_time: startDateTime,
        end_time: endDateTime,
        guest_last_name: formData.guest_last_name,
        guest_first_name: formData.guest_first_name || undefined,
        guest_contact: formData.guest_contact || undefined,
        notes: formData.notes || undefined,
      };

      await reservationApi.create(reservationData);
      setSuccess('Reservation created successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        guest_last_name: '',
        guest_first_name: '',
        guest_contact: '',
        notes: '',
      });

      if (onSuccess) onSuccess();
      // Reload day schedule to reflect the new booking
      loadDayReservations();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create reservation'
        : 'Failed to create reservation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Book a Reservation</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resource_id">Resource *</label>
          <select
            id="resource_id"
            value={formData.resource_id}
            onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
            required
          >
            <option value="">Select a resource...</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
                {resource.type && ` (${resource.type})`}
                {resource.capacity && ` - Capacity: ${resource.capacity}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">Start Time *</label>
            <input
              type="time"
              id="start_time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">End Time *</label>
            <input
              type="time"
              id="end_time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guest_last_name">Last Name *</label>
            <input
              type="text"
              id="guest_last_name"
              value={formData.guest_last_name}
              onChange={(e) => setFormData({ ...formData, guest_last_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="guest_first_name">First Name</label>
            <input
              type="text"
              id="guest_first_name"
              value={formData.guest_first_name}
              onChange={(e) => setFormData({ ...formData, guest_first_name: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="guest_contact">Contact (Email/Phone)</label>
          <input
            type="text"
            id="guest_contact"
            value={formData.guest_contact}
            onChange={(e) => setFormData({ ...formData, guest_contact: e.target.value })}
            placeholder="email@example.com or phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Any special requests..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create Reservation'}
        </button>
      </form>

      {/* Day schedule preview */}
      <div className="day-schedule">
        <h3>Schedule for {formData.date || 'selected date'}</h3>
        {!formData.resource_id ? (
          <p className="no-data">Select a resource to see the schedule.</p>
        ) : scheduleLoading ? (
          <p>Loading schedule…</p>
        ) : scheduleError ? (
          <div className="alert alert-error">{scheduleError}</div>
        ) : dayReservations.length === 0 ? (
          <p className="no-data">No reservations for this day.</p>
        ) : (
          <>
            {/* Timeline header ticks */}
            <div className="timeline-header">
              {['00:00','04:00','08:00','12:00','16:00','20:00','24:00'].map((t) => (
                <span key={t} className="timeline-tick">{t}</span>
              ))}
            </div>
            {/* Timeline track */}
            <div className="timeline-track">
              {dayReservations.map((r) => {
                const dayStart = new Date(`${formData.date}T00:00:00`);
                const startMs = new Date(r.start_time).getTime() - dayStart.getTime();
                const endMs = new Date(r.end_time).getTime() - dayStart.getTime();
                const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
                const startMin = clamp(Math.floor(startMs / 60000), 0, 1440);
                const endMin = clamp(Math.ceil(endMs / 60000), 0, 1440);
                const leftPct = (startMin / 1440) * 100;
                const widthPct = Math.max(1.5, ((endMin - startMin) / 1440) * 100); // ensure a visible min width
                return (
                  <div
                    key={r.id}
                    className={`timeline-block status-${r.status}`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${format(new Date(r.start_time), 'HH:mm')}–${format(new Date(r.end_time), 'HH:mm')} · ${r.guest_last_name}${r.guest_first_name ? `, ${r.guest_first_name}` : ''}`}
                  >
                    <span className="timeline-label">
                      {format(new Date(r.start_time), 'HH:mm')}–{format(new Date(r.end_time), 'HH:mm')} · {r.guest_last_name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Also show as list for accessibility */}
            <ul className="schedule-list" aria-label="Day schedule list">
              {dayReservations.map((r) => (
                <li key={r.id} className={`schedule-item status-${r.status}`}>
                  <div className="schedule-time">
                    {format(new Date(r.start_time), 'HH:mm')}–{format(new Date(r.end_time), 'HH:mm')}
                  </div>
                  <div className="schedule-meta">
                    <strong>{r.guest_last_name}{r.guest_first_name ? `, ${r.guest_first_name}` : ''}</strong>
                    {r.notes && <span className="schedule-notes"> · {r.notes}</span>}
                  </div>
                  <span className={`status-badge ${r.status === 'cancelled' ? 'status-cancelled' : r.status === 'pending' ? 'status-pending' : 'status-confirmed'}`}>
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

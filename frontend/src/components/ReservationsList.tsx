import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { reservationApi, resourceApi } from '../services/api';
import type { Reservation, Resource } from '../types/api';

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [filterResourceId, setFilterResourceId] = useState('');

  const loadResources = useCallback(async () => {
    try {
      const response = await resourceApi.list();
      setResources(response.data);
    } catch (err) {
      console.error('Failed to load resources', err);
    }
  }, []);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {};
      if (searchLastName) params.guest_last_name = searchLastName;
      if (filterResourceId) params.resource_id = parseInt(filterResourceId);

      const response = await reservationApi.list(params);
      setReservations(response.data);
    } catch {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [searchLastName, filterResourceId]);

  useEffect(() => {
    loadResources();
    loadReservations();
  }, [loadResources, loadReservations]);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      await reservationApi.cancel(id);
      loadReservations(); // Reload list
    } catch {
      alert('Failed to cancel reservation');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reservation? This cannot be undone.')) return;

    try {
      await reservationApi.delete(id);
      loadReservations(); // Reload list
    } catch {
      alert('Failed to delete reservation');
    }
  };

  const getResourceName = (resourceId: number) => {
    const resource = resources.find((r) => r.id === resourceId);
    return resource ? resource.name : `Resource #${resourceId}`;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="reservations-list">
      <h2>Reservations</h2>

      <div className="filters">
        <div className="form-group">
          <input
            type="text"
            placeholder="Search by last name..."
            value={searchLastName}
            onChange={(e) => setSearchLastName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <select
            value={filterResourceId}
            onChange={(e) => setFilterResourceId(e.target.value)}
          >
            <option value="">All resources</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={loadReservations} className="btn btn-secondary">
          Search
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p className="no-data">No reservations found.</p>
      ) : (
        <div className="reservations-grid">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-header">
                <h3>{getResourceName(reservation.resource_id)}</h3>
                <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>

              <div className="reservation-details">
                <div className="detail-row">
                  <strong>Guest:</strong>
                  <span>
                    {reservation.guest_first_name} {reservation.guest_last_name}
                  </span>
                </div>

                {reservation.guest_contact && (
                  <div className="detail-row">
                    <strong>Contact:</strong>
                    <span>{reservation.guest_contact}</span>
                  </div>
                )}

                <div className="detail-row">
                  <strong>Start:</strong>
                  <span>{formatDateTime(reservation.start_time)}</span>
                </div>

                <div className="detail-row">
                  <strong>End:</strong>
                  <span>{formatDateTime(reservation.end_time)}</span>
                </div>

                {reservation.notes && (
                  <div className="detail-row">
                    <strong>Notes:</strong>
                    <span>{reservation.notes}</span>
                  </div>
                )}
              </div>

              <div className="reservation-actions">
                {reservation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    className="btn btn-warning btn-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reservation.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

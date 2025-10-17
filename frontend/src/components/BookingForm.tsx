import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { resourceApi, reservationApi } from '../services/api';
import type { Resource, CreateReservation } from '../types/api';

interface BookingFormProps {
  onSuccess?: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    </div>
  );
}

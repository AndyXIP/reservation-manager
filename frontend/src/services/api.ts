import axios from 'axios';
import type {
  Organization,
  Resource,
  Reservation,
  CreateReservation,
  UpdateReservation,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Organizations
export const organizationApi = {
  list: () => api.get<Organization[]>('/organizations/'),
  get: (id: number) => api.get<Organization>(`/organizations/${id}`),
  create: (data: { name: string }) => api.post<Organization>('/organizations/', data),
  delete: (id: number) => api.delete(`/organizations/${id}`),
};

// Resources
export const resourceApi = {
  list: (organizationId?: number) => {
    const params = organizationId ? { organization_id: organizationId } : {};
    return api.get<Resource[]>('/resources/', { params });
  },
  get: (id: number) => api.get<Resource>(`/resources/${id}`),
  create: (data: {
    organization_id: number;
    name: string;
    type?: string;
    capacity?: number;
  }) => api.post<Resource>('/resources/', data),
  delete: (id: number) => api.delete(`/resources/${id}`),
};

// Reservations
export const reservationApi = {
  list: (params?: {
    resource_id?: number;
    guest_last_name?: string;
    start?: string;
    end?: string;
  }) => api.get<Reservation[]>('/reservations/', { params }),
  
  get: (id: number) => api.get<Reservation>(`/reservations/${id}`),
  
  create: (data: CreateReservation) => 
    api.post<Reservation>('/reservations/', data),
  
  update: (id: number, data: UpdateReservation) => 
    api.patch<Reservation>(`/reservations/${id}`, data),
  
  cancel: (id: number) => 
    api.post<Reservation>(`/reservations/${id}/cancel`),
  
  delete: (id: number) => 
    api.delete(`/reservations/${id}`),
};

export default api;

// API types matching backend schemas

export interface Organization {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
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

export interface UpdateReservation {
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
  guest_last_name?: string;
  guest_first_name?: string;
  guest_contact?: string;
}

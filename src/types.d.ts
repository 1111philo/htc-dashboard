/** App-wide types */

// DB -- Keep updated
// TODO: where is the source of truth?

interface User {
  user_id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager";
  created_at: string;
  updated_at: string;
  sub: string; // Amplify auth ID, not used
}

interface Guest {
  guest_id: number;
  first_name: string;
  last_name: string;
  dob: string;
  case_manager: string;
  notifications: string | GuestNotification[];
  services: string | GuestService[];
}

interface GuestAPIResponse {
  total_guests: number;
  guest: Guest;
}

interface GuestNotification {
  notification_id: number;
  guest_id: number;
  message: string;
  status: "Archived" | "Active";
  created_at: string;
  updated_at: string;
}

interface GuestService {
  guest_service_id: number;
  service_id: number;
  service_name: string;
  status: "Completed" | "Active";
  slot_occupied: number;
  queued_at: string;
  slotted_at: string;
  completed_at: string;
}

interface Visit {
  visit_id: number;
  guest_id: number;
  service_ids: number;
  created_at: string;
  updated_at: string;
}

interface ServiceType {
  service_id: number;
  service_name: string;
  quota: number | null;
  created_at: string;
  updated_at: string;
}

// END DB

// MISC

interface ReactSelectOption {
  value: string;
  label: string;
}

// END MISC

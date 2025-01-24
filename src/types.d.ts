/** App-wide types */

// DB TYPES -- Keep updated
// TODO: where is the source of truth?

interface Guest {
  total_guests: number;
  guest_id: number;
  first_name: string;
  last_name: string;
  dob: string;
  case_manager: string;
  notifications: string | GuestNotification[];
  services: string | GuestService[];
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
  queued_at: string;
  slotted_at: string;
  completed_at: string;
}

// END DB TYPES

interface ReactSelectOption {
  value: string;
  label: string;
}

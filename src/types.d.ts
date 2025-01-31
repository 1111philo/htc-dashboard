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
  guest_notifications: GuestNotification[];
  guest_services: GuestService[];
}

type GuestNotificationStatus = "Archived" | "Active"

interface GuestNotification {
  notification_id: number;
  guest_id: number;
  message: string;
  status: GuestNotificationStatus;
  created_at: string;
  updated_at: string;
}

type GuestServiceStatus = "Completed" | "Active" | "Queued"

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
  service_ids: number[];
  created_at: string;
  updated_at: string;
}

interface ServiceType {
  service_id: number;
  name: string;
  quota: number | null;
  created_at: string;
  updated_at: string;
}

// END DB

// RESPONSE

interface SuccessResponse {
  success: boolean;
}

interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
}

interface GuestDataAPIResponse extends Guest {
  total: number;
}

interface GuestsAPIResponse extends PaginationInfo {
  rows: Guest[];
}

interface AddUserAPIResponse {
  user_id: number
}

// TODO: fix when API returns pagination data 
type GetUsersAPIResponse = User[]
// interface GetUsersAPIResponse {
//   total: number;
//   offset: number;
//   limit: number;
//   rows: User[];
// }

interface GetVisitsAPIResponse extends PaginationInfo {
  rows: Visit[];
}

// END RESPONSE

// MISC

interface ReactSelectOption {
  value: string;
  label: string;
}

/** Feedback shown to the user on submit event or similar. */
interface UserMessage {
  text: string;
  isError: boolean;
}

// END MISC

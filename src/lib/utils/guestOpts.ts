import { paddedId } from "./util";

/** Map guests to `Select` options */
export function guestSelectOptsFrom(guests: Guest[]): GuestSelectOption[] {
  return guests.map((g) => guestSelectOptionFrom(g));
}

export function guestSelectOptionFrom(guest: Guest): GuestSelectOption {
  return { value: String(guest.guest_id), label: guestOptLabel(guest), guest };
}

/** Make string for option label */
export function guestOptLabel(g: Guest) {
  const notProvided = "[Not Provided]";
  return `${paddedId(g.guest_id)} : ${g.first_name ?? notProvided} ${g.last_name ?? notProvided} : ${g.dob ?? notProvided}`;
}

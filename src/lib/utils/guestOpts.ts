import { paddedId } from "./util";

/** Map guests to `Select` options */
export function guestSelectOptsFrom(guests: Guest[]): GuestSelectOption[] {
  return guests.map((g) => guestSelectOptionFrom(g));
}

export function guestSelectOptionFrom(
  guest: Guest | Partial<Guest>
): GuestSelectOption {
  return { value: String(guest.guest_id), label: guestOptLabel(guest), guest };
}

/** Make string for option label */
export function guestOptLabel(g: Guest | Partial<Guest>) {
  const NOT_PROVIDED = "[Not Provided]";
  return `${paddedId(g.guest_id!)} : ${g.first_name ?? NOT_PROVIDED} ${g.last_name ?? NOT_PROVIDED} : ${g.dob ?? NOT_PROVIDED}`;
}

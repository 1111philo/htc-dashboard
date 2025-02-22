/** Make string for option label */
export function guestOptLabel(g: Guest) {
  return `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`;
}

/** Map guests to `Select` options */
export function guestSelectOptsFrom(guests: Guest[]): GuestSelectOption[] {
  return guests.map((g) => guestSelectOptionFrom(g));
}

export function guestSelectOptionFrom(guest: Guest): GuestSelectOption {
  return { value: String(guest.guest_id), label: guestOptLabel(guest), guest };
}

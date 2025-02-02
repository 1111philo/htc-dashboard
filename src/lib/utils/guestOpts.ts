/** Make string for option label */
export function guestOptLabel(g: Guest) {
  return `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`;
}

/** Map guests to `Select` options */
export function guestLookupOpts(guests: Guest[]): ReactSelectOption[] {
  return guests.map((g) => {
    return {
      value: g.guest_id.toString(),
      label: guestOptLabel(g),
    };
  });
}
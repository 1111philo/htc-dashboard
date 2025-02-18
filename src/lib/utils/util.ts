/** Shared Utility Functions */

/** Return today's date in YYYY/MM/DD format. */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Return human readable date-time in format MM/DD/YYYY 00:00:00 AM */
export function readableDateTime(ISODateString: string): string {
  const ISODate = new Date(ISODateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: 'numeric',
    minute: 'numeric',
    second: undefined,
    hour12: true
  };

  return ISODate.toLocaleTimeString("en-US", options);
}

export function readableTime(ISODateString: string): string {
  const ISODate = new Date(ISODateString);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: undefined,
    hour12: true
  };

  return ISODate.toLocaleTimeString("en-US", options);
}

export function isEven(num) {
  return (num & 1) === 0;
}

export async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Return an offset for use in API calls for paginated data. */
export function pageOffset(pageNum: number): number {
  return pageNum * 10 - 10;
}

/** `key` param is the key with a datetime value to sort by. E.g. `obj.created_at` or `obj.updated_at` */
export function sortByTimeDescending(
  arr: GuestService[] | GuestNotification[],
  key: string
): GuestService[] | GuestNotification[] {
  arr.sort((a, b) => {
    const aTime = new Date(a[key]);
    const bTime = new Date(b[key]);
    if (aTime < bTime) return 1;
    if (aTime > bTime) return -1;
    return 0;
  });
  return arr;
}

export function sortByTimeAscending(
  arr: GuestService[] | GuestNotification[],
  key: string
): GuestService[] | GuestNotification[] {
  arr.sort((a, b) => {
    const aTime = new Date(a[key]);
    const bTime = new Date(b[key]);
    if (bTime < aTime) return 1;
    if (bTime > aTime) return -1;
    return 0;
  });
  return arr;
}

/** To be used when sending form data  */
export function trimStringValues(entries: Object) {
  for (const key in entries) {
    const val = entries[key];
    typeof val === "string" && (entries[key] = val.trim());
  }
}

/** Return a new string with the first character capitalized. */
export function capitalize(str): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function guestFormRequirementsSatisfied(guest: Partial<Guest>): boolean {
  const MIN_REQUIRED_COUNT = 2;
  const { first_name, last_name, dob } = guest; // required fields = 2 of these 3
  let requiredCount = 0;
  for (const val of [first_name, last_name, dob]) {
    val!.length > 0 && requiredCount++;
  }
  return requiredCount >= MIN_REQUIRED_COUNT;
}

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
  };

  return `${ISODate.toLocaleDateString("en-US", options)} ${ISODate.toLocaleTimeString("en-US")}`;
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

type SortDirection = boolean;
export const SORT_DIRECTION = Object.freeze({
  ASCENDING: true,
  DESCENDING: false,
});

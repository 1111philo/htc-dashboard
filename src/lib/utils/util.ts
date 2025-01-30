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

export function debounce<T>(func: (...args: any[]) => Promise<T>, delay = 500) {
  let timeoutId: number;
  return (...args: any[]): Promise<T> => {
    return new Promise((resolve) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        const result = await func(...args); // This passes the search query through
        resolve(result);
      }, delay);
    });
  };
}

/** Return an offset for use in API calls for paginated data. */
export function pageOffset(pageNum: number): number {
  return pageNum * 10 - 10;
}

type SortDirection = boolean;
export const SORT_DIRECTION = Object.freeze({ ASCENDING: true, DESCENDING: false });

export function sortRowsBy(
  key: keyof Guest | keyof User,
  direction: SortDirection,
  rows: User[],
  setSortedRows
) {
  let sorted = rows;
  if (key) {
    sorted = [...sorted].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      if (typeof a[key] === "string") {
        aValue = a[key].toString().toLowerCase();
        bValue = b[key].toString().toLowerCase();
      }
      if (typeof a[key] === "number") {
        aValue = a[key];
        bValue = b[key];
      }
      if (aValue! < bValue!) {
        return direction === SORT_DIRECTION.ASCENDING ? -1 : 1;
      }
      if (aValue! > bValue!) {
        return direction === SORT_DIRECTION.DESCENDING ? 1 : -1;
      }
      return 0;
    });
  }
  setSortedRows(sorted);
}

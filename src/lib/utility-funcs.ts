/** Shared Utility Functions */

/** Return today's date in YYYY/MM/DD format. */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function isEven(num) {
  return (num & 1) === 0;
}

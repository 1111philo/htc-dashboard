// UTIL
/** Return today's date in YYYY/MM/DD format. */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

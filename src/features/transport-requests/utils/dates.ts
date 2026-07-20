/**
 * Returns today's date in the format required by an HTML date input.
 * Uses local time to avoid UTC shifting the date in Paraguay.
 */
export function getTodayInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isDateOnOrAfterToday(value: string, today = getTodayInputValue()): boolean {
  return Boolean(value) && value >= today;
}

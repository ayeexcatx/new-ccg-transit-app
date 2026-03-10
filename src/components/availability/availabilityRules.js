import { format } from 'date-fns';

export const VIEW_MODES = ['day', 'week', 'month'];
export const STATUS_AVAILABLE = 'Available';
export const STATUS_UNAVAILABLE = 'Unavailable';

export const WEEKDAY_LABELS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export function getOperationalShifts(weekday) {
  if (weekday >= 1 && weekday <= 5) return ['Day', 'Night'];
  if (weekday === 0) return ['Night'];
  return [];
}

export function buildShiftLabel(availability) {
  if (availability.status === STATUS_UNAVAILABLE) return STATUS_UNAVAILABLE;
  if (availability.available_truck_count) return `${STATUS_AVAILABLE} (${availability.available_truck_count})`;
  return STATUS_AVAILABLE;
}

export function getStatusClass(status) {
  return status === STATUS_UNAVAILABLE ? 'text-red-700' : 'text-green-700';
}

export function normalizeCount(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function toDateKey(date) {
  return format(date, 'yyyy-MM-dd');
}

export const BOOKINGS_KEY = "bold_bookings";
export const COURT_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
/** Matches admin dashboard demo — court 3 in maintenance */
export const MAINTENANCE_COURT_IDS = new Set<number>([3]);

export type StoredBooking = {
  id: string;
  date: string;
  time: string;
  courtId: number;
  createdAt: string;
  guestLabel: string;
};

const SEED: StoredBooking[] = [
  {
    id: "demo-bp-1",
    date: offsetDateISO(2),
    time: "18:00",
    courtId: 5,
    createdAt: new Date().toISOString(),
    guestLabel: "Guest",
  },
  {
    id: "demo-bp-2",
    date: offsetDateISO(5),
    time: "10:00",
    courtId: 1,
    createdAt: new Date().toISOString(),
    guestLabel: "Guest",
  },
];

function offsetDateISO(daysFromToday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export function readBookings(): StoredBooking[] {
  if (typeof localStorage === "undefined") return [...SEED];
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredBooking[]) : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function writeBookings(list: StoredBooking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

export function addBooking(entry: Omit<StoredBooking, "id" | "createdAt">): StoredBooking {
  const booking: StoredBooking = {
    ...entry,
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const list = readBookings();
  list.unshift(booking);
  writeBookings(list);
  return booking;
}

export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 6; h <= 22; h++) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

export function bookingDays(count = 14): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** ponytail: deterministic fake occupancy — O(1); replace with API availability when backend exists */
export function isDemoSlotBlocked(courtId: number, date: string, time: string): boolean {
  if (MAINTENANCE_COURT_IDS.has(courtId)) return true;
  const hour = Number.parseInt(time.slice(0, 2), 10);
  const day = Number.parseInt(date.slice(8, 10), 10);
  return (courtId * 3 + day + hour) % 11 === 0;
}

export function isSlotBooked(
  courtId: number,
  date: string,
  time: string,
  bookings: StoredBooking[],
  ignoreId?: string,
): boolean {
  return bookings.some(
    (b) => b.id !== ignoreId && b.courtId === courtId && b.date === date && b.time === time,
  );
}

export function courtAvailable(
  courtId: number,
  date: string,
  time: string,
  bookings: StoredBooking[],
): boolean {
  if (MAINTENANCE_COURT_IDS.has(courtId)) return false;
  if (isDemoSlotBlocked(courtId, date, time)) return false;
  return !isSlotBooked(courtId, date, time, bookings);
}

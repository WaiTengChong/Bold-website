import { apiEnabled, apiFetch } from "@/lib/api-client";
import type { StoredBooking } from "@/lib/booking-demo";

export type CourtStatus = { id: number; inMaintenance: boolean };

export type DaySlot = { courtId: number; time: string };

let maintenanceIds = new Set<number>([3]);

export function maintenanceCourtIds(): Set<number> {
  return new Set(maintenanceIds);
}

export async function fetchCourtMaintenance(): Promise<Set<number>> {
  if (!apiEnabled()) return maintenanceCourtIds();
  const courts = await apiFetch<CourtStatus[]>("/courts");
  maintenanceIds = new Set(courts.filter((c) => c.inMaintenance).map((c) => c.id));
  return maintenanceCourtIds();
}

export async function fetchDaySlots(date: string): Promise<DaySlot[]> {
  if (!apiEnabled()) return [];
  return apiFetch<DaySlot[]>(`/bookings/day?date=${encodeURIComponent(date)}`);
}

export async function fetchMyBookings(): Promise<StoredBooking[]> {
  if (!apiEnabled()) return [];
  return apiFetch<StoredBooking[]>("/bookings/mine");
}

export async function createBookingApi(body: {
  date: string;
  time: string;
  courtId: number;
  guestName?: string;
}): Promise<StoredBooking> {
  return apiFetch<StoredBooking>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchGuestBookingEnabled(): Promise<boolean> {
  if (!apiEnabled()) return true;
  const res = await apiFetch<{ guestBookingEnabled: boolean }>("/settings");
  return res.guestBookingEnabled;
}
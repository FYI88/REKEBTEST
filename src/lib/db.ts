import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { trips as demoTrips, type Review, type Trip } from "@/lib/demo-data";
import type { Pay } from "@/lib/store";

export type DbProfile = {
  full_name: string;
  filiere: string | null;
  role: string | null;
} | null;

export type DbTripRow = {
  id: string;
  driver_name: string;
  from_quarter: string;
  pickups: string[];
  departure_date: string;
  departure_time: string;
  arrival_time: string | null;
  slot: "Matin" | "Soir";
  vehicle: "Voiture" | "Moto";
  car: string | null;
  plate: string | null;
  ambiance: Trip["preference"] | null;
  seats_total: number;
  seats_left: number;
  recurring: boolean;
  last_minute: boolean;
  profiles: DbProfile;
  ratings: { stars: number }[];
};

const avatarColors = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4", "bg-avatar-5"];

function initialsOf(name: string): string {
  const words = name.split(" ").filter((w) => /^[A-ZÀ-Þ]/.test(w) && !w.endsWith("."));
  const first = words[0]?.[0] ?? "E";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function dateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

export function toTrip(row: DbTripRow): Trip {
  const ratings = row.ratings ?? [];
  const avg = ratings.length ? ratings.reduce((a, r) => a + r.stars, 0) / ratings.length : 0;
  const colorIndex = [...row.id].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length;
  return {
    id: row.id,
    driver: row.driver_name,
    initials: initialsOf(row.driver_name),
    status: row.profiles ? [row.profiles.role, row.profiles.filiere].filter(Boolean).join(" · ") || "Membre ENSA" : "Membre ENSA",
    rating: Math.round(avg * 10) / 10,
    trips: 0,
    from: row.from_quarter,
    pickups: row.pickups ?? [],
    time: row.departure_time.slice(0, 5),
    arrival: (row.arrival_time ?? "").slice(0, 5),
    date: dateLabel(row.departure_date),
    slot: row.slot,
    vehicle: row.vehicle,
    car: row.car ?? "",
    plate: row.plate ?? "",
    seats: row.seats_left,
    total: row.seats_total,
    preference: row.ambiance ?? "Musique",
    color: avatarColors[colorIndex] ?? "bg-avatar-1",
    lastMinute: row.last_minute,
    recurring: row.recurring,
  };
}

export async function fetchTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*, profiles:driver_id (full_name, filiere, role), ratings (stars)")
    .order("departure_date", { ascending: true })
    .order("departure_time", { ascending: true });
  if (error) throw error;
  const mapped = ((data ?? []) as unknown as DbTripRow[]).map(toTrip);
  console.info(`[rkeb] trajets : Supabase (${mapped.length})`);
  return mapped;
}

export function useTrips(enabled = true) {
  return useQuery({ queryKey: ["trips"], queryFn: fetchTrips, staleTime: 60_000, retry: 1, enabled });
}

/* ============ Phase 3.3b : détail / billets / wallet réels (mode session) ============ */

type RatingEmbed = { stars: number; comment: string | null; from_id: string; profiles: { full_name: string } | null };

export type TripDetail = { trip: Trip; driverId: string | null; reviews: Review[] };

export type MyBooking = {
  id: string;
  trip: Trip;
  driverId: string | null;
  pickup: string;
  pay: Pay;
  status: "confirmé" | "terminé" | "annulé";
  past: boolean;
};

export type WalletTx = {
  id: string;
  label: string;
  amount: number;
  kind: "trajet" | "remboursement" | "recharge" | "cotisation";
  date: string;
};

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function txDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export async function fetchTrip(id: string): Promise<TripDetail | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*, profiles:driver_id (full_name, filiere, role), ratings (stars, comment, from_id, profiles:from_id (full_name))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as Omit<DbTripRow, "ratings"> & { driver_id: string | null; ratings: RatingEmbed[] };
  const reviews: Review[] = (row.ratings ?? [])
    .filter((r) => r.comment)
    .map((r) => ({ name: r.profiles?.full_name ?? "Membre ENSA", text: r.comment as string, stars: r.stars }));
  return { trip: toTrip(row), driverId: row.driver_id ?? null, reviews };
}

export function useTrip(id: string, enabled = true) {
  return useQuery({ queryKey: ["trip", id], queryFn: () => fetchTrip(id), staleTime: 60_000, retry: 1, enabled });
}

export async function fetchMyBookings(): Promise<MyBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, pickup, pay, status, trips:trip_id ( *, profiles:driver_id (full_name, filiere, role), ratings (stars) )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const today = todayISO();
  const rows = (data ?? []) as unknown as {
    id: string;
    pickup: string;
    pay: Pay;
    status: MyBooking["status"];
    trips: (DbTripRow & { driver_id: string | null }) | null;
  }[];
  return rows.flatMap((b) =>
    b.trips
      ? [{
          id: b.id,
          trip: toTrip(b.trips),
          driverId: b.trips.driver_id ?? null,
          pickup: b.pickup,
          pay: b.pay,
          status: b.status,
          past: b.trips.departure_date < today,
        }]
      : [],
  );
}

export function useMyBookings(enabled = true) {
  return useQuery({ queryKey: ["my-bookings"], queryFn: fetchMyBookings, staleTime: 30_000, retry: 1, enabled });
}

export async function fetchMyWallet(): Promise<{ rows: WalletTx[]; balance: number }> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, label, amount, kind, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows: WalletTx[] = (data ?? []).map((t: { id: string; label: string; amount: number; kind: WalletTx["kind"]; created_at: string }) => ({
    id: t.id,
    label: t.label,
    amount: t.amount,
    kind: t.kind,
    date: txDate(t.created_at),
  }));
  return { rows, balance: rows.reduce((a, r) => a + r.amount, 0) };
}

export function useMyWallet(enabled = true) {
  return useQuery({ queryKey: ["my-wallet"], queryFn: fetchMyWallet, staleTime: 30_000, retry: 1, enabled });
}

function writeError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new Error("Tu as déjà réservé ce trajet.");
  if (error.code === "42501") return new Error("Écriture refusée : connecte-toi à nouveau.");
  return new Error(error.message);
}

/** Réservation réelle : ligne bookings (+ débit wallet de 5 DH). RLS : passager = soi-même. */
export async function bookSeat(opts: { tripId: string; userId: string; pickup: string; pay: Pay; label: string }): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .insert({ trip_id: opts.tripId, passenger_id: opts.userId, pickup: opts.pickup, pay: opts.pay });
  if (error) throw writeError(error);
  if (opts.pay === "wallet") {
    const { error: wErr } = await supabase
      .from("wallet_transactions")
      .insert({ user_id: opts.userId, label: opts.label, amount: -5, kind: "trajet" });
    if (wErr) throw writeError(wErr);
  }
}

/** Annulation réelle : statut annulé (+ remboursement wallet de 5 DH si payé wallet). */
export async function cancelBooking(opts: { bookingId: string; userId: string; pay: Pay; refundLabel: string }): Promise<void> {
  const { error } = await supabase.from("bookings").update({ status: "annulé" }).eq("id", opts.bookingId);
  if (error) throw writeError(error);
  if (opts.pay === "wallet") {
    const { error: wErr } = await supabase
      .from("wallet_transactions")
      .insert({ user_id: opts.userId, label: opts.refundLabel, amount: 5, kind: "remboursement" });
    if (wErr) throw writeError(wErr);
  }
}

/** Notation réelle : ligne ratings (conducteur du trajet). */
export async function rateTrip(opts: { driverId: string; userId: string; tripId: string; stars: number }): Promise<void> {
  const { error } = await supabase
    .from("ratings")
    .insert({ from_id: opts.userId, to_id: opts.driverId, trip_id: opts.tripId, stars: opts.stars });
  if (error) throw writeError(error);
}

/** Demande de recharge cash (l'admin valide côté guichet). */
export async function requestRecharge(opts: { userId: string; amount: number }): Promise<void> {
  const { error } = await supabase.from("recharge_requests").insert({ user_id: opts.userId, amount: opts.amount });
  if (error) throw writeError(error);
}

export type NewTrip = {
  userId: string;
  driverName: string;
  from: string;
  pickups: string[];
  date: string;
  time: string;
  arrival: string;
  slot: "Matin" | "Soir";
  vehicle: "Voiture" | "Moto";
  car: string;
  plate: string;
  ambiance: Trip["preference"];
  seats: number;
  recurring: boolean;
  lastMinute: boolean;
};

/** Publication réelle d'un trajet (RLS : driver_id = soi-même). */
export async function publishTrip(t: NewTrip): Promise<void> {
  const { error } = await supabase.from("trips").insert({
    driver_id: t.userId,
    driver_name: t.driverName,
    from_quarter: t.from,
    pickups: t.pickups,
    departure_date: t.date,
    departure_time: t.time,
    arrival_time: t.arrival,
    slot: t.slot,
    vehicle: t.vehicle,
    car: t.car || null,
    plate: t.plate || null,
    ambiance: t.ambiance,
    seats_total: t.seats,
    seats_left: t.seats,
    recurring: t.recurring,
    last_minute: t.lastMinute,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Tu as déjà publié un trajet à cette date et cette heure.");
    throw writeError(error);
  }
}

export { demoTrips };

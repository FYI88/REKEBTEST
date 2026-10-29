import { useSyncExternalStore } from "react";
import { seedMessages, trips as seedTrips, type ChatMessage, type Trip, type Tx } from "@/lib/demo-data";

export type Pay = "wallet" | "points" | "cotisation";
export type Theme = "tanger" | "ensa" | "nuit";
export type Ambiance = Trip["preference"];
export type Booking = { tripId: string; pay: Pay; pickup: string; status: "confirmé" | "terminé" | "annulé"; rated?: number };
type State = {
  role: "passager" | "conducteur";
  balance: number;
  points: number;
  bookings: Booking[];
  cotisation: boolean;
  published: number;
  demoMode: boolean;
  theme: Theme;
  ambiance: Ambiance;
  notifsRead: boolean;
  myRides: Trip[];
  favorites: string[];
  hiddenTrips: string[];
  chats: Record<string, ChatMessage[]>;
  ledger: Tx[];
};

const KEY = "rkeb-demo-state-v1";

const seed: State = {
  role: "passager", balance: 35, points: 120, cotisation: false, published: 0, demoMode: true, theme: "tanger",
  ambiance: "Musique", notifsRead: false, myRides: [], favorites: [], hiddenTrips: [], chats: {}, ledger: [],
  bookings: [{ tripId: "7", pay: "wallet", pickup: "ENSA entrée principale", status: "terminé" }],
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<State>;
    if (typeof parsed.balance !== "number" || !Array.isArray(parsed.bookings)) return seed;
    return { ...seed, ...parsed };
  } catch {
    return seed;
  }
}

function save(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // stockage indisponible (SSR, navigation privée) : la démo reste en mémoire
  }
}

const canStore = typeof localStorage !== "undefined";
let state: State = canStore ? load() : seed;
const subs = new Set<() => void>();

export function setStore(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  if (canStore) save(state);
  subs.forEach((l) => l());
}

export function resetDemo() {
  state = seed;
  if (canStore) save(state);
  subs.forEach((l) => l());
}

export function useStore() {
  return useSyncExternalStore((l) => { subs.add(l); return () => subs.delete(l); }, () => state, () => seed);
}

function applyBookings(t: Trip, bookings: Booking[]): Trip {
  const taken = bookings.some((b) => b.tripId === t.id && b.status === "confirmé");
  return taken ? { ...t, seats: Math.max(0, t.seats - 1) } : t;
}

/** Trajets de démo visibles : ceux publiés par l'utilisateur d'abord, sans ceux suspendus par l'admin, places mises à jour. */
export function visibleDemoTrips(s: Pick<State, "myRides" | "hiddenTrips" | "bookings">): Trip[] {
  return [...s.myRides, ...seedTrips].filter((t) => !s.hiddenTrips.includes(t.id)).map((t) => applyBookings(t, s.bookings));
}

/** Tous les trajets de démo (même suspendus) : sert à retrouver un billet ou une conversation existants. */
export function findDemoTrip(s: Pick<State, "myRides" | "bookings">, id: string | undefined): Trip | undefined {
  const t = [...s.myRides, ...seedTrips].find((x) => x.id === id);
  return t ? applyBookings(t, s.bookings) : undefined;
}

/** Ajoute une ligne au ledger de démo (le wallet affiche ledger + historique de base). */
export function ledgerEntry(label: string, amount: number, kind: Tx["kind"]): Tx {
  const d = new Date();
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { id: `l-${d.getTime()}-${Math.abs(amount)}`, label, amount, kind, date: `Aujourd’hui ${hhmm}` };
}
export function chatFor(s: Pick<State, "chats">, tripId: string): ChatMessage[] {
  return s.chats[tripId] ?? (tripId === "1" ? seedMessages : []);
}

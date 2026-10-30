import { useSyncExternalStore } from "react";
import { groupSeedMessages, seedGroups as seedGroupsRef, seedMessages, trips as seedTrips, type ChatMessage, type Group, type Report, type RideRequest, type Trip, type Tx } from "@/lib/demo-data";

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
  myRequests: RideRequest[];
  acceptedRequests: string[];
  joinedGroups: string[];
  myGroups: Group[];
  reports: Report[];
  blocked: string[];
  boarded: string[];
  handledReports: string[];
};

const KEY = "rkeb-demo-state-v1";
const THEME_DEFAULT_VERSION = "rkeb-theme-default-v2";

const seed: State = {
  role: "passager", balance: 35, points: 120, cotisation: false, published: 0, demoMode: true, theme: "ensa",
  ambiance: "Musique", notifsRead: false, myRides: [], favorites: [], hiddenTrips: [], chats: {}, ledger: [], myRequests: [], acceptedRequests: [], joinedGroups: [], myGroups: [], reports: [], blocked: [], boarded: [], handledReports: [],
  bookings: [{ tripId: "7", pay: "wallet", pickup: "ENSA entrée principale", status: "terminé" }],
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<State>) : {};
    const loaded = typeof parsed.balance === "number" && Array.isArray(parsed.bookings)
      ? { ...seed, ...parsed }
      : seed;
    return loaded;
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
if (canStore) {
  try {
    if (localStorage.getItem(THEME_DEFAULT_VERSION) !== "1") {
      state = { ...state, theme: "ensa" };
      localStorage.setItem(THEME_DEFAULT_VERSION, "1");
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {
    // ENSA still applies in memory if browser storage is unavailable.
  }
}
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
export function visibleDemoTrips(s: Pick<State, "myRides" | "hiddenTrips" | "bookings" | "blocked">): Trip[] {
  return [...s.myRides, ...seedTrips].filter((t) => !s.hiddenTrips.includes(t.id) && !s.blocked.includes(t.driver)).map((t) => applyBookings(t, s.bookings));
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
  if (s.chats[tripId]) return s.chats[tripId];
  if (tripId.startsWith("group:")) return groupSeedMessages[tripId.slice(6)] ?? [];
  return tripId === "1" ? seedMessages : [];
}

export function allGroups(s: Pick<State, "myGroups">): Group[] {
  return [...s.myGroups, ...seedGroupsRef];
}

/** Membres affichés : membres de base + toi si tu as rejoint. */
export function groupMemberCount(g: Group, joined: string[]): number {
  return g.members.length + (joined.includes(g.id) ? 1 : 0);
}

/** Part hebdomadaire par membre (carburant partagé entre conducteur et membres). */
export function groupShare(g: Group, joined: string[]): number {
  return Math.ceil(g.weeklyFuel / (groupMemberCount(g, joined) + 1));
}

/** Cotisation essence = part hebdomadaire du groupe de Yasmine une fois que tu l'as rejoint (30 DH). */
export const COTISATION_GROUP_ID = "g1";
export const COTISATION_DH = groupShare({ ...seedGroupsRef[0]!, members: [...seedGroupsRef[0]!.members, { name: "Toi", initials: "TO" }] }, []);

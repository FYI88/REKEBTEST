export type TripSort = "heure" | "places" | "note";

type Sortable = { time: string; seats: number; rating: number };

export function sortTrips<T extends Sortable>(list: T[], by: TripSort): T[] {
  const copy = [...list];
  if (by === "places") return copy.sort((a, b) => b.seats - a.seats || a.time.localeCompare(b.time));
  if (by === "note") return copy.sort((a, b) => b.rating - a.rating || a.time.localeCompare(b.time));
  return copy.sort((a, b) => a.time.localeCompare(b.time));
}

export function matchesQuery(t: { driver: string; from: string; pickups: string[]; car: string }, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [t.driver, t.from, t.car, ...t.pickups].some((v) => v.toLowerCase().includes(q));
}

export function addMinutes(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function tomorrowISO(now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  return isoDate(d);
}

export function clockNow(now = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  return h;
}

/** QR décoratif déterministe (9×9, trois repères d'angle) + code d'embarquement lisible, dérivés de l'identifiant du billet. */
export function qrFor(seed: string): { cells: boolean[]; code: string } {
  let h = hash(seed) || 1;
  const next = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h; };
  const finder = (r: number, c: number) => (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
  const cells = Array.from({ length: 81 }, (_, i) => {
    const r = Math.floor(i / 9);
    const c = i % 9;
    if (finder(r, c)) return !(r % 3 === 1 && c % 3 === 1);
    return (next() >>> 16) % 2 === 0;
  });
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let n = hash(seed + "code");
  let code = "";
  for (let i = 0; i < 5; i++) { code += alphabet[n % alphabet.length]; n = Math.floor(n / alphabet.length) || hash(code + i); }
  return { cells, code: `ENSA-${code}` };
}

const replies: [RegExp, string][] = [
  [/où|ou es|where/i, "J’arrive dans 2 minutes, je mets les warnings."],
  [/pickup|arrive|là/i, "Parfait, à tout de suite."],
  [/merci|shukran/i, "Avec plaisir, à demain !"],
];

/** Réponse automatique du conducteur en mode démo. */
export function demoReply(text: string): string {
  return replies.find(([re]) => re.test(text))?.[1] ?? "Ok, noté !";
}

/** Code de montée à 4 chiffres, stable pour une réservation donnée. */
export function pinFor(seed: string): string {
  return String(1000 + (hash(seed + "pin") % 9000));
}

export type TrackStage = { key: string; label: string; from: number };

export const trackStages: TrackStage[] = [
  { key: "route", label: "Conducteur en route vers ton pickup", from: 0 },
  { key: "near", label: "À moins de 2 minutes", from: 45 },
  { key: "arrived", label: "Arrivé au pickup", from: 70 },
  { key: "onboard", label: "En route vers l’ENSA", from: 82 },
  { key: "done", label: "Arrivé à l’ENSA", from: 100 },
];

export function stageFor(progress: number): TrackStage {
  return [...trackStages].reverse().find((s) => progress >= s.from) ?? trackStages[0]!;
}

/** ETA restant en minutes avant le pickup (12 min au départ, 0 à 70 %). */
export function etaMinutes(progress: number): number {
  return Math.max(0, Math.ceil(12 * (1 - Math.min(progress, 70) / 70)));
}

export const FARE_DH = 5;
export const TAXI_PRICE_DH = 30;
export const CO2_PER_SHARED_RIDE_KG = 1.4;
export const MINUTES_SAVED_PER_RIDE = 35;

export type Impact = { rides: number; savedDh: number; co2Kg: number; minutes: number };

/** Estimation d'impact pour un passager : économie vs taxi, CO₂ évité (≈12 km × 120 g/km) et temps gagné vs bus. */
export function impactFor(rides: number): Impact {
  const n = Math.max(0, Math.floor(rides));
  return {
    rides: n,
    savedDh: n * (TAXI_PRICE_DH - FARE_DH),
    co2Kg: Math.round(n * CO2_PER_SHARED_RIDE_KG * 10) / 10,
    minutes: n * MINUTES_SAVED_PER_RIDE,
  };
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, "0")}` : ""}` : `${m} min`;
}

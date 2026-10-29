import { describe, expect, it } from "vitest";

import { formatMinutes, impactFor } from "@/lib/impact";
import { addMinutes, demoReply, matchesQuery, qrFor, sortTrips, tomorrowISO } from "@/lib/trip-utils";

describe("impactFor", () => {
  it("computes savings, CO2 and time from ride count", () => {
    expect(impactFor(10)).toEqual({ rides: 10, savedDh: 250, co2Kg: 14, minutes: 350 });
  });
  it("never goes negative", () => {
    expect(impactFor(-3).rides).toBe(0);
  });
  it("formats minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(125)).toBe("2 h 05");
    expect(formatMinutes(120)).toBe("2 h");
  });
});

describe("trip helpers", () => {
  const list = [
    { time: "07:40", seats: 1, rating: 4.9 },
    { time: "07:20", seats: 3, rating: 4.5 },
    { time: "07:30", seats: 3, rating: 5 },
  ];
  it("sorts by time, seats and rating", () => {
    expect(sortTrips(list, "heure").map((t) => t.time)).toEqual(["07:20", "07:30", "07:40"]);
    expect(sortTrips(list, "places").map((t) => t.time)).toEqual(["07:20", "07:30", "07:40"]);
    expect(sortTrips(list, "note").map((t) => t.rating)).toEqual([5, 4.9, 4.5]);
  });
  it("matches a free-text query", () => {
    const t = { driver: "Yasmine El Amrani", from: "Boukhalef", pickups: ["Station Shell"], car: "Dacia" };
    expect(matchesQuery(t, "shell")).toBe(true);
    expect(matchesQuery(t, "  ")).toBe(true);
    expect(matchesQuery(t, "tetouan")).toBe(false);
  });
  it("adds minutes across hour and midnight", () => {
    expect(addMinutes("07:45", 27)).toBe("08:12");
    expect(addMinutes("23:50", 20)).toBe("00:10");
  });
  it("gives tomorrow's ISO date", () => {
    expect(tomorrowISO(new Date(2026, 9, 31, 12))).toBe("2026-11-01");
  });
  it("derives a stable QR and code per seed", () => {
    const a = qrFor("booking-1");
    expect(a.cells).toHaveLength(81);
    expect(qrFor("booking-1")).toEqual(a);
    expect(qrFor("booking-2").code).not.toBe(a.code);
    expect(a.code).toMatch(/^ENSA-[A-Z2-9]{5}$/);
  });
  it("replies to chat messages", () => {
    expect(demoReply("Tu es où ?")).toContain("2 minutes");
    expect(demoReply("blabla")).toBe("Ok, noté !");
  });
});

import { describe, expect, it } from "vitest";

import { formatMinutes, impactFor } from "@/lib/impact";
import { seedGroups, trips } from "@/lib/demo-data";
import { COTISATION_DH, groupMemberCount, groupShare, visibleDemoTrips } from "@/lib/store";
import { addMinutes, demoReply, etaMinutes, matchesQuery, pinFor, qrFor, sortTrips, stageFor, tomorrowISO } from "@/lib/trip-utils";

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

describe("boarding PIN and live tracking", () => {
  it("derives a stable 4-digit PIN", () => {
    expect(pinFor("dp1")).toMatch(/^\d{4}$/);
    expect(pinFor("dp1")).toBe(pinFor("dp1"));
    expect(pinFor("dp1")).not.toBe(pinFor("dp2"));
  });
  it("maps progress to stages and ETA", () => {
    expect(stageFor(0).key).toBe("route");
    expect(stageFor(50).key).toBe("near");
    expect(stageFor(75).key).toBe("arrived");
    expect(stageFor(90).key).toBe("onboard");
    expect(stageFor(100).key).toBe("done");
    expect(etaMinutes(0)).toBe(12);
    expect(etaMinutes(70)).toBe(0);
    expect(etaMinutes(100)).toBe(0);
  });
});

describe("groups and blocking", () => {
  it("splits the weekly fuel between members and driver", () => {
    const g = seedGroups[0]!;
    expect(groupMemberCount(g, [])).toBe(3);
    expect(groupMemberCount(g, [g.id])).toBe(4);
    expect(groupShare(g, [g.id])).toBe(30);
    expect(COTISATION_DH).toBe(30);
  });
  it("hides blocked drivers, suspended trips and updates seats", () => {
    const base = { myRides: [], hiddenTrips: [], bookings: [], blocked: [] };
    expect(visibleDemoTrips(base)).toHaveLength(trips.length);
    const first = trips[0]!;
    expect(visibleDemoTrips({ ...base, blocked: [first.driver] }).some((t) => t.driver === first.driver)).toBe(false);
    expect(visibleDemoTrips({ ...base, hiddenTrips: [first.id] }).some((t) => t.id === first.id)).toBe(false);
    const booked = visibleDemoTrips({ ...base, bookings: [{ tripId: first.id, pay: "wallet", pickup: "x", status: "confirmé" }] }).find((t) => t.id === first.id);
    expect(booked?.seats).toBe(first.seats - 1);
  });
});

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Bike, Bell, Car, Check, Clock, Compass, Fuel, Gauge, Heart, House, Megaphone, MapPin, Moon, Palette, Plus, Repeat, Search, Sun, Ticket, Trash2, User, WalletCards, Zap } from "lucide-react";
import { toast } from "sonner";
import { neighborhoods, notifications, type Trip, type NotifIcon } from "@/lib/demo-data";
import { dateLabel, demoTrips, publishTrip, useMyWallet, useTrips } from "@/lib/db";
import { setStore, useStore, visibleDemoTrips, type Theme } from "@/lib/store";
import { useAuth, useIdentity } from "@/lib/auth";
import { addMinutes, isoDate, matchesQuery, sortTrips, tomorrowISO, type TripSort } from "@/lib/trip-utils";
import { Button, EmptyState, Field, inputClass, Logo, Stamp, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", label: "Rouler", icon: House },
  { to: "/requests", label: "Demandes", icon: Megaphone },
  { to: "/trips", label: "Billets", icon: Ticket },
  { to: "/wallet", label: "Wallet", icon: WalletCards },
  { to: "/profile", label: "Moi", icon: User },
] as const;

function SessionTimer() {
  const [m, setM] = useState(180);
  useEffect(() => { const i = setInterval(() => setM((x) => Math.max(0, x - 1)), 60000); return () => clearInterval(i); }, []);
  return <span className="hidden font-mono text-[10px] font-bold uppercase text-muted-foreground md:inline">Session · {Math.floor(m / 60)}h{String(m % 60).padStart(2, "0")}</span>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const s = useStore();
  const { session, loading } = useAuth();
  const id = useIdentity();
  const navigate = useNavigate();
  const wallet = useMyWallet(!!session);
  useEffect(() => {
    if (!loading && !session && !s.demoMode) navigate({ to: "/login" });
  }, [loading, session, s.demoMode, navigate]);
  return <div className="min-h-screen">
    <a href="#contenu" className="sr-only z-[60] rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm font-bold text-accent-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Aller au contenu</a>
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/app"><Logo /></Link>
        <div className="flex items-center gap-3">
          <SessionTimer />
          <Link to="/wallet" className="hidden rounded-full border-2 border-ink bg-card px-3 py-1.5 font-mono text-xs font-bold sm:block">{session ? (wallet.data ? wallet.data.balance : "…") : s.balance} DH · {s.points} pts</Link>
          <ThemeToggle />
          <NotificationsBell />
          <Link to="/profile" aria-label="Mon profil" className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-avatar-4 font-display text-sm font-extrabold">{id.initials}</Link>
        </div>
      </div>
    </header>
    <main id="contenu" className="mx-auto max-w-5xl px-4 pb-32 pt-6">{children}</main>
    <nav aria-label="Navigation principale" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-lg rounded-xl border-2 border-ink bg-ink p-1.5 hard">
      <div className="grid grid-cols-5 gap-1">{nav.map(({ to, label, icon: Icon }) =>
        <Link key={to} to={to} className="flex flex-col items-center gap-0.5 rounded-lg py-2 font-mono text-[10px] font-bold uppercase text-ink-muted transition [&.active]:bg-accent [&.active]:text-accent-foreground"><Icon size={19} />{label}</Link>)}
      </div>
    </nav>
  </div>;
}

export function Avatar({ trip, size = "md" }: { trip: Pick<Trip, "initials" | "color">; size?: "md" | "lg" }) {
  return <span className={cn("grid shrink-0 place-items-center rounded-full border-2 border-ink font-display font-extrabold", trip.color, size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm")}>{trip.initials}</span>;
}

const notifIcons: Record<NotifIcon, typeof Bell> = { booking: Ticket, flash: Zap, wallet: WalletCards, route: Car };

const themeCycle: Theme[] = ["ensa", "tanger", "nuit"];
const themeLabel: Record<Theme, string> = { tanger: "Tanger", ensa: "ENSA", nuit: "Nuit" };

export function ThemeToggle() {
  const s = useStore();
  const next = themeCycle[(themeCycle.indexOf(s.theme) + 1) % themeCycle.length] ?? "ensa";
  const Icon = s.theme === "nuit" ? Moon : Palette;
  return <button
    aria-label={`Thème ${themeLabel[s.theme]} : passer à ${themeLabel[next]}`}
    title={`Thème ${themeLabel[s.theme]} — cliquer pour ${themeLabel[next]}`}
    onClick={() => setStore(() => ({ theme: next }))}
    className="relative grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-card">
    <Icon size={17} />
    {s.theme !== "ensa" && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-ink bg-accent" />}
  </button>;
}

export function NotificationsBell() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const unread = s.notifsRead ? 0 : notifications.length;
  return <div ref={box} className="relative">
    <button aria-label={unread ? `Notifications, ${unread} non lues` : "Notifications"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-card"><Bell size={17} />{unread > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink bg-accent px-1 font-mono text-[10px] font-bold text-accent-foreground">{unread}</span>}</button>
    {open && <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border-2 border-ink bg-card p-2 hard-sm">
      <div className="flex items-center justify-between px-2 py-1.5"><p className="font-display text-base font-extrabold">Notifications</p><button onClick={() => setStore(() => ({ notifsRead: true }))} disabled={s.notifsRead} className="font-mono text-[10px] font-bold uppercase text-primary underline disabled:no-underline disabled:opacity-50">{s.notifsRead ? "Tout est lu" : "Tout marquer comme lu"}</button></div>
      <div className="grid gap-1">{notifications.map((n) => { const Icon = notifIcons[n.icon]; return <div key={n.id} className="flex items-start gap-2.5 rounded-md p-2 hover:bg-background"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-primary-soft"><Icon size={14} /></span><div className="min-w-0"><p className="text-sm font-bold">{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p><p className="mt-0.5 font-mono text-[10px] uppercase text-muted-foreground">{n.time}</p></div></div>; })}</div>
    </div>}
  </div>;
}
export function SeatDots({ trip }: { trip: Trip }) {
  return <span className="flex gap-1" aria-label={`${trip.total - trip.seats}/${trip.total} places prises`}>{Array.from({ length: trip.total ?? trip.seats ?? 0 }, (_, i) =>
    <span key={i} className={cn("h-3 w-3 rounded-full border-[1.5px] border-ink", i < trip.total - trip.seats ? "bg-ink" : "bg-card")} />)}</span>;
}

export function TripCard({ trip, favorite, onToggleFavorite }: { trip: Trip; favorite?: boolean; onToggleFavorite?: () => void }) {
  const full = trip.seats === 0;
  const toEnsa = trip.slot === "Matin";
  return <div className="relative">
    <Link to="/ride/$rideId" params={{ rideId: trip.id }} className={cn("press group relative grid grid-cols-[minmax(0,1fr)_auto] rounded-lg border-2 border-ink bg-card hard-sm", full && "opacity-60")}>
      <div className={cn("p-4", onToggleFavorite && "pr-10")}>
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag>{trip.vehicle === "Moto" ? <Bike size={11} /> : <Car size={11} />}{trip.vehicle}</Tag>
          <Tag>{trip.date}</Tag>
          {trip.lastMinute && <Tag className="bg-accent text-accent-foreground"><Zap size={11} />Place libre maintenant</Tag>}
          {trip.recurring && <Tag><Repeat size={11} />Récurrent</Tag>}
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-4xl font-extrabold tracking-tight">{trip.time}</span>
          <span className="min-w-0 truncate text-sm font-semibold">{toEnsa ? trip.from : "ENSA"} <span className="text-primary">→</span> {toEnsa ? "ENSA" : trip.from}</span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{trip.pickups?.length ?? 1} pickup{(trip.pickups?.length ?? 1) > 1 ? "s" : ""} · arrivée {trip.arrival}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar trip={trip} />
          <div className="min-w-0"><p className="truncate text-sm font-bold">{trip.driver}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">{trip.status} · {trip.rating > 0 ? `★ ${trip.rating}` : "Nouveau"}</p></div>
        </div>
      </div>
      <div className="relative flex w-24 flex-col items-center justify-between py-4 pl-1 sm:w-28">
        <span className="perforated absolute inset-y-3 left-0 w-[2px]" />
        <SeatDots trip={trip} />
        <span className="text-center"><span className="block font-display text-4xl font-extrabold leading-none">5</span><span className="font-mono text-[10px] font-bold">DH</span></span>
        <span className="font-mono text-[10px] font-bold uppercase">{full ? "Complet" : `${trip.seats} libre${trip.seats > 1 ? "s" : ""}`}</span>
      </div>
    </Link>
    {onToggleFavorite && <button type="button" onClick={onToggleFavorite} aria-pressed={!!favorite} aria-label={favorite ? `Retirer ${trip.driver} des favoris` : `Ajouter ${trip.driver} aux favoris`}
      className="absolute right-[6.4rem] top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-card sm:right-[7.4rem]"><Heart size={15} className={cn(favorite && "fill-destructive text-destructive")} /></button>}
  </div>;
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button aria-pressed={on} onClick={onClick} className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-3.5 text-xs font-bold", on ? "bg-ink text-ink-foreground" : "bg-card")}>{children}</button>;
}

export function Dashboard() {
  const s = useStore();
  const id = useIdentity();
  const [area, setArea] = useState("Tous");
  const [slot, setSlot] = useState<"Matin" | "Soir">("Matin");
  const [veh, setVeh] = useState<"Tous" | "Voiture" | "Moto">("Tous");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TripSort>("heure");
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const { session } = useAuth();
  const { data: dbTrips } = useTrips(!!session);
  const demo = useMemo(() => visibleDemoTrips(s), [s]);
  const source = session && dbTrips?.length ? dbTrips.filter((t) => !s.blocked.includes(t.driver)) : demo;
  const list = useMemo(() => sortTrips(source.filter((t) =>
    (area === "Tous" || t.from === area) && t.slot === slot && (veh === "Tous" || t.vehicle === veh)
    && (!onlyFree || t.seats > 0) && (!onlyFav || s.favorites.includes(t.id)) && matchesQuery(t, query)), sort),
  [source, area, slot, veh, onlyFree, onlyFav, query, sort, s.favorites]);
  const now = source.filter((t) => t.lastMinute && t.seats > 0);
  const driver = s.role === "conducteur";
  const filtered = area !== "Tous" || veh !== "Tous" || onlyFree || onlyFav || query.trim() !== "";
  const toggleFav = (t: Trip) => setStore((x) => ({ favorites: x.favorites.includes(t.id) ? x.favorites.filter((f) => f !== t.id) : [...x.favorites, t.id] }));
  const resetFilters = () => { setArea("Tous"); setVeh("Tous"); setOnlyFree(false); setOnlyFav(false); setQuery(""); };

  return <AppShell>
    <section className="reveal grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-end">
      <div>
        <p className="font-mono text-xs font-bold uppercase text-muted-foreground">Salam {id.name.split(" ")[0]} · {driver ? "mode conducteur" : "mode passager"}</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold leading-[.92] tracking-tight sm:text-6xl">{driver ? <>Ta voiture,<br /><span className="text-primary">leur raccourci.</span></> : <>Debout 7h,<br /><span className="text-primary">pas 6h.</span></>}</h1>
      </div>
      <div role="group" aria-label="Mode" className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card p-1.5 hard-sm">
        {(["passager", "conducteur"] as const).map((r) => <button key={r} aria-pressed={s.role === r} onClick={() => setStore(() => ({ role: r }))} className={cn("flex-1 rounded-lg py-3 text-sm font-bold transition", s.role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{r === "passager" ? "Je cherche" : "Je conduis"}</button>)}
      </div>
    </section>

    <nav aria-label="Raccourcis" className="mt-5 flex flex-wrap gap-2">
      {[{ to: "/requests", label: "Demandes", Icon: Megaphone }, { to: "/groups", label: "Groupes et cotisation", Icon: Fuel }, ...(driver ? [{ to: "/driver", label: "Tableau conducteur", Icon: Gauge }] : [])].map(({ to, label, Icon }) => <Link key={to} to={to} className="press inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink bg-card px-3.5 text-xs font-bold hard-sm"><Icon size={13} />{label}</Link>)}
    </nav>

    {driver ? <OfferRide /> : <>
      <div className="mt-6 flex items-center gap-3 overflow-hidden rounded-lg border-2 border-ink bg-accent px-4 py-3 text-accent-foreground">
        <Moon size={18} className="shrink-0" />
        <p className="text-sm font-semibold"><b>Réserve la veille</b> avant 22h : ton conducteur sait qui prendre et toi à quelle heure te lever.</p>
      </div>

      {now.length > 0 && <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Last minute</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{now.map((t) =>
          <Link key={t.id} to="/ride/$rideId" params={{ rideId: t.id }} className="press flex min-w-64 items-center gap-3 rounded-lg border-2 border-ink bg-ink p-3 text-ink-foreground hard-sm">
            <Avatar trip={t} /><div className="min-w-0 flex-1"><p className="font-display text-xl font-extrabold">{t.time} · {t.from}</p><p className="font-mono text-[10px] uppercase text-ink-muted">{t.seats} place · part dans 20 min</p></div><ArrowUpRight size={18} />
          </Link>)}
        </div>
      </section>}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">Départs {slot === "Matin" ? "vers l’ENSA" : "depuis l’ENSA"}</h2>
          <span aria-live="polite" className="font-mono text-xs font-bold text-muted-foreground">{list.length} trajet{list.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="relative min-w-52 flex-1"><span className="sr-only">Rechercher un conducteur, un quartier ou un pickup</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Conducteur, quartier, pickup…" className={cn(inputClass, "h-10 rounded-full pl-9")} /></label>
          <label className="sr-only" htmlFor="tri">Trier</label>
          <select id="tri" value={sort} onChange={(e) => setSort(e.target.value as TripSort)} className="h-10 shrink-0 rounded-full border-2 border-ink bg-card px-3 text-xs font-bold">
            <option value="heure">Tri : heure</option><option value="places">Tri : places libres</option><option value="note">Tri : meilleure note</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          <Chip on={slot === "Matin"} onClick={() => setSlot("Matin")}><Sun size={13} />Matin 7h30</Chip>
          <Chip on={slot === "Soir"} onClick={() => setSlot("Soir")}><Moon size={13} />Soir 17h</Chip>
          <span className="mx-1 w-0.5 shrink-0 bg-ink" />
          {(["Tous", "Voiture", "Moto"] as const).map((v) => <Chip key={v} on={veh === v} onClick={() => setVeh(v)}>{v}</Chip>)}
          <Chip on={onlyFree} onClick={() => setOnlyFree((x) => !x)}><Check size={13} />Places libres</Chip>
          <Chip on={onlyFav} onClick={() => setOnlyFav((x) => !x)}><Heart size={13} />Favoris{s.favorites.length > 0 && ` (${s.favorites.length})`}</Chip>
          <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Quartier" className="h-9 shrink-0 rounded-full border-2 border-ink bg-card px-3 text-xs font-bold">
            <option>Tous</option>{neighborhoods.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((t, i) => <div key={t.id} className="reveal" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}><TripCard trip={t} favorite={s.favorites.includes(t.id)} onToggleFavorite={() => toggleFav(t)} /></div>)}
          {!list.length && <EmptyState icon={<Compass />} title="Personne ne passe par là… encore." body="Essaie un autre quartier, un autre créneau ou retire des filtres.">
            {filtered && <Button variant="accent" className="mt-4" onClick={resetFilters}>Tout afficher</Button>}
          </EmptyState>}
        </div>
      </section>
    </>}
  </AppShell>;
}

function OfferRide() {
  const s = useStore();
  const { session } = useAuth();
  const id = useIdentity();
  const qc = useQueryClient();
  const [done, setDone] = useState<Trip | null>(null);
  const [from, setFrom] = useState<string>(neighborhoods[0]);
  const [date, setDate] = useState(tomorrowISO);
  const [slot, setSlot] = useState<"Matin" | "Soir">("Matin");
  const [time, setTime] = useState("07:30");
  const [vehicle, setVehicle] = useState<"Voiture" | "Moto">("Voiture");
  const [seats, setSeats] = useState(3);
  const [car, setCar] = useState("");
  const [plate, setPlate] = useState("");
  const [stops, setStops] = useState(["Rond-point Marjane"]);
  const [stop, setStop] = useState("");
  const [recurring, setRecurring] = useState(true);
  const [lastMinute, setLastMinute] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const addStop = () => { const v = stop.trim(); if (v && !stops.includes(v)) { setStops([...stops, v]); setStop(""); } };
  const pickSlot = (v: "Matin" | "Soir") => { setSlot(v); setTime(v === "Matin" ? "07:30" : "17:00"); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!stops.length) { setErr("Ajoute au moins un pickup sur ta route."); return; }
    const arrival = addMinutes(time, vehicle === "Moto" ? 20 : 27);
    const userId = session?.user.id;
    if (userId) {
      setBusy(true);
      try {
        await publishTrip({ userId, driverName: id.name, from, pickups: stops, date, time, arrival, slot, vehicle, car, plate, ambiance: s.ambiance, seats, recurring, lastMinute });
        await qc.invalidateQueries({ queryKey: ["trips"] });
      } catch (x) {
        setErr(x instanceof Error ? x.message : String(x));
        return;
      } finally {
        setBusy(false);
      }
    }
    const trip: Trip = {
      id: `mine-${Date.now()}`, driver: id.name, initials: id.initials, status: "Conducteur · toi", rating: 0, trips: 0,
      from, pickups: stops, time, arrival, date: dateLabel(date), slot, vehicle, car: car || (vehicle === "Moto" ? "Ma moto" : "Ma voiture"), plate: plate || "—",
      seats, total: seats, preference: s.ambiance, color: "bg-avatar-4", recurring, lastMinute,
    };
    setStore((x) => ({ published: x.published + 1, myRides: session ? x.myRides : [trip, ...x.myRides] }));
    toast.success("Trajet publié", { description: `${time} · ${from} → ENSA · ${seats} place${seats > 1 ? "s" : ""}` });
    setDone(trip);
  };

  if (done) return <div className="animate-in zoom-in-95 mt-8 grid place-items-center rounded-xl border-2 border-ink bg-card p-10 text-center hard">
    <Stamp className="h-28 w-28 text-lg">Publié<br />✓</Stamp>
    <h2 className="mt-6 font-display text-3xl font-extrabold">Ton trajet est en ligne.</h2>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{done.total} place{done.total > 1 ? "s" : ""} à 5 DH. Tu gagnes {done.total * 5} DH + {done.total * 10} éco-points si c’est complet.</p>
    <div className="mt-6 flex flex-wrap justify-center gap-3"><Button variant="paper" onClick={() => setDone(null)}>Publier un autre</Button><Link to="/ride/$rideId" params={{ rideId: done.id }}><Button>Voir mon trajet</Button></Link></div>
  </div>;

  return <>
    <form onSubmit={(e) => void submit(e)} className="mt-8 grid gap-6 rounded-xl border-2 border-ink bg-card p-5 hard sm:p-7 md:grid-cols-2">
      <div className="md:col-span-2 flex items-start justify-between gap-3"><div><h2 className="font-display text-3xl font-extrabold">Proposer un trajet</h2><p className="text-sm text-muted-foreground">Ouvert aux étudiants, profs et personnel vérifiés. {s.published > 0 && `${s.published} publié(s) aujourd’hui.`}</p></div><Stamp className="h-16 w-16 shrink-0 text-xl">5DH</Stamp></div>
      <Field label="Créneau"><div className="grid grid-cols-2 gap-2">{(["Matin", "Soir"] as const).map((v) => <button key={v} type="button" aria-pressed={slot === v} onClick={() => pickSlot(v)} className={cn("flex h-12 items-center justify-center gap-2 rounded-md border-2 border-ink text-sm font-bold", slot === v ? "bg-primary text-primary-foreground" : "bg-background")}>{v === "Matin" ? <Sun size={16} /> : <Moon size={16} />}{v === "Matin" ? "Aller · vers l’ENSA" : "Retour · depuis l’ENSA"}</button>)}</div></Field>
      <Field label={slot === "Matin" ? "Quartier de départ" : "Quartier d’arrivée"}><select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>{neighborhoods.map((n) => <option key={n}>{n}</option>)}</select></Field>
      <Field label="Jour"><input type="date" required min={isoDate(new Date())} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></Field>
      <Field label="Heure de départ"><input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} /></Field>
      <Field label="Véhicule"><div className="grid grid-cols-2 gap-2">{(["Voiture", "Moto"] as const).map((v) => <label key={v} className="flex h-12 items-center justify-center gap-2 rounded-md border-2 border-ink bg-background text-sm font-bold has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2"><input type="radio" name="v" checked={vehicle === v} className="sr-only" onChange={() => { setVehicle(v); setSeats(v === "Moto" ? 1 : 3); }} />{v === "Moto" ? <Bike size={16} /> : <Car size={16} />}{v}</label>)}</div></Field>
      <Field label={`Places : ${seats}`}><input type="range" min={1} max={vehicle === "Moto" ? 1 : 4} value={seats} onChange={(e) => setSeats(+e.target.value)} className="h-12 accent-primary" /></Field>
      <Field label="Modèle (optionnel)"><input value={car} onChange={(e) => setCar(e.target.value)} placeholder={vehicle === "Moto" ? "Yamaha NMAX noire" : "Dacia Sandero blanche"} className={inputClass} /></Field>
      <Field label="Plaque (optionnel)" hint="Visible seulement par les passagers qui réservent."><input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="45-A-2841" className={inputClass} /></Field>
      <div className="md:col-span-2">
        <Field label="Pickups sur ta route" hint="Les passagers choisiront le plus proche de chez eux.">
          <div className="flex flex-wrap gap-2">{stops.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-primary-soft px-3 py-1 text-xs font-bold"><MapPin size={12} />{p}<button type="button" aria-label={`Retirer ${p}`} onClick={() => setStops(stops.filter((x) => x !== p))}>×</button></span>)}</div>
          <div className="flex gap-2"><input value={stop} onChange={(e) => setStop(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStop(); } }} placeholder="Ex : Station Shell Boukhalef" className={inputClass} /><Button type="button" variant="ink" aria-label="Ajouter le pickup" onClick={addStop}><Plus size={16} /></Button></div>
        </Field>
      </div>
      <div className="grid gap-2 md:col-span-2 sm:grid-cols-2">
        {([["Trajet récurrent", "Lun. au ven., même horaire", Repeat, recurring, setRecurring], ["Accepter le last minute", "Notifie quand une place est libre", Clock, lastMinute, setLastMinute]] as const).map(([t, d, Icon, on, set]) =>
          <label key={t} className="flex items-center gap-3 rounded-md border-2 border-ink bg-background p-3"><Icon size={18} /><span className="flex-1"><b className="block text-sm">{t}</b><span className="text-xs text-muted-foreground">{d}</span></span><input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-5 w-5 accent-primary" /></label>)}
      </div>
      {err && <p role="alert" className="md:col-span-2 rounded-md border-2 border-ink bg-destructive-soft p-3 text-sm font-bold">{err}</p>}
      <Button type="submit" disabled={busy} className="md:col-span-2 h-14 text-base"><Check size={18} />{busy ? "Publication…" : "Publier · 5 DH la place"}</Button>
    </form>

    {!session && s.myRides.length > 0 && <section className="mt-8">
      <h2 className="font-display text-2xl font-extrabold">Mes trajets publiés</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{s.myRides.map((t) => <div key={t.id} className="grid gap-2">
        <TripCard trip={t} />
        <button onClick={() => { setStore((x) => ({ myRides: x.myRides.filter((r) => r.id !== t.id) })); toast("Trajet retiré"); }} className="inline-flex items-center gap-1.5 justify-self-end px-1 text-sm font-bold text-destructive"><Trash2 size={14} />Retirer ce trajet</button>
      </div>)}</div>
    </section>}
  </>;
}

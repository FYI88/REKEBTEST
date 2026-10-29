import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Check, Clock, Fuel, Flag, Lock, MapPin, MessageCircle, Plus, Send, Share2, ShieldAlert, Star, Users, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { driverSeed, neighborhoods, reportReasons, seedRequests, trips, type DriverPassenger, type Group, type RideRequest } from "@/lib/demo-data";
import { dateLabel, useTrip } from "@/lib/db";
import { COTISATION_GROUP_ID, allGroups, chatFor, findDemoTrip, groupMemberCount, groupShare, ledgerEntry, setStore, useStore } from "@/lib/store";
import { useAuth, useIdentity } from "@/lib/auth";
import { clockNow, etaMinutes, isoDate, pinFor, stageFor, tomorrowISO, trackStages } from "@/lib/trip-utils";
import { AppShell, Avatar, TripCard } from "@/components/prototype";
import { Button, EmptyState, Field, inputClass, Modal, Stamp, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";

function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return <div className="reveal"><h1 className="font-display text-5xl font-extrabold">{title}</h1>{sub && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{sub}</p>}</div>;
}

function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: readonly (readonly [T, string])[]; label: string }) {
  return <div role="tablist" aria-label={label} className="mt-5 inline-flex rounded-full border-2 border-ink bg-card p-1">{items.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={cn("rounded-full px-5 py-2 text-sm font-bold", value === k && "bg-ink text-ink-foreground")}>{l}</button>)}</div>;
}

/* ---------- REPORT / BLOCK ---------- */
export function ReportModal({ open, onClose, target, tripId }: { open: boolean; onClose: () => void; target: string; tripId?: string }) {
  const id = useIdentity();
  const [reason, setReason] = useState<string>(reportReasons[0]);
  const [details, setDetails] = useState("");
  const [block, setBlock] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStore((x) => ({
      reports: [{ id: `r-${Date.now()}`, target, reason, details: details.trim() || "Pas de détails.", time: `Aujourd’hui ${clockNow()}`, status: "ouvert", by: id.name, ...(tripId ? { tripId } : {}) }, ...x.reports],
      blocked: block && !x.blocked.includes(target) ? [...x.blocked, target] : x.blocked,
    }));
    toast.success("Signalement envoyé", { description: block ? `${target} est bloqué·e. L’administration examine ton signalement.` : "L’administration ENSA l’examine sous 24 h." });
    setDetails("");
    setBlock(false);
    onClose();
  };
  return <Modal open={open} onClose={onClose} title={`Signaler ${target}`}>
    <form onSubmit={submit} className="grid gap-4">
      <fieldset className="grid gap-2"><legend className="mb-1 font-mono text-[11px] font-bold uppercase">Motif</legend>
        {reportReasons.map((r) => <label key={r} className="flex items-center gap-3 rounded-md border-2 border-ink p-2.5 text-sm font-bold has-[:checked]:bg-primary-soft"><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-primary" />{r}</label>)}
      </fieldset>
      <Field label="Détails (optionnel)"><textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} maxLength={400} placeholder="Que s’est-il passé ?" className={cn(inputClass, "h-auto py-2")} /></Field>
      <label className="flex items-center gap-3 rounded-md border-2 border-ink bg-background p-3 text-sm"><input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="h-5 w-5 accent-primary" /><span><b className="block">Bloquer {target}</b><span className="text-xs text-muted-foreground">Ses trajets disparaissent de ta recherche.</span></span></label>
      <div className="flex gap-2"><Button type="button" variant="paper" className="flex-1" onClick={onClose}>Annuler</Button><Button type="submit" variant="danger" className="flex-1"><Flag size={15} />Envoyer</Button></div>
    </form>
  </Modal>;
}

/* ---------- RIDE REQUESTS ---------- */
function matchDriver(r: RideRequest) {
  return trips.find((t) => t.from === r.from && t.slot === r.slot && t.seats > 0) ?? trips.find((t) => t.slot === r.slot && t.seats > 0);
}

export function RequestsPage() {
  const s = useStore();
  const id = useIdentity();
  const [tab, setTab] = useState<"passager" | "conducteur">(s.role);
  const [from, setFrom] = useState<string>(neighborhoods[0]);
  const [slot, setSlot] = useState<"Matin" | "Soir">("Matin");
  const [time, setTime] = useState("07:30");
  const [date, setDate] = useState(tomorrowISO);
  const [note, setNote] = useState("");
  const post = (e: React.FormEvent) => {
    e.preventDefault();
    const rid = `mine-q-${Date.now()}`;
    const req: RideRequest = { id: rid, name: id.name, initials: id.initials, color: "bg-avatar-4", from, slot, time, date: dateLabel(date), note: note.trim() || "Une place suffit.", status: "ouverte", mine: true };
    setStore((x) => ({ myRequests: [req, ...x.myRequests] }));
    setNote("");
    toast.success("Demande publiée", { description: "Les conducteurs de ton quartier sont prévenus." });
    setTimeout(() => {
      const driver = matchDriver(req)?.driver ?? "Mehdi Bennis";
      setStore((x) => ({
        myRequests: x.myRequests.map((r) => (r.id === rid && r.status === "ouverte" ? { ...r, status: "acceptée", acceptedBy: driver } : r)),
        notifsRead: false,
      }));
      toast.success(`${driver} te propose une place`, { description: "Ouvre Mes demandes pour réserver le trajet." });
    }, 5000);
  };
  const cancel = (rid: string) => { setStore((x) => ({ myRequests: x.myRequests.map((r) => (r.id === rid ? { ...r, status: "annulée" } : r)) })); toast("Demande annulée"); };
  const board = seedRequests.filter((r) => !s.acceptedRequests.includes(r.id));
  const accepted = seedRequests.filter((r) => s.acceptedRequests.includes(r.id));
  const accept = (r: RideRequest) => {
    setStore((x) => ({ acceptedRequests: [...x.acceptedRequests, r.id] }));
    toast.success(`Place proposée à ${r.name.split(" ")[0]}`, { description: "Elle apparaît dans ton tableau conducteur." });
  };
  return <AppShell>
    <PageTitle title="Demandes" sub="Pas de trajet à ton heure ? Dis où et quand tu pars : les conducteurs de ton quartier te répondent. Prix toujours fixe : 5 DH." />
    <Tabs value={tab} onChange={setTab} label="Mode" items={[["passager", "Je cherche une place"], ["conducteur", "Je conduis"]]} />
    {tab === "passager" ? <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={post} className="grid content-start gap-4 rounded-xl border-2 border-ink bg-card p-5 hard-sm">
        <h2 className="font-display text-2xl font-extrabold">Poster une demande</h2>
        <div role="group" aria-label="Créneau" className="grid grid-cols-2 gap-2">{(["Matin", "Soir"] as const).map((v) => <button key={v} type="button" aria-pressed={slot === v} onClick={() => { setSlot(v); setTime(v === "Matin" ? "07:30" : "17:00"); }} className={cn("h-11 rounded-md border-2 border-ink text-sm font-bold", slot === v ? "bg-primary text-primary-foreground" : "bg-background")}>{v === "Matin" ? "Vers l’ENSA" : "Depuis l’ENSA"}</button>)}</div>
        <Field label="Quartier"><select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>{neighborhoods.map((n) => <option key={n}>{n}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Jour"><input type="date" required value={date} min={isoDate(new Date())} onChange={(e) => setDate(e.target.value)} className={inputClass} /></Field><Field label="Heure"><input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} /></Field></div>
        <Field label="Précision (optionnel)"><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder="Ex : un sac, même pickup que d’habitude" className={inputClass} /></Field>
        <Button type="submit" className="h-14"><Plus size={18} />Publier ma demande</Button>
      </form>
      <section>
        <h2 className="font-display text-2xl font-extrabold">Mes demandes</h2>
        <div className="mt-3 grid gap-3">
          {s.myRequests.map((r) => { const m = matchDriver(r); return <div key={r.id} className="rounded-lg border-2 border-ink bg-card p-4 hard-sm">
            <div className="flex flex-wrap items-center gap-2"><Tag>{r.date}</Tag><Tag>{r.time}</Tag><Tag className={cn(r.status === "acceptée" && "bg-success-soft", r.status === "annulée" && "bg-muted")}>{r.status}</Tag></div>
            <p className="mt-2 font-display text-xl font-extrabold">{r.slot === "Matin" ? `${r.from} → ENSA` : `ENSA → ${r.from}`}</p>
            <p className="text-sm text-muted-foreground">{r.note}</p>
            {r.status === "ouverte" && <div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 font-mono text-[11px] uppercase text-muted-foreground"><Clock size={12} className="live-dot" />En attente d’un conducteur…</span><button onClick={() => cancel(r.id)} className="text-sm font-bold text-destructive">Annuler</button></div>}
            {r.status === "acceptée" && <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-sm font-bold"><BadgeCheck size={16} className="text-primary" />{r.acceptedBy} te propose une place</span>{m && <Link to="/ride/$rideId" params={{ rideId: m.id }}><Button className="h-9 px-4">Voir le trajet</Button></Link>}</div>}
          </div>; })}
          {s.myRequests.length === 0 && <EmptyState icon={<MessageCircle />} title="Aucune demande." body="Publie ta première demande : un conducteur peut te répondre en quelques minutes." />}
        </div>
      </section>
    </div> : <div className="mt-6 grid gap-6">
      <section>
        <h2 className="font-display text-2xl font-extrabold">Passagers qui cherchent une place</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {board.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-ink bg-card p-4 hard-sm">
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-sm font-extrabold", r.color)}>{r.initials}</span>
            <div className="min-w-0 flex-1"><p className="font-bold">{r.name}</p><p className="font-mono text-[11px] uppercase text-muted-foreground">{r.date} · {r.time} · {r.slot === "Matin" ? `${r.from} → ENSA` : `ENSA → ${r.from}`}</p><p className="mt-1 text-sm text-muted-foreground">{r.note}</p></div>
            <Button className="h-9 px-4" onClick={() => accept(r)}><Check size={15} />Proposer une place</Button>
          </div>)}
          {board.length === 0 && <EmptyState title="Plus aucune demande ouverte." body="Reviens plus tard, de nouveaux passagers publient chaque jour." />}
        </div>
      </section>
      {accepted.length > 0 && <section>
        <h2 className="font-display text-xl font-extrabold">Places proposées</h2>
        <div className="mt-3 flex flex-wrap gap-2">{accepted.map((r) => <Tag key={r.id} className="bg-success-soft"><Check size={11} />{r.name} · {r.time}</Tag>)}</div>
        <Link to="/driver" className="mt-3 inline-block text-sm font-bold text-primary underline">Voir mon tableau conducteur</Link>
      </section>}
    </div>}
  </AppShell>;
}

/* ---------- GROUPS / FUEL POOL ---------- */
function GroupChat({ gid, disabled }: { gid: string; disabled: boolean }) {
  const s = useStore();
  const id = useIdentity();
  const key = `group:${gid}`;
  const [txt, setTxt] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const msgs = chatFor(s, key);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs.length]);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = txt.trim();
    if (!text) return;
    setStore((x) => ({ chats: { ...x.chats, [key]: [...chatFor(x, key), { from: "me", text, time: clockNow() }] } }));
    setTxt("");
  };
  if (disabled) return <p className="mt-3 flex items-center gap-2 rounded-md border-2 border-dashed border-ink p-3 text-sm text-muted-foreground"><Lock size={14} />Rejoins le groupe pour lire et écrire dans le chat.</p>;
  return <div className="mt-3 overflow-hidden rounded-lg border-2 border-ink">
    <div role="log" aria-live="polite" className="grid max-h-56 min-h-24 content-start gap-2 overflow-y-auto bg-background p-3">
      {msgs.length === 0 && <p className="m-auto text-center text-sm text-muted-foreground">Aucun message. Dis bonjour au groupe.</p>}
      {msgs.map((m, i) => <div key={i} className={cn("max-w-[85%] rounded-lg border-2 border-ink px-3 py-1.5 text-sm", m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-card")}>{m.from === "me" && <span className="block font-mono text-[9px] uppercase opacity-70">{id.name.split(" ")[0]}</span>}{m.text}<span className="block font-mono text-[9px] opacity-70">{m.time}</span></div>)}
      <div ref={end} />
    </div>
    <form onSubmit={send} className="flex gap-2 border-t-2 border-ink p-2"><input value={txt} onChange={(e) => setTxt(e.target.value)} aria-label="Message au groupe" className={cn(inputClass, "h-10")} placeholder="Message au groupe…" /><Button aria-label="Envoyer" className="h-10 px-3"><Send size={15} /></Button></form>
  </div>;
}

function GroupCard({ g }: { g: Group }) {
  const s = useStore();
  const [chat, setChat] = useState(false);
  const joined = s.joinedGroups.includes(g.id);
  const count = groupMemberCount(g, s.joinedGroups);
  const full = count >= g.maxMembers && !joined;
  const share = groupShare({ ...g, members: joined ? g.members : [...g.members, { name: "Toi", initials: "TO" }] }, s.joinedGroups.filter((x) => x !== g.id));
  const join = () => {
    if (s.balance < share) { toast.error("Solde insuffisant", { description: `Il faut ${share} DH pour rejoindre ce groupe.` }); return; }
    setStore((x) => ({
      joinedGroups: [...x.joinedGroups, g.id],
      balance: x.balance - share,
      cotisation: g.id === COTISATION_GROUP_ID ? true : x.cotisation,
      ledger: [ledgerEntry(`Cotisation essence · ${g.name}`, -share, "cotisation"), ...x.ledger],
    }));
    toast.success(`Bienvenue dans ${g.name}`, { description: `${share} DH débités pour cette semaine.` });
  };
  const leave = () => {
    setStore((x) => ({ joinedGroups: x.joinedGroups.filter((i) => i !== g.id), cotisation: g.id === COTISATION_GROUP_ID ? false : x.cotisation }));
    toast("Groupe quitté");
  };
  const fill = Math.min(100, Math.round((count / g.maxMembers) * 100));
  return <article className="rounded-xl border-2 border-ink bg-card p-5 hard-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h3 className="font-display text-2xl font-extrabold">{g.name}</h3><p className="font-mono text-[11px] uppercase text-muted-foreground">{g.slot === "Matin" ? `${g.from} → ENSA` : `ENSA → ${g.from}`} · {g.time} · {g.driver}</p></div>
      {joined && <Tag className="bg-success-soft"><Check size={11} />Membre</Tag>}
    </div>
    <div className="mt-4 flex items-center gap-2">
      <div className="flex -space-x-2">{g.members.map((m) => <span key={m.name} title={m.name} className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-avatar-1 font-display text-xs font-extrabold">{m.initials}</span>)}{joined && <span title="Toi" className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-accent font-display text-xs font-extrabold text-accent-foreground">Toi</span>}</div>
      <span className="text-sm text-muted-foreground">{count}/{g.maxMembers} places</span>
    </div>
    <div className="mt-3 h-2.5 overflow-hidden rounded-full border-2 border-ink" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fill} aria-label="Remplissage du groupe"><div className="h-full bg-primary" style={{ width: `${fill}%` }} /></div>
    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border-2 border-ink bg-ink text-sm">
      <div className="bg-card p-2.5"><dt className="font-mono text-[10px] uppercase text-muted-foreground">Plein de la semaine</dt><dd className="font-bold">{g.weeklyFuel} DH</dd></div>
      <div className="bg-card p-2.5"><dt className="font-mono text-[10px] uppercase text-muted-foreground">Ta part</dt><dd className="font-bold">{share} DH / semaine</dd></div>
    </dl>
    <div className="mt-4 flex flex-wrap gap-2">
      {joined ? <Button variant="paper" className="h-10" onClick={leave}>Quitter</Button> : <Button className="h-10" disabled={full} onClick={join}><Fuel size={15} />{full ? "Complet" : `Rejoindre · ${share} DH`}</Button>}
      <Button variant="ink" className="h-10" onClick={() => setChat((c) => !c)} aria-expanded={chat}><MessageCircle size={15} />Chat du groupe</Button>
    </div>
    {chat && <GroupChat gid={g.id} disabled={!joined && !g.mine} />}
  </article>;
}

export function GroupsPage() {
  const s = useStore();
  const id = useIdentity();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [from, setFrom] = useState<string>(neighborhoods[0]);
  const [slot, setSlot] = useState<"Matin" | "Soir">("Matin");
  const [time, setTime] = useState("07:30");
  const [fuel, setFuel] = useState(150);
  const [max, setMax] = useState(4);
  const groups = allGroups(s);
  const mineJoined = groups.filter((g) => s.joinedGroups.includes(g.id));
  const weekly = mineJoined.reduce((a, g) => a + groupShare({ ...g, members: g.members }, s.joinedGroups.filter((x) => x !== g.id)), 0);
  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Group = { id: `mine-g-${Date.now()}`, name: name.trim() || `Groupe de ${id.name.split(" ")[0]}`, from, slot, time, driver: id.name, weeklyFuel: fuel, maxMembers: max, members: [], mine: true };
    setStore((x) => ({ myGroups: [g, ...x.myGroups] }));
    toast.success("Groupe créé", { description: "Partage-le avec ceux qui font la même route." });
    setOpen(false);
    setName("");
  };
  return <AppShell>
    <div className="flex flex-wrap items-end justify-between gap-3"><PageTitle title="Groupes" sub="Roule toujours avec les mêmes personnes et partage le plein de la semaine. Moins cher qu’à la place, et chacun connaît son équipe." /><Button onClick={() => setOpen(true)}><Plus size={16} />Créer un groupe</Button></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">{[[Users, String(mineJoined.length), "groupes rejoints"], [Wallet, `${weekly} DH`, "cotisation / semaine"], [Fuel, `${groups.length}`, "groupes ouverts"]].map(([I, n, l]) => { const Icon = I as typeof Users; return <div key={l as string} className="rounded-lg border-2 border-ink bg-card p-4 hard-sm"><Icon size={18} className="text-primary" /><p className="mt-1 font-display text-3xl font-extrabold">{n as string}</p><p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">{l as string}</p></div>; })}</div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">{groups.map((g) => <GroupCard key={g.id} g={g} />)}</div>
    <Modal open={open} onClose={() => setOpen(false)} title="Créer un groupe">
      <form onSubmit={create} className="grid gap-4">
        <Field label="Nom du groupe"><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={`Groupe de ${id.name.split(" ")[0]}`} className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Quartier"><select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>{neighborhoods.map((n) => <option key={n}>{n}</option>)}</select></Field><Field label="Créneau"><select value={slot} onChange={(e) => { const v = e.target.value as "Matin" | "Soir"; setSlot(v); setTime(v === "Matin" ? "07:30" : "17:00"); }} className={inputClass}><option value="Matin">Matin</option><option value="Soir">Soir</option></select></Field></div>
        <Field label="Heure de départ"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} /></Field>
        <Field label={`Plein de la semaine : ${fuel} DH`}><input type="range" min={50} max={400} step={10} value={fuel} onChange={(e) => setFuel(+e.target.value)} className="h-10 accent-primary" /></Field>
        <Field label={`Places max : ${max}`}><input type="range" min={2} max={4} value={max} onChange={(e) => setMax(+e.target.value)} className="h-10 accent-primary" /></Field>
        <Button type="submit" className="h-12">Créer le groupe</Button>
      </form>
    </Modal>
  </AppShell>;
}

/* ---------- LIVE TRACKING ---------- */
export function TrackPage() {
  const { tripId } = useParams({ strict: false }) as { tripId?: string };
  const { session } = useAuth();
  const s = useStore();
  const detail = useTrip(tripId ?? "", !!session && !!tripId);
  const t = session ? detail.data?.trip : findDemoTrip(s, tripId);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sos, setSos] = useState(false);
  const [report, setReport] = useState(false);
  const path = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: 40, y: 180 });
  const stage = stageFor(progress);
  const last = useRef(stage.key);
  useEffect(() => {
    if (paused || progress >= 100) return;
    const i = setInterval(() => setProgress((p) => Math.min(100, p + 100 / 90)), 1000);
    return () => clearInterval(i);
  }, [paused, progress]);
  useEffect(() => {
    if (stage.key !== last.current) { last.current = stage.key; toast(stage.label, { duration: 3000 }); }
  }, [stage.key, stage.label]);
  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const p = el.getPointAtLength((progress / 100) * el.getTotalLength());
    setPt({ x: p.x, y: p.y });
  }, [progress]);
  if (session && detail.isLoading) return <AppShell><p className="font-mono text-xs uppercase text-muted-foreground">Chargement…</p></AppShell>;
  if (!t || !tripId) return <AppShell><div className="grid"><EmptyState title="Trajet introuvable."><Link to="/trips"><Button className="mt-4">Mes billets</Button></Link></EmptyState></div></AppShell>;
  const pin = pinFor(`me:${t.id}`);
  const eta = etaMinutes(progress);
  const share = async () => {
    const url = `${window.location.origin}/ride/${t.id}`;
    try {
      if (typeof navigator.share === "function") await navigator.share({ title: "Suis mon trajet Rkeb", url });
      else { await navigator.clipboard.writeText(url); toast.success("Lien de suivi copié"); }
    } catch {
      // partage annulé
    }
  };
  return <AppShell>
    <Link to="/trips" className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase"><ArrowLeft size={14} />Mes billets</Link>
    <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-4">
        <div className="rounded-xl border-2 border-ink bg-ink p-5 text-ink-foreground hard">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-ink-muted"><span className="live-dot h-2.5 w-2.5 rounded-full bg-destructive" />Suivi en direct · simulation</p>
          <p className="mt-2 font-display text-3xl font-extrabold leading-tight">{stage.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="font-display text-7xl font-extrabold tabular-nums">{stage.key === "route" || stage.key === "near" ? eta : stage.key === "arrived" ? 0 : ""}{(stage.key === "route" || stage.key === "near" || stage.key === "arrived") && <span className="text-2xl text-accent"> min</span>}</p>
            <p className="pb-2 font-mono text-xs text-ink-muted">{t.slot === "Matin" ? `${t.from} → ENSA` : `ENSA → ${t.from}`} · {t.time}</p>
          </div>
        </div>
        <div className="relative h-60 overflow-hidden rounded-lg border-2 border-ink bg-primary-soft">
          <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 160 Q120 120 200 150 T400 110" stroke="currentColor" className="text-card" strokeWidth="22" fill="none" />
            <path d="M60 0 L110 220 M290 0 L250 220" stroke="currentColor" className="text-card" strokeWidth="12" />
            <path ref={path} d="M40 180 C110 150 140 70 220 90 S330 60 360 40" stroke="currentColor" className="text-ink" strokeWidth="4" strokeDasharray="10 7" fill="none" />
            <circle cx="40" cy="180" r="7" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
            <circle cx={pt.x} cy={pt.y} r="10" fill="var(--accent)" stroke="var(--ink)" strokeWidth="3" />
          </svg>
          <span className="absolute right-[8%] top-[10%] rounded-md border-2 border-ink bg-accent px-2 py-1 font-mono text-[10px] font-bold text-accent-foreground">ENSA</span>
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm border-[1.5px] border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold"><MapPin size={11} />Pickup · {t.pickups[0] ?? t.from}</span>
        </div>
        <div>
          <div className="h-3 overflow-hidden rounded-full border-2 border-ink" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progression du trajet"><div className="h-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} /></div>
          <ol className="mt-2 grid grid-cols-5 gap-1 font-mono text-[9px] uppercase text-muted-foreground">{trackStages.map((st) => <li key={st.key} className={cn("text-center", progress >= st.from && "font-bold text-foreground")}>{st.key === "route" ? "Départ" : st.key === "near" ? "Proche" : st.key === "arrived" ? "Pickup" : st.key === "onboard" ? "À bord" : "ENSA"}</li>)}</ol>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="paper" onClick={() => setPaused((p) => !p)}>{paused ? "Reprendre" : "Pause"}</Button>
          <Button variant="paper" onClick={() => { setProgress(0); setPaused(false); }}>Rejouer</Button>
          <Button variant="paper" onClick={() => setProgress((p) => Math.min(100, p + 20))}>Avancer</Button>
        </div>
      </div>
      <aside className="grid content-start gap-4">
        <div className="relative rounded-lg border-2 border-ink bg-card p-5 hard-sm">
          <p className="font-mono text-[11px] font-bold uppercase text-muted-foreground">Code de montée</p>
          <p className="mt-1 font-mono text-5xl font-bold tracking-[.25em]">{pin}</p>
          <p className="mt-2 text-sm text-muted-foreground">Donne ce code au conducteur seulement quand tu as vérifié la plaque. Il valide ta place.</p>
          <Stamp className="absolute -right-3 -top-4 h-16 w-16 text-xs">Sécurité</Stamp>
        </div>
        <div className="rounded-lg border-2 border-ink bg-card p-5 hard-sm">
          <div className="flex items-center gap-3"><Avatar trip={t} size="lg" /><div><p className="flex items-center gap-1 font-display text-xl font-extrabold">{t.driver}<BadgeCheck size={18} className="text-primary" /></p><p className="flex items-center gap-1 font-mono text-[11px] uppercase text-muted-foreground"><Star size={11} className="fill-accent" />{t.rating > 0 ? t.rating : "Nouveau"} · {t.car || "Véhicule"}</p></div></div>
          <p className="mt-4 font-mono text-[11px] font-bold uppercase text-muted-foreground">Plaque à vérifier</p>
          <p className="rounded-md border-2 border-ink bg-accent py-2 text-center font-mono text-2xl font-bold text-accent-foreground">{t.plate || "—"}</p>
          <Link to="/chat/$tripId" params={{ tripId: t.id }} className="mt-3 flex items-center justify-center gap-2 rounded-md border-2 border-ink py-2.5 text-sm font-bold"><MessageCircle size={16} />Écrire au conducteur</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setSos(true)} className="press flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-destructive py-4 font-bold text-primary-foreground hard-sm"><ShieldAlert size={18} />SOS</button>
          <button onClick={() => void share()} className="press flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-card py-4 font-bold hard-sm"><Share2 size={18} />Partager</button>
        </div>
        <button onClick={() => setReport(true)} className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-muted-foreground underline"><Flag size={14} />Signaler un problème</button>
      </aside>
    </div>
    <Modal open={sos} onClose={() => setSos(false)} title="Alerte SOS">
      <p className="text-sm">Ta position live sera envoyée à ton contact d’urgence et à l’administration ENSA.</p>
      <div className="mt-4 grid gap-2"><Button variant="danger" onClick={() => { setSos(false); toast.error("Alerte envoyée", { description: "Ton contact d’urgence et l’administration ont reçu ta position (simulation)." }); }}><ShieldAlert size={16} />Alerter maintenant</Button><Button variant="paper" onClick={() => setSos(false)}>Annuler</Button></div>
    </Modal>
    <ReportModal open={report} onClose={() => setReport(false)} target={t.driver} tripId={t.id} />
  </AppShell>;
}

/* ---------- DRIVER DASHBOARD ---------- */
export function DriverPage() {
  const s = useStore();
  const nav = useNavigate();
  const [pinFor_, setPinFor] = useState<DriverPassenger | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const passengers: DriverPassenger[] = useMemo(() => [
    ...driverSeed.passengers,
    ...seedRequests.filter((r) => s.acceptedRequests.includes(r.id)).map((r) => ({ key: `rq-${r.id}`, name: r.name, initials: r.initials, pickup: `Pickup ${r.from}`, color: r.color })),
  ], [s.acceptedRequests]);
  const boarded = passengers.filter((p) => s.boarded.includes(p.key));
  const extraBoarded = s.boarded.length;
  const earned = driverSeed.monthBase + extraBoarded * 5;
  const week = driverSeed.weekly.map((d, i) => (i === 4 ? { ...d, gain: d.gain + extraBoarded * 5 } : d));
  const validate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinFor_) return;
    if (code !== pinFor(pinFor_.key)) { setErr("Code incorrect. Demande au passager de te le montrer à nouveau."); return; }
    setStore((x) => ({
      boarded: [...x.boarded, pinFor_.key],
      balance: x.balance + 5,
      points: x.points + 10,
      ledger: [ledgerEntry(`Passager à bord : ${pinFor_.name}`, 5, "gain"), ...x.ledger],
    }));
    toast.success(`${pinFor_.name.split(" ")[0]} est à bord`, { description: "+5 DH et +10 éco-points crédités." });
    setPinFor(null);
    setCode("");
    setErr(null);
  };
  const up = driverSeed.upcoming;
  return <AppShell>
    <div className="flex flex-wrap items-end justify-between gap-3"><PageTitle title="Tableau conducteur" sub="Tes gains, tes passagers et la validation de montée. 0 % de commission : 5 DH par place, pour toi." /><Button onClick={() => { setStore(() => ({ role: "conducteur" })); nav({ to: "/app" }); }}><Plus size={16} />Publier un trajet</Button></div>
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Gagné ce mois", `${earned} DH`], ["Passagers aidés", String(9 + extraBoarded)], ["Trajets publiés", String(14 + s.published)], ["Éco-points", String(s.points)]].map(([l, n]) => <div key={l} className="rounded-lg border-2 border-ink bg-card p-4 hard-sm"><p className="font-display text-4xl font-extrabold">{n}</p><p className="font-mono text-[10px] uppercase">{l}</p></div>)}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section>
        <h2 className="font-display text-2xl font-extrabold">Prochain trajet</h2>
        <div className="mt-3 rounded-xl border-2 border-ink bg-card p-5 hard-sm">
          <div className="flex flex-wrap items-center gap-2"><Tag>{up.date}</Tag><Tag>{up.vehicle}</Tag><Tag className="bg-accent text-accent-foreground">{passengers.length}/{up.seats} places</Tag></div>
          <p className="mt-2 font-display text-3xl font-extrabold">{up.time} · {up.from} → ENSA</p>
          <h3 className="mt-5 font-mono text-[11px] font-bold uppercase text-muted-foreground">Passagers · {boarded.length}/{passengers.length} à bord</h3>
          <ul className="mt-2 grid gap-2">{passengers.map((p) => { const on = s.boarded.includes(p.key); return <li key={p.key} className="flex flex-wrap items-center gap-3 rounded-md border-2 border-ink bg-background p-3">
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-xs font-extrabold", p.color)}>{p.initials}</span>
            <span className="min-w-0 flex-1"><b className="block text-sm">{p.name}</b><span className="font-mono text-[10px] uppercase text-muted-foreground">{p.pickup}</span></span>
            {on ? <Tag className="bg-success-soft"><Check size={11} />À bord</Tag> : <Button className="h-9 px-3" onClick={() => { setPinFor(p); setCode(""); setErr(null); }}>Valider la montée</Button>}
          </li>; })}</ul>
          <p className="mt-3 text-xs text-muted-foreground">Démo : chaque passager a un code à 4 chiffres. Pour tester, il est rappelé dans la fenêtre de validation.</p>
        </div>
        {s.myRides.length > 0 && <div className="mt-6"><h2 className="font-display text-2xl font-extrabold">Mes trajets publiés</h2><div className="mt-3 grid gap-4 md:grid-cols-2">{s.myRides.map((t) => <TripCard key={t.id} trip={t} />)}</div></div>}
      </section>
      <section className="grid content-start gap-6">
        <div><h2 className="font-display text-2xl font-extrabold">Gains de la semaine</h2>
          <div className="mt-3 rounded-lg border-2 border-ink bg-card p-4 hard-sm">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={week} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "2px solid var(--ink)", background: "var(--card)", color: "var(--foreground)", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => [`${v} DH`, "Gain"]} />
                <Bar dataKey="gain" fill="var(--accent)" stroke="var(--ink)" strokeWidth={2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div><h2 className="font-display text-2xl font-extrabold">Historique</h2>
          <ul className="mt-3 divide-y-2 divide-ink overflow-hidden rounded-lg border-2 border-ink bg-card">{driverSeed.history.map((h) => <li key={h.id} className="flex items-center gap-3 p-3"><span className="flex-1"><b className="block text-sm">{h.label}</b><span className="font-mono text-[11px] text-muted-foreground">{h.date} · {h.passengers} passagers</span></span><span className="font-mono font-bold text-success">+{h.gain} DH</span></li>)}</ul>
        </div>
      </section>
    </div>
    <Modal open={!!pinFor_} onClose={() => setPinFor(null)} title="Valider la montée">
      {pinFor_ && <form onSubmit={validate} className="grid gap-4">
        <p className="text-sm">Demande à <b>{pinFor_.name}</b> son code de montée à 4 chiffres, puis saisis-le.</p>
        <Field label="Code de montée"><input autoFocus inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setErr(null); }} placeholder="0000" className={cn(inputClass, "text-center font-mono text-2xl tracking-[.4em]")} /></Field>
        {err && <p role="alert" className="rounded-md border-2 border-ink bg-destructive-soft p-2 text-sm font-bold">{err}</p>}
        <p className="rounded-md border-2 border-dashed border-ink p-2 text-center font-mono text-[11px] uppercase text-muted-foreground">Démo · code du passager : {pinFor(pinFor_.key)}</p>
        <div className="flex gap-2"><Button type="button" variant="paper" className="flex-1" onClick={() => setPinFor(null)}><X size={15} />Annuler</Button><Button type="submit" className="flex-1" disabled={code.length !== 4}><Check size={15} />Valider</Button></div>
      </form>}
    </Modal>
  </AppShell>;
}

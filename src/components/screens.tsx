import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BadgeCheck, Ban, Car, Check, Clock, Coins, Eye, EyeOff, Flag, Fuel, Gauge, Megaphone, Navigation as NavIcon, UserX, GraduationCap, IdCard, Leaf, LogOut, Mail, MapPin, MessageCircle, Music, Navigation, Radio, RotateCcw, Search, Send, Share2, ShieldAlert, ShieldCheck, Star, Timer, Trophy, Users, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { RouteSketch } from "@/components/route-sketch";
import { RouteMap } from "@/components/route-map";
import { leaderboard, rechargeRequests, reviews, seedReports, transactions, trips, verificationQueue, weeklyStats, type ChatMessage, type Report, type Review, type Trip } from "@/lib/demo-data";
import { bookSeat, cancelBooking, rateTrip, requestRecharge, useMyBookings, useMyWallet, useTrip } from "@/lib/db";
import { COTISATION_DH, COTISATION_GROUP_ID, chatFor, findDemoTrip, ledgerEntry, resetDemo, setStore, useStore, type Pay } from "@/lib/store";
import { formatMinutes, impactFor } from "@/lib/impact";
import { addMinutes, clockNow, demoReply, qrFor } from "@/lib/trip-utils";
import { friendlyAuthError, sendEmailCode, signInWithPassword, signOutUser, signUpWithPassword, useAuth, useIdentity, verifyEmailCode } from "@/lib/auth";
import { AppShell, Avatar, SeatDots, TripCard } from "@/components/prototype";
import { ReportModal } from "@/components/features";
import { Button, EmptyState, Field, inputClass, Logo, Modal, Stamp, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


/* ---------- AUTH ---------- */
export function Auth({ signup = false }: { signup?: boolean }) {
  const nav = useNavigate();
  const { session, profile } = useAuth();
  const [mode, setMode] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cne, setCne] = useState("");
  const [role, setRole] = useState<"passager" | "conducteur">("passager");
  const [token, setToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Une session réelle vient de s'ouvrir → on quitte le mode démo et on route selon le rôle.
  useEffect(() => {
    if (!session) return;
    setStore(() => ({ demoMode: false }));
    nav({ to: profile?.role === "admin" ? "/admin" : "/app" });
  }, [session, profile, nav]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(friendlyAuthError(e instanceof Error ? e.message : "Erreur inconnue."));
    } finally {
      setBusy(false);
    }
  };

  const demo = () => { setStore(() => ({ demoMode: true })); nav({ to: "/app" }); };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (signup) {
        const s = await signUpWithPassword({ email, password, fullName, role, cne });
        if (!s) setSent(true); // confirmation par email activée : pas de session immédiate
      } else {
        await signInWithPassword(email, password);
      }
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (!codeSent) { await sendEmailCode(email); setCodeSent(true); }
      else await verifyEmailCode(email, token);
    });
  };

  if (sent) return <AuthFrame><div className="text-center"><Stamp className="h-28 w-28 text-base">Dossier<br />envoyé</Stamp><h1 className="mt-6 font-display text-3xl font-extrabold">Dossier envoyé !</h1><p className="mt-2 text-sm text-muted-foreground">Confirme ton email, puis l’admin vérifie ton CNE et ta carte étudiante (sous 24h). Tu peux déjà explorer.</p><Button className="mt-6 w-full" onClick={demo}>Explorer en attendant</Button></div></AuthFrame>;

  return <AuthFrame>
    <h1 className="font-display text-4xl font-extrabold">{signup ? "Rejoindre la ligne." : "Re-salam."}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{signup ? "Étudiants, profs et personnel ENSA uniquement." : "Connecte-toi par code email ou mot de passe."}</p>

    {!signup && <div className="mt-6 inline-flex w-full rounded-full border-2 border-ink bg-card p-1">
      {([["password", "Mot de passe"], ["code", "Code email"]] as const).map(([k, l]) =>
        <button key={k} type="button" onClick={() => { setMode(k); setErr(null); setCodeSent(false); }} className={cn("flex-1 rounded-full px-4 py-2 text-sm font-bold", mode === k ? "bg-ink text-ink-foreground" : "")}>{l}</button>)}
    </div>}

    {err && <p role="alert" className="mt-4 rounded-md border-2 border-ink bg-destructive-soft p-3 text-sm font-bold">{err}</p>}

    {(!signup && mode === "code") ? <form className="mt-6 grid gap-4" onSubmit={submitCode}>
      <Field label="Email institutionnel"><input required type="email" autoComplete="email" className={inputClass} placeholder="prenom.nom@etu.uae.ac.ma" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      {codeSent && <Field label="Code à 6 chiffres" hint="Vérifie ta boîte mail (et les spams)."><input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={inputClass} placeholder="123456" value={token} onChange={(e) => setToken(e.target.value)} /></Field>}
      <Button type="submit" className="mt-2 h-14" disabled={busy}>{busy ? "…" : codeSent ? "Valider le code" : "Recevoir un code"} <ArrowRight size={17} /></Button>
      {codeSent && <button type="button" onClick={() => { setCodeSent(false); setToken(""); }} className="text-center font-mono text-[10px] uppercase text-muted-foreground underline">Changer d’email</button>}
    </form> : <form className="mt-6 grid gap-4" onSubmit={submitPassword}>
      {signup && <Field label="Nom complet"><input required className={inputClass} placeholder="Amine Benali" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>}
      <Field label="Email institutionnel" hint={signup ? "Seuls @etu.uae.ac.ma et @uae.ac.ma sont acceptés." : undefined}><input required type="email" autoComplete="email" className={inputClass} placeholder="prenom.nom@etu.uae.ac.ma" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Mot de passe" hint={signup ? "6 caractères minimum." : undefined}><span className="relative block"><input required minLength={signup ? 6 : undefined} type={showPwd ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} className={cn(inputClass, "pr-12")} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPwd} onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></Field>
      {signup && <>
        <Field label="CNE ou matricule (prof / personnel)"><input className={inputClass} placeholder="R136724519" value={cne} onChange={(e) => setCne(e.target.value)} /></Field>
        <div><p className="font-mono text-[11px] font-bold uppercase">Je m’inscris comme</p><div className="mt-2 grid grid-cols-2 gap-2">{(["passager", "conducteur"] as const).map((r) => <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} className={cn("rounded-md border-2 border-ink py-2.5 text-sm font-bold capitalize", role === r && "bg-primary text-primary-foreground")}>{r}</button>)}</div></div>
      </>}
      <Button type="submit" className="mt-2 h-14" disabled={busy}>{busy ? "…" : signup ? "Créer mon compte" : "Entrer"} <ArrowRight size={17} /></Button>
    </form>}

    <div className="my-5 flex items-center gap-3"><span className="h-0.5 flex-1 bg-ink/20" /><span className="font-mono text-[10px] uppercase text-muted-foreground">ou</span><span className="h-0.5 flex-1 bg-ink/20" /></div>
    <Button variant="paper" className="w-full" onClick={demo}><Users size={16} />Entrer en mode démo (Amine)</Button>

    <p className="mt-6 text-center text-sm">{signup ? <>Déjà membre ? <Link to="/login" className="font-bold text-primary underline">Connexion</Link></> : <>Nouveau ? <Link to="/signup" className="font-bold text-primary underline">Créer un compte</Link></>}</p>
  </AuthFrame>;
}
function AuthFrame({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden border-r-2 border-ink bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <Link to="/"><Logo invert /></Link>
      <p className="font-display text-6xl font-extrabold leading-[.9]">Même route.<br />Même école.<br /><span className="text-accent">5 dirhams.</span></p>
      <div className="flex gap-3">{trips.slice(0, 4).map((t) => <Avatar key={t.id} trip={t} />)}<span className="self-center text-sm">+ 300 membres vérifiés</span></div>
    </aside>
    <main className="flex items-center justify-center p-5"><div className="w-full max-w-md rounded-xl border-2 border-ink bg-card p-6 hard sm:p-8"><Link to="/" className="mb-6 block lg:hidden"><Logo /></Link>{children}</div></main>
  </div>;
}

/* ---------- RIDE DETAIL ---------- */
const routeLabel = (t: Pick<Trip, "slot" | "from">) => (t.slot === "Matin" ? `${t.from} → ENSA` : `ENSA → ${t.from}`);

export function RideDetail({ rideId }: { rideId: string }) {
  const { session } = useAuth();
  const s = useStore();
  const detail = useTrip(rideId, !!session);
  const mine = useMyBookings(!!session);
  const wallet = useMyWallet(!!session);
  const back = <Link to="/app" className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase"><ArrowLeft size={14} />Retour</Link>;
  if (session && detail.isLoading) return <AppShell>{back}<p className="mt-6 font-mono text-xs uppercase text-muted-foreground">Chargement du trajet…</p></AppShell>;
  const t = session ? detail.data?.trip : findDemoTrip(s, rideId);
  if (!t) return <AppShell>{back}<div className="mt-6 grid"><EmptyState title="Trajet introuvable."><Link to="/app"><Button className="mt-4">Voir les trajets</Button></Link></EmptyState></div></AppShell>;
  const booked = session
    ? (mine.data?.some((b) => b.trip.id === rideId && b.status === "confirmé") ?? false)
    : s.bookings.some((b) => b.tripId === rideId && b.status === "confirmé");
  const balance = session ? wallet.data?.balance ?? 0 : s.balance;
  return <RideDetailBody key={t.id} t={t} rideId={rideId} session={!!session} userId={session?.user.id ?? null}
    dbReviews={session ? detail.data?.reviews ?? [] : []}
    booked={booked} balance={balance} />;
}
function RideDetailBody({ t, rideId, session, userId, dbReviews, booked, balance }: {
  t: Trip; rideId: string; session: boolean; userId: string | null;
  dbReviews: Review[]; booked: boolean; balance: number;
}) {
  const s = useStore();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [pickup, setPickup] = useState(t.pickups[0] ?? "");
  const [pay, setPay] = useState<Pay>("wallet");
  const [sos, setSos] = useState(false);
  const [report, setReport] = useState(false);
  const revs = session ? dbReviews : (reviews[t.id] ?? []);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const lowWallet = balance < 5;
  const lowPoints = !session && s.points < 50;
  const reserve = async () => {
    setErr(null);
    if (pay === "wallet" && lowWallet) { setErr("Solde insuffisant : recharge ton wallet ou choisis un autre paiement."); return; }
    if (pay === "points" && lowPoints) { setErr("Pas assez de points : il en faut 50 pour un trajet."); return; }
    if (pay === "cotisation" && !session && !s.joinedGroups.includes(COTISATION_GROUP_ID)) { setErr("Rejoins d’abord la cotisation essence depuis Groupes ou Wallet."); return; }
    if (session) {
      if (!userId) { setErr("Connecte-toi pour réserver."); return; }
      setBusy(true);
      try {
        await bookSeat({ tripId: rideId, userId, pickup, pay, label: `Trajet ${routeLabel(t)}` });
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["my-bookings"] }),
          qc.invalidateQueries({ queryKey: ["my-wallet"] }),
        ]);
        setOk(true);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
      return;
    }
    setStore((x) => ({
      balance: pay === "wallet" ? x.balance - 5 : x.balance,
      points: pay === "points" ? x.points - 50 : x.points,
      bookings: [{ tripId: t.id, pay, pickup, status: "confirmé" }, ...x.bookings],
      ledger: pay === "wallet" ? [ledgerEntry(`Trajet ${routeLabel(t)}`, -5, "trajet"), ...x.ledger] : x.ledger,
    }));
    toast.success("Place réservée", { description: `${t.time} · pickup ${pickup}` });
    setOk(true);
  };
  const shareLive = async () => {
    const url = `${window.location.origin}/ride/${t.id}`;
    try {
      if (typeof navigator.share === "function") await navigator.share({ title: `Mon trajet Rkeb ${t.time}`, text: `Je pars à ${t.time} (${routeLabel(t)}) avec ${t.driver}.`, url });
      else { await navigator.clipboard.writeText(url); toast.success("Lien du trajet copié", { description: "Envoie-le à un proche pour qu’il te suive." }); }
    } catch {
      // partage annulé par l'utilisateur
    }
  };
  const alertNow = () => { setSos(false); toast.error("Alerte envoyée", { description: "Ton contact d’urgence et l’administration ENSA ont reçu ta position (simulation)." }); };
  return <AppShell>
    <Link to="/app" className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase"><ArrowLeft size={14} />Retour</Link>
    <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-mono text-xs font-bold uppercase text-muted-foreground">{t.date} · {t.vehicle}</p><h1 className="font-display text-5xl font-extrabold tracking-tight">{t.time} <span className="text-primary">→</span> {t.arrival}</h1><p className="mt-1 text-sm font-semibold">{routeLabel(t)}</p></div>
          <Tag className="bg-accent text-accent-foreground"><Clock size={11} />Alerte retard activée</Tag>
        </div>
        <RouteMap from={t.from} stops={t.pickups ?? []} evening={t.slot === "Soir"} />
        <div className="rounded-lg border-2 border-ink bg-card p-5">
          <h2 className="font-display text-xl font-extrabold">Choisis ton pickup</h2>
          <div className="mt-3 grid gap-2">{(t.pickups ?? []).map((p, i) => <label key={p} className="flex items-center gap-3 rounded-md border-2 border-ink p-3 has-[:checked]:bg-primary-soft">
            <input type="radio" name="pickup" checked={pickup === p} onChange={() => setPickup(p)} className="accent-primary" /><span className="grid h-6 w-6 place-items-center rounded-full border-2 border-ink font-mono text-[10px] font-bold">{i + 1}</span><span className="flex-1 text-sm font-bold">{p}</span><span className="font-mono text-xs text-muted-foreground">{addMinutes(t.time, i * 5)}</span></label>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setSos(true)} className="press flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-destructive py-4 font-bold text-primary-foreground hard-sm"><ShieldAlert size={18} />SOS</button>
          <button onClick={() => void shareLive()} className="press flex items-center justify-center gap-2 rounded-lg border-2 border-ink bg-card py-4 font-bold hard-sm"><Share2 size={18} />Partager le trajet</button>
        </div>
      </div>
      <aside className="grid content-start gap-5">
        <div className="rounded-lg border-2 border-ink bg-card p-5 hard-sm">
          <div className="flex items-center gap-3"><Avatar trip={t} size="lg" /><div><p className="flex items-center gap-1 font-display text-xl font-extrabold">{t.driver}<BadgeCheck size={18} className="text-primary" /></p><p className="font-mono text-[11px] uppercase text-muted-foreground">{t.status} · {t.rating > 0 ? `★ ${t.rating}` : "Nouveau"} · {t.trips} trajets</p></div></div>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border-2 border-ink bg-ink text-sm">
            {[["Véhicule", t.car || "—"], ["Plaque", t.plate || "—"], ["Places", `${t.total - t.seats}/${t.total} prises`], ["Ambiance", t.preference]].map(([k, v]) => <div key={k} className="bg-card p-2.5"><dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>)}
          </dl>
          <Link to="/chat/$tripId" params={{ tripId: t.id }} className="mt-3 flex items-center justify-center gap-2 rounded-md border-2 border-ink py-2.5 text-sm font-bold"><MessageCircle size={16} />Écrire (sans partager ton numéro)</Link>
          <div className="mt-3 flex justify-center gap-4"><button onClick={() => setReport(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground underline"><Flag size={12} />Signaler</button><button onClick={() => { setStore((x) => ({ blocked: x.blocked.includes(t.driver) ? x.blocked : [...x.blocked, t.driver] })); toast(`${t.driver} bloqué·e`, { description: "Ses trajets disparaissent de ta recherche." }); nav({ to: "/app" }); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground underline"><UserX size={12} />Bloquer</button></div>
        </div>
        {revs.length > 0 && <div className="rounded-lg border-2 border-ink bg-card p-5 hard-sm">
          <h2 className="font-display text-xl font-extrabold">Ils en parlent</h2>
          <div className="mt-3 grid gap-2">{revs.map((r, i) => <div key={i} className="rounded-md border-2 border-ink bg-background p-3"><p className="flex gap-0.5" aria-label={`${r.stars} étoiles`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={cn(n <= r.stars ? "fill-accent" : "")} />)}</p><p className="mt-1 text-sm">“{r.text}”</p><p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{r.name}</p></div>)}</div>
        </div>}
        <div className="rounded-lg border-2 border-ink bg-card p-5 hard-sm">
          <h2 className="font-display text-xl font-extrabold">Payer ma place</h2>
          <div className="mt-3 grid gap-2">{([["wallet", "Wallet", `5 DH · solde ${balance} DH${lowWallet ? " · insuffisant" : ""}`, Coins], ["points", "Carte de points", `50 pts · tu as ${s.points}`, Star], ["cotisation", "Cotisation essence", `${COTISATION_DH} DH/semaine avec le groupe`, Fuel]] as const).map(([k, l, d, I]) =>
            <button key={k} aria-pressed={pay === k} onClick={() => setPay(k)} className={cn("flex items-center gap-3 rounded-md border-2 border-ink p-3 text-left", pay === k && "bg-ink text-ink-foreground")}><I size={18} /><span className="flex-1"><b className="block text-sm">{l}</b><span className="text-xs opacity-70">{d}</span></span>{pay === k && <Check size={16} />}</button>)}
          </div>
          {err && <p role="alert" className="mt-4 rounded-md border-2 border-ink bg-destructive-soft p-3 text-sm font-bold">{err}</p>}
          {booked ? <Link to="/trips"><Button variant="accent" className="mt-4 w-full">Déjà réservé · voir mon billet</Button></Link>
            : <Button className="mt-4 h-14 w-full text-base" disabled={busy || t.seats === 0} onClick={() => void reserve()}>{busy ? "Réservation…" : t.seats === 0 ? "Complet" : "Réserver ma place"}</Button>}
          <p className="mt-2 text-center font-mono text-[10px] uppercase text-muted-foreground">Remboursé automatiquement si le conducteur annule</p>
        </div>
      </aside>
    </div>
    <Modal open={ok} onClose={() => setOk(false)} title="C’est réservé !">
      <p className="text-sm">Pickup <b>{pickup}</b> à <b>{t.time}</b>. {t.driver.split(" ")[0]} a été prévenu·e. On te réveille 30 min avant.</p>
      <div className="mt-5 flex gap-2"><Button variant="paper" className="flex-1" onClick={() => setOk(false)}>Fermer</Button><Button className="flex-1" onClick={() => nav({ to: "/trips" })}>Mon billet</Button></div>
    </Modal>
    <ReportModal open={report} onClose={() => setReport(false)} target={t.driver} tripId={t.id} />
    <Modal open={sos} onClose={() => setSos(false)} title="Alerte SOS">
      <p className="text-sm">Ta position live sera envoyée à ton contact d’urgence et à l’administration ENSA. À utiliser en cas de danger ou de problème sérieux.</p>
      <div className="mt-4 grid gap-2"><Button variant="danger" onClick={alertNow}><ShieldAlert size={16} />Alerter maintenant</Button><Button variant="paper" onClick={() => setSos(false)}>Annuler</Button></div>
    </Modal>
  </AppShell>;
}

/* ---------- TRIPS ---------- */
export function TripsPage() {
  const s = useStore();
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const qc = useQueryClient();
  const mine = useMyBookings(!!session);
  const [tab, setTab] = useState<"next" | "past">("next");
  const [qr, setQr] = useState<{ id: string; seed: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, number>>({});
  type Row = { key: string; t: Trip; pickup: string; pay: Pay; status: "confirmé" | "terminé" | "annulé"; stars: number; rateable: boolean; driverId: string | null };
  const [toCancel, setToCancel] = useState<Row | null>(null);
  const rows: Row[] = session
    ? (mine.data ?? []).map((b) => ({
        key: b.id, t: b.trip, pickup: b.pickup, pay: b.pay, status: b.status,
        stars: rated[b.trip.id] ?? 0,
        rateable: b.status === "terminé" || (b.past && b.status === "confirmé"),
        driverId: b.driverId,
      }))
    : s.bookings.flatMap((b, i) => {
        const t = findDemoTrip(s, b.tripId);
        return t ? [{ key: b.tripId + i, t, pickup: b.pickup, pay: b.pay, status: b.status, stars: b.rated ?? 0, rateable: b.status === "terminé", driverId: null }] : [];
      });
  const list = rows.filter((r) => (tab === "next" ? r.status === "confirmé" : r.status !== "confirmé"));
  const cancel = async (r: Row) => {
    setToCancel(null);
    if (session) {
      if (!userId) return;
      setErr(null);
      try {
        await cancelBooking({ bookingId: r.key, userId, pay: r.pay, refundLabel: `Remboursement : ${routeLabel(r.t)}` });
        await Promise.all([qc.invalidateQueries({ queryKey: ["my-bookings"] }), qc.invalidateQueries({ queryKey: ["my-wallet"] })]);
        toast.success("Billet annulé", { description: r.pay === "wallet" ? "5 DH remboursés sur ton wallet." : undefined });
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
      return;
    }
    setStore((x) => ({
      bookings: x.bookings.map((b) => (b.tripId === r.t.id && b.status === "confirmé" ? { ...b, status: "annulé" } : b)),
      balance: r.pay === "wallet" ? x.balance + 5 : x.balance,
      points: r.pay === "points" ? x.points + 50 : x.points,
      ledger: r.pay === "wallet" ? [ledgerEntry(`Remboursement : ${routeLabel(r.t)}`, 5, "remboursement"), ...x.ledger] : x.ledger,
    }));
    toast.success("Billet annulé", { description: r.pay === "wallet" ? "5 DH remboursés sur ton wallet." : r.pay === "points" ? "50 points recrédités." : undefined });
  };
  const rate = (r: Row, n: number) => {
    setRated((x) => ({ ...x, [r.t.id]: n }));
    toast.success("Merci pour ta note", { description: `${n} étoile${n > 1 ? "s" : ""} pour ${r.t.driver.split(" ")[0]}.` });
    if (session) {
      if (userId && r.driverId) {
        void rateTrip({ driverId: r.driverId, userId, tripId: r.t.id, stars: n })
          .then(() => Promise.all([qc.invalidateQueries({ queryKey: ["trips"] }), qc.invalidateQueries({ queryKey: ["trip", r.t.id] })]))
          .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
      }
      return;
    }
    setStore((x) => ({ bookings: x.bookings.map((b) => (b.tripId === r.t.id ? { ...b, rated: n } : b)) }));
  };
  const qrData = qr ? qrFor(qr.seed) : null;
  const nextCount = rows.filter((r) => r.status === "confirmé").length;
  return <AppShell>
    <h1 className="font-display text-5xl font-extrabold">Mes billets</h1>
    <div role="tablist" aria-label="Billets" className="mt-5 inline-flex rounded-full border-2 border-ink bg-card p-1">{([["next", `À venir${nextCount ? ` (${nextCount})` : ""}`], ["past", "Historique"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("rounded-full px-5 py-2 text-sm font-bold", tab === k && "bg-ink text-ink-foreground")}>{l}</button>)}</div>
    {err && <p role="alert" className="mt-4 rounded-md border-2 border-ink bg-destructive-soft p-3 text-sm font-bold">{err}</p>}
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {list.map((r) => <div key={r.key} className="grid gap-2">
        <TripCard trip={r.t} />
        <div className="flex flex-wrap items-center gap-2 px-1">
          <Tag><MapPin size={11} />{r.pickup}</Tag><Tag>{r.pay === "wallet" ? "Wallet" : r.pay === "points" ? "Points" : "Cotisation"}</Tag>
          {r.status === "annulé" && <Tag className="bg-destructive-soft">Annulé · remboursé</Tag>}
          <span className="flex-1" />
          {r.status === "confirmé" && <><Link to="/track/$tripId" params={{ tripId: r.t.id }} className="inline-flex items-center gap-1 text-sm font-bold text-primary underline"><NavIcon size={13} />Suivre</Link><button onClick={() => setQr({ id: r.t.id, seed: r.key })} className="text-sm font-bold text-primary underline">QR d’embarquement</button><button onClick={() => setToCancel(r)} className="text-sm font-bold text-destructive">Annuler</button></>}
          {r.rateable && <span className="flex gap-0.5" role="group" aria-label="Noter le conducteur">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => rate(r, n)} aria-label={`${n} étoile${n > 1 ? "s" : ""}`}><Star size={20} className={cn(r.stars >= n ? "fill-accent" : "")} /></button>)}</span>}
        </div>
      </div>)}
      {!list.length && <EmptyState title={tab === "next" ? "Aucun billet à venir." : "Aucun trajet passé."} body={tab === "next" ? "Réserve un trajet pour demain matin : ton billet QR apparaît ici." : "Tes trajets terminés et annulés apparaîtront ici."}><Link to="/app"><Button className="mt-4">Trouver un trajet</Button></Link></EmptyState>}
    </div>
    <Modal open={!!qr} onClose={() => setQr(null)} title="Billet d’embarquement">
      <div role="img" aria-label="Code QR du billet" className="mx-auto grid w-48 grid-cols-9 gap-0.5 rounded-md border-2 border-ink bg-white p-2">{(qrData?.cells ?? []).map((on, i) => <span key={i} className={cn("aspect-square", on ? "bg-black" : "")} />)}</div>
      <p className="mt-4 text-center font-mono text-2xl font-bold tracking-[.2em]">{qrData?.code}</p>
      <p className="text-center text-xs text-muted-foreground">Montre ce code au conducteur pour valider ta place.</p>
    </Modal>
    <Modal open={!!toCancel} onClose={() => setToCancel(null)} title="Annuler ce billet ?">
      {toCancel && <>
        <p className="text-sm">{routeLabel(toCancel.t)} à <b>{toCancel.t.time}</b> avec {toCancel.t.driver}. {toCancel.pay === "wallet" ? "Tes 5 DH seront remboursés sur ton wallet." : toCancel.pay === "points" ? "Tes 50 points seront recrédités." : "Ta place sera libérée."}</p>
        <div className="mt-5 flex gap-2"><Button variant="paper" className="flex-1" onClick={() => setToCancel(null)}>Garder</Button><Button variant="danger" className="flex-1" onClick={() => void cancel(toCancel)}>Annuler le billet</Button></div>
      </>}
    </Modal>
  </AppShell>;
}

/* ---------- WALLET ---------- */
export function WalletPage() {
  const s = useStore();
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const w = useMyWallet(!!session);
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState(50);
  const [sent, setSent] = useState(false);
  const [rechErr, setRechErr] = useState<string | null>(null);
  const balance = session ? w.data?.balance ?? 0 : s.balance;
  const list = session ? (w.data?.rows ?? []) : [...s.ledger, ...transactions];
  const sendRecharge = async () => {
    setRechErr(null);
    if (userId) {
      try {
        await requestRecharge({ userId, amount: amt });
      } catch (e) {
        setRechErr(e instanceof Error ? e.message : String(e));
        return;
      }
    }
    setSent(true);
  };
  const inPool = s.joinedGroups.includes(COTISATION_GROUP_ID);
  const toggleCotisation = () => {
    if (session) { toast("Bientôt disponible", { description: "La cotisation essence arrive en mode réel." }); return; }
    if (!inPool && s.balance < COTISATION_DH) { toast.error("Solde insuffisant", { description: `Il faut ${COTISATION_DH} DH pour rejoindre la cotisation.` }); return; }
    setStore((x) => inPool
      ? { cotisation: false, joinedGroups: x.joinedGroups.filter((g) => g !== COTISATION_GROUP_ID) }
      : { cotisation: true, joinedGroups: [...x.joinedGroups, COTISATION_GROUP_ID], balance: x.balance - COTISATION_DH, ledger: [ledgerEntry("Cotisation essence · Groupe de Yasmine", -COTISATION_DH, "cotisation"), ...x.ledger] });
    toast.success(inPool ? "Cotisation quittée" : "Bienvenue dans le groupe", { description: inPool ? undefined : `${COTISATION_DH} DH débités pour cette semaine.` });
  };
  const toNext = s.points % 50;
  return <AppShell>
    <h1 className="font-display text-5xl font-extrabold">Wallet</h1>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-xl border-2 border-ink bg-ink p-6 text-ink-foreground hard md:col-span-2">
        <p className="font-mono text-xs uppercase text-ink-muted">Solde disponible</p>
        <p className="mt-2 font-display text-7xl font-extrabold">{balance}<span className="text-3xl text-accent"> DH</span></p>
        <p className="mt-1 text-sm text-ink-muted">≈ {Math.floor(balance / 5)} trajets</p>
        <div className="mt-6 flex gap-2"><Button variant="accent" onClick={() => { setSent(false); setOpen(true); }}>Recharger en cash</Button></div>
        <Stamp className="absolute -right-4 -top-4 h-28 w-28 text-2xl">5 DH</Stamp>
      </div>
      <div className="rounded-xl border-2 border-ink bg-accent p-6 text-accent-foreground hard-sm">
        <p className="font-mono text-xs font-bold uppercase">Carte de points</p>
        <p className="mt-2 font-display text-6xl font-extrabold">{s.points}</p>
        <p className="text-sm">= {Math.floor(s.points / 50)} trajets offerts. +10 pts par passager transporté.</p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-card" role="progressbar" aria-valuemin={0} aria-valuemax={50} aria-valuenow={toNext} aria-label="Progression vers le prochain trajet offert"><div className="h-full bg-ink" style={{ width: `${(toNext / 50) * 100}%` }} /></div>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase">{50 - toNext} pts avant le prochain trajet offert</p>
      </div>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border-2 border-ink bg-card p-5">
        <div className="flex items-center gap-2"><Fuel size={18} /><h2 className="font-display text-xl font-extrabold">Cotisation essence</h2></div>
        <p className="mt-1 text-sm text-muted-foreground">Groupe de Yasmine · 4 passagers · plein de 150 DH partagé chaque semaine. <Link to="/groups" className="font-bold text-primary underline">Tous les groupes</Link></p>
        <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink"><div className="h-full w-2/3 bg-primary" /></div>
        <Button variant={inPool ? "paper" : "primary"} className="mt-4 w-full" onClick={toggleCotisation}>{inPool ? `Inscrit · ${COTISATION_DH} DH/semaine ✓` : `Rejoindre pour ${COTISATION_DH} DH/semaine`}</Button>
      </div>
      <div className="rounded-xl border-2 border-ink bg-card p-5">
        <h2 className="font-display text-xl font-extrabold">Abonnement mensuel</h2>
        <p className="mt-1 text-sm text-muted-foreground">40 trajets aller retour pour 170 DH au lieu de 200.</p>
        <p className="mt-3 font-display text-4xl font-extrabold">170 DH<span className="text-base font-bold text-muted-foreground"> /mois</span></p>
        <Tag className="mt-2 bg-primary-soft">Bientôt</Tag>
      </div>
    </div>
    <h2 className="mt-8 font-display text-2xl font-extrabold">Historique</h2>
    {list.length === 0 && <p className="mt-3 rounded-xl border-2 border-dashed border-ink p-6 text-center text-sm text-muted-foreground">Aucune opération pour l’instant. Recharge ton wallet puis réserve ton premier trajet.</p>}
    <ul className="mt-3 divide-y-2 divide-ink overflow-hidden rounded-xl border-2 border-ink bg-card empty:hidden">{list.map((t) => <li key={t.id} className="flex items-center gap-3 p-4">
      <span className={cn("grid h-9 w-9 place-items-center rounded-full border-2 border-ink", t.amount > 0 ? "bg-success-soft" : "bg-background")}>{t.kind === "cotisation" ? <Fuel size={15} /> : t.amount > 0 ? <ArrowLeft size={15} /> : <Car size={15} />}</span>
      <div className="flex-1"><p className="text-sm font-bold">{t.label}</p><p className="font-mono text-[11px] text-muted-foreground">{t.date}</p></div>
      <span className={cn("font-mono font-bold", t.amount > 0 && "text-success")}>{t.amount > 0 ? "+" : ""}{t.amount} DH</span></li>)}</ul>
    <Modal open={open} onClose={() => setOpen(false)} title={sent ? "Demande envoyée" : "Recharge cash"}>
      {sent ? <p className="text-sm">Présente le code <b className="font-mono">RCH-{amt}7</b> au guichet BDE avec {amt} DH. L’admin valide et ton solde est crédité.</p> : <>
        <p className="text-sm text-muted-foreground">Pas de carte bancaire : tu paies en cash au guichet, l’admin valide.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">{[20, 50, 100].map((a) => <button key={a} aria-pressed={amt === a} onClick={() => setAmt(a)} className={cn("rounded-md border-2 border-ink py-3 font-display text-xl font-extrabold", amt === a && "bg-ink text-ink-foreground")}>{a}</button>)}</div>
        {rechErr && <p role="alert" className="mt-3 rounded-md border-2 border-ink bg-destructive-soft p-2 text-sm font-bold">{rechErr}</p>}
        <Button className="mt-4 w-full" onClick={() => void sendRecharge()}>Générer mon code</Button></>}
    </Modal>
  </AppShell>;
}

/* ---------- CHAT ---------- */
export function ChatPage() {
  const { tripId } = useParams({ strict: false }) as { tripId?: string };
  const { session } = useAuth();
  const s = useStore();
  const detail = useTrip(tripId ?? "", !!session && !!tripId);
  const t = session ? detail.data?.trip : findDemoTrip(s, tripId);
  const [txt, setTxt] = useState("");
  const [report, setReport] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const msgs = tripId ? chatFor(s, tripId) : [];
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);
  if (session && detail.isLoading) return <AppShell><p className="font-mono text-xs uppercase text-muted-foreground">Chargement…</p></AppShell>;
  if (!t || !tripId) return <AppShell><div className="grid"><EmptyState title="Conversation introuvable."><Link to="/app"><Button className="mt-4">Voir les trajets</Button></Link></EmptyState></div></AppShell>;
  const push = (m: ChatMessage) => setStore((x) => ({ chats: { ...x.chats, [tripId]: [...chatFor(x, tripId), m] } }));
  const send = (m: string) => {
    const text = m.trim();
    if (!text) return;
    push({ from: "me", text, time: clockNow() });
    setTxt("");
    if (!session) setTimeout(() => push({ from: "them", text: demoReply(text), time: clockNow() }), 1200);
  };
  return <AppShell>
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border-2 border-ink bg-card hard">
      <div className="flex items-center gap-3 border-b-2 border-ink p-4"><Link to="/ride/$rideId" params={{ rideId: t.id }} aria-label="Retour au trajet"><ArrowLeft size={18} /></Link><Avatar trip={t} /><div className="min-w-0 flex-1"><p className="truncate font-bold">{t.driver}</p><p className="truncate font-mono text-[10px] uppercase text-muted-foreground">{t.time} · {t.from} · numéro masqué</p></div><Tag><Music size={11} />{t.preference}</Tag><button onClick={() => setReport(true)} aria-label={`Signaler ${t.driver}`} title="Signaler" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink"><Flag size={14} /></button></div>
      <div role="log" aria-live="polite" className="grid max-h-[55vh] min-h-80 content-start gap-3 overflow-y-auto bg-background p-4">
        {msgs.length === 0 && <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">Dis bonjour à {t.driver.split(" ")[0]} : pickup, heure, point de rencontre. Ton numéro reste masqué.</p>}
        {msgs.map((m, i) => <div key={i} className={cn("max-w-[80%] rounded-lg border-2 border-ink px-3 py-2 text-sm", m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-card")}>{m.text}<span className="mt-0.5 block font-mono text-[9px] opacity-70">{m.time}</span></div>)}
        <div ref={end} />
      </div>
      <div className="flex gap-2 overflow-x-auto border-t-2 border-ink px-4 pt-3">{["J’arrive dans 2 min", "Je suis au pickup", "Tu es où ?", "Merci !"].map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold">{q}</button>)}</div>
      <form className="flex gap-2 p-4" onSubmit={(e) => { e.preventDefault(); send(txt); }}><input value={txt} onChange={(e) => setTxt(e.target.value)} aria-label="Message" className={inputClass} placeholder="Écris un message…" /><Button aria-label="Envoyer"><Send size={16} /></Button></form>
      {session && <p className="border-t-2 border-ink px-4 py-2 text-center font-mono text-[10px] uppercase text-muted-foreground">Messagerie locale · le temps réel arrive bientôt</p>}
    </div>
    <ReportModal open={report} onClose={() => setReport(false)} target={t.driver} tripId={t.id} />
  </AppShell>;
}

/* ---------- PROFILE ---------- */
export function ProfilePage() {
  const s = useStore();
  const nav = useNavigate();
  const id = useIdentity();
  const { session, profile } = useAuth();
  const mine = useMyBookings(!!session);
  const rides = session ? (mine.data ?? []).filter((b) => b.status !== "annulé").length : 24 + s.bookings.filter((b) => b.status === "confirmé").length;
  const driven = session ? "—" : String(8 + s.published);
  const impact = impactFor(rides);
  const isAdmin = id.isDemo || profile?.role === "admin";
  const signOut = () => { void signOutUser(); setStore(() => ({ demoMode: false })); nav({ to: "/" }); };
  return <AppShell>
    <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border-2 border-ink bg-card p-6 hard">
        <div className="flex items-center gap-4"><span className="grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-avatar-4 font-display text-2xl font-extrabold">{id.initials}</span><div><h1 className="font-display text-3xl font-extrabold">{id.name}</h1><Tag className="mt-1 bg-primary-soft"><BadgeCheck size={11} />{id.verified ? "Profil vérifié ENSA" : "Vérification en cours"}{id.isDemo ? " · démo" : ""}</Tag></div></div>
        <dl className="mt-5 grid gap-2 text-sm">{[[GraduationCap, id.filiere], [IdCard, id.cne], [Mail, id.email]].map(([I, v]) => { const Icon = I as typeof Mail; return <div key={v as string} className="flex items-center gap-2"><Icon size={15} /><span className="break-all font-mono text-xs">{v as string}</span></div>; })}</dl>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">{[[String(rides), "passager"], [driven, "conducteur"], [session ? "—" : "4.9★", "note"]].map(([n, l]) => <div key={l} className="rounded-md border-2 border-ink p-2"><p className="font-display text-2xl font-extrabold">{n}</p><p className="font-mono text-[10px] uppercase">{l}</p></div>)}</div>
        <div className="mt-5"><p className="font-mono text-[11px] font-bold uppercase">Mode actuel</p><div className="mt-2 grid grid-cols-2 gap-2">{(["passager", "conducteur"] as const).map((r) => <button key={r} aria-pressed={s.role === r} onClick={() => setStore(() => ({ role: r }))} className={cn("rounded-md border-2 border-ink py-2.5 text-sm font-bold capitalize", s.role === r && "bg-primary text-primary-foreground")}>{r}</button>)}</div></div>
        <div className="mt-5"><p className="font-mono text-[11px] font-bold uppercase">Thème</p><div className="mt-2 grid grid-cols-3 gap-2">{(["tanger", "ensa", "nuit"] as const).map((t) => <button key={t} aria-pressed={s.theme === t} onClick={() => setStore(() => ({ theme: t }))} className={cn("rounded-md border-2 border-ink py-2.5 text-sm font-bold capitalize", s.theme === t && "bg-primary text-primary-foreground")}>{t}</button>)}</div><p className="mt-1.5 text-xs text-muted-foreground">Tanger = thème par défaut · ENSA = variante institutionnelle · Nuit = mode sombre.</p></div>
        <div className="mt-5"><p className="font-mono text-[11px] font-bold uppercase">Ambiance préférée</p><div className="mt-2 flex flex-wrap gap-2">{(["Musique", "Silence", "Discussion"] as const).map((p) => <button key={p} aria-pressed={s.ambiance === p} onClick={() => setStore(() => ({ ambiance: p }))} className={cn("rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold", s.ambiance === p && "bg-ink text-ink-foreground")}>{p}</button>)}</div></div>
        <div className="mt-5 grid gap-2">{[["/requests", "Mes demandes de trajet", Megaphone], ["/groups", "Mes groupes", Fuel], ["/driver", "Tableau conducteur", Gauge]].map(([to, l, I]) => { const Icon = I as typeof Fuel; return <Link key={to as string} to={to as "/requests"} className="flex items-center gap-2 rounded-md border-2 border-ink py-2.5 pl-3 text-sm font-bold"><Icon size={16} />{l as string}<ArrowRight size={14} className="ml-auto mr-3" /></Link>; })}</div>
        {s.blocked.length > 0 && <div className="mt-5"><p className="font-mono text-[11px] font-bold uppercase">Utilisateurs bloqués</p><ul className="mt-2 grid gap-2">{s.blocked.map((b) => <li key={b} className="flex items-center gap-2 rounded-md border-2 border-ink bg-background p-2 text-sm"><UserX size={14} /><span className="flex-1 font-bold">{b}</span><button onClick={() => { setStore((x) => ({ blocked: x.blocked.filter((n) => n !== b) })); toast(`${b} débloqué·e`); }} className="text-xs font-bold text-primary underline">Débloquer</button></li>)}</ul></div>}
        {isAdmin && <Link to="/admin" className="mt-5 flex items-center justify-center gap-2 rounded-md border-2 border-ink py-2.5 text-sm font-bold"><ShieldCheck size={16} />Console d’administration</Link>}
        <nav aria-label="Aide et projet" className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-primary underline"><Link to="/help">Aide et FAQ</Link><Link to="/safety">Sécurité</Link><Link to="/about">Équipe</Link><Link to="/contact">Contact</Link></nav>
        <Button variant="paper" className="mt-3 w-full" onClick={signOut}><LogOut size={16} />Se déconnecter</Button>
        <button onClick={() => { resetDemo(); toast("Démo réinitialisée"); nav({ to: "/app" }); }} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-center font-mono text-[11px] uppercase text-muted-foreground underline"><RotateCcw size={12} />Recommencer la démo</button>
      </div>
      <div className="grid content-start gap-5">
        <div className="rounded-xl border-2 border-ink bg-card p-6 hard-sm">
          <div className="flex items-center gap-2"><Leaf /><h2 className="font-display text-2xl font-extrabold">Ton impact</h2></div>
          <p className="text-sm text-muted-foreground">Estimé sur {impact.rides} trajet{impact.rides > 1 ? "s" : ""} en covoiturage, par rapport à un taxi (30 DH), une voiture seule (12 km) et le bus.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">{([[Wallet, `${impact.savedDh} DH`, "économisés"], [Leaf, `${impact.co2Kg} kg`, "CO₂ évités"], [Timer, formatMinutes(impact.minutes), "gagnées"]] as const).map(([I, n, l]) => <div key={l} className="rounded-md border-2 border-ink bg-background p-3"><I size={18} className="mx-auto text-primary" /><p className="mt-1 font-display text-xl font-extrabold">{n}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">{l}</p></div>)}</div>
        </div>
        <div className="rounded-xl border-2 border-ink bg-accent p-6 text-accent-foreground hard-sm">
          <div className="flex items-center gap-2"><Trophy /><h2 className="font-display text-2xl font-extrabold">Top helpers ENSA</h2></div>
          <p className="text-sm">Les conducteurs qui remplissent le plus de places ce mois. Les éco-points se transforment en trajets offerts.</p>
          <ol className="mt-4 grid gap-2 text-foreground">{leaderboard.map((l, i) => <li key={l.name} className="flex items-center gap-3 rounded-md border-2 border-ink bg-card p-3"><span className="font-display text-2xl font-extrabold">{i + 1}</span><span className="flex-1 font-bold">{l.name}</span><span className="font-mono text-xs">{l.pts} pts</span></li>)}
            <li className="flex items-center gap-3 rounded-md border-2 border-dashed border-ink bg-card p-3"><span className="font-display text-2xl font-extrabold">17</span><span className="flex-1 font-bold">Toi</span><span className="font-mono text-xs">{s.points} pts</span></li></ol>
        </div>
      </div>
    </div>
  </AppShell>;
}

/* ---------- ADMIN ---------- */
export function AdminPage() {
  const s = useStore();
  const { profile, loading } = useAuth();
  if (!s.demoMode && loading) return <div className="grid min-h-screen place-items-center font-mono text-xs uppercase text-muted-foreground">Vérification des accès…</div>;
  if (!s.demoMode && profile?.role !== "admin") return <div className="grid min-h-screen place-items-center p-6">
    <div className="max-w-md rounded-xl border-2 border-ink bg-card p-8 text-center hard">
      <ShieldAlert size={36} className="mx-auto text-destructive" />
      <h1 className="mt-3 font-display text-3xl font-extrabold">Accès réservé.</h1>
      <p className="mt-2 text-sm text-muted-foreground">La console d’administration est réservée aux administrateurs ENSA. Connecte-toi avec un compte admin ou utilise le mode démo.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/login"><Button>Se connecter</Button></Link><Link to="/app"><Button variant="paper">Retour à l’app</Button></Link></div>
    </div>
  </div>;
  return <AdminConsole />;
}

function AdminConsole() {
  const s = useStore();
  const nav = useNavigate();
  const { profile } = useAuth();
  const [queue, setQueue] = useState(verificationQueue);
  const [recharges, setRecharges] = useState(rechargeRequests);
  const [log, setLog] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const weeklyTotal = weeklyStats.reduce((a, d) => a + d.trajets, 0);
  const avgTaux = Math.round(weeklyStats.reduce((a, d) => a + d.taux, 0) / weeklyStats.length);
  const act = (m: string) => setLog((l) => [`${clockNow()} · ${m}`, ...l].slice(0, 5));
  const allTrips = [...s.myRides, ...trips];
  const shown = allTrips.filter((t) => `${t.driver} ${t.from} ${t.plate}`.toLowerCase().includes(search.trim().toLowerCase()));
  const allReports = [...s.reports, ...seedReports];
  const openReports = allReports.filter((r) => !s.handledReports.includes(r.id));
  const closeReport = (r: Report, suspend: boolean) => {
    const ids = suspend ? allTrips.filter((t) => t.driver === r.target).map((t) => t.id) : [];
    setStore((x) => ({ handledReports: [...x.handledReports, r.id], hiddenTrips: [...new Set([...x.hiddenTrips, ...ids])] }));
    act(suspend ? `${r.target} suspendu·e après signalement` : `Signalement contre ${r.target} classé`);
  };
  const toggleTrip = (t: Trip) => {
    const hidden = s.hiddenTrips.includes(t.id);
    setStore((x) => ({ hiddenTrips: hidden ? x.hiddenTrips.filter((h) => h !== t.id) : [...x.hiddenTrips, t.id] }));
    act(hidden ? `Trajet de ${t.driver} réactivé` : `Trajet de ${t.driver} suspendu`);
  };
  const signOut = () => { void signOutUser(); setStore(() => ({ demoMode: false })); nav({ to: "/" }); };
  return <div className="min-h-screen">
    <header className="border-b-2 border-ink bg-ink text-ink-foreground"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Logo invert /><div className="flex items-center gap-3"><Tag className="bg-accent text-accent-foreground">Session admin · {profile?.role === "admin" ? profile.fullName : "ADM-ENSA-01"}</Tag><Link to="/app" className="font-mono text-[11px] font-bold uppercase underline">App</Link><button onClick={signOut} aria-label="Déconnexion"><LogOut size={18} /></button></div></div></header>
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="font-display text-5xl font-extrabold">Tour de contrôle</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{[["Membres vérifiés", "312"], ["En attente", String(queue.length)], ["Trajets cette semaine", String(weeklyTotal)], ["Recharges à valider", String(recharges.length)], ["Signalements ouverts", String(openReports.length)], ["Trajets suspendus", String(s.hiddenTrips.length)]].map(([l, n]) => <div key={l} className="rounded-lg border-2 border-ink bg-card p-4 hard-sm"><p className="font-display text-4xl font-extrabold">{n}</p><p className="font-mono text-[10px] uppercase">{l}</p></div>)}</div>
      {log.length > 0 && <div aria-live="polite" className="mt-4 rounded-md border-2 border-ink bg-success-soft p-3 font-mono text-xs">{log.map((l, i) => <p key={i}>✓ {l}</p>)}</div>}
      <section className="mt-8"><h2 className="font-display text-2xl font-extrabold">Trajets de la semaine</h2>
        <div className="mt-3 rounded-lg border-2 border-ink bg-card p-4 hard-sm">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyStats} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: "var(--foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "2px solid var(--ink)", background: "var(--card)", color: "var(--foreground)", fontFamily: "monospace", fontSize: 12 }} />
              <Bar dataKey="trajets" fill="var(--primary)" stroke="var(--ink)" strokeWidth={2} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 font-mono text-[11px] uppercase text-muted-foreground">{weeklyTotal} trajets · remplissage moyen {avgTaux} % · pic jeudi 7h30</p>
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section><h2 className="font-display text-2xl font-extrabold">Vérification CNE + email</h2>
          <div className="mt-3 grid gap-3">{queue.map((v) => <div key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-ink bg-card p-4">
            <Avatar trip={{ initials: v.initials, color: "bg-avatar-2" }} /><div className="min-w-0 flex-1"><p className="font-bold">{v.name} <Tag>{v.role}</Tag></p><p className="truncate font-mono text-[11px] text-muted-foreground">{v.cne} · {v.email} · {v.filiere}</p></div>
            <div className="flex gap-2"><Button className="h-9 px-3" onClick={() => { setQueue((q) => q.filter((x) => x.id !== v.id)); act(`${v.name} validé·e`); }}><Check size={15} />Valider</Button><Button variant="paper" className="h-9 px-3" aria-label={`Refuser ${v.name}`} onClick={() => { setQueue((q) => q.filter((x) => x.id !== v.id)); act(`${v.name} refusé·e`); }}><X size={15} /></Button></div>
          </div>)}{!queue.length && <p className="rounded-lg border-2 border-dashed border-ink p-6 text-center font-bold">File vide. Beau travail.</p>}</div>
        </section>
        <section><h2 className="font-display text-2xl font-extrabold">Recharges cash</h2>
          <div className="mt-3 grid gap-3">{recharges.map((r) => <div key={r.id} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-card p-4"><Coins size={18} /><div className="flex-1"><p className="font-bold">{r.name}</p><p className="font-mono text-[11px] text-muted-foreground">{r.at}</p></div><span className="font-display text-xl font-extrabold">{r.amount} DH</span><Button variant="accent" className="h-9 px-3" onClick={() => { setRecharges((x) => x.filter((y) => y.id !== r.id)); act(`${r.amount} DH crédités à ${r.name}`); }}>Créditer</Button></div>)}{!recharges.length && <p className="rounded-lg border-2 border-dashed border-ink p-6 text-center font-bold">Aucune recharge en attente.</p>}</div>
        </section>
      </div>
      <section className="mt-8"><h2 className="font-display text-2xl font-extrabold">Signalements <span className="font-mono text-base text-muted-foreground">({openReports.length} ouverts)</span></h2>
        <div className="mt-3 grid gap-3">{openReports.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-ink bg-card p-4">
          <Flag size={18} className="shrink-0 text-destructive" />
          <div className="min-w-0 flex-1"><p className="font-bold">{r.target} <Tag>{r.reason}</Tag></p><p className="text-sm text-muted-foreground">{r.details}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">Par {r.by} · {r.time}</p></div>
          <div className="flex gap-2"><Button variant="danger" className="h-9 px-3" onClick={() => closeReport(r, true)}><Ban size={14} />Suspendre</Button><Button variant="paper" className="h-9 px-3" onClick={() => closeReport(r, false)}>Classer</Button></div>
        </div>)}{!openReports.length && <p className="rounded-lg border-2 border-dashed border-ink p-6 text-center font-bold">Aucun signalement ouvert.</p>}</div>
      </section>
      <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-3"><h2 className="font-display text-2xl font-extrabold">Modération des trajets</h2>
        <label className="relative block min-w-56"><span className="sr-only">Filtrer les trajets</span><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Conducteur, quartier, plaque…" className={cn(inputClass, "h-10 pl-9")} /></label></div>
        <div className="mt-3 overflow-x-auto rounded-lg border-2 border-ink bg-card"><table className="w-full min-w-[640px] text-sm"><thead className="border-b-2 border-ink bg-muted font-mono text-[10px] uppercase"><tr>{["Conducteur", "Trajet", "Plaque", "Places", ""].map((h) => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
          <tbody>{shown.map((t) => { const off = s.hiddenTrips.includes(t.id); return <tr key={t.id} className={cn("border-b border-ink/20 last:border-0", off && "bg-destructive-soft")}><td className="p-3 font-bold">{t.driver}{off && <Tag className="ml-2">Suspendu</Tag>}</td><td className="p-3">{t.date} {t.time} · {t.from}</td><td className="p-3 font-mono">{t.plate}</td><td className="p-3">{t.total - t.seats}/{t.total}</td><td className="p-3 text-right"><button onClick={() => toggleTrip(t)} className={cn("inline-flex items-center gap-1 font-bold", off ? "text-primary" : "text-destructive")}>{off ? <><RotateCcw size={14} />Réactiver</> : <><Ban size={14} />Suspendre</>}</button></td></tr>; })}
            {!shown.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun trajet ne correspond.</td></tr>}</tbody></table></div>
      </section>
      <p className="mt-8 flex items-center gap-2 font-mono text-xs text-muted-foreground"><Navigation size={13} />Prototype : la suspension d’un trajet le retire de la découverte côté passager ; les autres actions ne modifient que cet écran.</p>
    </main>
  </div>;
}

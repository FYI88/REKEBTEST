import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Calculator, Car, ChevronDown, Clock, EyeOff, Leaf, MapPin, Moon, Play, Quote, ShieldAlert, ShieldCheck, Star, Sun, Timer, Users, Wallet } from "lucide-react";
import { driverSteps, faq, howItWorks, neighborhoods, platformStats, testimonials, trips, trustPoints } from "@/lib/demo-data";
import { FARE_DH, TAXI_PRICE_DH, formatMinutes, impactFor } from "@/lib/impact";
import { sortTrips } from "@/lib/trip-utils";
import { setStore } from "@/lib/store";
import { SeatDots, ThemeToggle } from "@/components/prototype";
import { Button, Logo, Stamp, Tag } from "@/components/ui";
import { cn } from "@/lib/utils";
import campus from "@/assets/campus-carpool.jpg";
import { SiteFooter } from "@/components/site-footer";
import { survey, surveyHighlights, surveyPercent } from "@/lib/survey-results";

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    el.classList.add("reveal-pending");
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { el.classList.remove("reveal-pending"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={cn("transition-[opacity,transform] duration-700 ease-out", className)}>{children}</div>;
}

function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);
  const target = m ? parseFloat(m[1] ?? "0") : 0;
  const decimals = m?.[1]?.includes(".") ? 1 : 0;
  useEffect(() => {
    const el = ref.current;
    if (!el || !m || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        setN(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  if (!m) return <span>{value}</span>;
  return <span ref={ref}>{n === null ? m[1] : n.toFixed(decimals)}{m[2]}</span>;
}

function SectionTitle({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return <div id={id} className="scroll-mt-24">
    <p className="font-mono text-xs font-bold uppercase text-muted-foreground">{eyebrow}</p>
    <h2 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">{title}</h2>
  </div>;
}

function Finder({ area, setArea, onOpen }: { area: string; setArea: (a: string) => void; onOpen: (path: "/app" | `/ride/${string}`) => void }) {
  const [slot, setSlot] = useState<"Matin" | "Soir">("Matin");
  const matches = useMemo(() => sortTrips(trips.filter((t) => t.slot === slot && (area === "Tous" || t.from === area)), "heure"), [slot, area]);
  return <div id="trajets" className="scroll-mt-24 overflow-hidden rounded-xl border-2 border-ink bg-card hard md:grid md:grid-cols-[minmax(0,19rem)_1fr]">
    <div className="grid content-start gap-4 border-b-2 border-ink bg-primary p-5 text-primary-foreground md:border-b-0 md:border-r-2">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase opacity-80">Trouve ton départ</p>
        <p className="font-display text-2xl font-extrabold leading-tight">Quel quartier, quelle heure&nbsp;?</p>
      </div>
      <div role="group" aria-label="Créneau" className="grid grid-cols-2 gap-1 rounded-lg border-2 border-ink bg-card p-1 text-foreground">
        {(["Matin", "Soir"] as const).map((s) => <button key={s} aria-pressed={slot === s} onClick={() => setSlot(s)} className={cn("flex items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-bold", slot === s && "bg-ink text-ink-foreground")}>{s === "Matin" ? <Sun size={14} /> : <Moon size={14} />}{s === "Matin" ? "Matin 7h30" : "Soir 17h"}</button>)}
      </div>
      <label className="grid gap-1.5"><span className="font-mono text-[11px] font-bold uppercase">Quartier</span>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="h-12 rounded-md border-2 border-ink bg-card px-3 text-sm font-bold text-foreground">
          <option>Tous</option>{neighborhoods.map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <p className="font-mono text-[11px] uppercase opacity-80">{matches.length} départ{matches.length > 1 ? "s" : ""} · prix fixe 5 DH</p>
    </div>
    <div className="p-4 md:p-5">
      <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase"><span className="live-dot h-2.5 w-2.5 rounded-full bg-destructive" />Tableau des départs</p><span className="font-mono text-[11px] text-muted-foreground">{slot === "Matin" ? "vers l’ENSA" : "depuis l’ENSA"}</span></div>
      <ul className="mt-3 grid gap-2" aria-live="polite">
        {matches.slice(0, 4).map((t) => <li key={t.id}>
          <button onClick={() => onOpen(`/ride/${t.id}`)} className="press flex w-full items-center gap-3 rounded-lg border-2 border-ink bg-background p-3 text-left hard-sm">
            <span className="font-display text-3xl font-extrabold tabular-nums">{t.time}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{t.slot === "Matin" ? `${t.from} → ENSA` : `ENSA → ${t.from}`}</span><span className="block truncate font-mono text-[10px] uppercase text-muted-foreground">{t.driver} · {t.vehicle} · ★ {t.rating}</span></span>
            <span className="hidden sm:block"><SeatDots trip={t} /></span>
            <span className={cn("rounded-sm border-[1.5px] border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase", t.seats === 0 ? "bg-muted" : "bg-accent text-accent-foreground")}>{t.seats === 0 ? "Complet" : `${t.seats} libre${t.seats > 1 ? "s" : ""}`}</span>
          </button>
        </li>)}
        {matches.length === 0 && <li className="rounded-lg border-2 border-dashed border-ink p-6 text-center text-sm text-muted-foreground">Aucun départ dans ce quartier à cette heure. Essaie un autre créneau ou <button className="font-bold text-primary underline" onClick={() => setArea("Tous")}>tous les quartiers</button>.</li>}
      </ul>
      <button onClick={() => onOpen("/app")} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline">Voir tous les trajets <ArrowRight size={14} /></button>
    </div>
  </div>;
}

function Savings() {
  const [mode, setMode] = useState<"passager" | "conducteur">("passager");
  const [days, setDays] = useState(5);
  const [seats, setSeats] = useState(3);
  const ridesMonth = days * 2 * 4;
  const imp = impactFor(ridesMonth);
  const taxi = ridesMonth * TAXI_PRICE_DH;
  const rkeb = ridesMonth * FARE_DH;
  const earn = seats * FARE_DH * ridesMonth;
  const stat = (I: typeof Wallet, n: string, l: string, strong = false) => <div className={cn("rounded-lg border-2 border-ink p-4", strong ? "bg-accent text-accent-foreground" : "bg-background")}><I size={18} className={strong ? "" : "text-primary"} /><p className="mt-2 font-display text-3xl font-extrabold tabular-nums">{n}</p><p className="font-mono text-[10px] font-bold uppercase opacity-80">{l}</p></div>;
  return <div className="rounded-xl border-2 border-ink bg-card p-5 hard md:p-8">
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
      <div>
        <div role="group" aria-label="Profil" className="inline-flex rounded-full border-2 border-ink bg-background p-1">{(["passager", "conducteur"] as const).map((m) => <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-5 py-2 text-sm font-bold capitalize", mode === m && "bg-ink text-ink-foreground")}>{m}</button>)}</div>
        <label className="mt-6 block"><span className="flex items-baseline justify-between font-mono text-[11px] font-bold uppercase"><span>Jours de cours par semaine</span><span className="font-display text-2xl">{days}</span></span>
          <input type="range" min={1} max={6} value={days} onChange={(e) => setDays(+e.target.value)} className="mt-2 h-10 w-full accent-primary" /></label>
        {mode === "conducteur" && <label className="mt-2 block"><span className="flex items-baseline justify-between font-mono text-[11px] font-bold uppercase"><span>Places remplies par trajet</span><span className="font-display text-2xl">{seats}</span></span>
          <input type="range" min={1} max={4} value={seats} onChange={(e) => setSeats(+e.target.value)} className="mt-2 h-10 w-full accent-primary" /></label>}
        <p className="mt-4 text-xs text-muted-foreground">{mode === "passager" ? `Base : ${ridesMonth} trajets par mois (aller + retour, 4 semaines), comparés à un taxi à ${TAXI_PRICE_DH} DH le trajet.` : `Base : ${ridesMonth} trajets par mois, toutes les places prises à ${FARE_DH} DH. Estimation, pas une promesse.`}</p>
      </div>
      <div className="grid grid-cols-2 gap-3" aria-live="polite">
        {mode === "passager" ? <>
          {stat(Wallet, `${taxi} DH`, "en taxi / mois")}
          {stat(Wallet, `${rkeb} DH`, "avec Rkeb / mois")}
          {stat(Leaf, `${imp.savedDh} DH`, "économisés / mois", true)}
          {stat(Timer, formatMinutes(imp.minutes), "gagnées / mois")}
        </> : <>
          {stat(Wallet, `${earn} DH`, "gagnés / mois", true)}
          {stat(Star, `${seats * 10 * ridesMonth}`, "éco-points / mois")}
          {stat(Users, `${seats * ridesMonth}`, "passagers aidés")}
          {stat(Leaf, `${imp.co2Kg} kg`, "CO₂ évités (collectif)")}
        </>}
      </div>
    </div>
  </div>;
}

export function Landing() {
  const nav = useNavigate();
  const [area, setArea] = useState("Tous");
  const [role, setRole] = useState<"passager" | "conducteur">("passager");
  const ticker = ["5 DH le trajet", "Vérifié CNE + @etu.uae.ac.ma", "Réservation la veille", "Voiture ou moto", "Profs et personnel bienvenus", "Bouton SOS", "Cotisation essence"];
  const tryDemo = () => { setStore(() => ({ demoMode: true })); nav({ to: "/app" }); };
  const open = (path: "/app" | `/ride/${string}`) => {
    setStore(() => ({ demoMode: true }));
    if (path === "/app") nav({ to: "/app" });
    else nav({ to: "/ride/$rideId", params: { rideId: path.slice(6) } });
  };
  const pickArea = (n: string) => {
    setArea(n);
    document.getElementById("trajets")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const coverage = neighborhoods.map((n) => ({ n, count: trips.filter((t) => t.from === n).length }));
  const steps = role === "passager" ? howItWorks : driverSteps;
  const navLink = "hidden font-mono text-[11px] font-bold uppercase text-muted-foreground hover:text-foreground md:block";
  return <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2">
        <Link to="/"><Logo /></Link>
        <nav aria-label="Sections" className="flex items-center gap-6"><a href="#trajets" className={navLink}>Trajets</a><a href="#comment" className={navLink}>Comment ça marche</a><a href="#economies" className={navLink}>Économies</a><a href="#confiance" className={navLink}>Confiance</a><a href="#faq" className={navLink}>FAQ</a></nav>
        <div className="flex items-center gap-2"><ThemeToggle /><Link to="/login"><Button variant="paper" className="h-10">Connexion</Button></Link><Link to="/signup" className="hidden sm:block"><Button variant="ink" className="h-10">Rejoindre</Button></Link></div>
      </div>
    </header>
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="reveal">
          <Tag className="bg-primary-soft">Réservé à la communauté ENSA Tanger</Tag>
          <h1 className="mt-5 font-display text-[clamp(3rem,7.5vw,6rem)] font-extrabold leading-[.85] tracking-tight">Réveil à 6h,<br />arrivée à 8h&nbsp;?<br /><span className="relative inline-block text-primary">C’est fini.<svg aria-hidden="true" className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 14" fill="none"><path d="M3 10C80 2 200 2 297 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg></span></h1>
          <p className="mt-7 max-w-lg text-lg">Ceux qui ont une voiture ou une moto partent déjà vers l’ENSA. Remplis leurs places vides, ils remplissent leur réservoir. <b>Tout le monde gagne une heure.</b></p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/signup"><Button className="h-14 px-7 text-base">Créer mon compte <ArrowRight size={18} /></Button></Link><Button variant="paper" className="h-14 px-7 text-base" onClick={tryDemo}><Play size={16} />Essayer sans compte</Button></div>
          <ul className="mt-6 flex flex-wrap gap-2">{[[BadgeCheck, "Membres vérifiés"], [Wallet, "Sans carte bancaire"], [ShieldCheck, "SOS intégré"]].map(([I, l]) => { const Icon = I as typeof BadgeCheck; return <li key={l as string}><Tag><Icon size={11} />{l as string}</Tag></li>; })}</ul>
        </div>
        <div className="reveal relative" style={{ animationDelay: "120ms" }}>
          <div className="rotate-2 overflow-hidden rounded-xl border-2 border-ink hard"><img src={campus} alt="Étudiants qui partagent une voiture vers le campus" width={1536} height={1024} className="aspect-[4/3] w-full object-cover" /></div>
          <Stamp className="absolute -bottom-8 -left-4 h-32 w-32 text-4xl sm:-left-8">5 DH<span className="block font-mono text-[9px] tracking-widest">PRIX FIXE</span></Stamp>
          <div className="absolute -right-2 -top-6 -rotate-3 rounded-lg border-2 border-ink bg-card p-3 hard-sm">
            <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Demain · 07:25</p>
            <p className="font-display text-lg font-extrabold">Boukhalef → ENSA</p><SeatDots trip={trips[0]} />
          </div>
          <div className="absolute -bottom-5 right-2 flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1.5 hard-sm"><Star size={14} className="fill-accent" /><span className="font-mono text-[11px] font-bold">4.8 · 312 membres</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-6"><Reveal><Finder area={area} setArea={setArea} onOpen={open} /></Reveal></section>

      <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-ink-foreground" aria-hidden="true"><div className="marquee flex w-max gap-10 font-display text-xl font-bold">{[...ticker, ...ticker].map((t, i) => <span key={i} className="flex items-center gap-10">{t}<span className="text-accent">✺</span></span>)}</div></div>

      <section aria-label="Chiffres clés" className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 pt-12 md:grid-cols-4">
        {platformStats.map((st, i) => <Reveal key={st.label} delay={i * 80}><div className="rounded-xl border-2 border-ink bg-card p-5 text-center hard-sm"><p className="font-display text-4xl font-extrabold text-primary"><CountUp value={st.value} /></p><p className="mt-1 font-mono text-[10px] font-bold uppercase text-muted-foreground">{st.label}</p></div></Reveal>)}
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-20">
        <SectionTitle eyebrow={`Notre questionnaire · ${survey.responses.toLocaleString("fr-FR")} réponses`} title="Pourquoi Rkeb existe." />
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Résultats déclarés dans le questionnaire fourni au projet. Une intention d’essayer, pas encore un nombre d’utilisateurs.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{surveyHighlights.map((item) => <article key={item.label} className="rounded-xl border-2 border-ink bg-primary-soft p-5"><p className="font-display text-4xl font-extrabold">{surveyPercent(item.count)}</p><h3 className="mt-2 text-sm font-bold">{item.label}</h3><p className="mt-2 font-mono text-[10px] text-muted-foreground">{item.count}/1 000 · {item.detail}</p></article>)}</div>
        <p className="mt-3 text-xs text-muted-foreground">26,2 % répondent négativement au covoiturage. Collecte et représentativité non documentées ; ces chiffres décrivent uniquement l’export reçu.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Bus bondés et retards", "Manque de transport à certaines heures, arriver à l'heure devient un exploit."],
            ["02", "Horaires décalés", "Les bus ne suivent pas l'emploi du temps, les correspondances compliquent tout."],
            ["03", "Trop cher, zéro info", "Budget étudiant serré, aucune info temps réel, des heures d'attente."],
            ["04", "Stress et fatigue", "L'accumulation au quotidien épuise avant même le premier cours."],
          ].map(([n, t, d], i) => <Reveal key={n} delay={i * 80}><article className="h-full rounded-xl border-2 border-ink bg-card p-5 hard-sm">
            <span className="font-mono text-sm font-bold text-primary">{n}</span>
            <h3 className="mt-3 font-display text-xl font-extrabold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </article></Reveal>)}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 md:grid-cols-3">
        {[
          ["01", "Sans voiture", "Tu arrives à l’heure, reposé·e, pour le prix d’un café. Plus de bus bondé ni de taxi à 30 DH.", Users],
          ["02", "Avec voiture ou moto", "Tu fais déjà le trajet. Des places pleines = essence remboursée + éco-points + classement des top helpers.", Car],
          ["03", "En confiance", "Chaque membre est validé par l’admin : CNE, email institutionnel et carte étudiante. Notation, partage live et SOS.", ShieldCheck],
        ].map(([n, t, d, I]) => { const Icon = I as typeof Car; return <article key={n as string} className="rounded-xl border-2 border-ink bg-card p-6 hard-sm odd:-rotate-1 even:rotate-1">
          <div className="flex items-center justify-between"><span className="font-mono text-sm font-bold text-primary">{n as string}</span><Icon /></div>
          <h3 className="mt-8 font-display text-2xl font-extrabold">{t as string}</h3><p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
        </article>; })}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <SectionTitle id="comment" eyebrow="En 4 étapes" title="Comment ça marche." />
        <div role="group" aria-label="Profil" className="mt-5 inline-flex rounded-full border-2 border-ink bg-card p-1">{(["passager", "conducteur"] as const).map((r) => <button key={r} aria-pressed={role === r} onClick={() => setRole(r)} className={cn("rounded-full px-5 py-2 text-sm font-bold", role === r && "bg-ink text-ink-foreground")}>{r === "passager" ? "Je cherche une place" : "Je conduis"}</button>)}</div>
        <ol className="relative mt-6 grid gap-4 md:grid-cols-4">
          <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-[2.6rem] hidden border-t-2 border-dashed border-ink md:block" />
          {steps.map((st) => <li key={role + st.n} className="reveal relative rounded-xl border-2 border-ink bg-card p-5 hard-sm">
            <span className="relative grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-accent font-display text-lg font-extrabold text-accent-foreground">{st.n}</span>
            <h3 className="mt-4 font-display text-xl font-extrabold">{st.title}</h3><p className="mt-1 text-sm text-muted-foreground">{st.body}</p>
          </li>)}
        </ol>
        <div className="mt-6"><Link to="/signup"><Button variant="ink">{role === "passager" ? "Réserver ma première place" : "Publier mon premier trajet"} <ArrowRight size={16} /></Button></Link></div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <SectionTitle id="economies" eyebrow="Calcule ton gain" title="Combien tu économises." />
        <div className="mt-6"><Reveal><Savings /></Reveal></div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 rounded-xl border-2 border-ink bg-primary p-7 text-primary-foreground hard md:grid-cols-4 md:p-10">
          <h2 className="font-display text-4xl font-extrabold leading-none md:col-span-1">Trois façons de payer.</h2>
          {[["Wallet DH", "Débit auto de 5 DH, recharge cash au guichet. Remboursé si le conducteur annule."], ["Carte de points", "Tu conduis souvent ? Tes points paient tes trajets passagers."], ["Cotisation essence", "Le groupe se partage le plein de la semaine. Encore moins cher."]].map(([t, d]) =>
            <div key={t} className="rounded-lg border-2 border-ink bg-card p-4 text-foreground"><p className="font-display text-xl font-extrabold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <SectionTitle id="confiance" eyebrow="Sécurité d’abord" title="Une communauté fermée, vérifiée." />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">{trustPoints.map((p, i) => { const I = [BadgeCheck, EyeOff, ShieldAlert, Star][i] ?? BadgeCheck; return <Reveal key={p.title} delay={i * 70}><article className="h-full rounded-xl border-2 border-ink bg-card p-5 hard-sm"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-primary-soft"><I size={18} /></span><h3 className="mt-3 font-display text-xl font-extrabold">{p.title}</h3><p className="mt-1 text-sm text-muted-foreground">{p.body}</p></article></Reveal>; })}</div>
          <Reveal><div className="relative h-full rounded-xl border-2 border-ink bg-ink p-6 text-ink-foreground hard">
            <p className="font-mono text-[11px] font-bold uppercase text-ink-muted">Ton parcours de vérification</p>
            <ol className="mt-4 grid gap-4">{[["Email ENSA confirmé", "@etu.uae.ac.ma ou @uae.ac.ma"], ["CNE ou matricule contrôlé", "validé par l’administration"], ["Carte étudiante vérifiée", "sous 24 h"], ["Badge « Profil vérifié »", "visible sur ta fiche"]].map(([t, d], i) => <li key={t} className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink-foreground font-mono text-xs font-bold">{i + 1}</span><span><b className="block text-sm">{t}</b><span className="text-xs text-ink-muted">{d}</span></span></li>)}</ol>
            <Stamp className="absolute -right-3 -top-4 h-20 w-20 text-sm">Vérifié<br />ENSA</Stamp>
          </div></Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <SectionTitle eyebrow="Couverture" title="Ton quartier est desservi ?" />
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Touche un quartier pour voir ses départs dans le tableau ci-dessus.</p>
        <ul className="mt-5 flex flex-wrap gap-2">{coverage.map(({ n, count }) => <li key={n}><button onClick={() => pickArea(n)} aria-pressed={area === n} className={cn("press inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold hard-sm", area === n ? "bg-ink text-ink-foreground" : "bg-card")}><MapPin size={14} />{n}<span className="rounded-full border-[1.5px] border-current px-1.5 font-mono text-[10px]">{count}</span></button></li>)}</ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-display text-4xl font-extrabold md:text-5xl">Ils roulent déjà ensemble.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => <Reveal key={t.name} delay={i * 80}><figure className="h-full rounded-xl border-2 border-ink bg-card p-5 hard-sm">
            <Quote size={20} className="text-primary" />
            <blockquote className="mt-3 text-sm">{t.text}</blockquote>
            <figcaption className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-avatar-1 font-display text-xs">{t.name.slice(0, 2).toUpperCase()}</span><span>{t.name} <span className="text-muted-foreground">· {t.who}</span></span></figcaption>
          </figure></Reveal>)}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <SectionTitle id="faq" eyebrow="Tu hésites encore ?" title="Questions fréquentes." />
        <Link to="/help" className="mt-3 inline-block text-sm font-bold text-primary underline">Toutes les questions et l’aide</Link>
        <div className="mt-6 grid gap-3">
          {faq.map((f) => <details key={f.q} className="group rounded-lg border-2 border-ink bg-card p-4 open:hard-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-extrabold">{f.q}<ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" /></summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </details>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-xl border-2 border-ink bg-ink p-8 text-center text-ink-foreground hard md:p-14">
          <Clock aria-hidden="true" className="absolute -left-6 -top-6 h-32 w-32 text-ink-foreground opacity-10" />
          <h2 className="relative font-display text-4xl font-extrabold md:text-6xl">Prochain départ : demain, 07:25.</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-ink-muted">Rejoins la ligne ou explore d’abord l’app avec le profil de démo, sans compte.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3"><Link to="/signup"><Button variant="accent" className="h-14 px-7 text-base">Créer mon compte</Button></Link><Button variant="paper" className="h-14 px-7 text-base" onClick={tryDemo}>Mode démo</Button></div>
        </div>
      </section>
    </main>

    <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-xl border-2 border-ink bg-card p-2 hard md:hidden">
      <Button className="h-11 flex-1" onClick={tryDemo}><Play size={15} />Essayer</Button>
      <Link to="/signup" className="flex-1"><Button variant="ink" className="h-11 w-full">Rejoindre</Button></Link>
    </div>

    <SiteFooter />
  </div>;
}

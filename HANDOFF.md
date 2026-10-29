# HANDOFF — Rkeb ENSA Carpool

> Living doc. Updated every work session. Newest entry at the bottom of § Session log.

## Demo-day checkpoint — footer, information pages and Android

- Branding update `v0.1.0-demo.2`: launcher icons (all five densities, legacy/round/adaptive) and splash images use `public/rkeb-logo.png` on cream. Regenerate with `scripts/android-branding.py` (Pillow). Version code 2; Android build and signature verification passed. Native launcher appearance still needs a phone check.

- Release checkpoint: `v0.1.0-demo.1` is the requested Android prerelease tag. Survey export `poolrkeb.json` contains 1,000 rows: 738 positive intent, 791 crowding at least sometimes, 719 costly transport, 523 strong stress/fatigue. Aggregates are in `src/lib/survey-results.ts`, full methodology in `docs/SURVEY-FINDINGS.md`, reproducible analysis in `scripts/survey-summary.mjs`. Source JSON is not committed. Landing and APK include these results; physical-phone testing remains pending.

- Shared footer: `src/components/site-footer.tsx`, used by landing and informational pages; developer credit Chetaine Younes, GitHub project link, ENSA academic context, Afriquia explicitly a potential partnership (no agreement/discount confirmed).
- New `/about`, `/help`, `/safety`, `/contact` routes in `src/components/information.tsx`; FAQ search/categories, safety explanation, contact copies feedback for GitHub (no server submission). Profile links to these pages.
- Capacitor Android wrapper (`ma.rkeb.demo`): standalone client entry `src/mobile.tsx`, `mobile/`, `vite.mobile.config.ts`, `capacitor.config.ts`, native `android/` project. Build uses bundled assets, no hosted site required.
- APK built successfully: `android/app/build/outputs/apk/debug/app-debug.apk`. Uses a complete portable Microsoft JDK 21 and Android SDK 36 under the pre-approved temporary opencode folder. Gradle needed `--max-workers=1` and `-Xmx768m -XX:ActiveProcessorCount=2` after a daemon crash with default parallelism.
- Installation/rebuild instructions and phone acceptance steps: `docs/ANDROID-DEMO.md`. Typecheck and 14 tests passed; web/mobile builds passed; mobile client routes rendered at 390px without page errors. Physical-device APK check is still required before tomorrow's presentation.

## 1. What this is

Clickable frontend prototype of a student carpool app for ENSA Tanger.
Fixed price 5 DH, ENSA-only verified community, 3 roles (passager / conducteur / admin).
Backed by Supabase (auth + trips read); demo data stays the fallback so the demo never breaks.

- Repo: https://github.com/FYI88/RKEB (`main`)
- Stack: TanStack Start, React 19, Tailwind CSS v4, Vite, recharts, @tanstack/react-query, @supabase/supabase-js, Leaflet (not yet)
- Design language: "Billet de Tanger" — cream paper, ink, petit-taxi teal, saffron stamps. Thème « ENSA » institutionnel = **opt-in** (toggle), jamais par défaut

## 2. Run it

```sh
npm install
npm run dev      # http://localhost:8080
npm run test     # vitest
npm run lint     # eslint
npm run build    # production build
```

Demo account: Amine Benali (GI2, wallet 35 DH). Admin: `/admin` (any ADM id/pass).

### Supabase (Phase 3)
1. `.env` (copié de `.env.example`) → `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. Jamais de clé secrète ici.
2. SQL Editor : `supabase/schema.sql` puis `supabase/seed.sql` (faits).
3. Base déjà créée → exécuter `supabase/migration-auth.sql` (exception email admin + trigger profil).
4. Après la 1ʳᵉ inscription du compte admin → `supabase/admin.sql` (le passe admin + vérifié).
5. Auth : `/login` → onglet **Code email** (OTP) ou **Mot de passe**, ou bouton **Mode démo** (Amine, zéro backend).
   Conseil démo : dans Supabase → Authentication → Email, désactiver « Confirm email » pour un signup mot de passe instantané.

## 3. Map of the code

| Path | Role — touch this when… |
|---|---|
| `src/lib/demo-data.ts` | **All demo content lives here** (trips, drivers, transactions, leaderboard, messages). New content goes here, nowhere else |
| `src/lib/store.ts` | Global client state (`setStore`/`useStore`: role, balance, points, bookings, cotisation). The seam for the future Supabase swap |
| `src/components/ui.tsx` | Shared primitives (Button, Tag, Logo, Modal, Stamp). Reuse, don't duplicate |
| `src/components/prototype.tsx` | AppShell, TripCard (shared ticket style), Dashboard, OfferRide |
| `src/components/screens.tsx` | Full screens: Landing, Auth, RideDetail, Trips, Wallet, Chat, Profile, Admin |
| `src/routes/` | One TanStack route per screen (thin wrappers) |
| `src/styles.css` | Design tokens (`:root` OKLCH colors) + utilities + bloc opt-in `.theme-ensa` (supprimable seul, sans toucher à Tanger) |

## 4. Roadmap

Goal: class demo first, architected so it can become a real app later.

- [x] Baseline pushed untouched (`85054a0`)
- [x] **Phase 0 — Contrast + color discipline**: primary `0.56→0.52` (3.98→4.66), white-on-primary (4.28→5.01), destructive `0.58→0.54` (4.27→5.06) — all ≥4.5 AA now, verified by script. Rule: teal = actions, saffron = money/urgency, green = confirmations
- [x] **Phase 1 — Demo-impact pack** (`661fba1`, `3dbeb8a`, `d3acb6f`, `2566d97`)
  - [x] Notifications panel (bell in AppShell header now opens dropdown, dot clears on "tout marquer comme lu"; data in `demo-data.ts`)
  - [x] Admin chart (recharts BarChart Lun–Ven under stat cards, "Trajets cette semaine" computed = 148; recharts no longer unused)
  - [x] Reviews on ride detail ("Ils en parlent", data keyed by trip id, hidden when none)
  - [x] Landing "Pourquoi Rkeb existe" strip (4 questionnaire problems between ticker and 3-cards)
- Verification status: `tsc` clean, `npm run test` green (1/1), `npm run build` OK, all 7 routes 200 on :8080. `npm run lint`: 483 prettier-only errors (433 pre-existing + 50 from new lines written in the file's existing dense style — zero non-prettier errors). Full-repo `prettier --write` deliberately NOT run to keep diffs reviewable.
- [x] **Phase 2 — Demo hardening** (`17f29d9` + demo script)
  - [x] localStorage persistence (`rkeb-demo-state-v1`, validated load, SSR-safe) — refresh no longer wipes bookings/wallet/role
  - [x] "Recommencer la démo" reset button on `/profile` (restores Amine 35 DH seed)
  - [x] `DEMO-SCRIPT.md`: timed 5-min click path + spoken lines + breakage fallbacks
- Verification status: `tsc` clean, `npm run test` green (1/1), `npm run build` OK, all 9 routes 200 on :8080. `npm run lint`: prettier-only errors (433 pre-existing + new lines in file's dense style, zero non-prettier).
- [x] **Phase 3 — Real-app runway**
  - [x] 3.0 Setup: `@supabase/supabase-js` installé, `.env` + `.env.example`, `src/lib/supabase.ts` (client + warning si env absentes)
  - [x] 3.1 Data: `supabase/schema.sql` (7 tables, RLS, fonction `is_admin()` security definer, trigger anti auto-promotion, bucket `card-photos` privé) + `supabase/seed.sql` (8 trajets démo, dates relatives)
  - [x] 3.2a Côté étudiant : `schema.sql` + `seed.sql` exécutés, doublons nettoyés (8 trajets en base), réponses données — login = **code email + mot de passe**, admin = **yvnnsart@gmail.com**, maps = **Leaflet/OSM** (Google Maps écarté : clé + facturation).
  - [x] 3.2b Auth réelle + mode démo (`src/lib/auth.ts` : OTP email, mot de passe, profil, `useIdentity` ; écran Auth à onglets + bouton « Mode démo » ; trigger `handle_new_user` ; garde `/app` dans `AppShell` ; identité réelle dans AppShell/Profil). ⚠️ ÉTUDIANT : exécuter `supabase/migration-auth.sql`, puis `supabase/admin.sql` après sa 1ʳᵉ inscription.
  - [ ] 3.3 Migration écrans (un par un, `demo-data.ts` gardé jusqu'au bout) : trips → bookings → wallet → chat realtime → admin
  - [x] 3.3a Trips lecture (`src/lib/db.ts` : fetch + mapper + `useTrips(enabled)`, fallback démo si erreur/vide ; Dashboard branché — trajets DB **uniquement si session réelle**, sinon démo pour garder les ids cohérents ; badge « Nouveau » si pas d'avis ; contrainte `trips_no_doublon`)
  - [x] 3.3b Ride detail + Trips + Wallet en mode réel : règle = **session ⇒ DB, pas de session ⇒ démo** (`db.ts` : `fetchTrip`/`useTrip` + avis réels (`ratings` + auteur), `fetchMyBookings`/`useMyBookings` (billet → trajet join, `past` = date dépassée), `fetchMyWallet`/`useMyWallet` (ledger = somme des `wallet_transactions`), écritures `bookSeat` (booking + débit 5 DH si wallet), `cancelBooking` (annulé + remboursement +5), `rateTrip` (ligne `ratings`), `requestRecharge`). UI : RideDetail splité wrapper (queries + états chargement/introuvable — un UUID inconnu ne retombe plus sur Yasmine) + Body (réservation async avec erreurs RLS affichées), TripsPage lignes unifiées (annuler/rater réels, notation aussi sur trajet passé), WalletPage solde+historique réels, pill solde du header. ⚠️ Écritures réelles non testables sans session (bloqueur `migration-auth.sql` identique) ; embeds syntaxe validés en direct contre PostgREST (200), RLS anon confirmée (0 lignes lectures, 401 écritures ratings). Limite connue : trajets seed ont `driver_id NULL` → `rateTrip` n'écrit que pour les trajets de conducteurs réels ; débit/crédit wallet écrit côté client (le trigger Postgres noté dans `schema.sql` reste la suite)
  - [ ] 3.4 Leaflet pickups + PWA manifest, puis Vercel deploy
  - [x] 3.5 **Thème ENSA opt-in** (toggle palette dans le header + rangée « Thème » sur `/profile` ; bloc `.theme-ensa` dans `styles.css` ; script pre-paint anti-flash ; défaut Tanger intact ; en mode ENSA seulement, avatars recolorés — violet → bleu poussière)

## 5. Rules

- New demo content → `src/lib/demo-data.ts` only (AGENTS.md).
- Ride previews → shared `TripCard`, keep one visual language.
- Small working commits on `main`, never rewrite/force-push history.
- Verify every change: `npm run lint` + click-through on `localhost:8080`.

## 6. Session log

- **2026-10-16 — Baseline**: explored prototype, `npm install`, dev server on :8080 (all routes 200), contrast audit (teal 3.98 / red 4.27 / white-on-teal 4.28 — borderline), wrote plan. `git init`, 91 files committed as `85054a0`, pushed untouched to FYI88/RKEB.
- **2026-10-16 — Phase 0**: created HANDOFF.md, darkened primary + destructive tokens (all text pairs ≥4.5 AA, script-verified), `npm run test` green. Note: `npm run lint` has 433 pre-existing prettier errors in generated files (none in `styles.css`, none introduced by us) — left untouched to keep diffs clean.
- **2026-10-16 — Phase 1**: 4 commits (notifications, admin chart, reviews, landing strip). tsc clean, tests green, build OK, smoke-tested 7 routes. Pushed to FYI88/RKEB. Next: Phase 2 (localStorage persistence + Reset démo, 5-min demo script doc).
- **2026-10-16 — Phase 2**: persistence + reset (`17f29d9`), `DEMO-SCRIPT.md`. 9 routes 200, tests green, build OK. Pushed. Next optional: Phase 3 Supabase runway.
- **2026-10-16 — Phase 3.0/3.1**: supabase-js installé, `.env` local (ignoré par git), client `src/lib/supabase.ts`, `supabase/schema.sql` + `seed.sql` écrits. tsc clean, tests green. En attente : exécution SQL côté étudiant + 3 réponses (login, admin, maps).
- **2026-10-16 — Phase 3.3a**: `/app` lit Supabase (`db.ts` + react-query, fallback démo). REST anon vérifié (RLS ok) mais seed doublé (16 lignes — seed exécuté 2×) → contrainte + `on conflict`, étudiant doit nettoyer + re-seed. Ride detail/bookings pas encore migrés : avis masqués sur base fraîche (normal).
- **2026-10-17 — Phase 3.2**: auth réelle (code email + mot de passe) **et** bouton « Mode démo ». `src/lib/auth.ts` (store de session SSR-safe, profil, `useIdentity`, erreurs en français), écran Auth réécrit (onglets, états busy/erreur, flux signup), garde de route dans `AppShell`, identité réelle dans AppShell/Profil. SQL : `handle_new_user` (rôle borné passager/conducteur, jamais admin), `supabase/migration-auth.sql`, `supabase/admin.sql`. Correctif : trajets DB chargés **uniquement** en session réelle (sinon démo, pour des ids cohérents). Vérif : tsc clean, tests 1/1, build OK, 5 routes 200.
- **2026-10-18 — Thème ENSA (toggle)**: audit couleurs du site ENSA (`#357cbd` bleu 3.98 ❌ AA, `#e79d19` ambre 2.06 ❌, `#5cba3c` vert 2.26 ❌, `#093f72` navy 9.66 ✅) → variante assainie : primaire `#2a6aa8` (5.18 lien / 5.18 blanc dessus), ink navy `#102840`, ambre `#e79d19` (texte navy 6.60), vert assombri `#2f7d20` (4.74). Contraste vérifié par script : 20 paires → 19 AA-OK (1 paire fantôme `text-destructive` sur `destructive-soft` jamais rendue dans l'UI ; paires réelles toutes OK, dont erreur navy sur `destructive-soft` 11.50). Implémentation additive : bloc `.theme-ensa` (21 tokens, `styles.css`), `theme: "tanger" | "ensa"` dans le store (défaut **tanger**), script pre-paint anti-flash dans `__root.tsx` + `ThemeApplier`, `ThemeToggle` (icône palette) dans le header + rangée Thème sur `/profile`. Vérif : tsc clean, tests 1/1, build OK, 10 routes 200, script et tokens présents dans le HTML/CSS servis. Rollback = supprimer le bloc CSS + le composant + le champ store.
- **2026-10-18 — Icône d'app (pas le logo)**: `RKEB.png` fourni par l'étudiant devient l'**icône d'app**, pas le logo d'en-tête. Traitement Python/PIL : fond noir → transparent (alpha par luminance + démélange), recadrage serré → `public/rkeb-logo.png` (851×313, ~190 Ko, servi pour futur manifest PWA). Déclinée en icônes : `public/favicon.ico` (16/24/32/48 px sur fond noir, 4 Ko) + `public/apple-touch-icon.png` (180², 10 Ko) — liens `<head>` ajoutés dans `__root.tsx`. Le logo d'en-tête a été restauré à sa version d'origine (cercle safran « 5 » + « Rkeb. ») : le PNG n'apparaît plus dans aucun composant. Vérif : tsc clean, tests 1/1, build OK, `/`, `/login`, `/admin` 200, les deux icônes servies 200, `apple-touch-icon` présent dans le head SSR, `rkeb-logo.png` absent du HTML des pages.
- **2026-10-18 — Kit de prompts logo**: `LOGO-PROMPTS.md` créé — 10 variantes du prompt maître RKEB (icône app, favicon monogramme, lockup horizontal, splash vertical, thème Tanger crème, variante teal, thème ENSA, admin navy, ticket 5 DH, preview 16:9) + tips outils (Ideogram/Recraft pour le texte), ratios d'aspect et negative prompt global.
- **2026-10-18 — Nouveau logo d'en-tête**: `Logo RKEB au swoosh orange.png` (R majuscules + swoosh orange en zigzag, déjà transparent) devient le **logo de l'app**. Traitement : simple recadrage alpha → `public/rkeb-logo.png` (900×880, 104 Ko) + variante `invert` (lettres noires → blanches, orange conservé) → `public/rkeb-logo-invert.png` (67 Ko) pour les fonds sombres. Ancien `rkeb-logo.png` (source de l'icône d'app) renommé `rkeb-app-icon.png` — favicon/apple-touch-icon inchangés. `Logo` dans `ui.tsx` : `<img h-[60px]>` + sous-titre mono « ENSA » (10px, « Carpool » retiré), `invert` sélectionne la variante blanche (panneau teal `/login`, header admin). Ancien logo cercle « 5 » retiré. Vérif : tsc clean, tests 1/1, build OK, 7 routes 200, les 2 PNG servis 200, bon src selon la page (normal sur `/app`, invert sur `/login` et `/admin`), preuves visuelles composited sur crème et navy sans halo.
- **2026-10-18 — Phase 3.3b (lecture+écriture réelles)**: `db.ts` enrichi de `fetchTrip`/`useTrip` (détail + avis réels `ratings`→auteur via embed `profiles:from_id`), `fetchMyBookings`/`useMyBookings` (billet → trajet complet + `past` si date dépassée), `fetchMyWallet`/`useMyWallet` (solde = somme du ledger `wallet_transactions`) et écritures `bookSeat` / `cancelBooking` / `rateTrip` / `requestRecharge` (toutes sous RLS « soi-même »). Côté UI : `RideDetail` = wrapper queries (chargement + « Trajet introuvable » pour un UUID inconnu, fin du retomber sur Yasmine) + `RideDetailBody` (réservation async, erreurs DB affichées, `solde` réel, avis réels, démo = ancien code exact) ; `TripsPage` lignes unifiées session/démo (annuler → UPDATE + remboursement +5 si wallet ; rater → INSERT `ratings` + invalidation moyennes ; étoiles aussi sur trajet passé non terminé ; QR tronqué à 4 chars pour les UUID) ; `WalletPage` solde+historique réels + INSERT `recharge_requests` à la génération du code ; pill solde header = solde réel (« … » pendant le chargement). Règle partout : **session ⇒ DB, sinon démo** (aucun changement de comportement démo). Vérif : tsc clean, tests 1/1, build OK, 11 routes 200, démo intacte (ride/7 Leila, wallet 35 DH, historique, pill 35), embeds validés en direct sur PostgREST (trips+avis 200 ; bookings/wallet anon = 0 lignes RLS ; INSERT ratings anon = 401). Écritures réelles ⇒ attente du bloqueur `migration-auth.sql` + 1 compte. Suites notées : trigger ledger sur bookings (`schema.sql` NOTE), trajets seed `driver_id NULL` ⇒ pas de notation tant que les conducteurs ne publient pas en DB.
- **2026-10-29 — Review + upgrade**: supabase client no longer crashes without .env (tests were failing on a fresh clone). Design: Nuit (dark) theme, richer landing (stats, how it works, testimonials, FAQ, demo CTA), focus rings, skip link, accessible modals, French 404/error pages, toasts, manifest. Features: search/sort/favorites/free-seat filter, real driver publishing (demo store + Supabase publishTrip), live seat counts, wallet ledger in demo, balance/points validation, cancel confirmation + correct refunds, unique QR per ticket, persisted notifications and chat, separate SOS/share, impact card, admin guard + suspend/reactivate wired to discovery. Added trip-utils.ts, impact.ts, tests (10 passing).
- **2026-10-29 — Landing v2 + feature pack**: landing rebuilt in landing.tsx (live departure board, savings/earnings calculator, passenger/driver tabs, trust section, coverage chips, sticky nav, mobile CTA bar, animated counters). New prototype features in eatures.tsx + routes /requests, /groups, /driver, /track/$tripId: ride requests (simulated driver reply), groups + fuel pool (wallet-synced cotisation, now 30 DH = share of 150 DH / 5), live tracking with boarding PIN and plate check, reports + block (store-backed, admin queue with suspend/dismiss), driver dashboard with PIN validation crediting +5 DH / +10 pts. Competitor analysis in docs/COMPETITOR-ANALYSIS.md. State additions in store.ts (myRequests, acceptedRequests, joinedGroups, myGroups, reports, blocked, boarded, handledReports). Verified: tsc clean, 14 tests, build OK, 13-step headless-Chrome E2E, no horizontal overflow at 390px in Tanger/Nuit. Persisting these in Supabase is not done (demo store only).

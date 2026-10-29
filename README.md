<div align="center">

<img src="public/rkeb-logo.png" width="180" alt="Rkeb logo" />

# Rkeb — ENSA Carpool

### Same road. Same school. 5 dirhams.

Verified student carpooling between Tangier and the **ENSA Tanger** campus.
*Covoiturage étudiant vérifié · Tanger ↔ ENSA · 5 DH la place.*

![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tests](https://img.shields.io/badge/tests-10_passing-107c41?style=for-the-badge)

Built by **Chetaine Younes** · ENSA GSR1

</div>

---

## Table of contents

1. [What is Rkeb?](#what-is-rkeb)
2. [Quick start](#quick-start)
3. [Two modes: demo and real](#two-modes-demo-and-real)
4. [Feature overview](#feature-overview)
5. [Pages and their content](#pages-and-their-content)
6. [Step-by-step walkthrough (login to admin)](#step-by-step-walkthrough)
7. [Themes and design system](#themes-and-design-system)
8. [Accessibility](#accessibility)
9. [Supabase backend setup](#supabase-backend-setup)
10. [Project structure](#project-structure)
11. [Scripts](#scripts)
12. [Roadmap](#roadmap)

---

## What is Rkeb?

Students at ENSA Tanger lose hours every week to crowded buses, off-schedule lines and expensive taxis.
Meanwhile, many students, professors and staff already drive to the campus with empty seats.

**Rkeb** ("ride" in Darija) connects them:

- **Passengers** book a seat for a fixed **5 DH**, choose the pickup closest to home and get a QR boarding ticket.
- **Drivers** publish the route they already drive, fill empty seats, refill the tank and earn eco-points.
- **Admins** validate every member (CNE + institutional email) and moderate rides, so the community stays ENSA-only.

Three roles: **passenger**, **driver**, **admin**. The UI is in French.

---

## Quick start

Requires **Node.js 20+** and npm.

```bash
git clone https://github.com/FYI88/RKEBPROJECT.git
cd RKEBPROJECT
npm install
cp .env.example .env     # optional: demo mode works without any Supabase keys
npm run dev              # http://localhost:8080
```

Open <http://localhost:8080>, click **"Essayer sans compte"** (landing) or **"Entrer en mode démo (Amine)"** (login) and the whole app is clickable immediately. No account, no backend, no network.

---

## Two modes: demo and real

| | **Demo mode** | **Real mode** |
|---|---|---|
| Needs | Nothing | Supabase project + `.env` keys |
| Identity | Persona **Amine Benali** (GI2, 35 DH wallet, 120 points) | Your real Supabase account and profile |
| Data | `src/lib/demo-data.ts` + state saved in `localStorage` (`rkeb-demo-state-v1`) | Postgres tables protected by RLS |
| Reset | Profile → **Recommencer la démo** | n/a |

The rule is simple: **a Supabase session means database, no session means demo.** The app never breaks if the backend is missing.

---

## Feature overview

### For passengers
- **Trip discovery** with free-text search (driver, neighborhood, pickup, car), sort (time / free seats / best rating), filters (morning 07:30 or evening 17:00 slot, car or motorbike, neighborhood, free seats only, favorites) and a **Last minute** strip.
- **Favorites**: heart a ride card to keep it handy and filter on it.
- **Ride detail**: driver profile with verified badge, car, plate, vibe, reviews, multi-pickup route (with estimated time at each pickup), share-trip link and **SOS**.
- **Booking** with three payment methods (Wallet 5 DH, 50-point card, weekly fuel pool), with balance/points validation and live seat count.
- **Tickets**: upcoming / history tabs, unique QR boarding code per ticket, cancellation with confirmation and automatic refund, star rating of the driver.
- **Wallet**: balance, cash top-up request (BDE desk, admin validates), points card with progress to the next free ride, fuel-pool subscription, full transaction history that reflects every booking and refund.
- **Trip chat**: persistent per-ride conversation, quick replies, phone number hidden (the demo driver answers automatically).
- **Impact card** on the profile: estimated DH saved vs taxi, CO₂ avoided and time gained.

### For drivers
- **Publish a ride**: slot, neighborhood, date, time, vehicle (car/motorbike), seats, optional car model and plate, multiple pickups, recurring and last-minute options. In demo mode it appears instantly in discovery; with a real session it is inserted in Supabase.
- **My published rides** list with removal (demo mode).
- Earn 5 DH + 10 eco-points per seat filled; **Top helpers** leaderboard.

### For admins
- **Control tower** (`/admin`): KPIs, weekly rides chart, CNE + email verification queue, cash top-up approvals, ride moderation with search.
- **Suspending a ride removes it from passenger discovery** (and can be reversed).
- Access guard: real admins or demo mode only.

### Platform
- Three themes: **Tanger** (default), **ENSA** (institutional blue/amber), **Nuit** (dark), persisted and applied before first paint (no flash).
- Persistent notifications (unread counter, mark all as read).
- Toast feedback for every important action.
- Installable web app manifest, French 404 and error pages, per-route page titles.
- Runs without Supabase keys (the client falls back safely).

---

## Pages and their content

| Route | Page | What is on it |
|---|---|---|
| `/` | **Landing** | Hero with "Essayer sans compte" demo button, key figures (members, weekly rides, price, rating), the four real problems from the student survey, three audiences (no car / car or bike / trust), **How it works** in four steps, the three payment methods, testimonials, FAQ accordion, final call to action, footer links. Theme toggle in the header. |
| `/login` | **Login** | Two tabs: **Mot de passe** and **Code email** (6-digit one-time code), show/hide password, friendly French errors, **demo mode** button, link to signup. |
| `/signup` | **Signup** | Full name, institutional email (`@etu.uae.ac.ma` / `@uae.ac.ma` only), password (6+ chars), CNE or staff ID, passenger/driver choice. After signup a "Dossier envoyé" screen explains the admin validation. |
| `/app` | **Discover** (passenger) or **Offer a ride** (driver) | Greeting, passenger/driver switch, "book the night before" banner, Last-minute strip, search + sort + filters, ticket-style trip cards with seat dots, price stamp and heart button. In driver mode: the publish form and the list of your rides. |
| `/ride/$rideId` | **Ride detail** | Date, departure → arrival, route map with numbered pickups, pickup picker, SOS and share buttons, driver card (rating, trips, car, plate, vibe, chat link), reviews, payment picker, **Réserver ma place**. |
| `/trips` | **My tickets** | Tabs *À venir* and *Historique*, each ticket with pickup, payment tag, QR boarding code, cancel (with confirmation) and star rating. |
| `/wallet` | **Wallet** | Balance and "≈ N trips", cash top-up modal (20 / 50 / 100 DH → code to show at the BDE desk), points card with progress bar, fuel pool, monthly subscription (coming soon), transaction history. |
| `/chat/$tripId` | **Trip chat** | Driver header with masked number, message log, quick replies, text input. |
| `/profile` | **Profile** | Identity (filière, CNE, email), ride counters, passenger/driver mode, theme picker (Tanger / ENSA / Nuit), preferred vibe, **Ton impact** card, Top helpers leaderboard, admin console link, sign out, reset demo. |
| `/admin` | **Admin console** | KPIs, weekly chart, verification queue, cash top-ups, ride moderation table with search and suspend/reactivate, action log. |

---

## Step-by-step walkthrough

### A. Fastest path: demo mode (30 seconds, no account)

1. Run `npm run dev` and open <http://localhost:8080>.
2. On the landing page click **Essayer sans compte**. (Alternative: go to `/login` and click **Entrer en mode démo (Amine)**.)
3. You land on `/app` as **Amine Benali** with 35 DH and 120 points.
4. Continue with [section C](#c-using-the-app-passenger).

### B. Real account (needs Supabase, see [setup](#supabase-backend-setup))

**Create an account**

1. Open `/signup` (button **Rejoindre** on the landing page).
2. Fill in **Nom complet**, **Email institutionnel** (must end with `@etu.uae.ac.ma` or `@uae.ac.ma`), **Mot de passe** (6+ characters, use the eye icon to check it), **CNE ou matricule** and choose **passager** or **conducteur**.
3. Click **Créer mon compte**.
4. If email confirmation is enabled in Supabase, you see **Dossier envoyé**: confirm your email, then the admin checks your CNE and student card (within 24h). Click **Explorer en attendant** to browse in demo mode meanwhile. If confirmation is disabled you are signed in right away.

**Log in**

1. Open `/login`.
2. Option 1, **Mot de passe** tab: enter email + password, click **Entrer**.
3. Option 2, **Code email** tab: enter your email, click **Recevoir un code**, type the 6-digit code received (check spam), click **Valider le code**. Use **Changer d'email** if you mistyped.
4. Regular users are redirected to `/app`; accounts with the `admin` role go to `/admin`.

### C. Using the app (passenger)

1. **Find a ride** on `/app`:
   - Pick **Matin 7h30** (to ENSA) or **Soir 17h** (from ENSA).
   - Type in the search box (driver, neighborhood, pickup, car), choose a sort order, filter by **Voiture / Moto**, **Places libres**, neighborhood or **Favoris**.
   - Tap the heart on a card to favorite it. Check the **Last minute** strip for rides leaving soon.
2. **Open a ride** by tapping its card. Review the driver, car, plate, vibe, reviews and the pickups with estimated times.
3. **Choose your pickup** (the one closest to home).
4. **Choose how to pay**: Wallet (5 DH), Carte de points (50 pts) or Cotisation essence. Insufficient balance or points are flagged before booking.
5. Click **Réserver ma place**. A toast and a confirmation dialog appear; the seat counter drops by one and, with Wallet, 5 DH is debited and logged.
6. **Chat** with the driver via **Écrire (sans partager ton numéro)**. Use quick replies ("Je suis au pickup") or type a message. Your number stays hidden.
7. **Stay safe**: **Partager le trajet** copies (or shares) the ride link for a relative; **SOS** → **Alerter maintenant** notifies the emergency contact and ENSA administration (simulated in the prototype).
8. **Board**: open `/trips` → **À venir** → **QR d'embarquement** and show the code to the driver.
9. **Cancel if needed**: **Annuler** → confirm. Wallet payments are refunded (+5 DH), points are re-credited.
10. **Rate the driver**: in **Historique**, tap 1–5 stars.
11. **Manage money** on `/wallet`: **Recharger en cash** → choose 20 / 50 / 100 DH → **Générer mon code** → show the code and the cash at the BDE desk; the admin credits you. Track your points toward a free ride and join the **Cotisation essence** (15 DH/week).
12. **Check your profile** at `/profile`: ride counters, **Ton impact** (DH saved, CO₂ avoided, time gained), preferred vibe, theme.
13. **Notifications**: the bell in the header shows an unread counter; **Tout marquer comme lu** clears it.
14. **Change theme** with the palette/moon button in the header (Tanger → ENSA → Nuit) or on the profile page.

### D. Using the app (driver)

1. Go to `/app` and switch to **Je conduis** (or set the mode in `/profile`).
2. In **Proposer un trajet** choose **Aller** (to ENSA) or **Retour** (from ENSA), the neighborhood, the day and the departure time.
3. Choose **Voiture** or **Moto**, then the number of seats (motorbike = 1).
4. Optionally enter the car model and plate (shown only to booked passengers).
5. Add **pickups** along your route (type a stop and press Enter or **+**; remove with ×).
6. Toggle **Trajet récurrent** and **Accepter le last minute**.
7. Click **Publier · 5 DH la place**. You see the "Ton trajet est en ligne" stamp, with what you earn if the ride fills up.
8. Your rides appear under **Mes trajets publiés** (demo mode) and in passenger discovery. Use **Retirer ce trajet** to delete one.

### E. Using the admin console

1. In **demo mode**: open `/admin` directly (or **Profil → Console d'administration**). With a real account, sign in with an account whose profile role is `admin` (see `supabase/admin.sql`); other accounts see **Accès réservé**.
2. Read the **KPIs**: verified members, pending, weekly rides, pending top-ups, suspended rides.
3. Check the **weekly rides chart** and average fill rate.
4. In **Vérification CNE + email**, click **Valider** or the **×** button for each pending member.
5. In **Recharges cash**, click **Créditer** after receiving the cash at the desk.
6. In **Modération des trajets**, search by driver, neighborhood or plate, then **Suspendre** a ride. It disappears from passenger discovery; click **Réactiver** to bring it back.
7. Every action is time-stamped in the green log at the top.
8. Sign out with the icon at the top right.

### F. Reset

**Profil → Recommencer la démo** restores Amine's initial state (35 DH, 120 pts, no published rides, no chats).

---

## Themes and design system

**"Billet de Tanger"**: cream paper, ink outlines, petit-taxi teal, saffron stamps, hard offset shadows, perforated ticket cards.

- Colour rule: **teal = actions, saffron = money/urgency, green = confirmations** (never a solid green button).
- Fonts: Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (labels).
- Themes are CSS-variable blocks in `src/styles.css`: `:root` (Tanger), `.theme-ensa`, `.theme-nuit`. Text/background pairs are kept at WCAG AA contrast (4.5:1).
- Shared primitives in `src/components/ui.tsx`; the ticket-style `TripCard` is reused everywhere a ride is previewed.

---

## Accessibility

- Visible `:focus-visible` outlines, skip-to-content link, `lang="fr"`.
- Modals are real dialogs (`role="dialog"`, `aria-modal`, Escape to close, focus moved in and restored, scroll locked).
- Toggle buttons expose `aria-pressed`; tabs expose `role="tab"`; errors use `role="alert"`; live regions for result counts, chat and admin log.
- `prefers-reduced-motion` is respected.

---

## Supabase backend setup

Demo mode needs none of this. For real mode:

```bash
cp .env.example .env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
# Never put a service_role key in the client and never commit .env
```

Then, in the Supabase SQL editor, **in this order**:

| # | File | Purpose |
|---|---|---|
| 1 | `supabase/schema.sql` | 7 tables, full RLS, `is_admin()` security-definer function, privilege-escalation trigger, private `card-photos` bucket |
| 2 | `supabase/seed.sql` | 8 demo rides with relative dates (no duplicates) |
| 3 | `supabase/migration-auth.sql` | Auto-create the profile at signup + admin email exception |
| 4 | — | Sign up once with the admin email in the app |
| 5 | `supabase/admin.sql` | Promote that account to admin and verified |

Tip: in Supabase → Authentication → Email, disable **Confirm email** for instant password signups during a demo.

**Data policy**: `trips` and `ratings` are publicly readable; `bookings`, `wallet_transactions`, `messages`, `recharge_requests` are readable/writable by their owner only; `role` and `verified` can only be changed by an admin. Drivers insert their own trips (`driver_id = auth.uid()`).

---

## Project structure

```text
.
├── public/                    logo (normal + inverted), favicon, app icon, manifest.webmanifest
├── supabase/                  schema.sql · seed.sql · migration-auth.sql · admin.sql
├── src/
│   ├── routes/                TanStack Start file routes (thin wrappers + page metadata)
│   ├── components/
│   │   ├── ui.tsx             Button, Field, Tag, Logo, Modal, Stamp, EmptyState
│   │   ├── prototype.tsx      AppShell, TripCard, Dashboard, OfferRide, ThemeToggle, notifications
│   │   ├── screens.tsx        Landing, Auth, RideDetail, Trips, Wallet, Chat, Profile, Admin
│   │   └── ui/                shadcn/Radix primitives (Toaster used)
│   ├── lib/
│   │   ├── demo-data.ts       single source of demo content
│   │   ├── store.ts           persistent demo state (localStorage) and selectors
│   │   ├── db.ts              Supabase reads/writes (trips, bookings, wallet, ratings, publish)
│   │   ├── auth.ts            password, email OTP, profile, useIdentity
│   │   ├── impact.ts          savings / CO₂ / time estimates
│   │   ├── trip-utils.ts      search, sort, time helpers, QR generator, chat replies
│   │   └── supabase.ts        client (safe fallback without env)
│   ├── styles.css             design tokens and the three themes
│   └── test/                  vitest: routing + utilities
├── HANDOFF.md                 living project log
├── DEMO-SCRIPT.md             timed 5-minute demo script
└── AGENTS.md                  rules for AI agents working on the repo
```

Stack: TanStack Start + Router, React 19, Tailwind CSS v4, Vite 8, TanStack Query, Supabase JS, Recharts, Radix UI, sonner, lucide-react.

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Dev server on <http://localhost:8080> |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm test` | Vitest (routing + utility tests) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Roadmap

- [x] AA contrast, demo data pack, persistent demo state, real Supabase auth
- [x] Real reads/writes for rides, bookings, wallet, ratings, top-up requests
- [x] ENSA theme, then Nuit (dark) theme
- [x] Driver publishing (demo and Supabase), search/sort/favorites, impact stats, admin guard
- [ ] Leaflet/OpenStreetMap map for pickups (the route map is currently illustrative)
- [ ] Realtime chat on the `messages` table
- [ ] Postgres trigger for the wallet ledger and seat counters
- [ ] Admin console on real data (verification, top-ups, moderation)
- [ ] Vercel/Cloudflare deployment

---

## License

No `LICENSE` file yet: all rights reserved by default.

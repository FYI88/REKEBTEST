# Rkeb vs inDrive vs Uber

What they do well, what they get wrong, and what Rkeb should copy or avoid.

Sources: Uber's public safety page and the inDrive Wikipedia article (both read on 2026-10-29). Points marked *(widely reported)* are general, long-running criticisms of ride-hailing platforms rather than figures from a specific source. Verify before using them in a pitch.

## 1. Three different products

| | **Rkeb** | **inDrive** | **Uber** |
|---|---|---|---|
| Model | Scheduled carpool on a route the driver already drives | Peer-to-peer ride-hailing: rider proposes a price, drivers accept or counter-offer | On-demand ride-hailing with algorithmic pricing |
| Price | Fixed 5 DH | Negotiated per ride; ~10% platform commission (2026 figure reported by Wikipedia) | Dynamic (surge) |
| Driver | Student, professor or staff member heading to ENSA anyway | Professional or semi-professional drivers | Professional and part-time drivers |
| Audience | One closed, verified community | Open market, 48 countries | Open market, global |
| Payment | Wallet, points, fuel pool; cash top-up at the BDE desk | Paid directly to the driver in cash or non-cash | In-app card payment |
| Core promise | Same road, same school, 5 DH | You name your price | Press a button, get a car |

**Key insight:** Rkeb is not a cheaper taxi. It is a *commute club*. Drivers are not selling a service, they are sharing a trip they would make anyway. That changes pricing, trust and safety, and it is the main thing to protect.

## 2. What inDrive did well (and Rkeb can do too)

| inDrive strength | What Rkeb does / should do |
|---|---|
| **Price agency.** Riders feel in control because they set the price. | Rkeb removes the haggling instead: one fixed, known price. Keep it. Add **ride requests** so passengers still choose *when and where* and drivers respond. (built) |
| **Demand-first discovery.** The rider posts a need; drivers respond. | **Ride requests board**: passengers post neighborhood + time, drivers accept. (built) |
| **Low commission** (~10%) attracts drivers. | Rkeb takes **0%** in the prototype: 5 DH goes to the driver plus eco-points. Keep fees at zero or transparent. |
| **Info shown before accepting**: driver rating, car, plate, live ETA. | Already on ride detail; **live tracking** adds ETA and progress. (built) |
| **Regional expansion into intercity and delivery.** | Roadmap idea: weekend rides home (other cities), parcel carrying on commute routes. |
| **Works in cash markets.** | Cash top-up at the BDE desk, no card needed. Keep. |

## 3. What Uber did well (and Rkeb can do too)

Taken from Uber's public safety page:

| Uber strength | What Rkeb does / should do |
|---|---|
| **Vetted drivers** (background checks before the first trip, re-screening). | Rkeb vets **everyone** (CNE, institutional email, student card) through the admin queue. Stronger because the community is closed. |
| **Emergency help with live location and trip details.** | **SOS** and share-trip link; live tracking page with plate and driver. (built) |
| **Trip monitoring** (RideCheck detects off-route or possible crash). | Future: simple off-route / long-stop alert on the live tracking page. |
| **Phone numbers stay private** between rider and driver. | Masked-number chat. Already built. |
| **24/7 support** and a public-safety liaison. | Admin console with a **reports queue**. (built) Future: dedicated ENSA safety contact. |
| **Two-way ratings** and trip history. | Passengers rate drivers today; add driver-to-passenger ratings later. |
| **Safety features inside the trip flow** (PIN to verify the right rider/car). | **Boarding PIN**: the passenger shows a 4-digit code the driver validates before the trip starts. (built) |

## 4. What they did wrong (and Rkeb should avoid)

| Problem | Where | Lesson for Rkeb |
|---|---|---|
| **Dynamic / surge pricing** surprises riders *(widely reported)*. | Uber | Never. Fixed 5 DH is the brand. |
| **Bargaining fatigue and unsafe haggling** at the curb; riders and drivers must negotiate every trip *(widely reported)*. | inDrive | No negotiation. Fixed fare, decided in advance. |
| **Regulatory friction.** inDrive's Philippine operations were suspended in 2024 over fare-bargaining rules and resumed only after adopting the regulator's fare structure (Wikipedia). | inDrive | Fixed, transparent fare plus a closed institutional community is easier to defend with the school administration. Keep the ENSA administration in the loop. |
| **Cash-payment disputes** and no in-app record of the fare. | inDrive | Everything goes through a ledger the passenger can see (wallet history). Cash only for top-ups, validated by the admin. |
| **Opaque driver deactivation** with little recourse *(widely reported)*. | Uber and others | Transparent moderation: reports have a status, suspensions are reversible, the admin log is visible. Add an appeal path later. |
| **Anonymous strangers.** Open platforms struggle with fake accounts and safety incidents *(widely reported)*. | Both | Keep membership closed and verified. Never allow public sign-up without institutional email. |
| **Commission creep.** Platform cuts tend to rise over time *(widely reported)*. | Both | Publish the fee policy. Rkeb = 0% for the prototype, and the 5 DH rule is public. |
| **Cancellation friction**: fees, unreliable drivers, rides that vanish. | Both | Automatic refund when the driver cancels; confirmation before cancelling; reliability visible through ratings and trip counts. |
| **Generic experience.** One app for everyone, no local identity. | Both | Keep the "Billet de Tanger" look, French/Darija tone, neighborhood-level routes (Boukhalef, Mesnana, Iberia...). |

## 5. Where Rkeb is structurally different (the moat)

1. **Closed community.** Only ENSA members. Trust is the product.
2. **Fixed price, no surge, no haggling.** Predictable for a student budget.
3. **Shared trips, not hired rides.** Drivers are already going there. Good for traffic and CO₂ (see the impact card).
4. **Group and fuel pool.** Neither competitor lets a regular group split fuel weekly. Built as **Groups**.
5. **Routine over spontaneity.** Recurring rides at 07:30 / 17:00 match class schedules; on-demand apps optimise for the opposite.

## 6. Feature decisions that came out of this analysis

| Feature | Learned from | Status |
|---|---|---|
| Ride requests board | inDrive (demand-first) without the haggling | Built |
| Live tracking + ETA | Both | Built (simulated) |
| Boarding PIN | Uber safety flow | Built |
| Reports and block | Uber safety / moderation, with transparent status | Built |
| Driver dashboard with earnings | inDrive's driver-friendly economics, zero commission | Built |
| Groups and fuel pool | Gap neither competitor fills | Built |
| Off-route / long-stop alert | Uber RideCheck | Future |
| Driver-to-passenger ratings | Uber two-way ratings | Future |
| Appeal path for suspensions | Fixing opaque deactivation | Future |
| Weekend intercity rides | inDrive intercity | Future |

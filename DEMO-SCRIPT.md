# DEMO SCRIPT — 5 minutes, Rkeb ENSA Carpool

> Avant la scène : ouvrir `http://localhost:8080` → `/login` → bouton **« Entrer en mode démo (Amine) »**
> (aucun email requis, personne Amine, 35 DH, 120 pts, 1 billet terminé).
> Un refresh ne casse rien (état persisté). Fausse manip : `/profile` → **« Recommencer la démo »**.
> L'auth réelle (code email / mot de passe) existe aussi — à montrer en option, hors chrono.
> **Test sur téléphone avant la présentation :** installer le dernier APK, vérifier le plein écran,
> le bouton retour et le bandeau hors ligne en mode avion ; ouvrir un trajet pour tester la vraie carte.
> La carte et le calcul de route nécessitent Internet ; sans réseau, le croquis illustré prend le relais.

## 0:00 — Accroche (`/`)

Dire ( = script INTRO) : questionnaire → 4 problèmes → 4 besoins.
Scroller sur **« Pourquoi Rkeb existe »** : pointer les 4 cartes, une phrase chacune.
Finir sur le tampon **5 DH prix fixe**.

## 0:45 — Inscription (`/signup`)

Cliquer **Rejoindre** : montrer le vrai formulaire (nom, email ENSA, mot de passe, CNE, passager/conducteur).
Phrase : compte vérifié CNE + email institutionnel + carte, validé par l'admin. Zéro externe.
Ne pas soumettre (ça déclencherait un email) → retour `/login` → **Mode démo** pour la suite.
Option : montrer au passage l'onglet **Code email** (connexion sans mot de passe).

## 1:30 — Découverte (`/app`)

Filtre **Matin**, quartier **Boukhalef** : carte Yasmine 07:25, 3 places, 5 DH.
Pointer : pastille **last minute**, **Récurrent**, compteur de places, prix fixe partout.
Basculer **« Je conduis »** : montrer le formulaire (pickups, places, récurrent) — ne pas valider.

## 2:30 — Trajet (`/ride/1`)

Repassez **« Je cherche »** si besoin. Cliquer la carte Yasmine.
Montrer : photo + plaque + badge vérifié, **pickups** (choisir rond-point Marjane),
carte OpenStreetMap avec itinéraire et arrêts numérotés (centres de quartier approximatifs),
avis **Ils en parlent** (si présents — base fraîche = section masquée, c'est normal),
boutons **SOS** + **Partager en live** (ouvrir le modal, fermer).
Paiement : choisir **Wallet**, cliquer **Réserver** → « C'est réservé ».
Phrase : débit auto 5 DH, remboursé si le conducteur annule.

## 3:30 — Billet + chat (`/trips`, `/chat/1`)

**Mes billets** : billet confirmé + bouton **QR d'embarquement** (montrer le code).
Onglet **Historique** : noter le trajet terminé avec les étoiles.
**Chat** : envoyer « Je suis au pickup » via réponse rapide — numéro masqué.

## 4:15 — Wallet (`/wallet`)

Solde passé de 35 à 30 DH : historique, **cotisation essence**, **carte de points**,
**Recharger en cash** → code BDE (pas de carte bancaire, guichet + validation admin).

## 4:40 — Admin (`/admin` — mot de passe quelconque)

**Tour de contrôle** : stats + graphique de la semaine.
Valider Hiba dans la file CNE, créditer une recharge, suspendre un trajet → ligne de log verte.
Phrase de fin ( = script IDEE) : ce qu'on a barré — bus privé, externes, crypto —
et « on passe au prototype ».

## Hors chrono — si la question tombe

- **Couleurs ENSA** : icône palette dans le header (aussi `/profile` → **Thème** → **ENSA**) → toute l'app passe au bleu/ambre institutionnel, re-cliquer pour revenir à Tanger. Phrase : « version couleurs ENSA, activable si l'école préfère — la démo par défaut reste la nôtre ».

## Si ça casse

- Mauvais clic : continuer, tout est cliquable, rien n'est destructeur.
- État bizarre : `/profile` → **Recommencer la démo**, reprendre au point suivant.
- Serveur tombé : `npm run dev` dans le dossier, attendre « ready », rouvrir `:8080`.
- Carte indisponible : expliquer que la géolocalisation exacte n'est pas encore activée ; le croquis hors ligne garde le quartier, l'ordre des pickups et l'ENSA visibles.
- Mode avion : le bandeau signale l'absence d'Internet et **Continuer en mode démo** mène aux trajets locaux. La connexion et la carte réelle ont besoin du réseau.

## Retours du test terrain — version Android

Pendant les essais avec l'APK sur téléphone, l'équipe a relevé trois points concrets : l'application ne s'affichait pas en plein écran, le bandeau hors ligne ne signalait pas correctement la perte de connexion, et le croquis de trajet gagnerait à être une carte de rues. Ces retours ont déclenché la version suivante :

- **Plein écran Android** : barres système masquées par défaut ; balayage depuis le bord les révèle temporairement.
- **Connexion hors ligne** : état réseau natif Android + vérification d'accès Internet, avec une action pour continuer en mode démo.
- **Carte du trajet** : fond OpenStreetMap, route routière OSRM et arrêts numérotés/labellisés ; coordonnées des arrêts approximées au centre du quartier, pas de GPS exact. Si le service de calcul d'itinéraire tombe, une ligne pointillée indicative apparaît ; si la carte Internet est indisponible, le croquis hors ligne s'affiche.

Après installation de la nouvelle APK, refaire ces trois vérifications sur le téléphone et noter les résultats ici avant la présentation. La carte en direct nécessite une connexion Internet.

### Test cycle 2 � fixes prompted by user and team phone feedback

Build observed problems into the presentation story: we tested the previous APK on a phone, other testers reported that fullscreen and offline detection did not behave as expected, and the route sketch felt less useful than a real map. We turned those reports into a new test cycle instead of assuming the browser preview represented Android correctly.

The follow-up APK (demo.5) addresses them with immersive Android system bars; native Capacitor network state plus an Internet reachability check and a visible demo-mode action; and a journal-coloured OpenStreetMap view with a road route and labelled numbered stops. Exact pickup GPS coordinates are not part of the prototype, so pins represent approximate pickup locations around district centres. If route calculation is unavailable, the map shows labelled dashed straight segments; if map tiles are unavailable, the original sketch appears.

**Retest on a physical phone after installing demo.5:** confirm fullscreen at launch and after resume; enable airplane mode and look for the banner and working demo shortcut; restore Internet, open /ride/1, and check map tiles, route, and labels. Record any remaining failures here. Browser checks do not count as proof of native fullscreen or airplane-mode detection.

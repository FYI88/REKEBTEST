# DEMO SCRIPT — 5 minutes, Rkeb ENSA Carpool

> Avant la scène : ouvrir `http://localhost:8080` → `/login` → bouton **« Entrer en mode démo (Amine) »**
> (aucun email requis, personne Amine, 35 DH, 120 pts, 1 billet terminé).
> Un refresh ne casse rien (état persisté). Fausse manip : `/profile` → **« Recommencer la démo »**.
> L'auth réelle (code email / mot de passe) existe aussi — à montrer en option, hors chrono.

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

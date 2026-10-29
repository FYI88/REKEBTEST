export type Trip = {
  id: string; driver: string; initials: string; status: string; rating: number; trips: number;
  from: string; pickups: string[]; time: string; arrival: string; date: string; slot: "Matin" | "Soir";
  vehicle: "Voiture" | "Moto"; car: string; plate: string; seats: number; total: number;
  preference: "Musique" | "Silence" | "Discussion"; color: string; lastMinute?: boolean; recurring?: boolean;
};

export const neighborhoods = ["Boukhalef", "Centre-ville", "Mesnana", "Iberia", "Malabata", "Route de Rabat", "Val Fleuri", "Dradeb"] as const;

export const trips: [Trip, ...Trip[]] = [
  { id: "1", driver: "Yasmine El Amrani", initials: "YA", status: "Étudiante GI3", rating: 4.9, trips: 86, from: "Boukhalef", pickups: ["Rond-point Marjane", "Résidence Al Andalous", "Station Shell"], time: "07:25", arrival: "07:52", date: "Demain", slot: "Matin", vehicle: "Voiture", car: "Dacia Sandero blanche", plate: "45-A-2841", seats: 3, total: 4, preference: "Musique", color: "bg-avatar-1", recurring: true },
  { id: "2", driver: "Mehdi Bennis", initials: "MB", status: "Étudiant GE2", rating: 4.8, trips: 42, from: "Centre-ville", pickups: ["Place des Nations"], time: "07:30", arrival: "07:55", date: "Demain", slot: "Matin", vehicle: "Moto", car: "Yamaha NMAX noire", plate: "12-B-9033", seats: 1, total: 1, preference: "Silence", color: "bg-avatar-2", lastMinute: true },
  { id: "3", driver: "Pr. Salma Ouazzani", initials: "SO", status: "Professeure", rating: 5.0, trips: 31, from: "Mesnana", pickups: ["Café Venezia", "Lycée Ibn Batouta"], time: "07:35", arrival: "07:58", date: "Demain", slot: "Matin", vehicle: "Voiture", car: "Renault Clio grise", plate: "38-A-7244", seats: 2, total: 4, preference: "Discussion", color: "bg-avatar-3", recurring: true },
  { id: "4", driver: "Omar Alaoui", initials: "OA", status: "Étudiant GI2", rating: 4.7, trips: 64, from: "Iberia", pickups: ["ENSA entrée principale", "Mosquée Mohammed V"], time: "17:10", arrival: "17:35", date: "Aujourd’hui", slot: "Soir", vehicle: "Voiture", car: "Peugeot 208 bleue", plate: "29-B-1180", seats: 3, total: 4, preference: "Musique", color: "bg-avatar-4", lastMinute: true },
  { id: "5", driver: "M. Karim Bennani", initials: "KB", status: "Administration", rating: 4.8, trips: 55, from: "Route de Rabat", pickups: ["Gare Tanger Ville", "Bd Mohammed VI"], time: "07:20", arrival: "07:50", date: "Demain", slot: "Matin", vehicle: "Voiture", car: "Kia Picanto rouge", plate: "18-A-6231", seats: 0, total: 3, preference: "Silence", color: "bg-avatar-5" },
  { id: "6", driver: "Nabil Tazi", initials: "NT", status: "Étudiant GC3", rating: 4.6, trips: 22, from: "Val Fleuri", pickups: ["Marché Val Fleuri"], time: "07:30", arrival: "07:50", date: "Demain", slot: "Matin", vehicle: "Moto", car: "Honda SH grise", plate: "09-B-4412", seats: 1, total: 1, preference: "Discussion", color: "bg-avatar-2" },
  { id: "7", driver: "Leila Amrani", initials: "LA", status: "Étudiante GI3", rating: 4.8, trips: 70, from: "Malabata", pickups: ["ENSA entrée principale", "Corniche Malabata"], time: "17:05", arrival: "17:30", date: "Aujourd’hui", slot: "Soir", vehicle: "Voiture", car: "Hyundai i10 blanche", plate: "41-A-0902", seats: 2, total: 4, preference: "Musique", color: "bg-avatar-3", recurring: true },
  { id: "8", driver: "Sara Idrissi", initials: "SI", status: "Étudiante GE3", rating: 4.9, trips: 48, from: "Dradeb", pickups: ["Rond-point Dradeb"], time: "07:40", arrival: "08:02", date: "Demain", slot: "Matin", vehicle: "Voiture", car: "Fiat 500 verte", plate: "22-A-1773", seats: 1, total: 3, preference: "Silence", color: "bg-avatar-1" },
];

export const me = { name: "Amine Benali", first: "Amine", initials: "AB", filiere: "Génie Informatique 2", cne: "R136724519", email: "amine.benali@etu.uae.ac.ma" };

export type Tx = { id: string; label: string; amount: number; date: string; kind: "trajet" | "remboursement" | "recharge" | "cotisation" };
export const transactions: Tx[] = [
  { id: "t1", label: "Trajet Boukhalef → ENSA", amount: -5, date: "Hier 07:25", kind: "trajet" },
  { id: "t2", label: "Remboursement : annulation conducteur", amount: 5, date: "Lun. 17:10", kind: "remboursement" },
  { id: "t3", label: "Recharge cash validée par l’admin", amount: 50, date: "Lun. 12:30", kind: "recharge" },
  { id: "t4", label: "Cotisation essence groupe Yasmine", amount: -15, date: "Dim. 20:00", kind: "cotisation" },
  { id: "t5", label: "Trajet ENSA → Iberia", amount: -5, date: "Ven. 17:10", kind: "trajet" },
];

export const verificationQueue = [
  { id: "v1", name: "Hiba Lahlou", initials: "HL", cne: "R145520983", email: "hiba.lahlou@etu.uae.ac.ma", role: "Passagère", filiere: "GI1" },
  { id: "v2", name: "Youssef Kettani", initials: "YK", cne: "R139984210", email: "youssef.kettani@etu.uae.ac.ma", role: "Conducteur", filiere: "GE3" },
  { id: "v3", name: "Pr. Rachid Fassi", initials: "RF", cne: "Personnel 0412", email: "r.fassi@uae.ac.ma", role: "Conducteur (prof)", filiere: "Dépt. Info" },
];

export const rechargeRequests = [
  { id: "r1", name: "Ilyas Ghazi", amount: 50, at: "Guichet BDE, 10:15" },
  { id: "r2", name: "Nora Benjelloun", amount: 100, at: "Guichet BDE, 11:40" },
];

export const leaderboard = [
  { name: "Yasmine El Amrani", pts: 1240, trips: 86 },
  { name: "Leila Amrani", pts: 980, trips: 70 },
  { name: "Omar Alaoui", pts: 860, trips: 64 },
  { name: "M. Karim Bennani", pts: 720, trips: 55 },
];

export const weeklyStats = [
  { day: "Lun", trajets: 24, taux: 78 },
  { day: "Mar", trajets: 31, taux: 84 },
  { day: "Mer", trajets: 28, taux: 81 },
  { day: "Jeu", trajets: 35, taux: 92 },
  { day: "Ven", trajets: 30, taux: 85 },
];

export type Review = { name: string; text: string; stars: number };
export const reviews: Record<string, Review[]> = {
  "1": [
    { name: "Ilyas G.", text: "Toujours à l'heure au rond-point, voiture propre.", stars: 5 },
    { name: "Nora B.", text: "Trajet calme, on arrive détendus à l'ENSA.", stars: 5 },
  ],
  "2": [
    { name: "Adam C.", text: "Rapide en moto, casque fourni, parfait en last minute.", stars: 5 },
  ],
  "3": [
    { name: "Hiba L.", text: "Conduite douce, bonnes discussions le matin.", stars: 5 },
    { name: "Yassine R.", text: "Ponctuelle et rassurante.", stars: 4 },
  ],
  "4": [
    { name: "Sara I.", text: "Musique au top, retour sans stress.", stars: 5 },
  ],
  "7": [
    { name: "Omar A.", text: "N'a jamais annulé, très fiable le soir.", stars: 5 },
  ],
};

export type ChatMessage = { from: "me" | "them"; text: string; time: string };
export const seedMessages: ChatMessage[] = [
  { from: "them", text: "Salam ! Je passe au rond-point Marjane à 07:25 pile.", time: "21:02" },
  { from: "me", text: "Parfait, je serai devant la pharmacie.", time: "21:04" },
  { from: "them", text: "Ok. Voiture blanche, plaque 45-A-2841 👍", time: "21:05" },
];

export type NotifIcon = "booking" | "flash" | "wallet" | "route";
export type Notification = { id: string; icon: NotifIcon; title: string; body: string; time: string };

export const notifications: Notification[] = [
  { id: "n1", icon: "booking", title: "Place confirmée", body: "Yasmine te prend demain à 07:25 au rond-point Marjane.", time: "il y a 2 h" },
  { id: "n2", icon: "flash", title: "Place libre maintenant", body: "Mehdi part du Centre-ville dans 20 min, 1 place moto.", time: "il y a 25 min" },
  { id: "n3", icon: "wallet", title: "Recharge validée", body: "50 DH crédités au guichet BDE.", time: "hier" },
  { id: "n4", icon: "route", title: "Conducteur en route", body: "Omar a démarré son trajet Iberia → ENSA.", time: "hier" },
];

export const platformStats = [
  { value: "312", label: "membres vérifiés" },
  { value: "148", label: "trajets cette semaine" },
  { value: "5 DH", label: "prix fixe par place" },
  { value: "4.8★", label: "note moyenne" },
] as const;

export const howItWorks = [
  { n: "1", title: "Crée ton compte", body: "Email @etu.uae.ac.ma ou @uae.ac.ma, CNE ou matricule. L’admin valide ton profil." },
  { n: "2", title: "Choisis ton trajet", body: "Filtre par quartier, créneau, voiture ou moto, puis choisis le pickup le plus proche." },
  { n: "3", title: "Réserve pour 5 DH", body: "Wallet, carte de points ou cotisation essence. Tu reçois ton billet QR." },
  { n: "4", title: "Monte et note", body: "Montre le QR au conducteur, arrive à l’heure, puis note le trajet." },
] as const;

export const testimonials = [
  { name: "Ilyas G.", who: "Étudiant GI2", text: "Je gagne une heure de sommeil chaque matin pour le prix d’un café." },
  { name: "Yasmine E.", who: "Conductrice GI3", text: "Mon plein est presque remboursé et je fais des rencontres sur la route." },
  { name: "Pr. Salma O.", who: "Professeure", text: "Trajets ponctuels, passagers vérifiés : je me sens en confiance." },
] as const;

export const faq = [
  { q: "Qui peut utiliser Rkeb ?", a: "Les étudiants, professeurs et membres du personnel de l’ENSA Tanger, avec une adresse @etu.uae.ac.ma ou @uae.ac.ma. Chaque profil est validé par l’administration." },
  { q: "Pourquoi 5 DH, toujours ?", a: "Un prix fixe évite les négociations et reste accessible à un budget étudiant. Les conducteurs gagnent des éco-points en plus." },
  { q: "Comment je paie ?", a: "Trois options : Wallet (recharge cash au guichet BDE), carte de points gagnés en conduisant, ou cotisation essence hebdomadaire partagée." },
  { q: "Et si le conducteur annule ?", a: "Ta place est remboursée automatiquement sur ton wallet. Tu peux aussi annuler toi-même depuis Mes billets." },
  { q: "Que fait le bouton SOS ?", a: "Il partage ta position avec ton contact d’urgence et l’administration ENSA. Tu peux aussi partager le lien du trajet à un proche." },
  { q: "Je n’ai pas de compte, je peux essayer ?", a: "Oui : le mode démo (persona Amine) rend toute l’app cliquable sans compte ni connexion réseau." },
] as const;

-- RKEB ENSA Carpool — seed v1 (mêmes données que la démo)
-- Prérequis : schema.sql exécuté. SQL Editor → New query → coller → Run.
-- driver_id NULL : les vrais conducteurs récupèrent leurs trajets à l'inscription.

insert into trips
  (driver_name, from_quarter, pickups, departure_date, departure_time, arrival_time, slot, vehicle, car, plate, ambiance, seats_total, seats_left, recurring, last_minute)
values
  ('Yasmine El Amrani', 'Boukhalef', '["Rond-point Marjane", "Résidence Al Andalous", "Station Shell"]', current_date + 1, '07:25', '07:52', 'Matin', 'Voiture', 'Dacia Sandero blanche', '45-A-2841', 'Musique', 4, 3, true, false),
  ('Mehdi Bennis', 'Centre-ville', '["Place des Nations"]', current_date + 1, '07:30', '07:55', 'Matin', 'Moto', 'Yamaha NMAX noire', '12-B-9033', 'Silence', 1, 1, false, true),
  ('Pr. Salma Ouazzani', 'Mesnana', '["Café Venezia", "Lycée Ibn Batouta"]', current_date + 1, '07:35', '07:58', 'Matin', 'Voiture', 'Renault Clio grise', '38-A-7244', 'Discussion', 4, 2, true, false),
  ('Omar Alaoui', 'Iberia', '["ENSA entrée principale", "Mosquée Mohammed V"]', current_date, '17:10', '17:35', 'Soir', 'Voiture', 'Peugeot 208 bleue', '29-B-1180', 'Musique', 4, 3, false, true),
  ('M. Karim Bennani', 'Route de Rabat', '["Gare Tanger Ville", "Bd Mohammed VI"]', current_date + 1, '07:20', '07:50', 'Matin', 'Voiture', 'Kia Picanto rouge', '18-A-6231', 'Silence', 3, 0, false, false),
  ('Nabil Tazi', 'Val Fleuri', '["Marché Val Fleuri"]', current_date + 1, '07:30', '07:50', 'Matin', 'Moto', 'Honda SH grise', '09-B-4412', 'Discussion', 1, 1, false, false),
  ('Leila Amrani', 'Malabata', '["ENSA entrée principale", "Corniche Malabata"]', current_date, '17:05', '17:30', 'Soir', 'Voiture', 'Hyundai i10 blanche', '41-A-0902', 'Musique', 4, 2, true, false),
  ('Sara Idrissi', 'Dradeb', '["Rond-point Dradeb"]', current_date + 1, '07:40', '08:02', 'Matin', 'Voiture', 'Fiat 500 verte', '22-A-1773', 'Silence', 3, 1, false, false)
on conflict (driver_name, departure_date, departure_time) do nothing;

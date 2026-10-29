-- RKEB — promotion admin
-- À exécuter APRÈS que le compte se soit inscrit une première fois (sinon aucune ligne profiles n'existe).
-- L'email est volontairement figé dans schema.sql (exception email_ensa) pour le compte de test.

update profiles
set role = 'admin', verified = true
where lower(email) = 'yvnnsart@gmail.com';

-- Vérifier :
-- select id, full_name, email, role, verified from profiles where role = 'admin';

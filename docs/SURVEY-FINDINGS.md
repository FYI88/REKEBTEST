# Résultats du questionnaire Rkeb

Source fournie : `poolrkeb.json` · **1 000 lignes de réponse**, sept questions.
Le fichier d'origine reste chez son propriétaire ; seules les statistiques agrégées sont publiées ici.

## Résultats

| Question | Réponses (sur 1 000) |
|---|---|
| Moyen principal | Bus 435 ; voiture 254 ; à pied (`a peid` dans la source) 78 ; autre 178 ; non renseigné 55 |
| Intention de covoiturer | Oui certainement 420 ; oui probablement 318 ; non certainement pas 174 ; non probablement 88 |
| Retards | Jamais 190 ; rarement 409 ; souvent 304 ; presque toujours 97 |
| Sentiment de sécurité | Oui tout le temps 129 ; oui la plupart du temps 446 ; non rarement 292 ; non jamais 133 |
| Offre de transport | Assez et pas trop remplis 209 ; assez mais parfois trop remplis 130 ; insuffisants et souvent trop remplis 388 ; très insuffisants et toujours trop remplis 273 |
| Coût | Raisonnable 194 ; cher 258 ; un peu cher 461 ; `Très légère` 87 (libellé original conservé) |
| Stress/fatigue | Pas du tout 75 ; faiblement 139 ; modérément 263 ; fortement 329 ; très fortement 194 |

## Chiffres utilisables en présentation

- **73,8 % (738/1 000)** répondent oui certainement ou oui probablement à un service de covoiturage proposé par leur établissement. Les **26,2 % de réponses négatives** restent visibles : une intention déclarée n'est pas une adoption réelle.
- **79,1 % (791/1 000)** décrivent des transports trop remplis au moins parfois (130 + 388 + 273).
- **66,1 % (661/1 000)** décrivent une offre insuffisante (388 + 273).
- **71,9 % (719/1 000)** jugent le transport cher ou un peu cher.
- **52,3 % (523/1 000)** déclarent une forte ou très forte influence sur le stress/fatigue.
- **40,1 % (401/1 000)** arrivent souvent ou presque toujours en retard.
- **42,5 % (425/1 000)** répondent « Non rarement » ou « Non jamais » à la question de sécurité.

## Méthode et limites

Comptage descriptif des lignes reçues, sans pondération ni suppression de lignes identiques : l'export ne contient pas d'identifiant permettant de reconnaître des répondants distincts. Les espaces répétés sont normalisés (`Non  probablement` devient `Non probablement`). Les 55 valeurs nulles du moyen de transport sont conservées ; tous les indicateurs ci-dessus utilisent 1 000 lignes comme dénominateur.

Date de collecte, méthode de recrutement et population exacte non précisées. Ces résultats décrivent cet export, sans démontrer qu'il est représentatif de l'ENSA Tanger. Ni économie de temps mesurée, ni consentement au prix exact de 5 DH, ni nombre de membres actifs ne peuvent être déduits de ces questions. Les compteurs d'activité et témoignages de la démo restent fictifs.

Reproduire les distributions depuis le fichier original :

```powershell
node scripts/survey-summary.mjs "C:\Users\HP\Downloads\poolrkeb.json"
```

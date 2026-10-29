/** Observed questionnaire counts from poolrkeb.json, independently of demo activity. */
export const survey = {
  responses: 1000,
  positiveIntent: 738,
  negativeIntent: 262,
  certainly: 420,
  probably: 318,
  certainlyNot: 174,
  probablyNot: 88,
  frequentLate: 401,
  unsafe: 425,
  costly: 719,
  strongStress: 523,
  insufficientTransport: 661,
  crowdedAtLeastSometimes: 791,
  missingTransportMode: 55,
};

export const surveyHighlights = [
  { count: survey.positiveIntent, label: "prêts à essayer le covoiturage", detail: "Oui certainement ou oui probablement" },
  { count: survey.crowdedAtLeastSometimes, label: "signalent des transports trop remplis", detail: "Parfois, souvent ou toujours" },
  { count: survey.costly, label: "trouvent le transport coûteux", detail: "Cher ou un peu cher" },
  { count: survey.strongStress, label: "ressentent un stress ou une fatigue élevés", detail: "Fortement ou très fortement" },
];

export function surveyPercent(count: number) {
  return `${(count * 100 / survey.responses).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/survey-summary.mjs <survey.json>");
const raw = readFileSync(file);
const rows = JSON.parse(raw.toString("utf8").replace(/^\uFEFF/, ""));
if (!Array.isArray(rows) || !rows.length) throw new Error("Expected a non-empty response array");
const questions = Object.keys(rows[0]);
if (questions.length !== 7) throw new Error("Expected seven survey questions");
const distributions = questions.map((question) => {
  const counts = {};
  for (const row of rows) {
    const value = row[question] == null ? "Non renseigné" : String(row[question]).trim().replace(/\s+/g, " ");
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return { question, counts };
});
const count = (index, labels) => labels.reduce((sum, label) => sum + (distributions[index].counts[label] ?? 0), 0);
console.log(JSON.stringify({
  source: "poolrkeb.json",
  sha256: createHash("sha256").update(raw).digest("hex"),
  responses: rows.length,
  positiveIntent: count(1, ["Oui certainement", "Oui probablement"]),
  frequentLate: count(2, ["Souvent", "Presque toujours"]),
  unsafe: count(3, ["Non jamais", "Non rarement"]),
  costly: count(5, ["Cher", "Un peu cher"]),
  strongStress: count(6, ["Fortement", "Très fortement"]),
  distributions,
}, null, 2));

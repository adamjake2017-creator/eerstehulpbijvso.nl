// ============================================================================
//  enrich-sociaalplan.js  -  voegt op ELKE bedrijfspagina een eigen
//  "Het sociaal plan bij <bedrijf>"-sectie toe.
//  ----------------------------------------------------------------------------
//  Doel (uit GSC-data): de zoekvraag "sociaal plan <bedrijf>" en
//  "<bedrijf> reorganisatie" beter bedienen. Die stond in de data wel met
//  vertoningen, maar zonder eigen inhoud op onze pagina's.
//
//      node generator/enrich-sociaalplan.js
//
//  Idempotent: pagina's die de sectie al hebben (id="sociaal-plan") worden
//  overgeslagen. Bedrijfsnaam wordt uit de BreadcrumbList-JSON gehaald, zodat
//  het op beide generaties bedrijfspagina's werkt. Raakt niets anders aan.
// ============================================================================

const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "reorganisatie");

// De sectie, geparametriseerd op bedrijfsnaam (naam is al HTML-escaped).
function section(name) {
  return `<section class="block"><div class="wrap"><h2 class="big reveal" id="sociaal-plan">Het sociaal plan bij <em>${name}</em></h2>
<div class="prose reveal"><p>Bij een grotere reorganisatie geldt vaak een sociaal plan: de afspraken tussen ${name} en de vakbonden of ondernemingsraad over wat er met boventallige medewerkers gebeurt. Denk aan de hoogte van de vergoeding, een van-werk-naar-werk-traject, een opzegtermijn en soms een extra vertrekregeling. Ken je het sociaal plan van ${name}, dan weet je waar je recht op hebt voordat je een vaststellingsovereenkomst tekent.</p>
<h3>Sociaal plan en je vaststellingsovereenkomst</h3><p>Je vaststellingsovereenkomst hoort aan te sluiten op het sociaal plan. Soms biedt het plan een vergoeding hoger dan de wettelijke transitievergoeding, bijvoorbeeld via een correctiefactor. In andere gevallen is het plan juist een bodem en valt er individueel meer te onderhandelen. Wij leggen jouw voorstel naast het sociaal plan van ${name} en controleren of je krijgt waar je recht op hebt.</p>
<h3>Geen sociaal plan? Dan onderhandel je zelf</h3><p>Niet elke reorganisatie bij ${name} kent een sociaal plan. Is er geen plan, dan is je vertrekregeling volledig een kwestie van onderhandelen, en is een scherpe blik op je vergoeding, je WW en je vrijstelling van werk juist extra belangrijk. Ook dan staan wij naast je.</p></div></div></section>
`;
}

const ANCHOR = '<section class="block"><div class="wrap"><h2 class="big reveal">Lees ook <em>verder</em></h2>';
const NAME_RE = /"position":3,"name":"((?:[^"\\]|\\.)*)"/;

let added = 0, skipped = 0, problems = [];
for (const f of fs.readdirSync(DIR)) {
  if (!/^vaststellingsovereenkomst-.+\.html$/.test(f)) continue;
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, "utf8");
  if (s.includes('id="sociaal-plan"')) { skipped++; continue; }
  const m = s.match(NAME_RE);
  if (!m) { problems.push(f + " (geen naam gevonden)"); continue; }
  if (!s.includes(ANCHOR)) { problems.push(f + " (anker ontbreekt)"); continue; }
  s = s.replace(ANCHOR, section(m[1]) + ANCHOR);
  fs.writeFileSync(p, s);
  added++;
}

console.log(`Sociaal-plan-sectie: ${added} toegevoegd, ${skipped} al aanwezig (overgeslagen).`);
if (problems.length) console.log("LET OP:\n  " + problems.join("\n  "));

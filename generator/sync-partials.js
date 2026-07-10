/* Stampt de canonieke header en footer (uit build.js) in de handgemaakte
   pagina's (homepage, root-pagina's en tools), zodat menu en footer overal
   identiek zijn aan de gegenereerde pagina's. Draai NA node generator/build.js:
     node generator/sync-partials.js */

const fs = require("fs");
const path = require("path");
const { header, footer } = require("./build.js");

const ROOT = path.join(__dirname, "..");
const WA = "Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.";

// prefix "" = root, "../" = één map diep (tools/)
const targets = [
  { rel:"index.html", prefix:"" },
  { rel:"aanmelden.html", prefix:"" },
  { rel:"bedankt.html", prefix:"" },
  { rel:"privacy.html", prefix:"" },
  { rel:"voorwaarden.html", prefix:"" },
  { rel:"voor-werkgevers.html", prefix:"" },
  { rel:"10-valkuilen-bij-een-vso.html", prefix:"" },
  { rel:"tools/transitievergoeding-berekenen.html", prefix:"../" },
  { rel:"tools/ww-veilig-scan.html", prefix:"../" },
  { rel:"tools/bedenktermijn-berekenen.html", prefix:"../" },
  { rel:"tools/wat-is-mijn-vso-waard.html", prefix:"../" },
  { rel:"tools/mag-mijn-werkgever-druk-zetten.html", prefix:"../" }
];

const HDR = /<header id="hdr">[\s\S]*?<\/header>/;
const FTR = /<footer[\s\S]*?<\/footer>/;

let ok = 0, skipped = [];
for (const t of targets) {
  const p = path.join(ROOT, t.rel);
  if (!fs.existsSync(p)) { skipped.push(t.rel + " (bestaat niet)"); continue; }
  let html = fs.readFileSync(p, "utf8");
  const newHdr = header(t.prefix, WA);
  const newFtr = footer(t.prefix);
  let did = [];
  if (HDR.test(html)) { html = html.replace(HDR, newHdr); did.push("header"); }
  if (FTR.test(html)) { html = html.replace(FTR, newFtr); did.push("footer"); }
  if (did.length) { fs.writeFileSync(p, html, "utf8"); ok++; console.log(`  ${t.rel}: ${did.join(" + ")} bijgewerkt`); }
  else skipped.push(t.rel + " (geen header/footer gevonden)");
}
console.log(`\n${ok} pagina's gesynchroniseerd.`);
if (skipped.length) console.log("Overgeslagen:\n  " + skipped.join("\n  "));
// Voegt een subtiel hartje-badge toe aan de "Aanmelden"-knop in het menu,
// met een tooltip die de goede-doel-USP uitlegt. Inline-styled (geen wijziging
// aan style.css, dus geen cache-buster-ripple). Idempotent en veilig.
// Draaien: node generator/add-goededoel-aanmeldknop.js
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const RE = /<a href="([^"]*aanmelden\.html)" class="hl">Aanmelden<\/a>/;
const TITLE = "Voor elke klant doneren we 33 euro aan een goed doel dat jij kiest";

function badged(href) {
  return `<a href="${href}" class="hl" data-gd="1" title="${TITLE}" style="position:relative;overflow:visible">Aanmelden<span aria-hidden="true" style="position:absolute;top:-7px;right:-6px;min-width:16px;height:16px;padding:0 3px;border-radius:9px;background:#fff;border:1px solid #e7dcc9;font-size:9px;line-height:15px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.18)">&#128155;</span></a>`;
}

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith(".html")) a.push(p);
  }
  return a;
}

let ch = 0, sk = 0, nf = 0;
for (const f of walk(ROOT)) {
  let s = fs.readFileSync(f, "utf8");
  if (s.includes('class="hl" data-gd="1"')) { sk++; continue; }
  const m = s.match(RE);
  if (!m) { nf++; continue; }
  fs.writeFileSync(f, s.replace(RE, badged(m[1])));
  ch++;
}
console.log(`aanmeldknop-badge toegevoegd: ${ch} | al aanwezig: ${sk} | geen match: ${nf}`);

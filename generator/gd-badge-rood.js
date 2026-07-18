// Zet het pulserende ringetje en het hartje van de Aanmelden-badge op warm rood.
// Idempotent (verandert alleen zolang het nog goud/geel is). Draaien:
// node generator/gd-badge-rood.js
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const RING_OUD = "border:2px solid #b8893b;animation:gd-pulse";
const RING_NIEUW = "border:2px solid #d1483f;animation:gd-pulse";
const HART_OUD = '<span class="gd-badge" aria-hidden="true">&#128155;</span>';
const HART_NIEUW = '<span class="gd-badge" aria-hidden="true">&#10084;&#65039;</span>';

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith(".html")) a.push(p);
  }
  return a;
}

let ch = 0;
for (const f of walk(ROOT)) {
  let s = fs.readFileSync(f, "utf8");
  const s2 = s.replace(RING_OUD, RING_NIEUW).replace(HART_OUD, HART_NIEUW);
  if (s2 !== s) { fs.writeFileSync(f, s2); ch++; }
}
console.log(`badge naar warm rood: ${ch} bestand(en) bijgewerkt.`);

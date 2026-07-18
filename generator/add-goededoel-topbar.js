// Vervangt site-breed het topbar-bericht "Het eerste bod is zelden het beste"
// door het goede-doel-bericht. Idempotent en veilig (raakt alleen dat ene bericht).
// Draaien: node generator/add-goededoel-topbar.js
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// Bericht #3 herkennen aan het UNIEKE icoon-pad (M3 17l6-6 4 4 7-7), niet aan tekst/pijl.
const RE = /<span class="tb-msg"><svg[^>]*><path d="M3 17l6-6 4 4 7-7"\/>[\s\S]*?<\/span>/;
const NEW = '<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 21s-6.7-4.3-9.3-8.5C1 9.4 2.4 5.7 5.7 5.1 7.6 4.8 9.4 5.7 10.5 7.2 11.6 5.7 13.4 4.8 15.3 5.1c3.3.6 4.7 4.3 3 7.4C18.7 16.7 12 21 12 21z"/></svg>Voor elke klant doneren we <b>&euro;33</b> aan een goed doel dat jij kiest &rarr;</span>';

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
  if (s.includes("Voor elke klant doneren we")) { sk++; continue; }
  if (!RE.test(s)) { nf++; continue; }
  fs.writeFileSync(f, s.replace(RE, NEW));
  ch++;
}
console.log(`topbar goede-doel-bericht toegevoegd: ${ch} | al aanwezig: ${sk} | geen topbar-match: ${nf}`);

// Voegt site-breed de footer-link "Ons goede doel" toe, direct na de Blog-link
// in de footer-linkbalk. Gebruikt het prefix van de bestaande Blog-link, zodat
// het relatieve pad per maplaag klopt. Idempotent en veilig.
// Draaien: node generator/add-goededoel-footer.js
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const RE = /<a href="([^"]*)blog\/index\.html">Blog<\/a>/;

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
  if (s.includes('een-nieuw-begin.html">Ons goede doel')) { sk++; continue; }
  const m = s.match(RE);
  if (!m) { nf++; continue; }
  const repl = `<a href="${m[1]}blog/index.html">Blog</a><a href="${m[1]}een-nieuw-begin.html">Ons goede doel</a>`;
  fs.writeFileSync(f, s.replace(RE, repl));
  ch++;
}
console.log(`footer-link "Ons goede doel" toegevoegd: ${ch} | al aanwezig: ${sk} | geen anker: ${nf}`);

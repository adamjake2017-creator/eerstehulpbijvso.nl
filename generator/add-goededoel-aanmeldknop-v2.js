// Upgrade van de "Aanmelden"-knop-badge: groter hartje + zacht pulserend ringetje
// zodat het beter opvalt. Injecteert een klein scoped <style>-blok per pagina
// (geen wijziging aan style.css). Idempotent. Respecteert prefers-reduced-motion.
// Draaien: node generator/add-goededoel-aanmeldknop-v2.js
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const TITLE = "Voor elke klant doneren we 33 euro aan een goed doel dat jij kiest";

// Matcht de bestaande badge (data-gd="1") inclusief de span, tot de eerste </a>.
const RE_LINK = /<a href="([^"]*aanmelden\.html)" class="hl" data-gd="1"[\s\S]*?<\/a>/;

const STYLE = '<style id="gd-style">' +
  '.gd-badge{position:absolute;top:-10px;right:-10px;width:23px;height:23px;border-radius:50%;background:#fff;border:1px solid #e7dcc9;display:grid;place-items:center;font-size:12px;box-shadow:0 2px 7px rgba(0,0,0,.22);z-index:3}' +
  '.gd-badge::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #b8893b;animation:gd-pulse 1.8s ease-out infinite}' +
  '@keyframes gd-pulse{0%{transform:scale(.75);opacity:.7}70%{transform:scale(1.55);opacity:0}100%{opacity:0}}' +
  '@media(prefers-reduced-motion:reduce){.gd-badge::after{animation:none;opacity:0}}' +
  '</style>';

function newLink(href) {
  return `<a href="${href}" class="hl" data-gd="2" title="${TITLE}" style="position:relative;overflow:visible">Aanmelden<span class="gd-badge" aria-hidden="true">&#128155;</span></a>`;
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
  if (s.includes('data-gd="2"')) { sk++; continue; }
  const m = s.match(RE_LINK);
  if (!m) { nf++; continue; }
  s = s.replace(RE_LINK, newLink(m[1]));
  if (!s.includes('id="gd-style"')) s = s.replace("</head>", STYLE + "</head>");
  fs.writeFileSync(f, s);
  ch++;
}
console.log(`aanmeldknop-badge v2 (groter + pulse): ${ch} | al v2: ${sk} | geen v1-badge: ${nf}`);

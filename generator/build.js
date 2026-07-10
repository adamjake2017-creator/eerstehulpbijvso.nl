/* Eerste hulp bij VSO — SEO-paginagenerator.
   Draai met:  node generator/build.js
   Genereert bedrijfs-, stad- en scenariopagina's + slimme combinaties,
   een overzichtspagina en sitemap.xml. Dependency-vrij. */

const fs = require("fs");
const path = require("path");
const { WA, companies, cities, scenarios, companyNews, articles, helpClusters } = require("./data.js");

const ROOT = path.join(__dirname, "..");
const SITE = "https://eerstehulpbijvso.nl";
// Cache-buster op basis van de inhoud van style.css, zodat na elke CSS-wijziging
// de verse stylesheet geladen wordt (voorkomt dat oude, gecachte CSS blijft hangen).
const CSS_VER = require("crypto").createHash("md5").update(fs.readFileSync(path.join(__dirname, "..", "assets", "style.css"))).digest("hex").slice(0, 8);
const ORG_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"LegalService","@id":SITE+"/#org",
  name:"Eerste hulp bij VSO", url:SITE+"/",
  logo:SITE+"/assets/logo.png", image:SITE+"/assets/logo.png",
  address:{"@type":"PostalAddress",streetAddress:"Vlierweg 12",postalCode:"1032 LG",addressLocality:"Amsterdam",addressCountry:"NL"},
  description:"Platform dat werknemers met een vaststellingsovereenkomst binnen 15 minuten koppelt aan een arbeidsrechtspecialist voor een betere, WW-veilige deal.",
  areaServed:"NL", availableLanguage:"nl", telephone:"+31645733083", priceRange:"Gratis check, kosten meestal vergoed door werkgever",
  sameAs:["https://www.linkedin.com/company/eerstehulpbijvso/"]
})}</script>`;

const cityBySlug = Object.fromEntries(cities.map(c => [c.slug, c]));
const companiesByCity = {};
companies.forEach(co => { (companiesByCity[co.hq] ||= []).push(co); });

const enc = s => encodeURIComponent(s);
const waLink = txt => `https://wa.me/${WA}?text=${enc(txt)}`;
const written = [];

function ensureDir(p){ fs.mkdirSync(path.dirname(p), { recursive:true }); }
function write(rel, html){
  const p = path.join(ROOT, rel);
  ensureDir(p);
  fs.writeFileSync(p, html, "utf8");
  written.push(rel.replace(/\\/g,"/"));
}

// ---- shared partials -------------------------------------------------------
const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />`;

const WA_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.6-1.5-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-.6 3 .5 1.4 1.3 2.6 2.5 3.8 1.7 1.7 3.2 2.3 4.6 2.7.9.2 1.6.2 2.2-.1.6-.3 1.7-1 1.9-1.6.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.6-.4zM12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a8.2 8.2 0 1 1 7.1 4z"/></svg>`;

function head({title, desc, keywords, canonical, ogType="article", prefix, faq, crumbs, extraLd}){
  const faqLd = faq ? `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    mainEntity: faq.map(f => ({ "@type":"Question", name:f.q, acceptedAnswer:{ "@type":"Answer", text:f.a }}))
  })}</script>` : "";
  const crumbLd = (crumbs && crumbs.length) ? `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement: crumbs.map((c,i)=>({ "@type":"ListItem", position:i+1, name:c.name, item:c.url }))
  })}</script>` : "";
  const moreLd = extraLd || "";
  return `<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<meta name="keywords" content="${keywords}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="${ogType}" /><meta property="og:locale" content="nl_NL" />
<meta property="og:title" content="${title}" /><meta property="og:description" content="${desc}" />
<meta property="og:url" content="${canonical}" />
${FONT}
<link rel="icon" type="image/png" href="${prefix}assets/favicon.png" />
<link rel="stylesheet" href="${prefix}assets/style.css?v=${CSS_VER}" />
${ORG_LD}
${crumbLd}
${faqLd}
${moreLd}
</head><body><div class="grain"></div>`;
}

function header(prefix, waText){
  return `<header id="hdr"><a class="topbar" href="${prefix}aanmelden.html" aria-label="Gratis en vrijblijvend een specialist spreken">
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9.3a3.5 3.5 0 1 0 0 5.4"/><path d="M8 11h5M8 13.4h5"/></svg><b>Gratis</b>, en meestal geen kosten voor jou →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>Een specialist die <b>jouw kant</b> kiest →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 17l6-6 4 4 7-7"/><path d="M17 7h4v4"/></svg>Het eerste bod is <b>zelden het beste</b> →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 11.5z"/></svg><b>Gratis en vrijblijvend</b>, binnen 15 min antwoord →</span>
</a><div class="bar">
<a href="${prefix}index.html" class="brand"><img class="mark" src="${prefix}assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<nav class="pnav">
<a href="${prefix}reorganisatie/index.html">Reorganisatie</a>
<a href="${prefix}vaststellingsovereenkomst/index.html">Situaties</a>
<a href="${prefix}hulp/index.html">Arbeidsrecht</a>
<a href="${prefix}tools/index.html">Hulpmiddelen</a>
<a href="${prefix}vso-hulp/index.html">Steden</a>
<a href="${prefix}blog/index.html">Kennisbank</a>
<a href="${prefix}aanmelden.html" class="hl">Aanmelden</a>
</nav>
<a href="${waLink(waText)}" class="cta-top">Gratis check →</a>
<button class="navtoggle" aria-label="Menu"><span></span><span></span><span></span></button>
</div></header>`;
}

const DEFAULT_FOOT_NOTE = "Onafhankelijke informatie voor werknemers. Geen juridisch advies op maat.";
const fixCaps = s => s.replace(/\bvso\b/gi,"VSO").replace(/\bww\b/gi,"WW").replace(/\bai\b/gi,"AI");
const labelFromSlug = slug => { const t = slug.replace(/-/g," "); return fixCaps(t.charAt(0).toUpperCase()+t.slice(1)); };

// Footer volgt een hub-and-spoke-opzet: per kolom een gecureerde top met de
// belangrijkste pagina's, en een "alle ..."-link naar de hub die de volledige
// lijst draagt. Zo blijft de linkkracht gebundeld op de hubs en de tools i.p.v.
// verdund over 200+ identieke sitewide-links (beter voor SEO én AI-SEO).
const FOOTER_SCENARIOS = ["reorganisatie","boventallig-verklaard","onder-druk-getekend","tijdens-ziekte","ziek-en-boventallig","is-mijn-vso-een-goede-deal","wat-is-gangbaar-onderhandelen","transitievergoeding-onderhandelen","ww-aanvragen-na-vso","werkgever-dreigt-met-uwv","concurrentiebeding","vrijstelling-van-werk","finale-kwijting","vso-en-belasting"];
const FOOTER_COMPANIES = ["heineken","asml","abn-amro","ing","de-volksbank","philips","kpn","rabobank","shell","achmea","klm","ns","unilever","capgemini","booking-com"];
const FOOTER_TOOLS = [
  { href:"tools/transitievergoeding-berekenen.html", label:"Transitievergoeding berekenen" },
  { href:"tools/wat-is-mijn-vso-waard.html", label:"Wat is mijn VSO waard?" },
  { href:"tools/ww-veilig-scan.html", label:"WW-veilig-scan" },
  { href:"tools/bedenktermijn-berekenen.html", label:"Bedenktermijn berekenen" },
  { href:"tools/mag-mijn-werkgever-druk-zetten.html", label:"Word je onder druk gezet?" },
  { href:"10-valkuilen-bij-een-vso.html", label:"Gratis gids: 10 valkuilen" }
];
const coBySlug = Object.fromEntries(companies.map(c => [c.slug, c]));
const scenBySlug = Object.fromEntries(scenarios.map(s => [s.slug, s]));

function footer(prefix, note, wrapClass){
  wrapClass = wrapClass || "wrap-wide";
  const link = x => `<a href="${prefix}${x.href}">${x.label}</a>`;
  const allLink = (href, label) => `<a class="foot-all" href="${prefix}${href}">${label} →</a>`;
  const scen = FOOTER_SCENARIOS.filter(s=>scenBySlug[s]).map(s=>({ href:`vaststellingsovereenkomst/${s}.html`, label:labelFromSlug(s) }));
  const cits = cities.slice(0,15).map(c=>({ href:`vso-hulp/${c.slug}.html`, label:c.name }));
  const cos  = FOOTER_COMPANIES.filter(s=>coBySlug[s]).map(s=>({ href:`reorganisatie/vaststellingsovereenkomst-${s}.html`, label:coBySlug[s].name }));
  const col = (h4, arr, allHref, allLabel) => `<div class="footcol"><h4>${h4}</h4><div class="linkgrid solo">${arr.map(link).join("")}${allLink(allHref, allLabel)}</div></div>`;
  return `<footer><div class="${wrapClass}">
<div class="foottop">
<a href="${prefix}index.html" class="brand"><img class="mark" src="${prefix}assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<p class="foot-intro">Van paniek naar een goede, veilige deal, met een specialist die jouw kant kiest. Meestal zonder kosten voor jou.</p>
<div class="flinks">
<a href="${prefix}reorganisatie/index.html">Reorganisatie</a>
<a href="${prefix}vaststellingsovereenkomst/index.html">Situaties</a>
<a href="${prefix}hulp/index.html">Arbeidsrecht</a>
<a href="${prefix}tools/index.html">Hulpmiddelen</a>
<a href="${prefix}vso-hulp/index.html">Steden</a>
<a href="${prefix}overzicht.html">Alles</a>
<a href="${prefix}blog/index.html">Kennisbank</a>
<a href="${prefix}voor-werkgevers.html">Voor werkgevers</a>
<a href="${waLink("Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.")}">WhatsApp</a>
<a href="mailto:hello@eerstehulpbijvso.nl">E-mail</a>
<a href="https://www.linkedin.com/company/eerstehulpbijvso/" target="_blank" rel="noopener">LinkedIn</a>
</div>
</div>
<div class="footcols">
${col("Jouw situatie", scen, "vaststellingsovereenkomst/index.html", `Alle ${scenarios.length} situaties`)}
<div class="footcol"><h4>Hulpmiddelen</h4><div class="linkgrid solo">${FOOTER_TOOLS.map(link).join("")}${allLink("tools/index.html","Alle hulpmiddelen")}</div></div>
${col("Hulp per stad", cits, "vso-hulp/index.html", `Alle ${cities.length} steden`)}
${col("Ontslag per bedrijf", cos, "reorganisatie/index.html", `Alle ${companies.length} bedrijven`)}
</div>
<div class="fbot"><span>© <span id="yr"></span> Eerste hulp bij VSO · Vlierweg 12, 1032 LG Amsterdam · KvK 64043770</span><span><a href="${prefix}privacy.html">Privacyverklaring</a> · <a href="${prefix}voorwaarden.html">Algemene voorwaarden</a></span><span>${note || DEFAULT_FOOT_NOTE}</span></div>
</div></footer>`;
}

function waFloat(){
  return `<a class="wa" href="${waLink("Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.")}" target="_blank" rel="noopener" aria-label="Stuur een WhatsApp">${WA_SVG}<span class="lbl">Stuur ons een <b>WhatsApp</b></span></a>`;
}

const SCRIPT = `<script>
const hdr=document.getElementById('hdr');addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>30));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0,rootMargin:"0px 0px -40px 0px"});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();
(function(){var t=document.querySelector('.navtoggle');if(!t)return;var m=document.createElement('div');m.className='mobilemenu';document.querySelectorAll('.pnav a, nav.pills a').forEach(function(a){m.appendChild(a.cloneNode(true))});var c=document.querySelector('.cta-top');if(c){var cc=c.cloneNode(true);cc.classList.remove('cta-top');cc.classList.add('btn-wa');m.appendChild(cc)}document.body.appendChild(m);function cl(){m.classList.remove('open');document.body.classList.remove('menu-open');t.classList.remove('on')}t.addEventListener('click',function(){var o=m.classList.toggle('open');document.body.classList.toggle('menu-open',o);t.classList.toggle('on',o)});m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',cl)})})();
</script></body></html>`;

const steps = (a,b,c) => `<section class="block"><div class="wrap"><h2 class="big reveal">Zo helpen we je, <em>vandaag nog</em></h2><div class="grid3">
<div class="step reveal"><div class="num">01</div><h3>Deel je situatie</h3><p>${a}</p></div>
<div class="step reveal"><div class="num">02</div><h3>Wij analyseren alles</h3><p>${b}</p></div>
<div class="step reveal"><div class="num">03</div><h3>Wij onderhandelen</h3><p>${c}</p></div>
</div></div></section>`;

const checklist = items => `<ul>${items.map(i=>`<li>${i}</li>`).join("")}</ul>`;

// Vergelijkingstabel (snippet-vriendelijk). t = { head:[...], rows:[[...],...] }
const cmpTable = t => `<table class="cmp"><thead><tr>${t.head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${
  t.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")
}</tbody></table>`;

function relatedBlock(prefix, links){
  return `<section class="block"><div class="wrap"><h2 class="big reveal">Lees ook <em>verder</em></h2><div class="prose reveal"><ul>${
    links.map(l=>`<li><a href="${prefix}${l.href}" style="color:var(--gold-deep)">${l.label}</a></li>`).join("")
  }</ul></div></div></section>`;
}

function band(prefix, h, p, waText){
  return `<div class="band reveal"><h2>${h}</h2><p>${p}</p><a class="btn btn-primary" href="${waLink(waText)}">Stuur ons een WhatsApp</a></div>`;
}

const NL_MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
function fmtDate(iso){ const [y,m,d] = iso.split("-").map(Number); return `${d} ${NL_MONTHS[m-1]} ${y}`; }

// "Actueel"-blok met geverifieerd reorganisatienieuws op een bedrijfspagina.
function newsBox(n){
  if(!n) return "";
  const src = n.url ? `<a href="${n.url}" target="_blank" rel="noopener nofollow" style="color:var(--gold-deep)">${n.src}</a>` : n.src;
  return `<div class="reveal" style="margin-top:24px;border:1px solid rgba(120,90,40,.18);border-left:4px solid var(--gold-deep);border-radius:14px;padding:22px 26px;background:rgba(190,150,70,.05)">
<span style="display:inline-block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-deep);font-weight:600">● Actueel · geverifieerd</span>
<p style="margin:10px 0 6px;font-family:Fraunces,serif;font-size:21px;line-height:1.3;color:var(--ink)">${n.fig}</p>
<p style="margin:0 0 10px">${n.text}</p>
<p style="margin:0;font-size:13px;color:var(--ink-mute)">Bron: ${src} · ${n.date} · geen officiële uiting van of namens het bedrijf</p>
</div>`;
}

// ---- COMPANY PAGES ---------------------------------------------------------
function buildCompany(co){
  const prefix = "../";
  const rel = `reorganisatie/vaststellingsovereenkomst-${co.slug}.html`;
  const url = `${SITE}/reorganisatie/vaststellingsovereenkomst-${co.slug}.html`;
  const waText = `Hoi, ik werk bij ${co.name} en heb een vaststellingsovereenkomst gekregen. Ik wil graag een gratis check.`;
  const city = cityBySlug[co.hq];
  const faq = [
    { q:`Moet ik mijn vaststellingsovereenkomst bij ${co.name} direct tekenen?`, a:"Nee. Je hebt na ondertekening nog een wettelijke bedenktermijn van 14 dagen (21 dagen als die termijn niet in de overeenkomst staat). Laat je nooit onder druk zetten." },
    { q:"Behoud ik mijn WW-uitkering bij ontslag door reorganisatie?", a:"Als de overeenkomst duidelijk maakt dat het ontslag op initiatief van de werkgever is, op bedrijfseconomische gronden en zonder verwijt aan jou, en de einddatum de fictieve opzegtermijn respecteert, behoud je in de regel je WW." },
    { q:"Kan ik onderhandelen over mijn vergoeding?", a:"Ja. De transitievergoeding is de bodem, niet het plafond. Bij een reorganisatie of sociaal plan valt er vaak meer te onderhandelen." }
  ];
  const related = [
    { href:`vso-hulp/${co.hq}.html`, label:`VSO-hulp in ${city ? city.name : co.hq}` },
    { href:`vaststellingsovereenkomst/reorganisatie.html`, label:"Vaststellingsovereenkomst bij een reorganisatie" },
    { href:`vaststellingsovereenkomst/boventallig-verklaard.html`, label:"Boventallig verklaard: wat nu?" },
    { href:`vaststellingsovereenkomst/ontslag-door-ai.html`, label:"Ontslag omdat je werk door AI wordt overgenomen" },
    { href:`tools/transitievergoeding-berekenen.html`, label:"Bereken je transitievergoeding 2026" }
  ];
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Reorganisatie",url:SITE+"/reorganisatie/"},{name:co.name,url}],
    title:`Vaststellingsovereenkomst bij ${co.name}? Dit zijn je rechten | Eerste hulp bij VSO`,
    desc:`Kreeg je een vaststellingsovereenkomst bij ${co.name}? Teken niets. Binnen 15 minuten een specialist die je WW veiligstelt en een betere deal onderhandelt. Gratis check via WhatsApp.`,
    keywords:`vaststellingsovereenkomst ${co.name.toLowerCase()}, ontslag ${co.name.toLowerCase()}, reorganisatie ${co.name.toLowerCase()}, boventallig ${co.name.toLowerCase()}`,
    canonical:url, prefix, faq
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Reorganisatie › ${co.name}</p>
<p class="eyebrow reveal">Reorganisatie · jouw rechten</p>
<h1 class="title reveal">Vaststellingsovereenkomst bij ${co.name}?<br><em>Adem.</em> Teken nog niets.</h1>
<p class="lead reveal">${co.tone} Maar een reorganisatie betekent niet dat je akkoord hoeft te gaan met het eerste voorstel. Juist bij een grote ontslagronde is er ruimte om te onderhandelen, en is het extra belangrijk dat je WW veilig is. Wij staan naast je, van het eerste gesprek tot je handtekening.</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Wat er nu bij ${co.name} <em>speelt</em></h2>
<div class="prose reveal"><p>${co.reorg}</p><p>Als jou een vaststellingsovereenkomst wordt voorgelegd, is dat het moment om even pas op de plaats te maken. Niet uit wantrouwen, maar omdat de details in de ${co.sector} duizenden euro's en je uitkering kunnen bepalen.</p></div>
${newsBox(companyNews[co.slug])}
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Waar je op moet <em>letten</em></h2>
<div class="prose reveal">
<h3>Is de afspiegeling correct toegepast?</h3><p>Bij bedrijfseconomisch ontslag moet je werkgever meestal het afspiegelingsbeginsel volgen. Gaat dat niet zorgvuldig, dan sta je sterker dan je denkt.</p>
<h3>Geldt er een sociaal plan?</h3><p>Bij grote reorganisaties is er vaak een sociaal plan met een vergoeding boven de wettelijke transitievergoeding. Ken je dat niet, dan onderhandel je in het duister.</p>
<h3>Blijft je WW veilig?</h3><p>De overeenkomst moet duidelijk maken dat het ontslag op initiatief van de werkgever is, op neutrale gronden en zonder verwijt aan jou. Anders ontstaat een gat in je inkomen.</p>
${checklist(["Is je vergoeding marktconform en in lijn met het sociaal plan?","Word je vrijgesteld van werk met behoud van salaris?","Krijg je ruimte voor outplacement of omscholing?","Wat valt er onder de finale kwijting?"])}
</div></div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Het standaardvoorstel vs. <em>wat er vaak nog in zit</em></h2>
<div class="prose reveal">
<p>Veel vaststellingsovereenkomsten bij ${co.name} beginnen met een voorstel dat netjes oogt, maar waar in de ${co.sector} vaak meer in zit. Dit is waar wij standaard naar kijken voordat je tekent:</p>
${cmpTable({
  head:["Onderdeel","Het standaardvoorstel","Wat er vaak nog in zit"],
  rows:[
    ["Vergoeding","Rond de wettelijke transitievergoeding","Een hoger bedrag, marktconform voor de "+co.sector+", zeker met een sociaal plan"],
    ["WW-zekerheid","Niet altijd waterdicht geformuleerd","Neutrale gronden en een correcte einddatum, zodat je WW veilig is"],
    ["Vrijstelling van werk","Soms, tot de einddatum","Vrijstelling met behoud van salaris, plus uitbetaling van je vakantiedagen"],
    ["Concurrentie- of relatiebeding","Blijft vaak ongewijzigd staan","Geschrapt of versoepeld, zodat je vrij verder kunt"],
    ["Juridische kosten","Voor eigen rekening","Vergoed door de werkgever, vaak € 750 tot € 1.000"],
    ["Bedenktijd","Druk om snel te tekenen","Je volledige 14 (of 21) dagen, rustig en goed geïnformeerd"]
  ]
})}
</div></div></section>

${steps(
  `Stuur ons een appje. Binnen 15 minuten heb je een specialist aan de lijn die je geruststelt.`,
  `We toetsen je overeenkomst aan het sociaal plan, checken je WW en zoeken waar meer te halen valt.`,
  `Je specialist haalt eruit wat erin zit en regelt dat de kosten door de werkgever worden gedragen.`
)}

${relatedBlock(prefix, related)}
${band(prefix, "Je hebt jaren gegeven.<br>Kom nu op voor <em>jezelf</em>.", "Gratis, vrijblijvend en zonder dat je vandaag iets hoeft te beslissen. Eén appje en je staat er niet meer alleen voor.", waText)}
</main>`
  + footer(prefix, `Onafhankelijke informatie voor werknemers. Geen officiële uiting van of namens ${co.name}.`)
  + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:`Vaststellingsovereenkomst bij ${co.name}`, rel };
}

// ---- CITY PAGES ------------------------------------------------------------
function buildCity(ci){
  const prefix = "../";
  const rel = `vso-hulp/${ci.slug}.html`;
  const url = `${SITE}/vso-hulp/${ci.slug}.html`;
  const waText = `Hoi, ik zoek in ${ci.name} hulp bij mijn vaststellingsovereenkomst. Ik wil graag een gratis check.`;
  const locals = companiesByCity[ci.slug] || [];
  const faq = [
    { q:`Kan ik in ${ci.name} snel hulp krijgen bij mijn VSO?`, a:`Ja. Waar je in ${ci.name} of omgeving ook werkt, je hebt binnen 15 minuten een specialist aan de lijn, ook 's avonds en in het weekend.` },
    { q:"Wat kost het mij?", a:"In de regel niets. Werkgevers bieden vaak tussen de € 750 en € 1.000 voor juridische bijstand, en zit dat er niet in dan halen wij het voor je binnen." }
  ];
  const related = [
    ...locals.slice(0,4).map(co => ({ href:`reorganisatie/vaststellingsovereenkomst-${co.slug}.html`, label:`Reorganisatie bij ${co.name}` })),
    { href:`vaststellingsovereenkomst/reorganisatie.html`, label:"Vaststellingsovereenkomst bij een reorganisatie" },
    { href:`tools/transitievergoeding-berekenen.html`, label:"Bereken je transitievergoeding 2026" }
  ];
  const localEmployers = locals.length
    ? `<p>Grote werkgevers in en rond ${ci.name} waar reorganisaties spelen, zijn onder meer ${locals.map(c=>c.name).join(", ")}. Werk je daar? Dan kennen wij de context.</p>` : "";
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"VSO-hulp",url:SITE+"/vso-hulp/"},{name:ci.name,url}],
    title:`Vaststellingsovereenkomst-hulp in ${ci.name} | Gratis check binnen 1 dag — Eerste hulp bij VSO`,
    desc:`VSO gekregen in ${ci.name}? Binnen 15 minuten een specialist aan de lijn die je WW veiligstelt en een betere deal onderhandelt. Gratis check, meestal zonder kosten voor jou.`,
    keywords:`vaststellingsovereenkomst ${ci.name.toLowerCase()}, ontslagjurist ${ci.name.toLowerCase()}, vso hulp ${ci.name.toLowerCase()}, arbeidsrecht ${ci.name.toLowerCase()}`,
    canonical:url, prefix, faq, ogType:"website"
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › VSO-hulp › ${ci.name}</p>
<p class="eyebrow reveal">VSO-hulp in ${ci.province}</p>
<h1 class="title reveal">Hulp bij je VSO<br>in <em>${ci.name}</em></h1>
<p class="lead reveal">Onverwacht een vaststellingsovereenkomst op je bureau, ergens in ${ci.name} of de regio? Haal eerst even adem, want je hoeft vandaag niets te tekenen. Wij koppelen je aan een specialist die de lokale arbeidsmarkt kent en onderhandelen een betere, WW-veilige deal.</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Ontslag in <em>${ci.name}</em></h2>
<div class="prose reveal"><p>${ci.local}</p>${localEmployers}
<p>Kom je er met je werkgever niet uit, dan is bij een arbeidszaak de ${ci.court} het bevoegde gerecht. Zover hoeft het zelden te komen: verreweg de meeste VSO's worden in goed overleg verbeterd, zonder gang naar de rechter.</p></div></div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Waar je op moet <em>letten</em></h2>
<div class="prose reveal">${checklist(["Is je vergoeding marktconform voor jouw sector en regio?","Is je WW volledig veiliggesteld?","Kloppen de bedenktermijn en de einddatum?","Wat valt er onder de finale kwijting?"])}</div></div></section>

${steps(
  `Stuur ons een appje. Binnen 15 minuten heb je een specialist aan de lijn, ook 's avonds en in het weekend.`,
  `We beoordelen je overeenkomst tot in de details en stellen je WW veilig.`,
  `We onderhandelen een betere deal en regelen dat de werkgever de kosten draagt.`
)}

${relatedBlock(prefix, related)}
${band(prefix, "Je staat er in ${ci.name} niet<br>alleen <em>voor</em>.".replace("${ci.name}", ci.name), "Eén appje en je hebt een specialist naast je die jouw kant kiest. Gratis en vrijblijvend.", waText)}
</main>`
  + footer(prefix)
  + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:`VSO-hulp in ${ci.name}`, rel };
}

// ---- SCENARIO PAGES --------------------------------------------------------
function buildScenario(sc){
  const prefix = "../";
  const rel = `vaststellingsovereenkomst/${sc.slug}.html`;
  const url = `${SITE}/vaststellingsovereenkomst/${sc.slug}.html`;
  const waText = `Hoi, ik heb een vraag over mijn vaststellingsovereenkomst (${sc.h1.toLowerCase()}). Ik wil graag een gratis check.`;
  const faq = [
    { q:"Moet ik direct tekenen?", a:"Nee, je hebt altijd een wettelijke bedenktermijn van 14 dagen (21 dagen als die niet is vermeld). Teken nooit onder druk." },
    { q:"Kost hulp mij iets?", a:"Meestal niet. De werkgever biedt vaak een vergoeding voor juridische bijstand van tussen de € 750 en € 1.000, en zit dat er niet in dan halen wij het voor je binnen." }
  ];
  const related = [
    { href:`vaststellingsovereenkomst/reorganisatie.html`, label:"Vaststellingsovereenkomst bij een reorganisatie" },
    { href:`vaststellingsovereenkomst/tijdens-ziekte.html`, label:"Vaststellingsovereenkomst tijdens ziekte" },
    { href:`tools/transitievergoeding-berekenen.html`, label:"Bereken je transitievergoeding 2026" }
  ].filter(l => !l.href.endsWith(`${sc.slug}.html`));
  const howToLd = `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo",name:"In 3 stappen van vaststellingsovereenkomst naar een goede deal",step:[{"@type":"HowToStep",position:1,name:"Deel je situatie",text:"Stuur ons een appje en vertel kort wat er speelt. Binnen 15 minuten heb je een specialist aan de lijn."},{"@type":"HowToStep",position:2,name:"Wij beoordelen je situatie",text:"We beoordelen je situatie en overeenkomst en leggen precies uit waar je staat."},{"@type":"HowToStep",position:3,name:"Wij onderhandelen",text:"We onderhandelen een betere, veilige deal en regelen dat de werkgever de kosten draagt."}]})}</script>`;
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Vaststellingsovereenkomst",url:SITE+"/vaststellingsovereenkomst/"},{name:labelFromSlug(sc.slug),url}],
    extraLd:howToLd,
    title:`${sc.h1} | Eerste hulp bij VSO`,
    desc:`${sc.intro.slice(0,150)}`,
    keywords:`${sc.h1.toLowerCase()}, vaststellingsovereenkomst, ${sc.slug.replace(/-/g," ")}, vso ${sc.slug.replace(/-/g," ")}`,
    canonical:url, prefix, faq
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Vaststellingsovereenkomst › ${sc.h1}</p>
<p class="eyebrow reveal">Jouw situatie</p>
<h1 class="title reveal">${sc.h1}</h1>
<p class="lead reveal">${sc.intro}</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Wat je moet <em>weten</em></h2>
<div class="prose reveal"><p>${sc.body}</p><p><strong style="color:var(--ink)">Het grootste risico:</strong> ${sc.risk}</p></div></div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Onze <em>checklist</em></h2>
<div class="prose reveal">${checklist(sc.check)}</div></div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">VSO of ontslag via de <em>rechter?</em></h2>
<div class="prose reveal">
<table class="cmp"><thead><tr><th>Aspect</th><th>Vaststellingsovereenkomst</th><th>Ontslag via UWV of kantonrechter</th></tr></thead>
<tbody>
<tr><td>Hoe het gaat</td><td>In onderling overleg, met een handtekening</td><td>Eenzijdig, via een procedure</td></tr>
<tr><td>Snelheid</td><td>Vaak binnen enkele weken geregeld</td><td>Kan maanden duren</td></tr>
<tr><td>WW-recht</td><td>Blijft veilig als de overeenkomst neutraal is opgesteld</td><td>Blijft in de regel behouden</td></tr>
<tr><td>Onderhandelingsruimte</td><td>Groot, vergoeding en voorwaarden zijn bespreekbaar</td><td>Beperkt, de rechter of het UWV beslist</td></tr>
<tr><td>Bedenktermijn</td><td>14 dagen (21 als niet vermeld)</td><td>Niet van toepassing</td></tr>
</tbody></table>
<p>Verreweg de meeste ontslagen lopen via een vaststellingsovereenkomst, juist omdat er ruimte is om er samen goed uit te komen. Wij zorgen dat je die ruimte optimaal benut.</p>
</div></div></section>

${steps(
  `Stuur ons een appje en vertel kort wat er speelt. Binnen 15 minuten heb je een specialist aan de lijn.`,
  `We beoordelen je situatie en overeenkomst en leggen precies uit waar je staat.`,
  `We onderhandelen een betere, veilige deal en regelen dat de werkgever de kosten draagt.`
)}

${relatedBlock(prefix, related)}
${band(prefix, "Twijfel je?<br>Vraag het ons, <em>gratis</em>.", "Eén appje en een specialist kijkt met je mee. Vrijblijvend en zonder dat je vandaag iets hoeft te beslissen.", waText)}
</main>`
  + footer(prefix)
  + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:sc.h1, rel };
}

// ---- COMPANY × CITY COMBO PAGES (alleen HQ/hoofdvestiging) ------------------
function buildCombo(co){
  const ci = cityBySlug[co.hq];
  if(!ci) return null;
  const prefix = "../";
  const rel = `reorganisatie/vso-${co.slug}-in-${ci.slug}.html`;
  const url = `${SITE}/reorganisatie/vso-${co.slug}-in-${ci.slug}.html`;
  const waText = `Hoi, ik werk bij ${co.name} in ${ci.name} en heb een vaststellingsovereenkomst gekregen. Ik wil graag een gratis check.`;
  const faq = [
    { q:`Ik werk bij ${co.name} in ${ci.name}, kan ik snel hulp krijgen?`, a:"Ja, binnen 15 minuten heb je een specialist aan de lijn die zowel je werkgever als de regionale arbeidsmarkt kent." },
    { q:"Behoud ik mijn WW?", a:"Als de overeenkomst neutraal is opgesteld en het initiatief bij de werkgever ligt, blijft je WW in de regel veilig. Wij controleren dat vóór je tekent." }
  ];
  const related = [
    { href:`reorganisatie/vaststellingsovereenkomst-${co.slug}.html`, label:`Alles over de reorganisatie bij ${co.name}` },
    { href:`vso-hulp/${ci.slug}.html`, label:`VSO-hulp in ${ci.name}` },
    { href:`tools/transitievergoeding-berekenen.html`, label:"Bereken je transitievergoeding 2026" }
  ];
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Reorganisatie",url:SITE+"/reorganisatie/"},{name:co.name+" in "+ci.name,url}],
    title:`Vaststellingsovereenkomst bij ${co.name} in ${ci.name}? Zo sta je sterk | Eerste hulp bij VSO`,
    desc:`Werk je bij ${co.name} in ${ci.name} en kreeg je een VSO? Teken niets. Binnen 15 minuten een specialist die je WW veiligstelt en een betere deal onderhandelt.`,
    keywords:`vaststellingsovereenkomst ${co.name.toLowerCase()} ${ci.name.toLowerCase()}, ontslag ${co.name.toLowerCase()} ${ci.name.toLowerCase()}, vso ${co.slug} ${ci.slug}`,
    canonical:url, prefix, faq
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Reorganisatie › ${co.name} in ${ci.name}</p>
<p class="eyebrow reveal">${co.name} · ${ci.name}</p>
<h1 class="title reveal">VSO bij ${co.name}<br>in <em>${ci.name}?</em></h1>
<p class="lead reveal">${co.tone} En dat midden in ${ci.name}, waar je werk, je collega's en vaak je hypotheek samenkomen. Wij kennen zowel ${co.name} als de arbeidsmarkt in ${ci.name}, en zorgen dat jij met een gerust hart tekent. Of pas tekent als het écht goed is.</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">${co.name} in ${ci.name}: de <em>context</em></h2>
<div class="prose reveal"><p>${co.reorg}</p><p>${ci.local}</p>
<p>Kom je er niet uit, dan is de ${ci.court} bevoegd. Maar dat is zelden nodig: de meeste vaststellingsovereenkomsten worden in goed overleg verbeterd.</p>
${checklist(["Is de afspiegeling en het sociaal plan correct toegepast?","Is je vergoeding marktconform voor ${ci.name}?".replace("${ci.name}", ci.name),"Is je WW volledig veiliggesteld?","Wat valt er onder de finale kwijting?"])}
</div></div></section>

${steps(
  `Stuur ons een appje. Binnen 15 minuten spreek je een specialist die ${co.name} kent.`.replace("${co.name}", co.name),
  `We toetsen je overeenkomst aan het sociaal plan en de regionale arbeidsmarkt.`,
  `We onderhandelen een betere deal en regelen dat de kosten door de werkgever worden gedragen.`
)}

${relatedBlock(prefix, related)}
${band(prefix, "Van ${ci} tot je handtekening:<br>wij staan <em>naast je</em>.".replace("${ci}", ci.name), "Eén appje en je hebt een specialist die jouw kant kiest. Gratis en vrijblijvend.", waText)}
</main>`
  + footer(prefix, `Onafhankelijke informatie voor werknemers. Geen officiële uiting van of namens ${co.name}.`)
  + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:`VSO bij ${co.name} in ${ci.name}`, rel };
}

// ---- PILLAR HUB PAGES ------------------------------------------------------
function buildPillar({ folder, title, desc, keywords, eyebrow, h1html, lead, sections, bandH, bandP }){
  const prefix = "../";
  const waText = "Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.";
  const url = `${SITE}/${folder}/`;
  const sec = (t, items) => `<section class="block"><div class="wrap"><h2 class="big reveal">${t}</h2><div class="prose reveal"><ul>${
    items.map(i=>`<li><a href="${prefix}${i.rel}" style="color:var(--gold-deep)">${i.label}</a></li>`).join("")
  }</ul></div></div></section>`;
  const html = head({ crumbs:[{name:"Home",url:SITE+"/"},{name:title.split(" | ")[0],url}], title, desc, keywords, canonical:url, prefix, ogType:"website" })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › ${title.split(" | ")[0]}</p>
<p class="eyebrow reveal">${eyebrow}</p>
<h1 class="title reveal">${h1html}</h1>
<p class="lead reveal">${lead}</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>
${sections.map(s => sec(s.title, s.items)).join("")}
${band(prefix, bandH, bandP, waText)}
</main>`
  + footer(prefix) + waFloat() + SCRIPT;
  write(`${folder}/index.html`, html);
  return { url, label:title.split(" | ")[0], rel:`${folder}/index.html` };
}

// ---- ARBEIDSRECHT-CLUSTERS (/hulp/) ----------------------------------------
function buildHelpCluster(c){
  const prefix = "../";
  const rel = `hulp/${c.slug}.html`;
  const url = `${SITE}/hulp/${c.slug}.html`;
  const waText = `Hoi, ik heb een vraag over ${labelFromSlug(c.slug).toLowerCase()} en wil graag een gratis check.`;
  const howToLd = `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo",name:"In 3 stappen van probleem naar een goede oplossing",step:[{"@type":"HowToStep",position:1,name:"Deel je situatie",text:"Stuur ons een appje en vertel kort wat er speelt. Binnen 15 minuten heb je een specialist aan de lijn."},{"@type":"HowToStep",position:2,name:"Wij beoordelen je situatie",text:"We beoordelen je situatie en leggen precies uit waar je staat en wat je opties zijn."},{"@type":"HowToStep",position:3,name:"Wij staan naast je",text:"We komen op voor je rechten en, waar dat kan, regelen we dat de kosten door de werkgever worden gedragen."}]})}</script>`;
  const related = [
    ...(c.extraRelated || []),
    { href:c.funnelHref, label:c.funnelLabel },
    { href:`vaststellingsovereenkomst/index.html`, label:"Alles over de vaststellingsovereenkomst" },
    { href:`tools/mag-mijn-werkgever-druk-zetten.html`, label:"Word je onder druk gezet? Doe de check" }
  ];
  const sections = c.sections.map(s => {
    const inner = s.list ? checklist(s.list) : `<p>${s.p}</p>`;
    return `<section class="block"><div class="wrap"><h2 class="big reveal">${s.h}</h2><div class="prose reveal">${s.p && s.list ? `<p>${s.p}</p>`:""}${inner}</div></div></section>`;
  }).join("\n");
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Arbeidsrecht",url:SITE+"/hulp/"},{name:labelFromSlug(c.slug),url}],
    extraLd:howToLd,
    title:`${labelFromSlug(c.slug)} | Eerste hulp bij VSO & arbeidsrecht`,
    desc:c.desc, keywords:c.keywords, canonical:url, prefix, faq:c.faq
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › <a href="${prefix}hulp/index.html">Arbeidsrecht</a> › ${labelFromSlug(c.slug)}</p>
<p class="eyebrow reveal">${c.eyebrow}</p>
<h1 class="title reveal">${c.h1}</h1>
<p class="lead reveal">${c.lead}</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}hulp/index.html">Meer arbeidsrechthulp</a></div>
</div></section>
${sections}
${c.table ? `<section class="block"><div class="wrap"><h2 class="big reveal">${c.tableH}</h2><div class="prose reveal">${cmpTable(c.table)}</div></div></section>` : ""}
<section class="block"><div class="wrap"><h2 class="big reveal">Het grootste <em>risico</em></h2><div class="prose reveal"><p>${c.risk}</p></div></div></section>
<section class="block"><div class="wrap"><h2 class="big reveal">Onze <em>checklist</em></h2><div class="prose reveal">${checklist(c.check)}</div></div></section>
${steps(
  `Stuur ons een appje en vertel kort wat er speelt. Binnen 15 minuten heb je een specialist aan de lijn.`,
  `We beoordelen je situatie en leggen precies uit waar je staat en wat je opties zijn.`,
  `We komen op voor je rechten en regelen waar mogelijk dat de werkgever de kosten draagt.`
)}
${relatedBlock(prefix, related)}
${band(prefix, c.funnelH, c.funnelP, waText)}
</main>`
  + footer(prefix) + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:labelFromSlug(c.slug), rel, desc:c.desc };
}

function buildHelpHub(clusterPages){
  const prefix = "../";
  const url = `${SITE}/hulp/`;
  const waText = "Hoi, ik heb een arbeidsrechtelijke vraag en wil graag een gratis check.";
  const itemLd = `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"ItemList",
    name:"Eerste hulp bij arbeidsrecht",
    itemListElement: clusterPages.map((c,i)=>({ "@type":"ListItem", position:i+1, url:c.url, name:c.label }))
  })}</script>`;
  const cards = clusterPages.map(c=>`<a class="reveal" href="${prefix}${c.rel}" style="display:block;border:1px solid rgba(120,90,40,.16);border-radius:16px;padding:26px;text-decoration:none;color:inherit;background:rgba(190,150,70,.04)">
<h3 style="font-family:Fraunces,serif;font-weight:400;font-size:23px;line-height:1.25;margin:0 0 10px;color:var(--ink)">${c.label}</h3>
<p style="margin:0;color:var(--ink-mute);line-height:1.55">${c.desc}</p></a>`).join("\n");
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Arbeidsrecht",url}],
    extraLd:itemLd,
    title:"Eerste hulp bij arbeidsrecht voor werknemers | Eerste hulp bij VSO",
    desc:"Meer dan alleen de vaststellingsovereenkomst. Hulp bij ontslag op staande voet, ziekte, arbeidsconflicten, bedingen en meer. Binnen 15 minuten een specialist die jouw kant kiest.",
    keywords:"arbeidsrecht hulp werknemer, ontslag op staande voet, arbeidsconflict, concurrentiebeding, ziekte reintegratie, gratis juridisch advies werknemer",
    canonical:url, prefix, ogType:"website"
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Arbeidsrecht</p>
<p class="eyebrow reveal">Eerste hulp bij arbeidsrecht</p>
<h1 class="title reveal">Meer dan je <em>VSO</em>.<br>Wij staan naast je.</h1>
<p class="lead reveal">Een vaststellingsovereenkomst is niet het enige moment waarop je werkgever aan de langste kant van het touw lijkt te staan. Bij ontslag op staande voet, ziekte, een conflict of een beding gelden net zo goed jouw rechten. Kies hieronder waar het bij jou om draait, en weet: bij twijfel is één appje genoeg.</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a></div>
</div></section>
<section class="block"><div class="wrap">
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
${cards}
</div></div></section>
<section class="block"><div class="wrap"><h2 class="big reveal">Draait het om je <em>vaststellingsovereenkomst?</em></h2>
<div class="prose reveal"><p>Veel arbeidskwesties monden uiteindelijk uit in een vaststellingsovereenkomst. Dat is ons vlaggenschip: <a href="${prefix}vaststellingsovereenkomst/index.html" style="color:var(--gold-deep)">bekijk alle situaties rond je VSO</a>, of ga direct naar <a href="${prefix}reorganisatie/index.html" style="color:var(--gold-deep)">ontslag door reorganisatie</a> en onze <a href="${prefix}tools/index.html" style="color:var(--gold-deep)">gratis hulpmiddelen</a>.</p></div></div></section>
${band(prefix, "Waar je ook mee zit:<br>vraag het ons, <em>gratis</em>.", "Eén appje en een specialist kijkt met je mee. Vrijblijvend en zonder dat je vandaag iets hoeft te beslissen.", waText)}
</main>`
  + footer(prefix) + waFloat() + SCRIPT;
  write("hulp/index.html", html);
  return { url, label:"Arbeidsrecht", rel:"hulp/index.html" };
}

// ---- TOOLS HUB -------------------------------------------------------------
const TOOLS_HUB = [
  { href:"tools/transitievergoeding-berekenen.html", name:"Transitievergoeding berekenen 2026", desc:"Bereken je wettelijke transitievergoeding, inclusief vakantiegeld en vaste toeslagen. Zo ken je je bodembedrag voordat je onderhandelt." },
  { href:"tools/wat-is-mijn-vso-waard.html", name:"Wat is mijn VSO waard?", desc:"Check aan de hand van een paar vragen of het bod in jouw vaststellingsovereenkomst marktconform is, of dat er meer in zit." },
  { href:"tools/ww-veilig-scan.html", name:"Is jouw VSO WW-veilig? Doe de scan", desc:"Vijf korte vragen met een stoplicht-uitkomst die laten zien of jouw overeenkomst je WW-uitkering veiligstelt." },
  { href:"tools/bedenktermijn-berekenen.html", name:"Hoeveel bedenktijd heb je nog?", desc:"Vul je tekendatum in en zie precies tot wanneer je kosteloos kunt terugkomen op je handtekening: 14 of 21 dagen." },
  { href:"tools/mag-mijn-werkgever-druk-zetten.html", name:"Word je onder druk gezet om te tekenen?", desc:"Vink aan wat je werkgever doet, van tekenbonus tot dreigen met het UWV, en zie meteen waarom je rechten er niet door veranderen." },
  { href:"10-valkuilen-bij-een-vso.html", name:"Gratis gids: 10 valkuilen bij een VSO", desc:"De tien fouten die werknemers het vaakst maken bij een vaststellingsovereenkomst, en hoe je ze voorkomt." }
];
function buildToolsHub(){
  const prefix = "../";
  const url = `${SITE}/tools/`;
  const waText = "Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.";
  const itemLd = `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"ItemList",
    name:"Hulpmiddelen bij je vaststellingsovereenkomst",
    itemListElement: TOOLS_HUB.map((t,i)=>({ "@type":"ListItem", position:i+1, url:`${SITE}/${t.href}`, name:t.name }))
  })}</script>`;
  const cards = TOOLS_HUB.map(t=>`<a class="reveal" href="${prefix}${t.href}" style="display:block;border:1px solid rgba(120,90,40,.16);border-radius:16px;padding:26px;text-decoration:none;color:inherit;background:rgba(190,150,70,.04)">
<h3 style="font-family:Fraunces,serif;font-weight:400;font-size:23px;line-height:1.25;margin:0 0 10px;color:var(--ink)">${t.name}</h3>
<p style="margin:0;color:var(--ink-mute);line-height:1.55">${t.desc}</p></a>`).join("\n");
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Hulpmiddelen",url}],
    extraLd:itemLd,
    title:"Gratis hulpmiddelen bij je vaststellingsovereenkomst | Eerste hulp bij VSO",
    desc:"Bereken je transitievergoeding, check of je VSO WW-veilig is, zie hoeveel bedenktijd je hebt en of je onder druk wordt gezet. Alle gratis tools op een rij.",
    keywords:"vso tools, transitievergoeding berekenen, ww-veilig scan, bedenktermijn berekenen, vaststellingsovereenkomst check, vso waard",
    canonical:url, prefix, ogType:"website"
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Hulpmiddelen</p>
<p class="eyebrow reveal">Gratis hulpmiddelen</p>
<h1 class="title reveal">Reken en check<br>het <em>zelf</em></h1>
<p class="lead reveal">Voordat je iets tekent, wil je weten waar je staat. Met deze gratis hulpmiddelen bereken je je vergoeding, check je of je WW veilig is en zie je hoeveel tijd je nog hebt. Kom je er niet uit, dan is één appje genoeg.</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a></div>
</div></section>
<section class="block"><div class="wrap">
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
${cards}
</div></div></section>
${band(prefix, "Liever direct een <em>antwoord?</em>", "Stuur ons je situatie. Binnen 15 minuten heb je een specialist aan de lijn die met je meekijkt. Gratis en vrijblijvend.", waText)}
</main>`
  + footer(prefix) + waFloat() + SCRIPT;
  write("tools/index.html", html);
  return { url, label:"Hulpmiddelen", rel:"tools/index.html" };
}

// ---- SOMMATIEBRIEF (bestellen, zonder directe betaling) --------------------
function buildSommatiebrief(){
  const prefix = "";
  const url = `${SITE}/sommatiebrief.html`;
  const waText = "Hoi, ik wil graag een brief laten opstellen (loon niet betaald of ongelijke behandeling). Kunnen jullie me helpen?";
  const faq = [
    { q:"Wat kost het?", a:"Een klein, vast bedrag. Je hoort de exacte prijs vooraf en je betaalt niets totdat je akkoord bent. Gaat het om onbetaald loon, dan proberen we de kosten bovendien op je werkgever te verhalen." },
    { q:"Wat gebeurt er nadat ik bestel?", a:"We nemen contact met je op, stellen een paar korte vragen en stellen de brief op maat voor je op. Je verstuurt die zelf, of wij doen dat namens jou." },
    { q:"Werkt zo'n brief echt?", a:"Vaak wel. Een formele brief van een jurist met een duidelijke termijn zet veel werkgevers alsnog aan tot betalen of een oplossing, zonder dat het tot een procedure hoeft te komen." }
  ];
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Brief laten opstellen",url}],
    title:"Laat een stevige brief opstellen door een jurist | Eerste hulp bij VSO",
    desc:"Loon niet betaald of ongelijk behandeld? Laat een jurist een stevige brief voor je opstellen, voor een klein bedrag. Vaak is dat al genoeg. Je betaalt pas na akkoord.",
    keywords:"sommatiebrief, ingebrekestelling loon, incassobrief werkgever, brief loon niet betaald, juridische brief laten opstellen, stevige brief werkgever",
    canonical:url, prefix, faq, ogType:"website"
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="index.html">Home</a> › Brief laten opstellen</p>
<p class="eyebrow reveal">Voor een klein bedrag · je betaalt pas na akkoord</p>
<h1 class="title reveal">Vaak is één stevige<br>brief al <em>genoeg</em></h1>
<p class="lead reveal">Betaalt je werkgever je loon niet of te laat, of word je ongelijk behandeld? Een formele brief van een jurist, met een duidelijke termijn en de juiste onderbouwing, zet vaak alles alsnog in beweging. Wij stellen die brief voor een klein bedrag op maat voor je op.</p>
</div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Hoe het <em>werkt</em></h2>
<div class="grid3">
<div class="step reveal"><div class="num">01</div><h3>Je vraagt de brief aan</h3><p>Vul hieronder kort in wat er speelt. Je zit nog nergens aan vast en betaalt nu niets.</p></div>
<div class="step reveal"><div class="num">02</div><h3>Wij stellen 'm op maat op</h3><p>Een jurist schrijft een stevige, juridisch kloppende brief, afgestemd op jouw situatie. De prijs hoor je vooraf.</p></div>
<div class="step reveal"><div class="num">03</div><h3>De brief gaat de deur uit</h3><p>Je verstuurt de brief zelf, of wij doen dat namens jou. Gaat het om onbetaald loon, dan proberen we de kosten op je werkgever te verhalen.</p></div>
</div></div></section>

<section class="block" style="padding-top:10px"><div class="wrap">
<form action="verstuur.php" method="post" enctype="multipart/form-data" class="card reveal">
<input type="hidden" name="onderwerp" value="Bestelling: brief laten opstellen" />
<div class="field"><label for="naam">Je naam</label><input id="naam" name="naam" type="text" required autocomplete="name" /></div>
<div class="calc" style="gap:20px">
<div class="field"><label for="email">E-mailadres</label><input id="email" name="email" type="email" required autocomplete="email" /></div>
<div class="field"><label for="telefoon">Telefoonnummer</label><input id="telefoon" name="telefoon" type="tel" required autocomplete="tel" /></div>
</div>
<div class="field"><label for="brief_type">Waar gaat je brief over?</label>
<select id="brief_type" name="brief_type">
<option value="">Kies wat van toepassing is</option>
<option>Loon dat niet of te laat is betaald</option>
<option>Ongelijke behandeling of ongelijk loon</option>
<option>Een concurrentie- of relatiebeding</option>
<option>Iets anders</option>
</select></div>
<div class="field"><label for="situatie">Beschrijf kort je situatie</label><textarea id="situatie" name="situatie" required placeholder="Bijvoorbeeld: mijn werkgever heeft mijn loon van vorige maand nog niet betaald, ondanks herhaald vragen."></textarea></div>
<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" />
<label class="consent"><input type="checkbox" name="toestemming" required /><span>Ik geef toestemming om mijn gegevens te verwerken en te delen met de specialist die mijn brief opstelt. Ik heb de <a href="privacy.html" style="color:var(--gold-deep)">privacyverklaring</a> gelezen.</span></label>
<button type="submit" class="btn btn-primary">Vraag de brief aan</button>
<p class="hint" style="margin-top:16px">Je betaalt niets totdat je de prijs kent en akkoord bent. Liever direct contact? <a href="${waLink(waText)}" style="color:var(--gold-deep)">Stuur ons een WhatsApp</a>.</p>
</form>
</div></section>
${band(prefix, "Liever eerst even <em>overleggen?</em>", "Stuur ons een appje met wat er speelt. We kijken gratis mee en zeggen eerlijk of een brief in jouw geval de beste stap is.", waText)}
</main>`
  + footer(prefix) + waFloat() + SCRIPT;
  write("sommatiebrief.html", html);
  return { url, label:"Brief laten opstellen", rel:"sommatiebrief.html" };
}

// ---- KENNISBANK (BLOG) -----------------------------------------------------
function buildArticle(a){
  const prefix = "../";
  const rel = `blog/${a.slug}.html`;
  const url = `${SITE}/blog/${a.slug}.html`;
  const waText = "Hoi, ik heb een vraag over mijn vaststellingsovereenkomst. Ik wil graag een gratis check.";
  const related = articles.filter(x => x.slug !== a.slug).slice(0,3)
    .map(x => ({ href:`blog/${x.slug}.html`, label:x.title }))
    .concat([{ href:`tools/wat-is-mijn-vso-waard.html`, label:"Wat is mijn VSO waard? Check je aanbod" }]);
  const artLd = `<script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org","@type":"Article",
    headline:a.title, description:a.desc, datePublished:a.date, dateModified:a.date,
    author:{"@type":"Organization",name:"Eerste hulp bij VSO",url:SITE+"/"},
    publisher:{"@type":"Organization",name:"Eerste hulp bij VSO",logo:{"@type":"ImageObject",url:SITE+"/assets/logo.png"}},
    mainEntityOfPage:url
  })}</script>`;
  const body = a.blocks.map(b => {
    const inner = b.table ? cmpTable(b.table) : b.list ? checklist(b.list) : `<p>${b.p}</p>`;
    return `<section class="block"><div class="wrap"><h2 class="big reveal">${b.h}</h2>
<div class="prose reveal">${inner}</div></div></section>`;
  }).join("\n");
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Kennisbank",url:SITE+"/blog/"},{name:a.title,url}],
    extraLd:artLd,
    title:`${a.title} | Eerste hulp bij VSO`,
    desc:a.desc,
    keywords:`${a.cat.toLowerCase()}, vaststellingsovereenkomst, vso, ${a.slug.replace(/-/g," ")}`,
    canonical:url, prefix, faq:a.faq
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › <a href="${prefix}blog/index.html">Kennisbank</a> › ${a.cat}</p>
<p class="eyebrow reveal">${a.cat} · ${fmtDate(a.date)} · ${a.read} min lezen</p>
<h1 class="title reveal">${a.h1}</h1>
<p class="lead reveal">${a.intro}</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="${waLink(waText)}">Stuur ons een WhatsApp</a><a class="btn btn-ghost" href="${prefix}tools/wat-is-mijn-vso-waard.html">Check je VSO-aanbod</a></div>
</div></section>
${body}
${relatedBlock(prefix, related)}
${band(prefix, "Speelt dit ook bij jou?<br>Vraag het ons, <em>gratis</em>.", "Eén appje en een specialist kijkt met je mee. Vrijblijvend en zonder dat je vandaag iets hoeft te beslissen.", waText)}
</main>`
  + footer(prefix)
  + waFloat() + SCRIPT;
  write(rel, html);
  return { url, label:a.title, rel };
}

function buildBlogIndex(){
  const prefix = "../";
  const url = `${SITE}/blog/`;
  const waText = "Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.";
  const sorted = [...articles].sort((x,y) => y.date.localeCompare(x.date));
  const cards = sorted.map(a => `<a class="reveal" href="${prefix}blog/${a.slug}.html" style="display:block;border:1px solid rgba(120,90,40,.16);border-radius:16px;padding:26px;text-decoration:none;color:inherit;background:rgba(190,150,70,.04)">
<span style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);font-weight:600">${a.cat}</span>
<h3 style="font-family:Fraunces,serif;font-weight:400;font-size:23px;line-height:1.25;margin:12px 0 10px;color:var(--ink)">${a.title}</h3>
<p style="margin:0 0 16px;color:var(--ink-mute);line-height:1.55">${a.desc}</p>
<span style="font-size:13px;color:var(--ink-mute)">${fmtDate(a.date)} · ${a.read} min lezen</span></a>`).join("\n");
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Kennisbank",url}],
    title:"Kennisbank over de vaststellingsovereenkomst | Eerste hulp bij VSO",
    desc:"Heldere artikelen over je vaststellingsovereenkomst: reorganisatie, transitievergoeding, WW-behoud en actueel bedrijfsnieuws. Praktisch uitgelegd.",
    keywords:"vaststellingsovereenkomst uitleg, vso kennisbank, transitievergoeding, ww behoud, reorganisatie 2026",
    canonical:url, prefix, ogType:"website"
  })
  + header(prefix, waText)
  + `<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="${prefix}index.html">Home</a> › Kennisbank</p>
<p class="eyebrow reveal">Kennisbank</p>
<h1 class="title reveal">Alles over je <em>VSO</em>, helder uitgelegd</h1>
<p class="lead reveal">Van de reorganisatiegolf van 2026 tot het veiligstellen van je WW: hier lees je in gewone taal waar je op moet letten. En bij twijfel is één appje genoeg.</p>
</div></section>
<section class="block"><div class="wrap">
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
${cards}
</div></div></section>
${band(prefix, "Liever direct een <em>antwoord?</em>", "Stuur ons een appje met jouw situatie. Binnen 15 minuten heb je een specialist aan de lijn.", waText)}
</main>`
  + footer(prefix)
  + waFloat() + SCRIPT;
  write("blog/index.html", html);
  return { url, label:"Kennisbank", rel:"blog/index.html" };
}

// ---- OVERVIEW HUB + SITEMAP ------------------------------------------------
function buildOverview(groups){
  const prefix = "";
  const section = (title, items) => `<section class="block"><div class="wrap"><h2 class="big reveal">${title}</h2><div class="prose reveal"><ul>${
    items.map(i=>`<li><a href="${prefix}${i.rel}" style="color:var(--gold-deep)">${i.label}</a></li>`).join("")
  }</ul></div></div></section>`;
  const html = head({
    crumbs:[{name:"Home",url:SITE+"/"},{name:"Alle onderwerpen",url:SITE+"/overzicht.html"}],
    title:"Alle onderwerpen | Eerste hulp bij VSO",
    desc:"Overzicht van alle hulp bij vaststellingsovereenkomsten: per bedrijf, per stad en per situatie. Vind jouw onderwerp en krijg binnen 15 minuten een specialist.",
    keywords:"vaststellingsovereenkomst hulp, vso per bedrijf, vso per stad, ontslag scenario's",
    canonical:`${SITE}/overzicht.html`, prefix, ogType:"website"
  })
  + header(prefix, "Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.")
  + `<main><section class="page"><div class="wrap">
<p class="eyebrow reveal">Alle onderwerpen</p>
<h1 class="title reveal">Vind <em>jouw</em> situatie</h1>
<p class="lead reveal">Werk je bij een bedrijf dat reorganiseert, zoek je hulp in jouw stad, of speelt er een specifieke situatie? Kies je onderwerp hieronder. En weet: bij twijfel is één appje genoeg.</p>
</div></section>
${groups.help && groups.help.length ? section("Eerste hulp bij arbeidsrecht", groups.help) : ""}
${groups.articles ? section("Kennisbank", groups.articles) : ""}
${section("Per situatie", groups.scenarios)}
${section("Per bedrijf", groups.companies)}
${section("Per bedrijf en stad", groups.combos)}
${section("Per stad", groups.cities)}
</main>`
  + footer(prefix)
  + waFloat() + SCRIPT;
  write("overzicht.html", html);
}

function buildSitemap(all){
  const urls = [
    `${SITE}/`,
    `${SITE}/overzicht.html`,
    `${SITE}/aanmelden.html`,
    `${SITE}/10-valkuilen-bij-een-vso.html`,
    `${SITE}/privacy.html`,
    `${SITE}/voorwaarden.html`,
    `${SITE}/voor-werkgevers.html`,
    `${SITE}/tools/transitievergoeding-berekenen.html`,
    `${SITE}/tools/wat-is-mijn-vso-waard.html`,
    `${SITE}/tools/ww-veilig-scan.html`,
    `${SITE}/tools/bedenktermijn-berekenen.html`,
    `${SITE}/tools/mag-mijn-werkgever-druk-zetten.html`,
    ...all.map(a => a.url)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map(u=>`  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join("\n")
    + `\n</urlset>\n`;
  write("sitemap.xml", xml);
}

// ---- EXPORTS (voor sync-partials.js) ---------------------------------------
module.exports = { head, header, footer, waFloat, SCRIPT };

// ---- RUN -------------------------------------------------------------------
if (require.main === module) {
const companyPages = companies.map(buildCompany);
const cityPages = cities.map(buildCity);
const scenarioPages = scenarios.map(buildScenario);
const comboPages = companies.map(buildCombo).filter(Boolean);
const articlePages = articles.map(buildArticle);
const blogIndexPage = buildBlogIndex();
const toolsHubPage = buildToolsHub();
const helpClusterPages = helpClusters.map(buildHelpCluster);
const helpHubPage = buildHelpHub(helpClusterPages);
const sommatiebriefPage = buildSommatiebrief();

const reorgScenarioSlugs = ["reorganisatie","boventallig-verklaard","collectief-ontslag","ziek-en-boventallig","onder-druk-getekend","werkgever-dreigt-met-uwv","ontslag-door-ai","na-overname-of-fusie"];
const reorgScenarioPages = scenarioPages.filter(p => reorgScenarioSlugs.some(s => p.rel.endsWith(`/${s}.html`)));

const pillarReorg = buildPillar({
  folder:"reorganisatie",
  title:"Ontslag door reorganisatie? Je rechten in 2026 | Eerste hulp bij VSO",
  desc:"Boventallig door een reorganisatie? Ontdek je rechten per bedrijf, of je WW veilig is en hoeveel vergoeding je kunt onderhandelen. Binnen 15 minuten een specialist.",
  keywords:"ontslag door reorganisatie, boventallig, vaststellingsovereenkomst reorganisatie, sociaal plan, afspiegelingsbeginsel",
  eyebrow:"Reorganisatie · jouw rechten",
  h1html:"Ontslag door een<br><em>reorganisatie?</em>",
  lead:"De reorganisatiegolf van 2026 raakt duizenden werknemers tegelijk. Word je boventallig, dan betekent dat niet dat je slecht functioneert, en niet dat je akkoord hoeft te gaan met het eerste voorstel. Vind hieronder de hulp die bij jouw werkgever en situatie past.",
  sections:[
    { title:"Situaties bij een reorganisatie", items:reorgScenarioPages },
    { title:"Per bedrijf", items:companyPages },
    { title:"Per bedrijf en stad", items:comboPages }
  ],
  bandH:"Boventallig?<br>Kom op voor <em>jezelf</em>.",
  bandP:"Eén appje en je hebt een specialist naast je die jouw kant kiest. Gratis en vrijblijvend."
});

const pillarVso = buildPillar({
  folder:"vaststellingsovereenkomst",
  title:"Vaststellingsovereenkomst gekregen? Alle situaties op een rij | Eerste hulp bij VSO",
  desc:"Alles over je vaststellingsovereenkomst: bedenktermijn, WW, transitievergoeding, ziekte, concurrentiebeding en onderhandelen. Teken niets voordat je dit leest.",
  keywords:"vaststellingsovereenkomst, vso gekregen wat nu, beëindigingsovereenkomst, vso laten controleren, bedenktermijn",
  eyebrow:"Jouw situatie",
  h1html:"Vind jouw situatie<br>rond je <em>VSO</em>",
  lead:"Elke vaststellingsovereenkomst is anders, en elke situatie vraagt om net andere aandacht. Ziek, zwanger, na een lang dienstverband of met een concurrentiebeding: kies hieronder wat op jou van toepassing is.",
  sections:[
    { title:"Alle situaties", items:scenarioPages },
    { title:"Uit de kennisbank", items:articlePages },
    { title:"Handige hulpmiddelen", items:[
      { rel:"tools/transitievergoeding-berekenen.html", label:"Transitievergoeding berekenen 2026" },
      { rel:"tools/wat-is-mijn-vso-waard.html", label:"Wat is mijn VSO waard? Check je aanbod" },
      { rel:"tools/ww-veilig-scan.html", label:"Is jouw VSO WW-veilig? Doe de scan" },
      { rel:"tools/bedenktermijn-berekenen.html", label:"Hoeveel bedenktijd heb je nog?" },
      { rel:"tools/mag-mijn-werkgever-druk-zetten.html", label:"Word je onder druk gezet? Doe de check" },
      { rel:"10-valkuilen-bij-een-vso.html", label:"Gratis gids: 10 valkuilen bij een VSO" }
    ] }
  ],
  bandH:"Twijfel je?<br>Vraag het ons, <em>gratis</em>.",
  bandP:"Eén appje en een specialist kijkt met je mee. Vrijblijvend en zonder dat je vandaag iets hoeft te beslissen."
});

const pillarCity = buildPillar({
  folder:"vso-hulp",
  title:"VSO-hulp bij jou in de buurt | Vaststellingsovereenkomst per stad | Eerste hulp bij VSO",
  desc:"Hulp bij je vaststellingsovereenkomst in jouw stad. Binnen 15 minuten een specialist die de lokale arbeidsmarkt kent. Gratis check, meestal zonder kosten voor jou.",
  keywords:"vaststellingsovereenkomst hulp, ontslagjurist stad, vso hulp regio, arbeidsrecht lokaal",
  eyebrow:"VSO-hulp per stad",
  h1html:"Hulp bij je VSO,<br>bij jou in de <em>buurt</em>",
  lead:"Waar je ook werkt in Nederland, je hebt binnen 15 minuten een specialist aan de lijn die je regio kent. Kies je stad hieronder.",
  sections:[
    { title:"Alle steden", items:cityPages }
  ],
  bandH:"Waar je ook zit:<br>wij staan <em>naast je</em>.",
  bandP:"Eén appje en je hebt een specialist die jouw kant kiest. Gratis en vrijblijvend."
});

const pillars = [pillarReorg, pillarVso, pillarCity];

buildOverview({ companies:companyPages, cities:cityPages, scenarios:scenarioPages, combos:comboPages, articles:articlePages, help:helpClusterPages });
buildSitemap([...pillars, toolsHubPage, helpHubPage, ...helpClusterPages, sommatiebriefPage, blogIndexPage, ...articlePages, ...companyPages, ...cityPages, ...scenarioPages, ...comboPages]);

console.log("Gegenereerd:");
console.log(`  ${pillars.length} pillar-pagina's + tools-hub + arbeidsrecht-hub`);
console.log(`  ${helpClusterPages.length} arbeidsrecht-cluster(s)`);
console.log(`  ${companyPages.length} bedrijfspagina's`);
console.log(`  ${cityPages.length} stadspagina's`);
console.log(`  ${scenarioPages.length} scenariopagina's`);
console.log(`  ${comboPages.length} bedrijf×stad-combinaties`);
console.log(`  ${articlePages.length} kennisbank-artikelen + blog/index.html`);
console.log(`  + overzicht.html en sitemap.xml`);
console.log(`  TOTAAL: ${written.length} bestanden geschreven.`);
}
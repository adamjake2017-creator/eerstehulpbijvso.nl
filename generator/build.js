/* Eerste hulp bij VSO — SEO-paginagenerator.
   Draai met:  node generator/build.js
   Genereert bedrijfs-, stad- en scenariopagina's + slimme combinaties,
   een overzichtspagina en sitemap.xml. Dependency-vrij. */

const fs = require("fs");
const path = require("path");
const { WA, companies, cities, scenarios } = require("./data.js");

const ROOT = path.join(__dirname, "..");
const SITE = "https://eerstehulpbijvso.nl";
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
<link rel="stylesheet" href="${prefix}assets/style.css" />
${ORG_LD}
${crumbLd}
${faqLd}
${moreLd}
</head><body><div class="grain"></div>`;
}

function header(prefix, waText){
  return `<header id="hdr"><div class="bar">
<a href="${prefix}index.html" class="brand"><img class="mark" src="${prefix}assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<nav class="pnav">
<a href="${prefix}reorganisatie/index.html">Reorganisatie</a>
<a href="${prefix}vaststellingsovereenkomst/index.html">Situaties</a>
<a href="${prefix}vso-hulp/index.html">Steden</a>
<a href="${prefix}tools/transitievergoeding-berekenen.html">Berekenen</a>
<a href="${prefix}overzicht.html">Alles</a>
</nav>
<a href="${waLink(waText)}" class="cta-top">Gratis check →</a>
<button class="navtoggle" aria-label="Menu"><span></span><span></span><span></span></button>
</div></header>`;
}

const DEFAULT_FOOT_NOTE = "Onafhankelijke informatie voor werknemers. Geen juridisch advies op maat.";
const fixCaps = s => s.replace(/\bvso\b/gi,"VSO").replace(/\bww\b/gi,"WW").replace(/\bai\b/gi,"AI");
const labelFromSlug = slug => { const t = slug.replace(/-/g," "); return fixCaps(t.charAt(0).toUpperCase()+t.slice(1)); };

function footer(prefix, note, wrapClass){
  wrapClass = wrapClass || "wrap-wide";
  const links = arr => arr.map(x=>`<a href="${prefix}${x.href}">${x.label}</a>`).join("");
  const scen = scenarios.map(s=>({ href:`vaststellingsovereenkomst/${s.slug}.html`, label:labelFromSlug(s.slug) }));
  const cits = cities.map(c=>({ href:`vso-hulp/${c.slug}.html`, label:c.name }));
  const cos  = companies.map(c=>({ href:`reorganisatie/vaststellingsovereenkomst-${c.slug}.html`, label:c.name }));
  return `<footer><div class="${wrapClass}">
<div class="foottop">
<a href="${prefix}index.html" class="brand"><img class="mark" src="${prefix}assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<p class="foot-intro">Van paniek naar een goede, veilige deal, met een specialist die jouw kant kiest. Meestal zonder kosten voor jou.</p>
<div class="flinks">
<a href="${prefix}reorganisatie/index.html">Reorganisatie</a>
<a href="${prefix}vaststellingsovereenkomst/index.html">Situaties</a>
<a href="${prefix}vso-hulp/index.html">Steden</a>
<a href="${prefix}tools/transitievergoeding-berekenen.html">Berekenen</a>
<a href="${prefix}overzicht.html">Alles</a>
<a href="${waLink("Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.")}">WhatsApp</a>
<a href="mailto:hello@eerstehulpbijvso.nl">E-mail</a>
<a href="https://www.linkedin.com/company/eerstehulpbijvso/" target="_blank" rel="noopener">LinkedIn</a>
</div>
</div>
<div class="footcols">
<div class="footcol one"><h4>Jouw situatie</h4><div class="linkgrid">${links(scen)}</div></div>
<div class="footcol"><h4>Hulp per stad</h4><div class="linkgrid">${links(cits)}</div></div>
<div class="footcol"><h4>Ontslag per bedrijf</h4><div class="linkgrid">${links(cos)}</div></div>
</div>
<div class="fbot"><span>© <span id="yr"></span> Eerste hulp bij VSO · Vlierweg 12, 1032 LG Amsterdam · KvK 64043770</span><span><a href="${prefix}privacy.html">Privacyverklaring</a> · <a href="${prefix}voorwaarden.html">Algemene voorwaarden</a></span><span>${note || DEFAULT_FOOT_NOTE}</span></div>
</div></footer>`;
}

function waFloat(){
  return `<a class="wa" href="${waLink("Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.")}" target="_blank" rel="noopener" aria-label="Stuur een WhatsApp">${WA_SVG}<span class="lbl">Stuur ons een <b>WhatsApp</b></span></a>`;
}

const SCRIPT = `<script>
const hdr=document.getElementById('hdr');addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>30));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
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

function relatedBlock(prefix, links){
  return `<section class="block"><div class="wrap"><h2 class="big reveal">Lees ook <em>verder</em></h2><div class="prose reveal"><ul>${
    links.map(l=>`<li><a href="${prefix}${l.href}" style="color:var(--gold-deep)">${l.label}</a></li>`).join("")
  }</ul></div></div></section>`;
}

function band(prefix, h, p, waText){
  return `<div class="band reveal"><h2>${h}</h2><p>${p}</p><a class="btn btn-primary" href="${waLink(waText)}">Stuur ons een WhatsApp</a></div>`;
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
<div class="prose reveal"><p>${co.reorg}</p><p>Als jou een vaststellingsovereenkomst wordt voorgelegd, is dat het moment om even pas op de plaats te maken. Niet uit wantrouwen, maar omdat de details in de ${co.sector} duizenden euro's en je uitkering kunnen bepalen.</p></div></div></section>

<section class="block"><div class="wrap"><h2 class="big reveal">Waar je op moet <em>letten</em></h2>
<div class="prose reveal">
<h3>Is de afspiegeling correct toegepast?</h3><p>Bij bedrijfseconomisch ontslag moet je werkgever meestal het afspiegelingsbeginsel volgen. Gaat dat niet zorgvuldig, dan sta je sterker dan je denkt.</p>
<h3>Geldt er een sociaal plan?</h3><p>Bij grote reorganisaties is er vaak een sociaal plan met een vergoeding boven de wettelijke transitievergoeding. Ken je dat niet, dan onderhandel je in het duister.</p>
<h3>Blijft je WW veilig?</h3><p>De overeenkomst moet duidelijk maken dat het ontslag op initiatief van de werkgever is, op neutrale gronden en zonder verwijt aan jou. Anders ontstaat een gat in je inkomen.</p>
${checklist(["Is je vergoeding marktconform en in lijn met het sociaal plan?","Word je vrijgesteld van werk met behoud van salaris?","Krijg je ruimte voor outplacement of omscholing?","Wat valt er onder de finale kwijting?"])}
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
    `${SITE}/privacy.html`,
    `${SITE}/voorwaarden.html`,
    `${SITE}/tools/transitievergoeding-berekenen.html`,
    `${SITE}/tools/ww-veilig-scan.html`,
    `${SITE}/tools/bedenktermijn-berekenen.html`,
    ...all.map(a => a.url)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map(u=>`  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join("\n")
    + `\n</urlset>\n`;
  write("sitemap.xml", xml);
}

// ---- RUN -------------------------------------------------------------------
const companyPages = companies.map(buildCompany);
const cityPages = cities.map(buildCity);
const scenarioPages = scenarios.map(buildScenario);
const comboPages = companies.map(buildCombo).filter(Boolean);

const reorgScenarioSlugs = ["reorganisatie","boventallig-verklaard","ontslag-door-ai","na-overname-of-fusie"];
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
    { title:"Handige hulpmiddelen", items:[
      { rel:"tools/transitievergoeding-berekenen.html", label:"Transitievergoeding berekenen 2026" },
      { rel:"tools/ww-veilig-scan.html", label:"Is jouw VSO WW-veilig? Doe de scan" },
      { rel:"tools/bedenktermijn-berekenen.html", label:"Hoeveel bedenktijd heb je nog?" }
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

buildOverview({ companies:companyPages, cities:cityPages, scenarios:scenarioPages, combos:comboPages });
buildSitemap([...pillars, ...companyPages, ...cityPages, ...scenarioPages, ...comboPages]);

// footer voor de handgemaakte homepage (prefix "" + smalle wrap), om in index.html te plakken
fs.writeFileSync(path.join(__dirname, "_footer-home.html"), footer("", null, "wrap"), "utf8");

console.log("Gegenereerd:");
console.log(`  ${pillars.length} pillar-pagina's`);
console.log(`  ${companyPages.length} bedrijfspagina's`);
console.log(`  ${cityPages.length} stadspagina's`);
console.log(`  ${scenarioPages.length} scenariopagina's`);
console.log(`  ${comboPages.length} bedrijf×stad-combinaties`);
console.log(`  + overzicht.html en sitemap.xml`);
console.log(`  TOTAAL: ${written.length} bestanden geschreven.`);
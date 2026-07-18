// ============================================================================
//  add-scenario.js  -  voegt VEILIG informatieve pagina's toe (root-niveau)
//  ----------------------------------------------------------------------------
//  Voor Google "People Also Ask"-vragen: voeg een record toe aan SCENARIOS,
//  draai `node generator/add-scenario.js`. Genereert <slug>.html in de huisstijl
//  (hero + secties + optionele vergelijkingstabel + FAQ + FAQ-schema), en zet
//  de pagina automatisch in sitemap.xml. Raakt GEEN andere pagina's aan.
//
//  Record-velden:
//   slug, title(<=60), desc(<=155), keywords, eyebrow, h1(html mag <em>),
//   lead, sections:[{h, html}], table?{caption,head:[],rows:[[...]]},
//   faq:[{q,a}], related:[{href,label}]
// ============================================================================

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const CSS_VER = "67f61170";
const today = new Date().toISOString().slice(0, 10);
const waGeneric = encodeURIComponent("Hoi, ik heb een vaststellingsovereenkomst gekregen en wil graag een gratis check.");

// ---- Pagina's ---------------------------------------------------------------
const SCENARIOS = [
  {
    slug: "netto-transitievergoeding",
    title: "Netto transitievergoeding: wat houd je over?",
    desc: "Wat blijft er netto over van je transitievergoeding of ontslagvergoeding? Hoe de belasting werkt en een indicatie van netto bij 10.000, 25.000 en 50.000 euro bruto.",
    keywords: "netto transitievergoeding, wat houd je netto over transitievergoeding, netto ontslagvergoeding, transitievergoeding belasting, netto van 25000 bruto",
    eyebrow: "Transitievergoeding · netto",
    h1: "Wat houd je <em>netto</em> over van je transitievergoeding?",
    lead: "Je transitievergoeding wordt bruto afgesproken, en daar gaat nog belasting vanaf. Hoeveel je netto overhoudt hangt af van je inkomen. Op deze pagina lees je hoe het werkt, met een indicatie per bedrag.",
    sections: [
      { h: "Bruto of netto? Het <em>verschil</em>", html: "<p>Een transitievergoeding (en elke ontslagvergoeding) wordt altijd <strong>bruto</strong> afgesproken. Het is fiscaal gewoon loon: je werkgever houdt er loonheffing op in, en het restant krijg je netto uitbetaald. De vergoeding telt niet mee voor premies werknemersverzekeringen, maar wel voor de inkomstenbelasting.</p>" },
      { h: "Hoeveel houd je <em>netto</em> over?", html: "<p>De belasting wordt ingehouden via het zogeheten <strong>bijzonder tarief</strong>. Dat percentage hangt af van je jaarinkomen: hoe hoger je inkomen, hoe hoger het tarief. Grofweg ligt het tussen de <strong>37% en 49,5%</strong>. Verdien je modaal, dan houd je dus meer over dan iemand met een hoog salaris.</p><p>Belangrijk: een eenmalige vergoeding kan je dat jaar in een hoger tarief duwen. Soms is het gunstig om de uitbetaling over een jaargrens te spreiden. Laat dat narekenen voordat je tekent.</p>" },
      { h: "Voorbeeld: netto van <em>25.000 euro</em> bruto", html: "<p>Een transitievergoeding van &euro;25.000 bruto levert indicatief tussen de <strong>&euro;12.600 en &euro;15.800 netto</strong> op, afhankelijk van je jaarinkomen en dus je tarief. Er is geen vast bedrag: het is echt persoonlijk. Onze <a href=\"tools/transitievergoeding-berekenen.html\" style=\"color:var(--gold-deep)\">calculator</a> rekent het brutobedrag uit; voor het netto bedrag is je persoonlijke tarief nodig.</p>" },
      { h: "Kun je de belasting <em>beperken?</em>", html: "<p>De ruimte is beperkt. De oude stamrecht-vrijstelling (waarmee je de vergoeding belastingvrij kon parkeren) is sinds 2014 afgeschaft. Wat soms wel helpt: de timing van de uitbetaling, of het bedrag deels in een ander belastingjaar laten vallen. Dit is maatwerk. Bij een goede vaststellingsovereenkomst kijken wij hier standaard naar mee." }
    ],
    table: {
      caption: "Indicatie netto per brutobedrag (afhankelijk van je jaarinkomen)",
      head: ["Bruto vergoeding", "Indicatief netto (lager tarief)", "Indicatief netto (hoger tarief)"],
      rows: [
        ["&euro;10.000", "~&euro;6.300", "~&euro;5.050"],
        ["&euro;25.000", "~&euro;15.800", "~&euro;12.600"],
        ["&euro;50.000", "~&euro;31.500", "~&euro;25.300"]
      ]
    },
    faq: [
      { q: "Wat houd je netto over van een transitievergoeding?", a: "Dat hangt af van je inkomen. De vergoeding is bruto en wordt belast via het bijzonder tarief, grofweg 37% tot 49,5%. Van 25.000 euro bruto houd je indicatief tussen de 12.600 en 15.800 euro netto over." },
      { q: "Hoeveel is de netto transitievergoeding van 25.000 euro bruto?", a: "Indicatief tussen de 12.600 en 15.800 euro netto, afhankelijk van je jaarinkomen en dus je belastingtarief. Er is geen vast bedrag, het is persoonlijk." },
      { q: "Wordt de transitievergoeding belast?", a: "Ja. Een transitievergoeding is fiscaal loon en wordt belast in box 1 via het bijzonder tarief. Ze telt niet mee voor de premies werknemersverzekeringen, maar wel voor de inkomstenbelasting." },
      { q: "Kun je belasting besparen op je ontslagvergoeding?", a: "De ruimte is beperkt sinds de stamrecht-vrijstelling in 2014 is afgeschaft. Soms helpt de timing van de uitbetaling of het spreiden over twee belastingjaren. Dit is maatwerk, laat het narekenen." }
    ],
    related: [
      { href: "transitievergoeding.html", label: "Wat is de transitievergoeding en hoe bereken je 'm?" },
      { href: "tools/transitievergoeding-berekenen.html", label: "Bereken je transitievergoeding 2026" },
      { href: "ww-en-transitievergoeding.html", label: "Telt de transitievergoeding mee voor je WW?" },
      { href: "vaststellingsovereenkomst/vso-en-belasting.html", label: "VSO en belasting" }
    ]
  },
  {
    slug: "voor-en-nadelen-vaststellingsovereenkomst",
    title: "Voor- en nadelen vaststellingsovereenkomst (VSO)",
    desc: "Wat zijn de voordelen en nadelen van een vaststellingsovereenkomst? En is het verstandig om te tekenen? Een eerlijk overzicht om vanuit rust te beslissen.",
    keywords: "nadelen vaststellingsovereenkomst, voordelen vaststellingsovereenkomst, is een vso gunstig, is het verstandig een vso te tekenen, voor en nadelen vso",
    eyebrow: "Vaststellingsovereenkomst · afwegen",
    h1: "De voor- en <em>nadelen</em> van een vaststellingsovereenkomst",
    lead: "Een vaststellingsovereenkomst (VSO) kan een prima uitkomst zijn, maar je geeft er ook iets voor op. Hier zie je eerlijk de voordelen en de nadelen naast elkaar, zodat je vanuit rust kunt beslissen.",
    sections: [
      { h: "De <em>voordelen</em>", html: "<ul><li><strong>Je WW blijft meestal behouden</strong>, mits de overeenkomst goed is geformuleerd (neutrale grond, correcte einddatum).</li><li><strong>Ruimte om te onderhandelen</strong>: vaak zit er meer in dan de wettelijke transitievergoeding.</li><li><strong>Rust en regie</strong>: geen lange procedure bij UWV of kantonrechter.</li><li><strong>Nette afspraken</strong>: over vrijstelling van werk, een goed getuigschrift, en het schrappen van een concurrentiebeding.</li><li><strong>Juridische kosten vaak vergoed</strong> door de werkgever.</li></ul>" },
      { h: "De <em>nadelen</em>", html: "<ul><li><strong>Je geeft je ontslagbescherming op</strong>: je stemt zelf in met het einde van je contract.</li><li><strong>Finale kwijting</strong>: na tekenen kun je meestal niets meer claimen, dus het moet in één keer goed.</li><li><strong>WW-risico bij fouten</strong>: een verkeerde formulering (verwijtbaarheid, fictieve opzegtermijn) kan je uitkering kosten.</li><li><strong>Druk om snel te tekenen</strong>, terwijl haast juridisch nergens op slaat.</li><li>Geen <strong>automatisch</strong> recht op de transitievergoeding (in de praktijk wel de ondergrens bij onderhandelen).</li></ul>" },
      { h: "Is het <em>verstandig</em> om te tekenen?", html: "<p>Dat hangt af van de inhoud, niet van het woord \"vaststellingsovereenkomst\". Een goed voorstel, met je WW veilig en een nette vergoeding, is vaak verstandiger dan een onzekere procedure. Een slecht of gehaast voorstel niet. De gouden regel: <strong>teken nooit meteen, en laat het eerst controleren</strong>. Zo weet je zeker of je tekent omdat het goed is, of alleen omdat je er vanaf wilt.</p>" }
    ],
    table: {
      caption: "Voordelen vs. nadelen in het kort",
      head: ["Voordelen", "Nadelen"],
      rows: [
        ["WW meestal behouden", "Je geeft ontslagbescherming op"],
        ["Ruimte om te onderhandelen", "Finale kwijting: het moet in één keer goed"],
        ["Rust, geen procedure", "WW-risico bij verkeerde formulering"],
        ["Kosten vaak door werkgever vergoed", "Druk om snel te tekenen"]
      ]
    },
    faq: [
      { q: "Wat zijn de nadelen van een vaststellingsovereenkomst?", a: "Je geeft je ontslagbescherming op, er geldt finale kwijting (je kunt achteraf niets meer claimen), en een verkeerde formulering kan je WW kosten. Ook is er vaak druk om snel te tekenen. Laat de overeenkomst daarom altijd eerst controleren." },
      { q: "Is een vaststellingsovereenkomst gunstig?", a: "Dat kan, als je WW veilig is en de vergoeding netjes is. Een VSO geeft rust en onderhandelruimte. Maar het hangt volledig af van de inhoud, niet van het woord zelf." },
      { q: "Is het verstandig om een vaststellingsovereenkomst te tekenen?", a: "Alleen als het voorstel goed is. Teken nooit meteen. Laat je overeenkomst eerst controleren, zodat je zeker weet dat je WW veilig is en of er meer in zit dan wordt geboden." }
    ],
    related: [
      { href: "wat-is-een-vaststellingsovereenkomst.html", label: "Wat is een vaststellingsovereenkomst?" },
      { href: "vaststellingsovereenkomst/is-mijn-vso-een-goede-deal.html", label: "Is mijn VSO een goede deal?" },
      { href: "vaststellingsovereenkomst/onder-druk-getekend.html", label: "Onder druk getekend: wat nu?" },
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW-uitkering behouden na een VSO" }
    ]
  },
  {
    slug: "zelf-een-vaststellingsovereenkomst-aanvragen",
    title: "Zelf een vaststellingsovereenkomst aanvragen?",
    desc: "Kun je als werknemer zelf een vaststellingsovereenkomst voorstellen? Ja, maar let op de WW-valkuil. Zo doe je het verstandig, en kan je werkgever weigeren?",
    keywords: "zelf een vaststellingsovereenkomst aanvragen, vaststellingsovereenkomst initiatief werknemer, kan ik zelf een vso aanvragen, kan werkgever vso weigeren, zelf vso voorstellen",
    eyebrow: "Vaststellingsovereenkomst · initiatief werknemer",
    h1: "Zelf een <em>vaststellingsovereenkomst</em> aanvragen?",
    lead: "Kun je als werknemer zelf een VSO voorstellen? Ja, dat kan. Maar er zit een belangrijke WW-valkuil aan. Zo pak je het verstandig aan.",
    sections: [
      { h: "Kan het? <em>Ja</em>", html: "<p>Je mag als werknemer zelf een vaststellingsovereenkomst voorstellen aan je werkgever. Dat gebeurt vaak bij een verstoorde arbeidsrelatie, na een conflict, of als je met een nette regeling uit elkaar wilt. Je bent daar vrij in.</p>" },
      { h: "De <em>WW-valkuil</em> (belangrijk)", html: "<p>Hier zit het grootste risico. Als het lijkt alsof jij zelf ontslag neemt, ben je <strong>verwijtbaar werkloos</strong> en krijg je geen WW. Neem jij het initiatief, dan moet de overeenkomst juist zo worden geformuleerd dat de beeindiging op initiatief van de werkgever plaatsvindt, op een neutrale grond en zonder verwijt aan jou. Anders loop je je uitkering mis. Laat dit altijd controleren.</p>" },
      { h: "Kan je werkgever <em>weigeren?</em>", html: "<p>Ja. Een werkgever is niet verplicht mee te werken aan een vaststellingsovereenkomst. Werkt hij niet mee terwijl de situatie onhoudbaar is (bijvoorbeeld een verstoorde arbeidsrelatie), dan kan een gang naar de kantonrechter een alternatief zijn. Ook dan sta je sterker met goede voorbereiding.</p>" }
    ],
    faq: [
      { q: "Kan je zelf een vaststellingsovereenkomst aanvragen?", a: "Ja. Als werknemer mag je zelf een VSO voorstellen aan je werkgever, bijvoorbeeld bij een verstoorde arbeidsrelatie of als je met een nette regeling weg wilt. Let wel goed op je WW." },
      { q: "Behoud ik mijn WW als ik zelf een VSO voorstel?", a: "Alleen als de overeenkomst goed is geformuleerd. Neem jij het initiatief, dan moet de beeindiging toch op initiatief van de werkgever en op een neutrale grond staan, anders ben je verwijtbaar werkloos en krijg je geen WW." },
      { q: "Kan een werkgever een vaststellingsovereenkomst weigeren?", a: "Ja, een werkgever is niet verplicht mee te werken. Bij een onhoudbare situatie kan de kantonrechter een alternatief zijn." }
    ],
    related: [
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW-uitkering behouden na een VSO" },
      { href: "vaststellingsovereenkomst/verstoorde-arbeidsrelatie.html", label: "Vaststellingsovereenkomst bij een verstoorde arbeidsrelatie" },
      { href: "vaststellingsovereenkomst/wat-is-gangbaar-onderhandelen.html", label: "Wat is gangbaar om te onderhandelen?" },
      { href: "wat-is-een-vaststellingsovereenkomst.html", label: "Wat is een vaststellingsovereenkomst?" }
    ]
  },
  {
    slug: "vaststellingsovereenkomst-en-uwv",
    title: "Vaststellingsovereenkomst en het UWV: hoe zit dat?",
    desc: "Wat heeft het UWV met een vaststellingsovereenkomst te maken? Bij een VSO ga je juist niet via het UWV, maar voor je WW komt het UWV wel in beeld.",
    keywords: "vaststellingsovereenkomst uwv, uwv vaststellingsovereenkomst, vaststellingsovereenkomst en ww uwv, moet uwv vso goedkeuren, vso zonder uwv",
    eyebrow: "Vaststellingsovereenkomst · UWV",
    h1: "Vaststellingsovereenkomst en het <em>UWV</em>",
    lead: "Wat heeft het UWV met een vaststellingsovereenkomst te maken? Kort: bij een VSO ga je juist niet via het UWV. Maar voor je WW komt het UWV wel degelijk in beeld.",
    sections: [
      { h: "Bij een VSO ga je <em>niet</em> via het UWV", html: "<p>Een vaststellingsovereenkomst is een beeindiging met wederzijds goedvinden. Je hebt daarvoor geen ontslagvergunning van het UWV nodig, en er komt geen kantonrechter aan te pas. Dat is juist het voordeel: het is sneller en je houdt samen de regie. Het UWV hoeft een VSO dus niet goed te keuren.</p>" },
      { h: "Wanneer komt het UWV <em>wel</em> in beeld?", html: "<p>Als er geen vaststellingsovereenkomst komt, kan je werkgever bij bedrijfseconomisch ontslag of langdurige ziekte een ontslagvergunning bij het UWV aanvragen. Soms wordt daar ook mee gedreigd om je te laten tekenen. Lees wat je dan kunt doen als je <a href=\"vaststellingsovereenkomst/werkgever-dreigt-met-uwv.html\" style=\"color:var(--gold-deep)\">werkgever dreigt met het UWV</a>.</p>" },
      { h: "Voor je <em>WW</em> kom je wel bij het UWV", html: "<p>Na je vaststellingsovereenkomst vraag je je WW-uitkering aan bij het UWV. Daarom is het cruciaal dat de overeenkomst neutraal is geformuleerd (werkgeversinitiatief, geen verwijt, correcte einddatum). Klopt dat niet, dan kan het UWV je WW afwijzen. Wij checken dit standaard voordat je tekent.</p>" }
    ],
    table: {
      caption: "VSO-route vs. UWV-route",
      head: ["", "Vaststellingsovereenkomst", "Via het UWV"],
      rows: [
        ["Wie beslist", "Jij en je werkgever samen", "Het UWV (ontslagvergunning)"],
        ["Snelheid", "Meestal sneller", "Duurt langer"],
        ["Onderhandelen over vergoeding", "Ja, ruimte", "Nauwelijks"],
        ["WW aanvragen", "Bij het UWV, na afloop", "Bij het UWV, na afloop"]
      ]
    },
    faq: [
      { q: "Moet het UWV een vaststellingsovereenkomst goedkeuren?", a: "Nee. Een VSO is een beeindiging met wederzijds goedvinden en heeft geen goedkeuring of ontslagvergunning van het UWV nodig. Dat is juist het verschil met de UWV-route." },
      { q: "Krijg ik WW van het UWV na een vaststellingsovereenkomst?", a: "Ja, mits de overeenkomst goed is geformuleerd: op initiatief van de werkgever, op een neutrale grond en met een correcte einddatum. Anders kan het UWV je WW afwijzen." },
      { q: "Wat is beter, ontslag via het UWV of een vaststellingsovereenkomst?", a: "Een VSO geeft meer regie en ruimte om te onderhandelen, en is meestal sneller. Maar het hangt af van je situatie. Laat je voorstel checken zodat je WW veilig is." }
    ],
    related: [
      { href: "vaststellingsovereenkomst/werkgever-dreigt-met-uwv.html", label: "Werkgever dreigt met het UWV" },
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW-uitkering behouden na een VSO" },
      { href: "vaststellingsovereenkomst/ww-aanvragen-na-vso.html", label: "WW aanvragen na een VSO" },
      { href: "vaststellingsovereenkomst/ontslag-met-wederzijds-goedvinden.html", label: "Ontslag met wederzijds goedvinden" }
    ]
  }
];

// ---- Template ---------------------------------------------------------------
function esc(s) { return String(s).replace(/&(?!\w+;)/g, "&amp;"); }

function render(c) {
  const faqJson = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: c.faq.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });
  const sectionsHtml = c.sections.map(s =>
    `<section class="block"><div class="wrap"><h2 class="big reveal">${s.h}</h2>\n<div class="prose reveal">${s.html}</div></div></section>`).join("\n");
  const tableHtml = c.table ? `<section class="block"><div class="wrap"><h2 class="big reveal">${esc(c.table.caption)}</h2>\n<div class="prose reveal"><table class="cmp"><thead><tr>${c.table.head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${c.table.rows.map(r => `<tr>${r.map(td => `<td>${td}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div></section>` : "";
  const faqVisible = `<section class="block"><div class="wrap"><h2 class="big reveal">Veelgestelde <em>vragen</em></h2>\n<div class="prose reveal">${c.faq.map(x => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join("")}</div></div></section>`;
  const relatedHtml = c.related && c.related.length ? `<section class="block"><div class="wrap"><h2 class="big reveal">Lees ook <em>verder</em></h2><div class="prose reveal"><ul>${c.related.map(r => `<li><a href="${r.href}" style="color:var(--gold-deep)">${esc(r.label)}</a></li>`).join("")}</ul></div></div></section>` : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P37MWPW4');</script>
<!-- End Google Tag Manager -->
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}" />
<meta name="keywords" content="${esc(c.keywords)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://eerstehulpbijvso.nl/${c.slug}.html" />
<meta property="og:type" content="article" /><meta property="og:locale" content="nl_NL" />
<meta property="og:title" content="${esc(c.title)}" /><meta property="og:description" content="${esc(c.desc)}" />
<meta property="og:url" content="https://eerstehulpbijvso.nl/${c.slug}.html" />
<link rel="icon" type="image/png" href="assets/favicon.png" />
<link rel="stylesheet" href="assets/style.css?v=${CSS_VER}" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LegalService","@id":"https://eerstehulpbijvso.nl/#org","name":"Eerste hulp bij VSO","url":"https://eerstehulpbijvso.nl/","logo":"https://eerstehulpbijvso.nl/assets/logo.png","image":"https://eerstehulpbijvso.nl/assets/logo.png","address":{"@type":"PostalAddress","streetAddress":"Vlierweg 12","postalCode":"1032 LG","addressLocality":"Amsterdam","addressCountry":"NL"},"description":"Platform dat werknemers met een vaststellingsovereenkomst binnen 15 minuten koppelt aan een arbeidsrechtspecialist voor een betere, WW-veilige deal.","areaServed":"NL","availableLanguage":"nl","telephone":"+31645733083","priceRange":"Gratis check, kosten meestal vergoed door werkgever","sameAs":["https://www.linkedin.com/company/eerstehulpbijvso/"]}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://eerstehulpbijvso.nl/"},{"@type":"ListItem","position":2,"name":"${esc(c.title)}","item":"https://eerstehulpbijvso.nl/${c.slug}.html"}]}</script>
<script type="application/ld+json">${faqJson}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${esc(c.title)}","description":"${esc(c.desc)}","author":{"@type":"Organization","name":"Eerste hulp bij VSO"},"publisher":{"@type":"Organization","name":"Eerste hulp bij VSO","logo":{"@type":"ImageObject","url":"https://eerstehulpbijvso.nl/assets/logo.png"}},"mainEntityOfPage":"https://eerstehulpbijvso.nl/${c.slug}.html"}</script>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P37MWPW4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="grain"></div>
<header id="hdr"><a class="topbar" href="aanmelden.html" aria-label="Gratis en vrijblijvend een specialist spreken">
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9.3a3.5 3.5 0 1 0 0 5.4"/><path d="M8 11h5M8 13.4h5"/></svg><b>Gratis</b>, en meestal geen kosten voor jou →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>Een specialist die <b>jouw kant</b> kiest →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 17l6-6 4 4 7-7"/><path d="M17 7h4v4"/></svg>Het eerste bod is <b>zelden het beste</b> →</span>
<span class="tb-msg"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 11.5z"/></svg><b>Gratis en vrijblijvend</b>, binnen 15 min antwoord →</span>
</a><div class="bar">
<a href="index.html" class="brand"><img class="mark" src="assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<nav class="pnav">
<a href="wat-is-een-vaststellingsovereenkomst.html">Wat is een VSO?</a>
<a href="transitievergoeding.html">Transitievergoeding</a>
<div class="ddwrap"><a href="vaststellingsovereenkomst/index.html" class="ddtrigger">Situaties</a><div class="ddmenu">
<a href="vaststellingsovereenkomst/reorganisatie.html">Reorganisatie</a>
<a href="vaststellingsovereenkomst/onder-druk-getekend.html">Onder druk getekend</a>
<a href="vaststellingsovereenkomst/tijdens-ziekte.html">Bij ziekte</a>
<a href="vaststellingsovereenkomst/ww-uitkering-behouden.html">WW behouden</a>
<a href="vaststellingsovereenkomst/transitievergoeding-onderhandelen.html">Vergoeding onderhandelen</a>
<a href="vaststellingsovereenkomst/index.html">Alle situaties &rarr;</a>
</div></div>
<div class="ddwrap"><a href="tools/index.html" class="ddtrigger">Hulpmiddelen</a><div class="ddmenu">
<a href="tools/transitievergoeding-berekenen.html">Transitievergoeding berekenen</a>
<a href="tools/ww-veilig-scan.html">WW-veilig-scan</a>
<a href="tools/bedenktermijn-berekenen.html">Bedenktermijn berekenen</a>
<a href="tools/wat-is-mijn-vso-waard.html">Wat is mijn VSO waard?</a>
<a href="tools/index.html">Alle hulpmiddelen &rarr;</a>
</div></div>
<div class="ddwrap"><a href="hulp/index.html" class="ddtrigger">Kennisbank</a><div class="ddmenu">
<a href="hulp/ontslaggronden.html">De 9 ontslaggronden</a>
<a href="hulp/billijke-vergoeding.html">Billijke vergoeding</a>
<a href="hulp/ontslag-op-staande-voet.html">Ontslag op staande voet</a>
<a href="hulp/onterecht-ontslag.html">Onterecht ontslagen?</a>
<a href="blog/index.html">Blog &amp; actueel</a>
<a href="hulp/index.html">Alle artikelen &rarr;</a>
</div></div>
<a href="aanmelden.html" class="hl">Aanmelden</a>
</nav>
<a href="https://wa.me/31645733083?text=${waGeneric}" class="cta-top">Gratis check →</a>
<button class="navtoggle" aria-label="Menu"><span></span><span></span><span></span></button>
</div></header>

<main><section class="page"><div class="wrap">
<p class="crumb reveal"><a href="index.html">Home</a> › ${esc(c.title)}</p>
<p class="eyebrow reveal">${esc(c.eyebrow)}</p>
<h1 class="title reveal">${c.h1}</h1>
<p class="lead reveal">${esc(c.lead)}</p>
<div class="cta-row reveal"><a class="btn btn-wa" href="https://wa.me/31645733083?text=${waGeneric}">Laat je situatie gratis checken</a><a class="btn btn-ghost" href="tools/transitievergoeding-berekenen.html">Bereken je vergoeding</a></div>
</div></section>

${sectionsHtml}
${tableHtml}
${faqVisible}
${relatedHtml}
<div class="band reveal"><h2>Twijfel je over je <em>situatie?</em></h2><p>Gratis, vrijblijvend en zonder dat je vandaag iets hoeft te beslissen. Eén appje en je staat er niet meer alleen voor.</p><a class="btn btn-primary" href="https://wa.me/31645733083?text=${waGeneric}">Stuur ons een WhatsApp</a></div>
</main>

<footer><div class="wrap-wide">
<div class="foottop">
<a href="index.html" class="brand"><img class="mark" src="assets/logo.png" alt="Eerste hulp bij VSO" /><span>Eerste hulp<br><b>bij VSO</b></span></a>
<p class="foot-intro">Van paniek naar een goede, veilige deal, met een specialist die jouw kant kiest. Meestal zonder kosten voor jou.</p>
<div class="flinks">
<a href="reorganisatie/index.html">Reorganisatie</a>
<a href="vaststellingsovereenkomst/index.html">Situaties</a><a href="wat-is-een-vaststellingsovereenkomst.html">Wat is een VSO?</a>
<a href="hulp/index.html">Kennisbank</a>
<a href="tools/index.html">Hulpmiddelen</a>
<a href="vso-hulp/index.html">Steden</a>
<a href="overzicht.html">Alles</a><a href="transitievergoeding.html">Transitievergoeding</a>
<a href="blog/index.html">Blog</a>
<a href="voor-werkgevers.html">Voor werkgevers</a><a href="werken-bij.html">Werken bij ons</a>
<a href="https://wa.me/31645733083?text=${waGeneric}">WhatsApp</a>
<a href="mailto:hello@eerstehulpbijvso.nl">E-mail</a>
<a href="https://www.linkedin.com/company/eerstehulpbijvso/" target="_blank" rel="noopener">LinkedIn</a>
</div>
</div>
<div class="fbot"><span>© <span id="yr"></span> Eerste hulp bij VSO · Vlierweg 12, 1032 LG Amsterdam · KvK 64043770</span><span><a href="privacy.html">Privacyverklaring</a> · <a href="voorwaarden.html">Algemene voorwaarden</a></span><span>Onafhankelijke informatie voor werknemers. Geen juridisch advies op maat.</span></div>
</div></footer>

<a class="wa" href="https://wa.me/31645733083?text=${waGeneric}" target="_blank" rel="noopener" aria-label="Stuur een WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2s-.7.9-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.6-1.5-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-.6 3 .5 1.4 1.3 2.6 2.5 3.8 1.7 1.7 3.2 2.3 4.6 2.7.9.2 1.6.2 2.2-.1.6-.3 1.7-1 1.9-1.6.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.6-.4zM12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a8.2 8.2 0 1 1 7.1 4z"/></svg><span class="lbl">Stuur ons een <b>WhatsApp</b></span></a>
<script>
const hdr=document.getElementById('hdr');addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>30));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0,rootMargin:"0px 0px -40px 0px"});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.getElementById('yr').textContent=new Date().getFullYear();
(function(){var t=document.querySelector('.navtoggle');if(!t)return;var m=document.createElement('div');m.className='mobilemenu';document.querySelectorAll('.pnav > a, .pnav > .ddwrap > a, nav.pills a').forEach(function(a){m.appendChild(a.cloneNode(true))});var c=document.querySelector('.cta-top');if(c){var cc=c.cloneNode(true);cc.classList.remove('cta-top');cc.classList.add('btn-wa');m.appendChild(cc)}document.body.appendChild(m);function cl(){m.classList.remove('open');document.body.classList.remove('menu-open');t.classList.remove('on')}t.addEventListener('click',function(){var o=m.classList.toggle('open');document.body.classList.toggle('menu-open',o);t.classList.toggle('on',o)});m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',cl)})})();
</script>
</body>
</html>`;
}

// ---- Sitemap-integratie -----------------------------------------------------
function addToSitemap(slug) {
  if (!fs.existsSync(SITEMAP)) return "geen sitemap";
  let s = fs.readFileSync(SITEMAP, "utf8");
  const loc = `https://eerstehulpbijvso.nl/${slug}.html`;
  if (s.includes(loc)) return "al aanwezig";
  s = s.replace(/<\/urlset>/, `<url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  fs.writeFileSync(SITEMAP, s);
  return "toegevoegd";
}

// ---- Uitvoeren --------------------------------------------------------------
let n = 0;
for (const c of SCENARIOS) {
  fs.writeFileSync(path.join(ROOT, `${c.slug}.html`), render(c));
  const sm = addToSitemap(c.slug);
  console.log(`  ${c.slug}.html geschreven  |  sitemap: ${sm}`);
  n++;
}
console.log(`Klaar: ${n} pagina('s). Tip: link ze ook vanaf een verwante pagina (bijv. transitievergoeding.html) voor interne linkkracht.`);

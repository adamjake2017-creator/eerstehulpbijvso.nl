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
const MAANDEN = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MAAND = MAANDEN[new Date().getMonth()] + " " + new Date().getFullYear();
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
  },
  {
    slug: "ww-stopzetten-of-pauzeren",
    title: "WW stopzetten of pauzeren: hoe werkt dat?",
    desc: "Kun je je WW-uitkering zelf stopzetten of pauzeren? Kort: niet zomaar, je WW is gekoppeld aan of je werkt. Zo werkt stopzetten, verrekenen en herleven.",
    keywords: "ww stopzetten, ww tijdelijk stopzetten, ww uitkering pauzeren, ww stopzetten en herleven, ww uitkering stopzetten zonder werk, kan ik mijn ww stopzetten",
    eyebrow: "WW · stopzetten",
    h1: "WW <em>stopzetten</em> of pauzeren?",
    lead: "Kun je je WW-uitkering zelf stopzetten of even op pauze zetten? Kort: niet zomaar, want je WW hangt samen met of je werkt en wat je verdient. Zo zit het.",
    sections: [
      { h: "Je WW stopt <em>vanzelf</em> als je gaat werken", html: "<p>Je zet je WW niet met een knop stop. Je geeft je gewerkte uren en inkomsten door aan het UWV (via Mijn UWV), en je uitkering wordt daarop aangepast. Werk je volledig, dan stopt je WW; werk je deels, dan krijg je vaak nog een gedeeltelijke uitkering. Geef wijzigingen altijd op tijd door, anders riskeer je een terugvordering en een boete.</p>" },
      { h: "Kun je je WW tijdelijk <em>pauzeren?</em>", html: "<p>Vrijwillig \"op pauze\" zetten kan niet. Maar er is wel iets belangrijks: stopt je WW doordat je (tijdelijk) werk vindt, en word je daarna opnieuw werkloos, dan kan je oude recht onder voorwaarden <strong>herleven</strong>. Je gooit je opgebouwde WW dus niet zomaar weg.</p>" },
      { h: "WW laten <em>herleven</em>", html: "<p>Word je binnen de looptijd van je oude WW-recht opnieuw werkloos en heb je nog niet genoeg nieuwe rechten opgebouwd, dan kan je oude uitkering herleven in plaats van dat je helemaal opnieuw moet aanvragen. Meld je dan opnieuw bij het UWV. De precieze termijnen en voorwaarden staan op uwv.nl, dus check daar je eigen situatie.</p>" }
    ],
    faq: [
      { q: "Kun je je WW-uitkering zelf stopzetten?", a: "Niet met een knop. Je WW stopt automatisch zodra je gaat werken: je geeft je uren en inkomsten door aan het UWV en de uitkering wordt aangepast of stopgezet. Geef wijzigingen op tijd door om een terugvordering te voorkomen." },
      { q: "Kan ik mijn WW tijdelijk pauzeren?", a: "Vrijwillig pauzeren kan niet. Maar als je WW stopt doordat je werk vindt en je wordt later opnieuw werkloos, kan je oude recht onder voorwaarden herleven." },
      { q: "Wat is het herleven van een WW-uitkering?", a: "Als je binnen de looptijd van je oude WW-recht opnieuw werkloos wordt zonder voldoende nieuwe rechten, kan je oude uitkering herleven in plaats van dat je opnieuw moet aanvragen. Meld je opnieuw bij het UWV; de exacte voorwaarden staan op uwv.nl." }
    ],
    related: [
      { href: "ww-aanvraag-intrekken-of-annuleren.html", label: "WW-aanvraag intrekken of annuleren" },
      { href: "einde-ww-uitkering-wat-nu.html", label: "Einde WW-uitkering: wat nu?" },
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW behouden na een VSO" }
    ]
  },
  {
    slug: "ww-aanvraag-intrekken-of-annuleren",
    title: "WW-aanvraag intrekken of annuleren",
    desc: "Heb je WW aangevraagd maar toch werk gevonden of wil je je aanvraag terugtrekken? Zo trek je je WW-aanvraag in, en wat betekent dat voor je resterende recht.",
    keywords: "ww aanvraag intrekken, ww aanvraag annuleren, ww afmelden, ww opzeggen, ww aanvraag terugtrekken",
    eyebrow: "WW · aanvraag",
    h1: "Je WW-aanvraag <em>intrekken</em> of annuleren",
    lead: "Heb je WW aangevraagd, maar toch (weer) werk gevonden? Of wil je je aanvraag terugtrekken? Zo doe je dat, en dit betekent het voor je opgebouwde recht.",
    sections: [
      { h: "Aanvraag intrekken <em>vóór</em> toekenning", html: "<p>Heb je WW aangevraagd maar is die nog niet toegekend, en heb je toch werk gevonden? Dan trek je de aanvraag in via Mijn UWV of door het UWV te bellen. Geef door dat je niet meer werkloos bent.</p>" },
      { h: "Al een uitkering, maar <em>weer aan het werk?</em>", html: "<p>Krijg je al WW en ga je (deels) werken? Dan trek je niet in, maar geef je je werk en inkomsten door. Je uitkering wordt dan verrekend of stopgezet. Lees hoe dat werkt op onze pagina over <a href=\"ww-stopzetten-of-pauzeren.html\" style=\"color:var(--gold-deep)\">WW stopzetten of pauzeren</a>.</p>" },
      { h: "Let op je <em>resterende recht</em>", html: "<p>Trek je in of stopt je WW doordat je gaat werken, dan ben je je opgebouwde recht niet per se kwijt: het kan later herleven als je opnieuw werkloos wordt. Gooi je rechten dus niet zomaar weg en informeer bij twijfel bij het UWV.</p>" }
    ],
    faq: [
      { q: "Hoe trek ik mijn WW-aanvraag in?", a: "Via Mijn UWV of door het UWV te bellen. Geef aan dat je je aanvraag wilt intrekken omdat je niet meer werkloos bent." },
      { q: "Kan ik mijn WW-uitkering opzeggen?", a: "Krijg je al een uitkering en ga je werken, dan zeg je niet op, maar geef je je werk en inkomsten door. De uitkering wordt dan verrekend of stopgezet." },
      { q: "Verlies ik mijn recht als ik mijn aanvraag intrek?", a: "Niet per se. Je opgebouwde WW-recht kan later herleven als je binnen de looptijd opnieuw werkloos wordt. Informeer bij het UWV naar je situatie." }
    ],
    related: [
      { href: "ww-stopzetten-of-pauzeren.html", label: "WW stopzetten of pauzeren" },
      { href: "vaststellingsovereenkomst/ww-aanvragen-na-vso.html", label: "WW aanvragen na een VSO" },
      { href: "einde-ww-uitkering-wat-nu.html", label: "Einde WW-uitkering: wat nu?" }
    ]
  },
  {
    slug: "einde-ww-uitkering-wat-nu",
    title: "Einde WW-uitkering: wat nu?",
    desc: "Loopt je WW af en heb je nog geen werk? Dan is er mogelijk bijstand via je gemeente. Zo vraag je het aan, en dit is het belangrijke verschil met de WW.",
    keywords: "einde ww uitkering wat dan, na de ww, van ww naar bijstand, geen ww meer wat nu, wat na ww uitkering, uitkering na ww, einde ww en dan",
    eyebrow: "WW · einde",
    h1: "Je WW <em>stopt</em>. Wat nu?",
    lead: "Loopt je WW-uitkering af en heb je nog geen nieuw werk? Dan zijn er een paar routes. De belangrijkste is meestal bijstand via je gemeente, maar let op: die werkt anders dan de WW.",
    sections: [
      { h: "Bijstand aanvragen bij je <em>gemeente</em>", html: "<p>Eindigt je WW en heb je onvoldoende inkomen, dan kun je bijstand (Participatiewet) aanvragen bij je gemeente. Doe dit <strong>op tijd, liefst voordat je WW stopt</strong>, zodat je geen periode zonder inkomen hebt. De aanvraag loopt via je gemeente, niet via het UWV.</p>" },
      { h: "Bijstand is <em>anders</em> dan WW", html: "<p>Belangrijk verschil: bij bijstand kijkt de gemeente naar je <strong>vermogen</strong> (spaargeld, bezittingen) en naar het <strong>inkomen van je partner of huishouden</strong>. Heb je spaargeld boven de grens of een verdienende partner, dan krijg je mogelijk geen of minder bijstand. Bij de WW speelt dat niet. Ook geldt bij bijstand een sollicitatie- en re-integratieplicht.</p>" },
      { h: "Andere <em>routes</em>", html: "<p>Voor oudere werklozen bestaan onder voorwaarden de IOAW of IOW, met soepeler regels dan de bijstand. Kijk ook naar toeslagen (zorg-, huurtoeslag) en naar scholing of omscholing. Je gemeente en het UWV kunnen je vertellen wat in jouw geval mogelijk is.</p>" }
    ],
    table: {
      caption: "WW versus bijstand in het kort",
      head: ["", "WW", "Bijstand"],
      rows: [
        ["Wie regelt het", "UWV", "Je gemeente"],
        ["Gebaseerd op", "Je arbeidsverleden en laatste loon", "Je inkomen en vermogen nu"],
        ["Vermogen (spaargeld) telt mee", "Nee", "Ja"],
        ["Inkomen partner telt mee", "Nee", "Ja"]
      ]
    },
    faq: [
      { q: "Wat gebeurt er als mijn WW-uitkering stopt?", a: "Heb je nog geen werk en onvoldoende inkomen, dan kun je bijstand aanvragen bij je gemeente. Doe dit op tijd, liefst voordat je WW eindigt, om een gat zonder inkomen te voorkomen." },
      { q: "Kan ik van WW naar bijstand?", a: "Ja, maar bijstand werkt anders: de gemeente kijkt naar je vermogen en het inkomen van je partner. Heb je spaargeld boven de grens of een verdienende partner, dan krijg je mogelijk geen of minder bijstand." },
      { q: "Heb ik recht op bijstand met spaargeld?", a: "Boven een bepaald vermogen (spaargeld en bezittingen) krijg je geen bijstand. De exacte grens hangt af van je situatie; je gemeente bepaalt dit." },
      { q: "Wat is de IOW of IOAW?", a: "Dit zijn uitkeringen voor oudere werklozen, met onder voorwaarden soepeler regels dan de bijstand (bijvoorbeeld geen of een lichtere vermogenstoets). Vraag het UWV of je gemeente of je hiervoor in aanmerking komt." }
    ],
    related: [
      { href: "ww-stopzetten-of-pauzeren.html", label: "WW stopzetten of pauzeren" },
      { href: "sollicitatieplicht-ww.html", label: "Sollicitatieplicht in de WW" },
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW behouden na een VSO" }
    ]
  },
  {
    slug: "sollicitatieplicht-ww",
    title: "Sollicitatieplicht in de WW: wat moet je doen?",
    desc: "Met een WW-uitkering moet je actief solliciteren. Doe je dat niet, dan kan het UWV korten of stopzetten. Wat wordt er verwacht en wanneer geldt een uitzondering?",
    keywords: "sollicitatieplicht ww, ww stopzetten sollicitatieplicht, ontheffing sollicitatieplicht ww, hoeveel sollicitaties ww, ww sollicitatieplicht ontheffing",
    eyebrow: "WW · plichten",
    h1: "De <em>sollicitatieplicht</em> in de WW",
    lead: "Met een WW-uitkering moet je actief werk zoeken. Houd je je daar niet aan, dan kan het UWV je uitkering korten of zelfs stopzetten. Dit wordt er van je verwacht.",
    sections: [
      { h: "Wat moet je <em>doen?</em>", html: "<p>Je staat ingeschreven als werkzoekende en zoekt aantoonbaar naar werk: solliciteren, reageren op vacatures en je inschrijven bij bijvoorbeeld uitzendbureaus. In de regel wordt verwacht dat je meerdere sollicitatie-activiteiten per vier weken doet. Houd je sollicitaties bij, want het UWV kan ernaar vragen. De precieze afspraken kunnen per situatie verschillen, dus volg wat het UWV met jou afspreekt.</p>" },
      { h: "Gevolgen als je het <em>niet</em> doet", html: "<p>Solliciteer je te weinig of werk je niet mee aan je re-integratie, dan kan het UWV een maatregel opleggen: een tijdelijke korting op je uitkering of, bij herhaling, stopzetting. Reageer daarom altijd op oproepen van het UWV en houd je aan de afspraken.</p>" },
      { h: "Uitzonderingen en <em>ontheffing</em>", html: "<p>In sommige situaties gelden aangepaste afspraken, bijvoorbeeld bij ziekte, bij scholing die het UWV heeft goedgekeurd, of bij vrijwilligerswerk onder voorwaarden. Denk je dat een uitzondering voor jou geldt? Bespreek het dan vooraf met het UWV in plaats van er zelf van uit te gaan.</p>" }
    ],
    faq: [
      { q: "Hoeveel moet ik solliciteren in de WW?", a: "In de regel wordt verwacht dat je meerdere sollicitatie-activiteiten per vier weken doet en ingeschreven staat als werkzoekende. De precieze afspraken kunnen per situatie verschillen; volg wat het UWV met jou afspreekt en houd je sollicitaties bij." },
      { q: "Wat gebeurt er als ik niet genoeg solliciteer?", a: "Het UWV kan een maatregel opleggen: een tijdelijke korting op je uitkering of, bij herhaling, stopzetting. Reageer altijd op oproepen en houd je aan de afspraken." },
      { q: "Kan ik ontheffing krijgen van de sollicitatieplicht?", a: "In bepaalde situaties gelden aangepaste afspraken, bijvoorbeeld bij ziekte, goedgekeurde scholing of vrijwilligerswerk onder voorwaarden. Bespreek dit vooraf met het UWV." }
    ],
    related: [
      { href: "ww-stopzetten-of-pauzeren.html", label: "WW stopzetten of pauzeren" },
      { href: "einde-ww-uitkering-wat-nu.html", label: "Einde WW-uitkering: wat nu?" },
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW behouden na een VSO" }
    ]
  },
  {
    slug: "onverwijld-betekenis",
    title: "Onverwijld: wat betekent dat juridisch?",
    desc: "Wat betekent onverwijld in het arbeidsrecht? Het betekent zonder uitstel, direct. Vooral bij ontslag op staande voet is onverwijld cruciaal. Zo zit het.",
    keywords: "onverwijld betekenis, wat betekent onverwijld, onverwijld ontslag op staande voet, onverwijld mededelen, onverwijld juridisch, hoe snel is onverwijld",
    eyebrow: "Begrip · arbeidsrecht",
    h1: "Wat betekent <em>onverwijld?</em>",
    lead: "Onverwijld betekent: zonder uitstel, direct. Je komt het woord vooral tegen bij ontslag op staande voet, en juist daar is het bepalend of een ontslag geldig is. Zo zit het.",
    sections: [
      { h: "Onverwijld = <em>zonder uitstel</em>", html: "<p>Onverwijld betekent letterlijk \"zonder te wachten\": meteen, direct, zonder onnodig uitstel. In het dagelijks taalgebruik zeg je \"direct\" of \"per omgaande\". In de wet heeft het woord een scherpe lading, want het bepaalt of iemand op tijd heeft gehandeld.</p>" },
      { h: "Onverwijld bij <em>ontslag op staande voet</em>", html: "<p>Het woord is het belangrijkst bij ontslag op staande voet. De wet (artikel 7:677 BW) stelt twee onverwijld-eisen: (1) de werkgever moet <strong>onverwijld opzeggen</strong> nadat de dringende reden zich voordoet, en (2) hij moet de reden <strong>onverwijld meedelen</strong> aan de werknemer. Voldoet het ontslag niet aan beide, dan is het vaak niet rechtsgeldig. Dezelfde eis geldt trouwens voor jou: wil je zelf op staande voet ontslag nemen wegens een dringende reden, dan moet ook dat onverwijld.</p>" },
      { h: "Hoe snel is <em>onverwijld?</em>", html: "<p>Er staat geen vast aantal dagen in de wet. Het gaat om \"voortvarend handelen\". Een werkgever mag kort de tijd nemen om de feiten te onderzoeken, juridisch advies in te winnen of hoor en wederhoor toe te passen, mits hij dan vlot doorpakt. Loopt er te veel tijd overheen zonder goede reden, dan is niet meer aan de onverwijld-eis voldaan en sneuvelt het ontslag vaak bij de rechter.</p>" },
      { h: "Wat betekent dit <em>voor jou?</em>", html: "<p>Ben je op staande voet ontslagen? Check dan of de werkgever wel onverwijld heeft gehandeld en de reden direct heeft genoemd. Twijfel je, teken dan niets en laat je situatie beoordelen. Een ontslag op staande voet raakt je WW hard, dus het is het waard om goed te laten controleren of het klopt.</p>" }
    ],
    faq: [
      { q: "Wat betekent onverwijld?", a: "Onverwijld betekent zonder uitstel, direct, zonder onnodig te wachten. In het arbeidsrecht bepaalt het of iemand op tijd heeft gehandeld, vooral bij ontslag op staande voet." },
      { q: "Waarom is onverwijld belangrijk bij ontslag op staande voet?", a: "De wet eist dat de werkgever onverwijld opzegt na de dringende reden en de reden onverwijld meedeelt. Gebeurt dat niet, dan is het ontslag op staande voet vaak niet rechtsgeldig." },
      { q: "Hoe snel is onverwijld precies?", a: "Er staat geen vast aantal dagen in de wet. De werkgever mag kort onderzoek doen of advies inwinnen, maar moet daarna voortvarend doorpakken. Te veel uitstel zonder goede reden betekent dat niet aan de eis is voldaan." }
    ],
    related: [
      { href: "hulp/ontslag-op-staande-voet.html", label: "Ontslag op staande voet: je rechten" },
      { href: "hulp/ontslaggronden.html", label: "De 9 ontslaggronden op een rij" },
      { href: "verwijtbaar-werkloos.html", label: "Verwijtbaar werkloos: en je WW?" }
    ]
  },
  {
    slug: "fictieve-opzegtermijn",
    title: "Fictieve opzegtermijn en je WW: wat is het?",
    desc: "De fictieve opzegtermijn bepaalt wanneer je WW ingaat na een vaststellingsovereenkomst. Reken je einddatum verkeerd, dan mis je weken WW. Zo voorkom je dat.",
    keywords: "fictieve opzegtermijn, fictieve opzegtermijn ww, fictieve opzegtermijn berekenen, einddatum vaststellingsovereenkomst ww, opzegtermijn vso ww, wanneer gaat mijn ww in",
    eyebrow: "WW · einddatum",
    h1: "De <em>fictieve opzegtermijn</em> en je WW",
    lead: "De fictieve opzegtermijn klinkt technisch, maar hij bepaalt iets belangrijks: wanneer je WW ingaat. Reken je de einddatum in je vaststellingsovereenkomst verkeerd, dan kun je zomaar weken WW mislopen.",
    sections: [
      { h: "Wat is de <em>fictieve opzegtermijn?</em>", html: "<p>Als je met een vaststellingsovereenkomst uit elkaar gaat, zeg je het contract niet echt op. Maar het UWV doet <strong>alsof</strong> er wel is opgezegd, en houdt rekening met de opzegtermijn die de werkgever had moeten aanhouden. Dat is de fictieve opzegtermijn. Je WW gaat pas in nadat die termijn is verstreken.</p>" },
      { h: "Waarom is dit <em>belangrijk?</em>", html: "<p>Staat er in je overeenkomst een einddatum die de fictieve opzegtermijn niet respecteert, dan schuift het UWV de start van je WW gewoon op. Die weken krijg je meestal niet betaald, niet door je werkgever en niet via de WW. Zo val je zonder inkomen. Een correcte einddatum is daarom een van de eerste dingen die wij controleren.</p>" },
      { h: "Hoe bereken je de <em>einddatum?</em>", html: "<p>De opzegtermijn van de werkgever hangt af van hoe lang je in dienst bent: grofweg &eacute;&eacute;n maand tot vier maanden. Belangrijk: de dag van ondertekening telt mee, en meestal wordt tegen het einde van de maand opgezegd. De overeenkomst hoort een einddatum te noemen die hier netjes op aansluit, zodat je WW direct kan ingaan. Twijfel je? Laat de datum narekenen voordat je tekent.</p>" }
    ],
    table: {
      caption: "Opzegtermijn werkgever (indicatie, tenzij CAO anders bepaalt)",
      head: ["Lengte dienstverband", "Wettelijke opzegtermijn werkgever"],
      rows: [
        ["Korter dan 5 jaar", "1 maand"],
        ["5 tot 10 jaar", "2 maanden"],
        ["10 tot 15 jaar", "3 maanden"],
        ["15 jaar of langer", "4 maanden"]
      ]
    },
    faq: [
      { q: "Wat is de fictieve opzegtermijn?", a: "Bij een vaststellingsovereenkomst doet het UWV alsof er is opgezegd en houdt het rekening met de opzegtermijn die de werkgever had moeten aanhouden. Je WW gaat pas in nadat die fictieve opzegtermijn is verstreken." },
      { q: "Waarom is de fictieve opzegtermijn belangrijk voor mijn WW?", a: "Respecteert de einddatum in je overeenkomst de fictieve opzegtermijn niet, dan schuift het UWV de start van je WW op. Die weken worden meestal niet betaald, waardoor je zonder inkomen kunt vallen." },
      { q: "Hoe lang is de fictieve opzegtermijn?", a: "Die is gelijk aan de opzegtermijn van de werkgever, grofweg 1 tot 4 maanden afhankelijk van hoe lang je in dienst bent, tenzij de CAO iets anders bepaalt. Laat de einddatum narekenen voordat je tekent." }
    ],
    related: [
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW-uitkering behouden na een VSO" },
      { href: "vaststellingsovereenkomst/opzegtermijn.html", label: "Opzegtermijn bij een vaststellingsovereenkomst" },
      { href: "vaststellingsovereenkomst/ww-aanvragen-na-vso.html", label: "WW aanvragen na een VSO" },
      { href: "verwijtbaar-werkloos.html", label: "Verwijtbaar werkloos: en je WW?" }
    ]
  },
  {
    slug: "verwijtbaar-werkloos",
    title: "Verwijtbaar werkloos: geen WW? Zo voorkom je het",
    desc: "Ben je verwijtbaar werkloos, dan weigert het UWV je WW. Dit betekent het, wanneer het speelt en hoe een goede vaststellingsovereenkomst het voorkomt.",
    keywords: "verwijtbaar werkloos, verwijtbaar werkloos ww, geen ww verwijtbaar, wanneer verwijtbaar werkloos, verwijtbaar werkloos vaststellingsovereenkomst, zelf ontslag nemen ww",
    eyebrow: "WW · valkuil",
    h1: "<em>Verwijtbaar werkloos:</em> en je WW?",
    lead: "Verwijtbaar werkloos zijn is de belangrijkste reden waarom het UWV een WW-uitkering weigert. Bij een vaststellingsovereenkomst is het daarom cruciaal dat je dit voorkomt. Zo zit het.",
    sections: [
      { h: "Wat betekent <em>verwijtbaar werkloos?</em>", html: "<p>Je bent verwijtbaar werkloos als je werkloosheid je eigen schuld is in de ogen van het UWV. De twee klassieke gevallen: je <strong>neemt zelf ontslag</strong> zonder dringende reden, of je bent ontslagen om een <strong>dringende reden</strong> die jou te verwijten valt (bijvoorbeeld ontslag op staande voet). In beide gevallen kan het UWV je WW weigeren.</p>" },
      { h: "Waarom een VSO juist <em>neutraal</em> moet zijn", html: "<p>Hier zit de kern. Een vaststellingsovereenkomst is een be&euml;indiging met wederzijds goedvinden. Als die verkeerd is geformuleerd, kan het lijken alsof jij zelf koos om te stoppen: verwijtbaar dus. Daarom hoort er in de overeenkomst te staan dat het initiatief bij de <strong>werkgever</strong> ligt, op een <strong>neutrale grond</strong> (bijvoorbeeld bedrijfseconomisch of een verstoorde arbeidsrelatie) en <strong>zonder verwijt</strong> aan jou. Die formulering beschermt je WW.</p>" },
      { h: "Zo <em>voorkom</em> je het", html: "<p>Teken nooit een vaststellingsovereenkomst zonder dat iemand de WW-formulering heeft gecontroleerd. Let op de grond van het ontslag, de afwezigheid van verwijt, en een correcte einddatum die de <a href=\"fictieve-opzegtermijn.html\" style=\"color:var(--gold-deep)\">fictieve opzegtermijn</a> respecteert. Dit is precies waar wij standaard naar kijken, zodat je je uitkering niet misloopt.</p>" }
    ],
    faq: [
      { q: "Wat betekent verwijtbaar werkloos?", a: "Je bent verwijtbaar werkloos als je werkloosheid je eigen schuld is volgens het UWV: je neemt zelf ontslag zonder dringende reden, of je wordt ontslagen om een dringende reden die jou te verwijten valt. Het UWV kan dan je WW weigeren." },
      { q: "Ben ik verwijtbaar werkloos bij een vaststellingsovereenkomst?", a: "Niet als de overeenkomst goed is geformuleerd. Er moet in staan dat het initiatief bij de werkgever ligt, op een neutrale grond en zonder verwijt aan jou. Dan blijft je WW veilig. Een verkeerde formulering kan je juist wel verwijtbaar maken." },
      { q: "Krijg ik geen WW als ik zelf ontslag neem?", a: "In de regel niet. Zelf ontslag nemen zonder dringende reden maakt je verwijtbaar werkloos, waardoor het UWV je WW weigert. Wil je uit elkaar, regel het dan via een goed geformuleerde vaststellingsovereenkomst." }
    ],
    related: [
      { href: "vaststellingsovereenkomst/ww-uitkering-behouden.html", label: "Je WW-uitkering behouden na een VSO" },
      { href: "vaststellingsovereenkomst/ontslag-met-wederzijds-goedvinden.html", label: "Ontslag met wederzijds goedvinden" },
      { href: "fictieve-opzegtermijn.html", label: "De fictieve opzegtermijn en je WW" },
      { href: "zelf-een-vaststellingsovereenkomst-aanvragen.html", label: "Zelf een vaststellingsovereenkomst aanvragen?" }
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
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${esc(c.title)}","description":"${esc(c.desc)}","datePublished":"${today}","dateModified":"${today}","author":{"@type":"Organization","name":"Eerste hulp bij VSO"},"publisher":{"@type":"Organization","name":"Eerste hulp bij VSO","logo":{"@type":"ImageObject","url":"https://eerstehulpbijvso.nl/assets/logo.png"}},"mainEntityOfPage":"https://eerstehulpbijvso.nl/${c.slug}.html"}</script>
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
<p class="eyebrow reveal">${esc(c.eyebrow)} &middot; bijgewerkt ${MAAND}</p>
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

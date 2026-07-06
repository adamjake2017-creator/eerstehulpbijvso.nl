# Feature: VSO-ervaringen per werkgever ("de VSO-barometer")

*Concept + MVP-opzet + juridische checkvragen. Status: idee/ontwerp, nog niet gebouwd.*

---

## 1. Doel & positionering

Per bedrijf laten zien hoe (oud-)medewerkers de **afhandeling van hun vaststellingsovereenkomst** hebben ervaren, in geaggregeerde scores. Kernemotie: *"Je bent niet de eerste — zo verloopt dit vaker bij dit bedrijf."*

**Positionering:** steunend en informatief, géén klaagmuur of "naming-and-shaming". Dat past bij het merk én is juridisch veiliger.

**Waarom een USP/moat:** geverifieerde, gestructureerde ervaringsdata per bedrijf heeft niemand anders. Het wordt sterker met elke klant (netwerkeffect) en maakt de bestaande bedrijfspagina's uniek, rijker en beter citeerbaar (SEO/AI).

---

## 2. De vragen (4–5 gestructureerde dimensies)

Alleen **keuze-antwoorden** (schaal/opties), géén vrij scheldveld. Feitelijke ervaringen laten zich veel moeilijker als smaad kwalificeren.

1. **Druk om te tekenen** — "Voelde je druk om snel te tekenen?"
   → Geen / Enige / Veel
2. **Tijd & ruimte** — "Kreeg je voldoende tijd en ruimte om je te laten adviseren?"
   → Ja, ruim voldoende / Enigszins / Nee, te weinig
3. **Menselijkheid** — "Hoe menselijk en respectvol verliep het proces?"
   → schaal 1–5
4. **Correctheid** — "Verliep het netjes en werden gemaakte afspraken nagekomen?"
   → Ja / Deels / Nee
5. **Eindoordeel** — "Hoe kijk je terug op de afhandeling van je VSO bij dit bedrijf?"
   → schaal 1–5

**Context (niet gescoord, wél als patroon getoond):**
"Speelde er iets bijzonders?" → meerkeuze: Tijdens ziekte / Tijdens zwangerschap / Reorganisatie / Kort na indiensttreding / Anders / N.v.t.

> Optioneel vrij tekstveld: voor de MVP **weglaten** (of alleen intern, niet publiek). Publieke vrije tekst = het grootste juridische risico. Eventueel later: één gemodereerde zin, pas ná goedkeuring zichtbaar.

---

## 3. Verificatie (belangrijk)

Alleen ervaringen van mensen die **echt een VSO kregen**. Praktisch:
- Verstuur de ervaringen-vragenlijst via een **unieke link** na een intake/afgeronde zaak (WhatsApp/e-mail).
- Markeer die reacties als "geverifieerd".
- Dit weert nepreacties, maakt het juridisch verdedigbaar ("geverifieerde ervaringen") én is precies de instroom die concurrenten missen.

---

## 4. Aggregatie & weergave

- **Drempel:** toon scores pas vanaf **minimaal 5–10 geverifieerde reacties** per bedrijf. Zo voorkom je dat één review een bedrijf "beschuldigt" en is het statistisch betekenisvol.
- **Onder de drempel:** "Nog te weinig ervaringen voor een betrouwbaar beeld — deel jouw ervaring."
- **Geaggregeerd, nooit individueel:** percentages/gemiddelden, geen losse verhalen, en **nooit namen van personen** (HR, leidinggevenden).
- **Methodologie tonen:** "Gebaseerd op N geverifieerde ervaringen van (oud-)medewerkers."
- **Recht op weerwoord:** vaste regel: "Werk je bij dit bedrijf en wil je reageren of een onjuistheid melden? Neem contact op." + verwijderprocedure.

**Voorbeeldweergave op de bedrijfspagina:**
> **Ervaringen bij [Bedrijf]** — gebaseerd op 14 geverifieerde ervaringen
> - Druk om te tekenen: **vaak hoog** (10 van 14 ervoeren druk)
> - Tijd & ruimte: **beperkt**
> - Menselijkheid: **2,6 / 5**
> - Eindoordeel: **2,8 / 5**
> - Context: in 6 van de 14 gevallen speelde ziekte mee
>
> *Je bent niet de eerste. Deel ook jouw ervaring →*

Dit blok komt op de bestaande pagina's `/reorganisatie/vaststellingsovereenkomst-[bedrijf]`.

---

## 5. Datamodel (licht — kan starten in een spreadsheet)

Per reactie: bedrijf · datum · geverifieerd (ja/nee) · scores per dimensie · context-tags. Aggregatie = gemiddelden/percentages per bedrijf. Simpel genoeg om handmatig te beginnen.

---

## 6. Fasering

- **Fase 0 (nu, zonder bouwen):** vaste vragen toevoegen aan je intake → data verzamelen in een spreadsheet. Dimensies vastzetten. Juridische toetsing.
- **Fase 1 (licht):** zodra je genoeg data hebt, geaggregeerde scores (desnoods handmatig samengesteld) tonen op de bedrijfspagina's.
- **Fase 2 (volwaardig):** submissieformulier + verificatie + automatische aggregatie + moderatie/weerwoord-proces.

---

## 7. Ingebouwde juridische waarborgen (samenvatting)
Geaggregeerd · geverifieerd · gestructureerd (geen vrij scheldveld) · drempel N · geen personen herleidbaar · recht op weerwoord + notice-and-takedown · AVG-proof · steunende toon.

---

## DEEL B — Juridische checkvragen voor de jurist

1. **Onrechtmatige uiting / smaad:** onder welke voorwaarden zijn geaggregeerde, geverifieerde ervaringsscores over een met naam genoemd bedrijf toelaatbaar? Welke woordkeuze/framing moeten we vermijden?
2. **Drempel & methodologie:** welk minimum aantal reacties en welke transparante methodologie maken het verdedigbaar (niet herleidbaar tot een individu)?
3. **Personen:** bevestig dat we op geen enkele manier individuele personen (HR, leidinggevenden) mogen noemen of herleidbaar maken.
4. **AVG – grondslag:** wat is de juiste grondslag voor het verwerken en publiceren van ervaringen (toestemming?) en hoe leggen we die vast?
5. **AVG – bijzondere gegevens:** "tijdens ziekte/zwangerschap" raakt gezondheidsgegevens. Hoe anonimiseren/aggregeren zodat dit geen bijzondere persoonsgegevens meer zijn?
6. **AVG – rechten:** inzage-, correctie- en verwijderrecht van de reviewer; bewaartermijn; verwerkersafspraken.
7. **Aansprakelijkheid platform:** hoe beperken we onze aansprakelijkheid (notice-and-takedown, moderatie, disclaimer, hosting-/tussenpersoon-vrijstelling onder DSA/e-Commerce)?
8. **Recht op weerwoord / rectificatie:** hoe richten we de reactie- en verwijderprocedure voor bedrijven correct in?
9. **Verificatie:** welke mate van verificatie is juridisch wenselijk om "geverifieerd" te mogen claimen, zonder extra AVG-last?
10. **Vrije tekst:** is (gemodereerde) publieke vrije tekst verantwoord, of houden we het bij scores?
11. **Oneerlijke handelspraktijk / reputatieschade:** risico dat een bedrijf claimt dat de scores hun reputatie onrechtmatig schaden — hoe dekken transparantie + methodologie dit af?
12. **Bedrijfsnamen/merken:** we gebruiken nu al bedrijfsnamen op de pagina's; verandert de ervaringslaag iets aan de toelaatbaarheid daarvan?

---

## Wat nu te doen (deze week)
1. Zet de **4–5 vragen** hierboven vast (pas aan waar je wilt).
2. Voeg ze toe aan je **intake** (WhatsApp/na een zaak) → begin met **verzamelen** in een spreadsheet.
3. Leg dit document voor aan je **jurist-partner** (Deel B) — meteen een mooie eerste gezamenlijke waardecreatie.
4. Kies je **drempel** (bijv. 5) en **verificatiemethode**.
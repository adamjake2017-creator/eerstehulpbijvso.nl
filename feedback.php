<?php
// Ontvangt feedback van de feedback-widget (async fetch).
// Logt naar een afgeschermde CSV en mailt bij een negatieve of getypte reactie.
// Vraagt geen persoonsgegevens; bezoekers kunnen vrije tekst achterlaten.

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo '{"ok":false}';
    exit;
}

// Honeypot: bots vullen dit verborgen veld. Stil afronden.
if (!empty($_POST["website"])) {
    echo '{"ok":true}';
    exit;
}

function schoon($v) {
    return trim(str_replace(["\r", "\n"], " ", (string)($v ?? "")));
}

$sentiment = schoon($_POST["sentiment"] ?? "");     // "ja" of "nee"
$pagina    = mb_substr(schoon($_POST["pagina"] ?? ""), 0, 300);
$opmerking = mb_substr(strip_tags((string)($_POST["opmerking"] ?? "")), 0, 2000);
$opmerking = str_replace(["\r", "\n"], " ", $opmerking);

if ($sentiment !== "ja" && $sentiment !== "nee") {
    http_response_code(400);
    echo '{"ok":false}';
    exit;
}

$tijd = date("Y-m-d H:i:s");

// CSV-log in een afgeschermde map (feedback/.htaccess blokkeert publieke toegang)
$map = __DIR__ . "/feedback";
if (!is_dir($map)) { @mkdir($map, 0750, true); }
$fh = @fopen($map . "/feedback-log.csv", "a");
if ($fh) {
    @fputcsv($fh, [$tijd, $sentiment, $pagina, $opmerking]);
    @fclose($fh);
}

// Mail alleen als er iets zinnigs is: een negatieve stem of een opmerking
if ($sentiment === "nee" || $opmerking !== "") {
    $ontvanger = "hello@eerstehulpbijvso.nl";
    $afzender  = "hello@eerstehulpbijvso.nl";
    $onderwerp = "Website-feedback (" . $sentiment . ")";

    $bericht  = "Nieuwe feedback via eerstehulpbijvso.nl\n\n";
    $bericht .= "Nuttig gevonden: " . $sentiment . "\n";
    $bericht .= "Pagina: " . $pagina . "\n";
    $bericht .= "Opmerking:\n" . ($opmerking !== "" ? $opmerking : "(geen opmerking achtergelaten)") . "\n\n";
    $bericht .= "Tijdstip: " . $tijd . "\n";

    $headers  = "From: Eerste hulp bij VSO <" . $afzender . ">\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";

    @mail($ontvanger, $onderwerp, $bericht, $headers);
}

echo '{"ok":true}';
<?php
// Verwerkt de intake van aanmelden.html en mailt de inzending.
// Pas hieronder $ontvanger aan als je de meldingen op een ander adres wilt.

$ontvanger = "hello@eerstehulpbijvso.nl";
$afzender  = "hello@eerstehulpbijvso.nl"; // moet een adres op je eigen domein zijn (SPF)

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: aanmelden.html");
    exit;
}

// Honeypot: bots vullen dit verborgen veld. Stil afronden.
if (!empty($_POST["website"])) {
    header("Location: bedankt.html");
    exit;
}

// Nieuwlijnen strippen om header-injectie te voorkomen
function schoon($v) {
    return trim(str_replace(["\r", "\n"], " ", (string)($v ?? "")));
}

$naam     = schoon($_POST["naam"] ?? "");
$email    = schoon($_POST["email"] ?? "");
$telefoon = schoon($_POST["telefoon"] ?? "");
$status   = schoon($_POST["vso_status"] ?? "");
$situatie = trim((string)($_POST["situatie"] ?? ""));
$akkoord  = isset($_POST["toestemming"]);

// Server-side validatie
$fouten = [];
if ($naam === "")                                   $fouten[] = "naam";
if (!filter_var($email, FILTER_VALIDATE_EMAIL))     $fouten[] = "e-mailadres";
if ($telefoon === "")                               $fouten[] = "telefoonnummer";
if ($situatie === "")                               $fouten[] = "situatie";
if (!$akkoord)                                      $fouten[] = "toestemming";

if (!empty($fouten)) {
    http_response_code(400);
    echo "Vul alle verplichte velden in en geef toestemming, en probeer het opnieuw via ";
    echo '<a href="aanmelden.html">het formulier</a>.';
    exit;
}

$onderwerp = "Nieuwe VSO-aanmelding via de website";

$bericht  = "Nieuwe aanmelding via eerstehulpbijvso.nl\n\n";
$bericht .= "Naam: " . $naam . "\n";
$bericht .= "E-mail: " . $email . "\n";
$bericht .= "Telefoon: " . $telefoon . "\n";
$bericht .= "VSO-status: " . ($status !== "" ? $status : "niet opgegeven") . "\n\n";
$bericht .= "Situatie:\n" . strip_tags($situatie) . "\n\n";
$bericht .= "Toestemming gegeven: ja\n";
$bericht .= "Tijdstip: " . date("Y-m-d H:i:s") . "\n";

$headers  = "From: Eerste hulp bij VSO <" . $afzender . ">\r\n";
$headers .= "Reply-To: " . $naam . " <" . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

@mail($ontvanger, $onderwerp, $bericht, $headers);

header("Location: bedankt.html");
exit;
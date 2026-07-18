<?php
// Verwerkt de intake van aanmelden.html: mailt de gegevens en slaat een geuploade
// VSO veilig op in de afgeschermde map vso-uploads (niet publiek benaderbaar).
// Pas $ontvanger aan als je de meldingen op een ander adres wilt.

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

$naam       = schoon($_POST["naam"] ?? "");
$email      = schoon($_POST["email"] ?? "");
$telefoon   = schoon($_POST["telefoon"] ?? "");
$status     = schoon($_POST["vso_status"] ?? "");
$gezondheid = schoon($_POST["gezondheid"] ?? "");
$situatie   = trim((string)($_POST["situatie"] ?? ""));
$akkoord    = isset($_POST["toestemming"]);
$onderwerp_in = schoon($_POST["onderwerp"] ?? "");   // optioneel label, bv. bij een briefbestelling
$brief_type   = schoon($_POST["brief_type"] ?? "");  // optioneel: waar de brief over gaat
$goed_doel    = schoon($_POST["goed_doel"] ?? "");   // gekozen goed doel (Een nieuw begin)

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

// Bestanden veilig opslaan (optioneel, meerdere toegestaan)
$bestandinfo = "geen bestand geupload";
if (isset($_FILES["bestand"]) && isset($_FILES["bestand"]["name"]) && is_array($_FILES["bestand"]["name"])) {
    $toegestaan = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "heic"];
    $maxbytes   = 20 * 1024 * 1024; // 20 MB per bestand
    $maxaantal  = 10;
    $map = __DIR__ . "/vso-uploads";
    if (!is_dir($map)) { @mkdir($map, 0750, true); }

    $regels = [];
    $aantal = count($_FILES["bestand"]["name"]);
    for ($i = 0; $i < $aantal && count($regels) < $maxaantal; $i++) {
        if (($_FILES["bestand"]["error"][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            continue; // leeg veld of fout, overslaan
        }
        $origineel = schoon(basename($_FILES["bestand"]["name"][$i]));
        $tmp       = $_FILES["bestand"]["tmp_name"][$i];
        $grootte   = (int)$_FILES["bestand"]["size"][$i];
        $ext       = strtolower(pathinfo($origineel, PATHINFO_EXTENSION));

        if (in_array($ext, $toegestaan, true) && $grootte > 0 && $grootte <= $maxbytes && is_uploaded_file($tmp)) {
            $veiligenaam = date("Ymd-His") . "-" . bin2hex(random_bytes(6)) . "." . $ext;
            if (@move_uploaded_file($tmp, $map . "/" . $veiligenaam)) {
                $regels[] = $origineel . " (opgeslagen als vso-uploads/" . $veiligenaam . ")";
            } else {
                $regels[] = $origineel . " (kon niet worden opgeslagen)";
            }
        } else {
            $regels[] = $origineel . " (geweigerd: type of grootte niet toegestaan)";
        }
    }
    if (!empty($regels)) {
        $bestandinfo = count($regels) . " bestand(en):\n  " . implode("\n  ", $regels);
    }
}

$onderwerp = $onderwerp_in !== "" ? $onderwerp_in : "Nieuwe VSO-aanmelding via de website";

$bericht  = ($onderwerp_in !== "" ? $onderwerp_in : "Nieuwe aanmelding") . " via eerstehulpbijvso.nl\n\n";
$bericht .= "Naam: " . $naam . "\n";
$bericht .= "E-mail: " . $email . "\n";
$bericht .= "Telefoon: " . $telefoon . "\n";
if ($brief_type !== "") $bericht .= "Onderwerp van de brief: " . $brief_type . "\n";
$bericht .= "VSO-status: " . ($status !== "" ? $status : "niet opgegeven") . "\n";
$bericht .= "Ziekte of zwangerschap: " . ($gezondheid !== "" ? $gezondheid : "niet opgegeven") . "\n\n";
$bericht .= "Situatie:\n" . strip_tags($situatie) . "\n\n";
$bericht .= "Bijlage: " . $bestandinfo . "\n\n";
$bericht .= "Gekozen goed doel (Een nieuw begin): " . ($goed_doel !== "" ? $goed_doel : "niet gekozen") . "\n";
$bericht .= "Toestemming gegeven: ja\n";
$bericht .= "Tijdstip: " . date("Y-m-d H:i:s") . "\n";

$headers  = "From: Eerste hulp bij VSO <" . $afzender . ">\r\n";
$headers .= "Reply-To: " . $naam . " <" . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

@mail($ontvanger, $onderwerp, $bericht, $headers);

header("Location: bedankt.html?doel=" . rawurlencode($goed_doel));
exit;
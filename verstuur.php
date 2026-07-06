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

// Bestand veilig opslaan (optioneel)
$bestandinfo = "geen bestand geupload";
if (isset($_FILES["bestand"]) && isset($_FILES["bestand"]["error"]) && $_FILES["bestand"]["error"] === UPLOAD_ERR_OK) {
    $origineel = schoon(basename($_FILES["bestand"]["name"]));
    $tmp       = $_FILES["bestand"]["tmp_name"];
    $grootte   = (int)$_FILES["bestand"]["size"];
    $ext       = strtolower(pathinfo($origineel, PATHINFO_EXTENSION));
    $toegestaan = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "heic"];
    $maxbytes   = 20 * 1024 * 1024; // 20 MB

    if (in_array($ext, $toegestaan, true) && $grootte > 0 && $grootte <= $maxbytes && is_uploaded_file($tmp)) {
        $map = __DIR__ . "/vso-uploads";
        if (!is_dir($map)) { @mkdir($map, 0750, true); }
        $veiligenaam = date("Ymd-His") . "-" . bin2hex(random_bytes(6)) . "." . $ext;
        if (@move_uploaded_file($tmp, $map . "/" . $veiligenaam)) {
            $bestandinfo = "Bestand ontvangen: " . $origineel . "\nOpgeslagen als: vso-uploads/" . $veiligenaam;
        } else {
            $bestandinfo = "Bestand ontvangen maar kon niet worden opgeslagen (origineel: " . $origineel . ")";
        }
    } else {
        $bestandinfo = "Bestand geweigerd, type of grootte niet toegestaan (origineel: " . $origineel . ")";
    }
}

$onderwerp = "Nieuwe VSO-aanmelding via de website";

$bericht  = "Nieuwe aanmelding via eerstehulpbijvso.nl\n\n";
$bericht .= "Naam: " . $naam . "\n";
$bericht .= "E-mail: " . $email . "\n";
$bericht .= "Telefoon: " . $telefoon . "\n";
$bericht .= "VSO-status: " . ($status !== "" ? $status : "niet opgegeven") . "\n";
$bericht .= "Ziekte of zwangerschap: " . ($gezondheid !== "" ? $gezondheid : "niet opgegeven") . "\n\n";
$bericht .= "Situatie:\n" . strip_tags($situatie) . "\n\n";
$bericht .= "Bijlage: " . $bestandinfo . "\n\n";
$bericht .= "Toestemming gegeven: ja\n";
$bericht .= "Tijdstip: " . date("Y-m-d H:i:s") . "\n";

$headers  = "From: Eerste hulp bij VSO <" . $afzender . ">\r\n";
$headers .= "Reply-To: " . $naam . " <" . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

@mail($ontvanger, $onderwerp, $bericht, $headers);

header("Location: bedankt.html");
exit;
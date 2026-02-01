<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../config/db.php";

$nombre  = $_POST["nombre"] ?? "";
$correo  = $_POST["correo"] ?? "";
$mensaje = $_POST["mensaje"] ?? "";

if ($nombre === "" || $correo === "") {
    echo json_encode(["ok" => false, "error" => "Datos incompletos"]);
    exit;
}

$pdo = obtenerConexion();


$sql = "INSERT INTO solicitudes_contacto (nombre, correo, mensaje) VALUES (:nombre, :correo, :mensaje)";
$stmt = $pdo->prepare($sql);


$stmt->bindParam(':nombre', $nombre);
$stmt->bindParam(':correo', $correo);
$stmt->bindParam(':mensaje', $mensaje);

if ($stmt->execute()) {
    mail($correo, "Gracias por su mensaje", "Hemos recibido su mensaje y nos pondremos en contacto pronto.");
    echo json_encode(['status' => 'success', 'message' => 'Mensaje enviado correctamente.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error al enviar el mensaje.']);
}

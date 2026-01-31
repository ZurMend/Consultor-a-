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

$sql = "INSERT INTO solicitudes_contacto (nombre, correo, mensaje)
        VALUES (:nombre, :correo, :mensaje)";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":nombre" => $nombre,
    ":correo" => $correo,
    ":mensaje" => $mensaje
]);

echo json_encode(["ok" => true]);

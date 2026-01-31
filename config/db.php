<?php
function obtenerConexion(): PDO {
    return new PDO(
        "mysql:host=localhost;dbname=consultoria;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
}

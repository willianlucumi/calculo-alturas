<?php
// Configuración de la base de datos
$servername = "localhost"; // O la IP del servidor
$username = "root"; // Nombre de usuario de MySQL (por defecto en XAMPP)
$password = ""; // Contraseña de MySQL (por defecto en XAMPP)
$dbname = "constructora_db"; // Nombre de la base de datos

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Opcional: Establecer el juego de caracteres a utf8mb4
$conn->set_charset("utf8mb4");

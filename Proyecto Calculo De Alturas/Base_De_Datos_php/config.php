<?php
// Configuración de la base de datos
$host = 'localhost';
$usuario = 'root';
$contrasena = '';  // Por defecto en XAMPP no tiene contraseña
$base_datos = 'calculo_alturas';

// Crear conexión
$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Establecer charset
$conexion->set_charset("utf8mb4");
?>
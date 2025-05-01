<?php
require_once 'config.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario_id = $conexion->real_escape_string($_POST['usuario_id']);
    $codigo = $conexion->real_escape_string($_POST['codigo']);
    $tipo = $conexion->real_escape_string($_POST['tipo']); // '2fa' o 'recuperacion'

    // Verificar el código
    $sql = "SELECT * FROM codigos_verificacion 
            WHERE usuario_id = $usuario_id 
            AND codigo = '$codigo' 
            AND tipo = '$tipo' 
            AND utilizado = 0 
            AND fecha_expiracion > NOW()";
    
    $result = $conexion->query($sql);
    
    if ($result->num_rows === 1) {
        // Marcar código como utilizado
        $sql_update = "UPDATE codigos_verificacion SET utilizado = 1 WHERE usuario_id = $usuario_id AND codigo = '$codigo'";
        $conexion->query($sql_update);
        
        // Obtener datos del usuario
        $sql_user = "SELECT id, nombre, nombre_usuario, email FROM usuarios WHERE id = $usuario_id";
        $user_result = $conexion->query($sql_user);
        $usuario = $user_result->fetch_assoc();
        
        // Crear sesión
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['email'] = $usuario['email'];
        $_SESSION['nombre'] = $usuario['nombre'];
        
        // Actualizar último acceso
        $sql_update = "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = {$usuario['id']}";
        $conexion->query($sql_update);
        
        echo json_encode([
            'status' => 'success', 
            'message' => 'Código verificado correctamente',
            'usuario' => $usuario
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Código inválido o expirado']);
    }
}
?>
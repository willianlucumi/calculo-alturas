<?php
require_once 'config.php';
session_start();

// Verificar si se enviaron datos por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conexion->real_escape_string($_POST['email']);
    $password = $_POST['password'];

    // Buscar usuario por email
    $sql = "SELECT id, nombre, nombre_usuario, email, password, autenticacion_dos_factores 
            FROM usuarios WHERE email = '$email' AND estado = 'activo'";
    $result = $conexion->query($sql);

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        
        // Verificar contraseña
        if (password_verify($password, $usuario['password'])) {
            
            // Si tiene 2FA activado
            if ($usuario['autenticacion_dos_factores']) {
                // Generar código de verificación
                $codigo = rand(100000, 999999);
                $expiracion = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                
                $sql_code = "INSERT INTO codigos_verificacion (usuario_id, codigo, tipo, fecha_expiracion) 
                             VALUES ({$usuario['id']}, '$codigo', '2fa', '$expiracion')";
                $conexion->query($sql_code);
                
                // En un sistema real, aquí enviarías el código por email
                // mail($email, 'Tu código de verificación', "Tu código es: $codigo");
                
                echo json_encode([
                    'status' => 'success', 
                    'message' => 'Verificación de dos pasos requerida',
                    'require_2fa' => true,
                    'usuario_id' => $usuario['id'],
                    'codigo' => $codigo // NOTA: En producción, NO enviar el código al cliente
                ]);
            } else {
                // Crear sesión
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['email'] = $usuario['email'];
                $_SESSION['nombre'] = $usuario['nombre'];
                
                // Actualizar último acceso
                $sql_update = "UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = {$usuario['id']}";
                $conexion->query($sql_update);
                
                echo json_encode([
                    'status' => 'success', 
                    'message' => 'Inicio de sesión exitoso',
                    'usuario' => [
                        'id' => $usuario['id'],
                        'nombre' => $usuario['nombre'],
                        'nombre_usuario' => $usuario['nombre_usuario'],
                        'email' => $usuario['email']
                    ]
                ]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado o inactivo']);
    }
}
?>
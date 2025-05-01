<?php
require_once 'config.php';

// Verificar si se enviaron datos por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $conexion->real_escape_string($_POST['nombre']);
    $nombre_usuario = $conexion->real_escape_string($_POST['nombre_usuario']);
    $email = $conexion->real_escape_string($_POST['email']);
    $password = $_POST['password'];
    $a2f = isset($_POST['enable_2fa']) ? 1 : 0;

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Email inválido']);
        exit;
    }

    // Verificar si el email ya existe
    $sql_check = "SELECT id FROM usuarios WHERE email = '$email'";
    $result = $conexion->query($sql_check);
    if ($result->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este email ya está registrado']);
        exit;
    }

    // Verificar si el nombre de usuario ya existe
    $sql_check = "SELECT id FROM usuarios WHERE nombre_usuario = '$nombre_usuario'";
    $result = $conexion->query($sql_check);
    if ($result->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este nombre de usuario ya está en uso']);
        exit;
    }

    // Encriptar contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario
    $sql = "INSERT INTO usuarios (nombre, nombre_usuario, email, password, autenticacion_dos_factores) 
            VALUES ('$nombre', '$nombre_usuario', '$email', '$password_hash', $a2f)";

    if ($conexion->query($sql) === TRUE) {
        $usuario_id = $conexion->insert_id;
        
        // Si se activó 2FA, generar código
        if ($a2f) {
            $codigo = rand(100000, 999999);
            $expiracion = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            
            $sql_code = "INSERT INTO codigos_verificacion (usuario_id, codigo, tipo, fecha_expiracion) 
                         VALUES ($usuario_id, '$codigo', '2fa', '$expiracion')";
            $conexion->query($sql_code);
            
            // En un sistema real, aquí enviarías el código por email
            // mail($email, 'Tu código de verificación', "Tu código es: $codigo");
            
            echo json_encode([
                'status' => 'success', 
                'message' => 'Cuenta creada correctamente', 
                'require_2fa' => true,
                'codigo' => $codigo  // NOTA: En producción, NO enviar el código al cliente
            ]);
        } else {
            echo json_encode(['status' => 'success', 'message' => 'Cuenta creada correctamente']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar: ' . $conexion->error]);
    }
}
?>
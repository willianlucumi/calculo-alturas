<?php
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $conexion->real_escape_string($_POST['email']);
    
    // Verificar si el email existe
    $sql = "SELECT id FROM usuarios WHERE email = '$email'";
    $result = $conexion->query($sql);
    
    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        $usuario_id = $usuario['id'];
        
        // Generar código de recuperación
        $codigo = bin2hex(random_bytes(4)); // Código hexadecimal de 8 caracteres
        $expiracion = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Guardar código en la base de datos
        $sql_code = "INSERT INTO codigos_verificacion (usuario_id, codigo, tipo, fecha_expiracion) 
                     VALUES ($usuario_id, '$codigo', 'recuperacion', '$expiracion')";
        $conexion->query($sql_code);
        
        // En un sistema real, aquí enviarías el código por email con instrucciones
        // mail($email, 'Recuperación de contraseña', "Tu código es: $codigo\nHaz clic aquí para restablecer tu contraseña: https://tudominio.com/reset_password.php?codigo=$codigo");
        
        echo json_encode([
            'status' => 'success', 
            'message' => 'Se han enviado instrucciones a tu correo',
            'codigo' => $codigo // NOTA: En producción, NO enviar el código al cliente
        ]);
    } else {
        // Por seguridad, no revelar si el email existe o no
        echo json_encode(['status' => 'success', 'message' => 'Si tu email está registrado, recibirás instrucciones']);
    }
}
?>
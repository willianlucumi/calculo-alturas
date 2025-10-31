<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'db_connection.php'; // Incluir el archivo de conexión

$action = $_GET['action'] ?? '';
$response = ['success' => false, 'message' => 'Acción no válida.'];

switch ($action) {
    case 'get_all_quotes':
        $sql = "SELECT * FROM quotes ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $quotes = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $quotes[] = $row;
            }
        }
        $response = ['success' => true, 'data' => $quotes];
        break;

    case 'get_all_contact_forms':
        $sql = "SELECT * FROM contact_forms ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $forms = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $forms[] = $row;
            }
        }
        $response = ['success' => true, 'data' => $forms];
        break;

    case 'get_all_users':
        $sql = "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $users = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
        }
        $response = ['success' => true, 'data' => $users];
        break;

        // AÑADE MÁS FUNCIONES AQUÍ (e.g., para eliminar un usuario)
        // case 'delete_user':
        //     $id = $_POST['id'] ?? null;
        //     if ($id) {
        //         $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        //         $stmt->bind_param("i", $id);
        //         if ($stmt->execute()) {
        //             $response = ['success' => true, 'message' => 'Usuario eliminado.'];
        //         } else {
        //             $response = ['success' => false, 'message' => 'Error al eliminar usuario.'];
        //         }
        //         $stmt->close();
        //     }
        //     break;
}

$conn->close();
echo json_encode($response);

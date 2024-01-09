<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_notification_id = isset($_POST['notify_id']) ? (string)$_POST['notify_id'] : null;
    $username_session = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_delete_notification = "DELETE FROM remora_db.notifications WHERE notification_id = '$new_notification_id';";
    
    $conn->query($sql_delete_notification);

    $conn->close();

    $response = array('message' => 'Notification_update');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
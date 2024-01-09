<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_notification_id = isset($_POST['notify_id']) ? (string)$_POST['notify_id'] : null;
    $username_session_issuer = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_info = "SELECT travel_id, issuer FROM notifications WHERE notification_id = '$new_notification_id';";

    $travel_id = $conn->query($sql_info);

    $row = $travel_id->fetch_assoc();
    $var_travel_id = $row["travel_id"];
    $var_new_receiver = $row["issuer"];

    $sql_update_trip_spots = "UPDATE trips SET available_spots = available_spots + 1, booked_spots = booked_spots - 1 WHERE travel_id = '$var_travel_id';";
    
    $conn->query($sql_update_trip_spots);

    $currentDateTime = new DateTime();
    $effective_notification_time = $currentDateTime->format('Y-m-d H:i:s');
    $notification_id_hash = (string) hash('sha256', $var_travel_id.$username_session_issuer.$var_new_receiver.$effective_notification_time);
    
    $sql_send_notification_to_passenger = "INSERT INTO remora_db.notifications(notification_id, receiver, issuer, travel_id, type, notification_date) VALUES ('$notification_id_hash', '$var_new_receiver', '$username_session_issuer', '$var_travel_id', 'INFORMATION_REFUSED', '$effective_notification_time');";

    $conn->query($sql_send_notification_to_passenger);

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
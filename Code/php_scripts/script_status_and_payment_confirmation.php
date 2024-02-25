<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_travel_id = isset($_POST['trip_id']) ? (string)$_POST['trip_id'] : null;
    $username_session_issuer = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_info = "SELECT * FROM remora_db.trips WHERE travel_id = '$new_travel_id';";

    $travel_id = $conn->query($sql_info);

    $row = $travel_id->fetch_assoc();
    $var_new_receiver = $row["username"];
    
    $currentDateTime = new DateTime();
    $effective_notification_time = $currentDateTime->format('Y-m-d H:i:s');
    $notification_id_hash = (string) hash('sha256', $new_travel_id.$username_session_issuer.$var_new_receiver.$effective_notification_time);
    
    $sql_send_notification_to_driver = "INSERT INTO remora_db.notifications(notification_id, receiver, issuer, travel_id, type, notification_date, wallet) VALUES ('$notification_id_hash', '$var_new_receiver', '$username_session_issuer', '$new_travel_id', 'PAYMENT_RECEIVED', '$effective_notification_time', '');";

    $conn->query($sql_send_notification_to_driver);

    $sql_update_status_payed = "UPDATE remora_db.ongoing_trips SET status = 'PAID' WHERE travel_id = '$new_travel_id' AND username = '$username_session_issuer' AND role = 'PASSENGER';";

    $result_driver_check = $conn->query($sql_update_status_payed);

    $sql_update_passenger_stats = "UPDATE remora_db.users SET trips_received = trips_received+1, travel_stats = travel_stats+1 WHERE username = '$username_session_issuer';";

    $result_passenger_stats_update = $conn->query($sql_update_passenger_stats);
    
    $conn->close();

    $response = array('message' => 'Notification_payment_sent_and_passenger_stats_updated');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
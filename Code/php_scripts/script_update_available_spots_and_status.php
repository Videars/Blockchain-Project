<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_travel_id = isset($_POST['trip_id']) ? (string)$_POST['trip_id'] : null;
    $username_session = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_update_available_spots = "UPDATE remora_db.trips SET available_spots = 0 WHERE travel_id = '$new_travel_id';";
    
    $conn->query($sql_update_available_spots);

    $sql_update_passenger_status = "UPDATE remora_db.ongoing_trips SET status = 'PAY_UNLOCKED' WHERE travel_id = '$new_travel_id' AND role = 'PASSENGER';";

    $conn->query($sql_update_passenger_status);

    $sql_update_driver_status = "UPDATE remora_db.ongoing_trips SET status = 'STORED' WHERE travel_id = '$new_travel_id' AND role = 'DRIVER';";

    $conn->query($sql_update_driver_status);

    $conn->close();

    $response = array('message' => 'Spots_updated');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
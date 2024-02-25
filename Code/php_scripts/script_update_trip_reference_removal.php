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

    $sql_update_notification = "DELETE FROM remora_db.notifications WHERE travel_id = '$new_travel_id';";

    $conn->query($sql_update_notification);

    $sql_update_ongoing_trips = "DELETE FROM remora_db.ongoing_trips WHERE travel_id = '$new_travel_id';";

    $conn->query($sql_update_ongoing_trips);

    $sql_update_trips = "DELETE FROM remora_db.trips WHERE travel_id = '$new_travel_id';";

    $conn->query($sql_update_trips);

    $sql_update_trips = "UPDATE remora_db.users SET trips_given = trips_given+1, travel_stats = travel_stats+1 WHERE username = '$username_session_issuer';";

    $conn->query($sql_update_trips);
    
    $conn->close();

    $response = array('message' => 'Trip_correctly_closed_and_information_updated');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
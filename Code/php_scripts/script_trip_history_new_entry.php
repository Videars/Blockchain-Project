<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_travel_id = isset($_POST['trip_id']) ? (string)$_POST['trip_id'] : null;
    $new_trip_id_blockchain = isset($_POST['trip_id_blockchain']) ? (string)$_POST['trip_id_blockchain'] : null;
    $new_driver_wallet = isset($_POST['wallet_driver']) ? (string)$_POST['wallet_driver'] : null;
    $username_session = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_get_relative_trip = "SELECT * FROM remora_db.trips WHERE travel_id = '$new_travel_id';";

    $result = $conn->query($sql_get_relative_trip);
    $row = $result->fetch_assoc();

    $effective_driver = $row['username'];
    $new_departure = $row['departure'];
    $new_destination = $row['destination'];
    $new_departure_date = $row['departure_date'];

    $sql_create_history_trip_entry = "INSERT INTO remora_db.history_trips (travel_id, trip_identifier_blockchain, driver_username, departure, destination, departure_date, driver_wallet) VALUES ('$new_travel_id', '$new_trip_id_blockchain', '$effective_driver', '$new_departure', '$new_destination', '$new_departure_date', '$new_driver_wallet');";
    
    $conn->query($sql_create_history_trip_entry);

    $sql_update_driver_wallet_ongoing_trips = "UPDATE remora_db.ongoing_trips SET wallet = '$new_driver_wallet' WHERE travel_id = '$new_travel_id' AND role = 'DRIVER';";
    
    $conn->query($sql_update_driver_wallet_ongoing_trips);

    $conn->close();

    $response = array('message' => 'New history trip entry created');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
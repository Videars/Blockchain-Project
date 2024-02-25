<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $new_post_username = $_SESSION["username"];
    $new_travel_id = isset($_GET['trip_id']) ? (string)$_GET['trip_id'] : null;

    $sql = "SELECT trip_identifier_blockchain, driver_wallet FROM remora_db.history_trips WHERE travel_id = '$new_travel_id';";

    $result = $conn->query($sql);

    $resultArray = array();
    $offer = array();

    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            $offer = array(
                "trip_identifier_blockchain" => $row["trip_identifier_blockchain"],
                "driver_wallet" => $row["driver_wallet"]
            );

            $resultArray[] = $offer;
        }
    }

    $conn->close();

    echo json_encode($resultArray);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
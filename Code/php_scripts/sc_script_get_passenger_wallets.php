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

    $sql = "SELECT wallet FROM remora_db.ongoing_trips WHERE travel_id = '$new_travel_id' AND role = 'PASSENGER';";

    $result = $conn->query($sql);

    $resultArray = array();
    $offer = array();

    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            $offer = array(
                "wallet" => $row["wallet"]
            );

            $resultArray[] = $offer;
        }
    }

    $trip_cost = "SELECT gear_cost FROM remora_db.trips WHERE travel_id = '$new_travel_id';";

    $result_cost = $conn->query($trip_cost);

    $row_cost = $result_cost->fetch_assoc();

    $offer = array(
        "gear_cost" => $row_cost["gear_cost"]
    );

    $resultArray[] = $offer;

    $conn->close();

    echo json_encode($resultArray);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
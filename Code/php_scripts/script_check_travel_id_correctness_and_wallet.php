<?php
session_start();
include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $new_travel_id = isset($_GET['trip_id']) ? (string)$_GET['trip_id'] : null;
    $username_session = $_SESSION["username"];
    
    $sql_get_travel_id = "SELECT travel_id FROM remora_db.ongoing_trips WHERE travel_id = '$new_travel_id' AND username = '$username_session' AND role = 'DRIVER';";

    $result_travel_id = $conn->query($sql_get_travel_id);
    
    $resultArray = array();

    $resultArray[] = array(
        "check" => $result_travel_id->num_rows
    );

    if($result_travel_id->num_rows > 0){
        $sql_get_passengers_wallet = "SELECT wallet FROM remora_db.ongoing_trips WHERE travel_id = '$new_travel_id' and role = 'PASSENGER';";
        $result_passengers_wallet = $conn->query($sql_get_passengers_wallet);

        while($row = $result_passengers_wallet->fetch_assoc()){
            $resultArray[] = array(
                "wallet" => $row["wallet"]
            );
        }
    }
    
    $conn->close();
    
    echo json_encode($resultArray);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
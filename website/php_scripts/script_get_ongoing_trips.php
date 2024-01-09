<?php
session_start();
include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $perPage = 3;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $username_session = $_SESSION["username"];
    
    $offset = ($page - 1) * $perPage;
    
    $sql_get_ongoing_trips = "SELECT * FROM remora_db.ongoing_trips WHERE username = '$username_session' LIMIT $offset, $perPage";

    $result = $conn->query($sql_get_ongoing_trips);
    
    $resultArray = array();
    $offer = array();
    
    while ($row = $result->fetch_assoc()){
        $var_travel_id = $row["travel_id"];

        $sql_get_trip_info = "SELECT * FROM remora_db.trips WHERE travel_id = '$var_travel_id' ORDER BY departure_date;";

        $result_trip = $conn->query($sql_get_trip_info);

        if($result_trip->num_rows != 0){
            $row_trip = $result_trip->fetch_assoc();
            $offer = array(
                "travel_id" => $row_trip["travel_id"],
                "username" => $row_trip["username"],
                "departure" => $row_trip["departure"],
                "destination" => $row_trip["destination"],
                "departure_date" => $row_trip["departure_date"],
                "gear_cost" => $row_trip["gear_cost"],
                "expiration" => $row_trip["expiration"],
                "available_spots" => $row_trip["available_spots"],
                "expired" => $row_trip["expired"],
                "booked_spots" => $row_trip["booked_spots"],
                "role" => $row["role"]
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
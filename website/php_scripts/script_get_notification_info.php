<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $new_notification_id = isset($_GET['notify_id']) ? (string)$_GET['notify_id'] : null;

    $sql_get_notification_info = "SELECT notifications.issuer, trips.travel_id, departure, destination, departure_date FROM remora_db.notifications, remora_db.trips WHERE notifications.notification_id = '$new_notification_id' AND notifications.travel_id = trips.travel_id;";

    $result = $conn->query($sql_get_notification_info);

    $resultArray = array();
    while ($row = $result->fetch_assoc()) {
        $offer = array(
            "issuer" => $row["issuer"],
            "departure" => $row["departure"],
            "destination" => $row["destination"],
            "departure_date" => $row["departure_date"]
        );

        $resultArray[] = $offer;
    }

    $conn->close();

    echo json_encode($resultArray);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $perPage = 4;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

    $offset = ($page - 1) * $perPage;

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $user = $_SESSION["username"];

    $sql_get_notifications = "SELECT notification_id, type FROM notifications WHERE receiver = '$user' LIMIT $offset, $perPage";

    $result = $conn->query($sql_get_notifications);

    $resultArray = array();
    while ($row = $result->fetch_assoc()) {
        $offer = array(
            "notification_id" => $row["notification_id"],
            "type" => $row["type"]
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
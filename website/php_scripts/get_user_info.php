<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $user = $_SESSION["username"];

    $sql = "SELECT email, balance, travel_stats, trips_given, trips_received, minted_gears FROM users WHERE username = '$user'";

    $result = $conn->query($sql);

    $resultArray = array();
    while ($row = $result->fetch_assoc()) {
        $offer = array(
            "username" => $user,
            "email" => $row["email"],
            "balance" => $row["balance"],
            "travel_stats" => $row["travel_stats"],
            "trips_given" => $row["trips_given"],
            "trips_received" => $row["trips_received"],
            "minted_gears" => $row["minted_gears"]
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
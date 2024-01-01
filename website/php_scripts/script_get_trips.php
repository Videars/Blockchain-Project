<?php
$servername = "localhost";
$username = "root";
$password = "**********";
$dbname = "remora_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$perPage = 5;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$mode = isset($_GET['mode']) ? (string)$_GET['mode'] : null;

$departure = isset($_GET['departure']) ? (string)$_GET['departure'] : null;
$destination = isset($_GET['destination']) ? (string)$_GET['destination'] : null;
$date = isset($_GET['date']) ? (string)$_GET['date'] : null;

$offset = ($page - 1) * $perPage;

if($mode === "DEFAULT_MODE"){
    $sql = "SELECT * FROM trips ORDER BY departure_date LIMIT $offset, $perPage";
}

if($mode === "SEARCH_MODE"){
    if($departure === "" && $destination === "" && $date === ""){
        $sql = "SELECT * FROM trips ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination === "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination !== "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE destination = '$destination' ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination === "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure_date LIKE '$date%' ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination !== "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND destination = '$destination' ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure !== "" && $destination === "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND departure_date LIKE '$date%' ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination !== "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE destination = '$destination' AND departure_date LIKE '$date%' ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination !== "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND destination = '$destination' AND departure_date LIKE '$date%' ORDER BY departure_date LIMIT $offset, $perPage";
    }
}

$result = $conn->query($sql);

$resultArray = array();
while ($row = $result->fetch_assoc()) {
    $offer = array(
        "travel_id" => $row["travel_id"],
        "username" => $row["username"],
        "departure" => $row["departure"],
        "destination" => $row["destination"],
        "departure_date" => $row["departure_date"],
        "gear_cost" => $row["gear_cost"],
        "expiration" => $row["expiration"],
        "available_spots" => $row["available_spots"],
        "expired" => $row["expired"],
        "booked_spots" => $row["booked_spots"]
    );

    $resultArray[] = $offer;
}

$conn->close();

echo json_encode($resultArray);

?>
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

$offset = ($page - 1) * $perPage;

$sql = "SELECT * FROM trips ORDER BY departure_date LIMIT $offset, $perPage";
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
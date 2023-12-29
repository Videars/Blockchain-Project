<?php
$servername = "localhost";
$username = "root";
$password = "********";
$dbname = "remora_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM gears";
$result = $conn->query($sql);

$resultArray = array();
while ($row = $result->fetch_assoc()) {
    $offer = array(
        "offer_id" => $row["offer_id"],
        "seller" => $row["username"],
        "gears" => $row["gears_offered"],
        "eth" => $row["eth_requested"]
    );

    $resultArray[] = $offer;
}


$conn->close();

echo json_encode($resultArray);

?>
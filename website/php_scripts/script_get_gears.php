<?php
include 'config.php';

$conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$perPage = 5;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

$offset = ($page - 1) * $perPage;

$sql = "SELECT * FROM gears ORDER BY gears_offered LIMIT $offset, $perPage";

$result = $conn->query($sql);

$resultArray = array();
while ($row = $result->fetch_assoc()) {
    $offer = array(
        "offer_id" => $row["offer_id"],
        "username" => $row["username"],
        "gears_offered" => $row["gears_offered"],
        "eth_requested" => $row["eth_requested"]
    );

    $resultArray[] = $offer;
}

$conn->close();

echo json_encode($resultArray);

?>
<?php
$servername = "localhost";
$username = "root";
$password = "Pappagallo99!";
$dbname = "remora_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$new_post_username = isset($_POST['new_sell_username']) ? (string)$_POST['new_sell_username'] : null;
$new_post_gears = isset($_POST['new_sell_gears_offered']) ? (string)$_POST['new_sell_gears_offered'] : null;
$new_post_ethereum = isset($_POST['new_sell_ethereum_requested']) ? (string)$_POST['new_sell_ethereum_requested'] : null;

$offer_id_value = (string) md5($new_post_username.$new_post_gears.$new_post_ethereum);

$sql = "INSERT INTO remora_db.gears (offer_id, username, gears_offered, eth_requested) VALUES ('$offer_id_value', '$new_post_username', '$new_post_gears', '$new_post_ethereum');";

$result = $conn->query($sql);

$conn->close();

$response = array('message' => 'POST Successful');
echo json_encode($response);

?>
<?php
session_start();

include 'config.php';

$conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$new_post_username = $_SESSION["username"];
$new_post_gears = isset($_POST['new_sell_gears_offered']) ? (string)$_POST['new_sell_gears_offered'] : null;
$new_post_ethereum = isset($_POST['new_sell_ethereum_requested']) ? (string)$_POST['new_sell_ethereum_requested'] : null;
$new_post_receiver_wallet = isset($_POST['new_sell_gears_receiver_wallet']) ? (string)$_POST['new_sell_gears_receiver_wallet'] : null;

$offer_id_value = (string) hash('sha256', $new_post_username.$new_post_gears.$new_post_ethereum.$new_post_receiver_wallet);

$sql = "INSERT INTO remora_db.gears (offer_id, username, gears_offered, eth_requested, receiver_wallet) VALUES ('$offer_id_value', '$new_post_username', '$new_post_gears', '$new_post_ethereum', '$new_post_receiver_wallet');";

$result = $conn->query($sql);

$conn->close();

$response = array('message' => 'POST Successful');
echo json_encode($response);

?>
<?php
include 'config.php';

$conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$name_id = isset($_POST['name']) ? (string)$_POST['name'] : null;
$surname_id = isset($_POST['surname']) ? (string)$_POST['surname'] : null;
$email_id = isset($_POST['email']) ? (string)$_POST['email'] : null;
$username_id = isset($_POST['username']) ? (string)$_POST['username'] : null;
$password_id = isset($_POST['password']) ? (string)$_POST['password'] : null;

$password_id_hashed = (string) hash('sha256', $password_id);
$sql = "INSERT INTO remora_db.users (username, email, name, surname, travel_stats, trips_given, trips_received, minted_gears, password) VALUES ('$username_id', '$email_id', '$name_id', '$surname_id', '0', '0', '0', '0', '$password_id_hashed');";

$result = $conn->query($sql);

$conn->close();

$response = array('message' => 'Register Successful');
echo json_encode($response);

?>
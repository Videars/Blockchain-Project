<?php
$servername = "localhost";
$username_db = "root";
$password_db = "Pappagallo99!";
$dbname = "remora_db";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$name_id = isset($_POST['name']) ? (string)$_POST['name'] : null;
$surname_id = isset($_POST['surname']) ? (string)$_POST['surname'] : null;
$email_id = isset($_POST['email']) ? (string)$_POST['email'] : null;
$username_id = isset($_POST['username']) ? (string)$_POST['username'] : null;
$password_id = isset($_POST['password']) ? (string)$_POST['password'] : null;


$sql = "INSERT INTO remora_db.users (username, email, name, surname, balance, travel_stats, password) VALUES ('$username_id', '$email_id', '$name_id', '$surname_id', '0', '0', '$password_id');";

$result = $conn->query($sql);

$conn->close();

$response = array('message' => 'Register Successful');
echo json_encode($response);

?>
<?php
$servername = "localhost";
$username_db = "root";
$password_db = "Pappagallo99!";
$dbname = "remora_db";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username_id = isset($_GET['username']) ? (string)$_GET['username'] : null;
$password_id = isset($_GET['password']) ? (string)$_GET['password'] : null;

$sql = "SELECT username, password FROM remora_db.users WHERE username = '$username_id';";

$result = $conn->query($sql);

if($row = $result->fetch_assoc()){
    if($password_id === $row["password"]){
        $conn->close();
        $response = array('message' => 'Login Successful');
        echo json_encode($response);
        } else {
            $conn->close();
            $response = array('message' => 'Wrong Password!');
            echo json_encode($response);
        }
    } else {
        $conn->close();
        $response = array('message' => 'User not found :(');
        echo json_encode($response);
    }

?>
<?php
$servername = "localhost";
$username = "root";
$password = "Pappagallo99!";
$dbname = "remora_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$new_post_username = isset($_POST['new_post_username']) ? (string)$_POST['new_post_username'] : null;
$new_post_departure = isset($_POST['new_post_departure']) ? (string)$_POST['new_post_departure'] : null;
$new_post_destination = isset($_POST['new_post_destination']) ? (string)$_POST['new_post_destination'] : null;
$new_post_date_departure = isset($_POST['new_post_date_departure']) ? $_POST['new_post_date_departure'] : null;
$new_post_booking_deadline = isset($_POST['new_post_booking_deadline']) ? $_POST['new_post_booking_deadline'] : null;
$new_post_available_spots = isset($_POST['new_post_available_spots:']) ? (int)$_POST['new_post_available_spots:'] : 0;
$new_post_gear_cost_input = isset($_POST['new_post_gear_cost_input']) ? (int)$_POST['new_post_gear_cost_input'] : 0;

$travel_id_value = (string) md5($new_post_username.$new_post_departure.$new_post_destination.$new_post_date_departure);

$sql = "INSERT INTO remora_db.trips (travel_id, username, departure, destination, departure_date, gear_cost, expiration, available_spots, booked_spots, expired) VALUES ('$travel_id_value', '$new_post_username', '$new_post_departure', '$new_post_destination', '$new_post_date_departure', '$new_post_gear_cost_input', '$new_post_booking_deadline', '$new_post_available_spots', '0', '0');";

$result = $conn->query($sql);

$conn->close();

$response = array('message' => 'POST Successful');
echo json_encode($response);

?>
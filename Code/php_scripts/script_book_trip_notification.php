<?php
session_start();

include 'config.php';

$conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$notification_user = $_SESSION["username"];
$travel_id = isset($_POST['book_trip_id']) ? (string)$_POST['book_trip_id'] : null;
$wallet_id = isset($_POST['wallet']) ? (string)$_POST['wallet'] : null;

$sql_check_trip_already_booked = "SELECT * FROM remora_db.ongoing_trips WHERE travel_id = '$travel_id' AND username = '$notification_user';";

$result_check_trip = $conn->query($sql_check_trip_already_booked);

if ($result_check_trip->num_rows == 0){

    $sql_get_driver = "SELECT username, expiration, available_spots FROM trips WHERE expired = '0' AND travel_id = '$travel_id';";

    $result = $conn->query($sql_get_driver);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $effective_driver = $row['username'];
        $expiration_time = $row['expiration'];
        $effective_available_spots = $row['available_spots'];

        if(checkExpiration($expiration_time) == 0){
            if($row["available_spots"] > 0){
                if($notification_user !== $effective_driver){

                    $sql_check_notification = "SELECT notification_id FROM notifications WHERE travel_id = '$travel_id' AND receiver = '$effective_driver' AND issuer = '$notification_user';";
            
                    $result = $conn->query($sql_check_notification);
            
                    if ($result->num_rows == 0) {
                        $currentDateTime = new DateTime();
                        $effective_notification_time = $currentDateTime->format('Y-m-d H:i:s');
                        $notification_id = (string) hash('sha256', $travel_id.$notification_user.$effective_driver.$effective_notification_time);
                        
                        $sql_insert_notification = "INSERT INTO remora_db.notifications (notification_id, receiver, issuer, travel_id, type, notification_date, wallet) VALUES ('$notification_id', '$effective_driver', '$notification_user', '$travel_id', 'CONFIRMATION', '$effective_notification_time', '$wallet_id');";
            
                        $conn->query($sql_insert_notification);
                        
                        $sql_update_available_spots_and_booked_spots = "UPDATE remora_db.trips SET available_spots = available_spots - 1, booked_spots = booked_spots + 1 WHERE travel_id = '$travel_id';";

                        $conn->query($sql_update_available_spots_and_booked_spots);

                        $conn->close();
            
                        $response = array('message' => 'BOOK Successful: wait some time for the driver confirmation. You are about to be redirected to the first page.');
                        echo json_encode($response);
                    } else {
                        $conn->close();
            
                        $response = array('message' => 'You have already sent a notification to BOOK this trip. Wait for the driver response');
                        echo json_encode($response);
                    }
                } else {
                    $conn->close();
            
                    $response = array('message' => 'You cannot BOOK this trip. You are the DRIVER!');
                    echo json_encode($response);
                }
            } else {
                $response = array('message' => 'You cannot BOOK this trip. There are no available spots anymore, sorry :(');
                echo json_encode($response);
            }
        } else {
            $response = array('message' => 'You cannot BOOK this trip. The trip seems to be expired, sorry :(');
            echo json_encode($response);
        }
    }
} else {
    $response = array('message' => 'You cannot BOOK this trip. You are part of this trip already :)');
    echo json_encode($response);
}

function checkExpiration($date_var) {
    $now = new DateTime();

    $expiration_date = $date_var;

    $expirationDateObj = new DateTime($expiration_date);

    if ($now > $expirationDateObj) {
        //scaduta
        return 1;
    } else {
        //ok
        return 0;
    }
}

?>
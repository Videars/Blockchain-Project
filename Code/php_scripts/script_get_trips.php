<?php
include 'config.php';

$conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$perPage = 5;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$mode = isset($_GET['mode']) ? (string)$_GET['mode'] : null;

$departure = isset($_GET['departure']) ? (string)$_GET['departure'] : null;
$destination = isset($_GET['destination']) ? (string)$_GET['destination'] : null;
$date = isset($_GET['date']) ? (string)$_GET['date'] : null;

$offset = ($page - 1) * $perPage;

if($mode === "DEFAULT_MODE"){
    $sql = "SELECT * FROM trips WHERE expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
}

if($mode === "SEARCH_MODE"){
    if($departure === "" && $destination === "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination === "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination !== "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE destination = '$destination' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination === "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure_date LIKE '$date%' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination !== "" && $date === ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND destination = '$destination' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure !== "" && $destination === "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND departure_date LIKE '$date%' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }
    if($departure === "" && $destination !== "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE destination = '$destination' AND departure_date LIKE '$date%' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }

    if($departure !== "" && $destination !== "" && $date !== ""){
        $sql = "SELECT * FROM trips WHERE departure = '$departure' AND destination = '$destination' AND departure_date LIKE '$date%' AND expired = '0' AND available_spots > 0 ORDER BY departure_date LIMIT $offset, $perPage";
    }
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

$database_update = 1;

while($database_update == 1) {

    $result = $conn->query($sql);
    $resultArray = array();
    $offer = array();

    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            if(checkExpiration($row["expiration"]) == 0){
                //DATA VALIDA
                if($row["available_spots"] > 0){
                    $database_update = 0;
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
                } else {
                    //NON METTO NELL'ARRAY E NON FACCIO NULLA
                    //ma tanto qui non entriamo mai perchè le query hanno available spot > 0 come condizione
                }
            } else {
                //SCADUTA
                $database_update = 1;
                $new_entry = $row["travel_id"];
                if($row["booked_spots"] > 0){
                    //SETTO EXPIRED
                    $sql_update_expired_field = "UPDATE remora_db.trips SET expired = '1' WHERE travel_id = '$new_entry';";
                    $conn->query($sql_update_expired_field);
                    //NON METTO NELL'ARRAY E NON FACCIO NULLA
                } else {
                    //CANCELLO DAL DB
                    $sql_delete_row = "DELETE FROM remora_db.trips WHERE travel_id = '$new_entry';";
                    $conn->query($sql_delete_row);
                }
                break;
            }

            $resultArray[] = $offer;

        }
    } else {
        $database_update = 0;
    }
}

$conn->close();

echo json_encode($resultArray);

?>
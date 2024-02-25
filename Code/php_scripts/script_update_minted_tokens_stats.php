<?php
session_start();

include 'config.php';

if(isset($_SESSION["username"])){

    $conn = new mysqli($servername_db, $username_db, $password_db, $dbname);

    $new_minted_tokens = isset($_POST['tokens']) ? (string)$_POST['tokens'] : null;
    $username_session_issuer = $_SESSION["username"];

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql_update_minted_tokens = "UPDATE remora_db.users SET minted_gears = minted_gears + $new_minted_tokens WHERE username = '$username_session_issuer';";

    $conn->query($sql_update_minted_tokens);
    
    $conn->close();

    $response = array('message' => 'Tokens_correctly_minted_and_stats_correctly_updated');
    echo json_encode($response);

} else {
    $response = array('message' => 'You are not logged in :(');
    echo json_encode($response);
}

?>
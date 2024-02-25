<?php
session_start();

if(isset($_SESSION["username"])){
    $user = $_SESSION["username"];
    $response = array('message' => $user);
    echo json_encode($response);
    } else {
        $response = array('message' => 'You are not logged in :(');
        echo json_encode($response);
    }

?>
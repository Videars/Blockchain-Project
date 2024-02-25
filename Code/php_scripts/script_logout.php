<?php
session_start();

unset($_SESSION["username"]);
session_destroy();

$response = array('message' => 'You have logged out successfully');
echo json_encode($response);

?>
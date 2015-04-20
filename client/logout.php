<?php


session_start();
unset($_SESSION['googleId']);
unset($_SESSION['token']);

header("Location: index.php");

?>
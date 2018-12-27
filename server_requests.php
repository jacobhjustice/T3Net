<?php
    // All variable used in database access are stored in secret.php are listed below:
    //  $server: The server on which the database exists
    //  $user: the username credentials to access the database
    //  $password: Password associated with username
    //  $db: The name of the database within the server
    require 'secret.php';
    require 'server_functions.php';

    $con = mysqli_connect($server, $user, $password, $db);
    $func = $_GET['FUNCTION'];

    $retObj = (object) [
        'ERROR' => null,
        'DATA' => null,
    ];
    
    switch($func) {
        case 'CREATE_USER':
            $name = $_GET['USERNAME'];
            $pass = $_GET['PASSWORD'];
            createUser($con, $name, $pass, $retObj);
            echo json_encode($retObj);
            break;
        case 'AUTHENTICATE_USER':
            $name = $_GET['USERNAME'];
            $pass = $_GET['PASSWORD'];
            authenticateUser($con, $name, $pass, $retObj);
            echo json_encode($retObj);
            break;
        default: 
            echo 'Could not find command';
    }
    exit();
?>
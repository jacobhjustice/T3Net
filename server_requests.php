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
            break;
        case 'AUTHENTICATE_USER':
            $name = $_GET['USERNAME'];
            $pass = $_GET['PASSWORD'];
            authenticateUser($con, $name, $pass, $retObj);
            break;
        case 'CREATE_GAME': 
            $creatorID = $_GET['CREATOR_ID'];
            $challengedName = $_GET['CHALLENGED_NAME'];
            if($retObj->ERROR == null) {
                createGame($con, $creatorID, $challengedName, $retObj);
            }
            break;
        case 'FETCH_GAMES':
            break;
        case 'TAKE_TURN':
            $nextTurnNumber = $_GET['NEXT_TURN'];
            $cellID = $_GET['CELL_ID'];
            $squareID = $_GET['SQUARE_ID'];
            $gameID = $_GET['GAME_ID'];
            $nextSquare = $_GET['NEXT_SQUARE'];
            $playerID = $_GET['PLAYER_ID'];
            $opponentID = $_GET['OPPONENT_ID'];
            $tookSquare = $_GET['TOOK_SQUARE'] == "true";
            $wonGame = $_GET['WON_GAME'] == "true";
            takeTurn($con, $nextTurnNumber, $cellID, $squareID, $gameID, $nextSquare, $playerID, $opponentID, $tookSquare, $wonGame, $retObj);
            break;
        default: 
            $retObj->ERROR = "COMMAND UNKNOWN";
    }
    mysqli_close($con);
    echo json_encode($retObj);
    exit();
?>
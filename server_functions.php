<?php
    function createGame($conn, $creatorID, $challengedID) {

    }

    function getLatestMove($conn, $gameID, $turnNum) {

    }

    function createUser($con, $username, $password, &$retObj) {  
        $password = filter_var($password, FILTER_SANITIZE_STRING);
        $username = filter_var($username, FILTER_SANITIZE_STRING);
        $query = "SELECT * FROM Account WHERE Username = '$username'";
        $result = mysqli_query($con, $query);

        // Check to make sure username does not exist already
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($result->num_rows > 0){
            $retObj->ERROR = "username";
            return;
        }

        // Hash the password, create account, and return the ID to the client
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $query = "INSERT INTO Account (Username, Password) VALUES ('$username', '$hash');";
        $result = mysqli_query($con, $query);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        $retObj->DATA = mysqli_insert_id($con);
        return;
    }

    function takeTurn($conn, $turn, $cellID, $squareID, $nextSquareID, $playerID, $tookSquare, $wonGame) {

    }

    function allGames($conn, $userID) {

    }

    function checkForTurn($conn, $gameID) {

    }
?>
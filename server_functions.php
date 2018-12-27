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
        if(strlen($err) > 0) {
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
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        $retObj->DATA = mysqli_insert_id($con);
        return;
    }

    function authenticateUser($con, $username, $password, &$retObj) { 
        $password = filter_var($password, FILTER_SANITIZE_STRING);
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $username = filter_var($username, FILTER_SANITIZE_STRING);

        $query = "SELECT ID FROM Account WHERE Username = '$username' AND Password = '$hash'";
        $result = mysqli_query($con, $query);

        // Check to make sure username does not exist already
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($row = mysqli_fetch_row($result)){
            $retObj->DATA = $row[0];
            return;
        }
        $retObj->ERROR = "Username/Password could not be authenticated";
    }

    function takeTurn($conn, $turn, $cellID, $squareID, $nextSquareID, $playerID, $tookSquare, $wonGame) {

    }

    function allGames($conn, $userID, $previousGames) {
        // TODO: TEST FINISH
        $userID = filter_var($userID, FILTER_SANITIZE_INT);
        $query = "SELECT G.ID, G.Player1, G.Player2, A.Username AS Opposer, G.Winner, G.PlayerTurn FROM Game G LEFT JOIN Account A ON (A.ID <> $userID AND A.ID = Player2) OR (A.ID <> $userID AND A.ID = Player1) WHERE (G.Player1 = $userID OR G.Player2 = $userID) " . ($previousGames ? "" : " AND G.Winner IS NULL");

    }

    function checkForTurn($conn, $gameID, $userID, &$retObj) {
        // TODO TEST FINISH
        $gameID = filter_var($gameID, FILTER_SANITIZE_INT);
        $userID = filter_var($userID, FILTER_SANITIZE_INT);
        $query = "SELECT COUNT(*) FROM Game WHERE ID = $gameID AND $userID = PlayerTurn";
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        //$retObj->DATA = $
    }
?>
<?php
    function findUser($con, $username, &$retObj) {
        $username = filter_var($username, FILTER_SANITIZE_STRING);
        $query = "SELECT ID FROM Account WHERE Username = '$username'";
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
        $retObj->ERROR = -1;
    }


// ALL FUNC


// TODO: loadGame, createGameRandom, 
    function createGame($con, $creatorID, $challengedName, &$retObj) {
        // TODO TEST, RETURN DATA TO CLIENT
        $creatorID = filter_var($creatorID, FILTER_SANITIZE_STRING);
        $challengedName = filter_var($challengedName, FILTER_SANITIZE_STRING);
        
        // Confirm challengee exists
        findUser($con, $challengedName, $retObj);
        if($retObj->ERROR != null) {
            return;
        }
        $challengedID = $retObj->DATA;

        if($challengedID == $creatorID) {
            $retObj->ERROR = -2;
            return;
        }

        // Create the game
        $query = "INSERT INTO Game (Player1, Player2, PlayerTurn, TurnNumber, NextSquare) VALUES ($creatorID, $challengedID, $creatorID, 0, -1);";
        $result = mysqli_query($con, $query);        
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }

        $gameID = mysqli_insert_id($con);
        $player2Object = (object)[
            'ID' => $challengedID,
            'Logo' => 'O',
            'Username' => $challengedName
        ];

        $retObj->DATA = (object) [
            'ID' => $gameID,
            'Player1' => null,
            'Player2' => $player2Object,
            'TurnNumber' => 0,
            'NextSquare' => -1,
            'Squares' => array(),
            'Winner' => null,
        ];

        // Create the 9 squares for the game
        for($i = 0; $i < 9; $i++) {
            $query = "INSERT INTO Square (GameID, LocalOrder) VALUES ($gameID, $i);";
            $result = mysqli_query($con, $query);        
            $err = mysqli_error($con);
            if (strlen($err) > 0) {
                $retObj->ERROR = $err;
                return;
            }
            $squareID = mysqli_insert_id($con);

            $squareObject = (object)[
                'ID' => $squareID,
                'GameID' => $gameID,
                'LocalOrder' => $i,
                'Owner' => null,
                'Cells' => array()
            ];
            array_push($retObj->DATA->Squares, $squareObject);

            // Create each of the cells within the square
            $query = " INSERT INTO Cell (SquareID, GameID, LocalOrder) VALUES ";
            for($o = 0; $o < 9; $o++) {
                $query .= "($squareID, $gameID, $o)";
                if($o != 8) {
                    $query .= ", ";
                }
            }
            $result = mysqli_query($con, $query);   
            $baseCellID = mysqli_insert_id($con);         

            $err = mysqli_error($con);
            if (strlen($err) > 0) {
                $retObj->ERROR = $err;
                return;
            }
            for($o = 0; $o < 9; $o++) {
                $cellObject = (object)[
                    'ID' => $baseCellID + $o,
                    'SquareID' => $squareID,
                    'GameID' => $gameID,
                    'LocalOrder' => $o,
                    'Owner' => null
                ];
                array_push($retObj->DATA->Squares[$i]->Cells, $cellObject);
            }
        }
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
        $username = filter_var($username, FILTER_SANITIZE_STRING);
        $query = "SELECT ID, PASSWORD FROM Account WHERE Username = '$username'";
        $result = mysqli_query($con, $query);

        // Check to make sure username does not exist already
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($row = mysqli_fetch_row($result)){
            if(password_verify($password, $row[1])) {
                $retObj->DATA = $row[0];
                return;
            }
        }
        $retObj->ERROR = "Username/Password could not be authenticated";
    }

    function takeTurn($con, $nextTurnNumber, $cellID, $squareID, $gameID, $nextSquare, $playerID, $opponentID, $tookSquare, $wonGame, &$retObj) {
        $nextTurnNumber = filter_var($nextTurnNumber, FILTER_SANITIZE_STRING);
        $cellID = filter_var($cellID, FILTER_SANITIZE_STRING);
        $squareID = filter_var($squareID, FILTER_SANITIZE_STRING);
        $gameID = filter_var($gameID, FILTER_SANITIZE_STRING);
        $nextSquare = filter_var($nextSquare, FILTER_SANITIZE_STRING);
        $playerID = filter_var($playerID, FILTER_SANITIZE_STRING);
        $opponentID = filter_var($opponentID, FILTER_SANITIZE_STRING);

        $query = "UPDATE Cell SET Owner = $playerID WHERE ID = $cellID ";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }

        if($tookSquare) {
            $query = "UPDATE Square SET Owner = $playerID WHERE ID = $squareID ";
            $result = mysqli_query($con, $query);
            $err = mysqli_error($con);
            if(strlen($err) > 0) {
                $retObj->ERROR = $err;
                return;
            }
        }
        $query = "UPDATE Game SET TurnNumber = $nextTurnNumber, PlayerTurn = $opponentID, NextSquare = $nextSquare" . ($wonGame ? ", Winner = $playerID" : "") . " WHERE ID = $gameID";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        $retObj->DATA = "success";
    }

    function fetchGames($conn, $userID, $previousGames) {
        // TODO: TEST FINISH
        $userID = filter_var($userID, FILTER_SANITIZE_INT);
        $query = "SELECT G.ID, G.Player1, G.Player2, A.Username AS Opposer, G.Winner, G.PlayerTurn FROM Game G LEFT JOIN Account A ON (A.ID <> $userID AND A.ID = Player2) OR (A.ID <> $userID AND A.ID = Player1) WHERE (G.Player1 = $userID OR G.Player2 = $userID) " . ($previousGames ? "" : " AND G.Winner IS NULL");

    }

    function getTurns($conn, $gameID, $userID, &$retObj) {
        // TODO TEST FINISH
        $gameID = filter_var($gameID, FILTER_SANITIZE_INT);
        $userID = filter_var($userID, FILTER_SANITIZE_INT);
        $query = "SELECT COUNT(*) FROM Game WHERE ID = $gameID AND $userID = PlayerTurn";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        //$retObj->DATA = $
    }
?>
<?php
    // Creates all entries for the game within the database.
    function createGame($con, $creatorID, $challengedName, &$retObj) {
        $creatorID = filter_var($creatorID, FILTER_SANITIZE_STRING);
        $challengedName = filter_var($challengedName, FILTER_SANITIZE_STRING);
        $challengedID = 0;
        $query = "SELECT ID FROM Account WHERE Username = '$challengedName'";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }

        if($row = mysqli_fetch_row($result)){
            $challengedID = $row[0];
        } else {
            $retObj->ERROR = "Not found";
            return;
        }
        if($challengedID == $creatorID) {
            $retObj->ERROR = -2;
            return;
        }

        $query = "INSERT INTO Game (Player1, Player2, PlayerTurn, TurnNumber, NextSquare, LastUpdate) VALUES ($creatorID, $challengedID, $creatorID, 0, -1, now());";
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

    // Loads the game from the database.
    function loadGame($con, $gameID, &$retObj) {
        $gameID = filter_var($gameID, FILTER_SANITIZE_STRING);
        $query = "SELECT G.ID, A.ID AS P1ID, A.Username AS P1Username, A2.ID AS P2ID, A2.Username AS P2Username, G.TurnNumber, G.NextSquare, G.Winner FROM Game G LEFT JOIN Account A ON A.ID = G.Player1 LEFT JOIN Account A2 ON A2.ID = G.Player2 WHERE $gameID = G.ID";
        $result = mysqli_query($con, $query);        
        $err = mysqli_error($con);
        if (strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($row = mysqli_fetch_assoc($result)) {
            $player1Object = (object)[
                'ID' => $row['P1ID'],
                'Logo' => 'X',
                'Username' => $row['P1Username']
            ];
    
            $player2Object = (object)[
                'ID' => $row['P2ID'],
                'Logo' => 'O',
                'Username' => $row['P2Username']
            ];
    
            $retObj->DATA = (object) [
                'ID' => $gameID,
                'Player1' => $player1Object,
                'Player2' => $player2Object,
                'TurnNumber' => $row['TurnNumber'],
                'NextSquare' => $row['NextSquare'],
                'Squares' => array(),
                'Winner' => $row['Winner'],
            ];
    
            $query = "SELECT ID, LocalOrder, Owner FROM Square WHERE GameID = $gameID ORDER BY LocalOrder";
            $result = mysqli_query($con, $query);   
            $err = mysqli_error($con);
            if (strlen($err) > 0) {
                $retObj->ERROR = $err;
                return;
            }

            while($row2 = mysqli_fetch_assoc($result)) {
                $squareID = $row2['ID'];
                $squareObject = (object)[
                    'ID' => $squareID,
                    'GameID' => $gameID,
                    'LocalOrder' => $row2['LocalOrder'],
                    'Owner' => $row2['Owner'],
                    'Cells' => array()
                ];
                $query = "SELECT ID, LocalOrder, Owner FROM Cell WHERE SquareID = $squareID ORDER BY LocalOrder";
                $result2 = mysqli_query($con, $query);   
                $err = mysqli_error($con);
                if (strlen($err) > 0) {
                    $retObj->ERROR = $err;
                    return;
                }

                while($row3 = mysqli_fetch_assoc($result2)) {
                    $squareID = $row3['ID'];
                    $cellObject = (object)[
                        'ID' => $squareID,
                        'SquareID' => $squareID,
                        'GameID' => $gameID,
                        'LocalOrder' => $row3['LocalOrder'],
                        'Owner' => $row3['Owner'],
                    ];
                    array_push($squareObject->Cells, $cellObject);
                }
                array_push($retObj->DATA->Squares, $squareObject);
            }
        }
    }

    // Check the database to see if it is the user's turn in the current game
    function pollTurn($con, $gameID, $userID, &$retObj) {
        $gameID = filter_var($gameID, FILTER_SANITIZE_STRING);
        $query = "SELECT ID FROM Game WHERE ID = $gameID AND PlayerTurn = $userID";
        $result = mysqli_query($con, $query);        
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($row = mysqli_fetch_row($result)) {
            $retObj->DATA = "turn";
            return;
        }
        $retObj->DATA = "wait";
    }

    // Create a new Account
    function createUser($con, $username, $password, &$retObj) {  
        $password = filter_var($password, FILTER_SANITIZE_STRING);
        $username = filter_var($username, FILTER_SANITIZE_STRING);
        $query = "SELECT * FROM Account WHERE Username = '$username'";
        $result = mysqli_query($con, $query);

        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($result->num_rows > 0){
            $retObj->ERROR = "username";
            return;
        }

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

    // Check to see if the user has entered in the correct credentials.
    function authenticateUser($con, $username, $password, &$retObj) { 
        $password = filter_var($password, FILTER_SANITIZE_STRING);
        $username = filter_var($username, FILTER_SANITIZE_STRING);
        $query = "SELECT ID, PASSWORD FROM Account WHERE Username = '$username'";
        $result = mysqli_query($con, $query);

        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        if($row = mysqli_fetch_row($result)){
            if(password_verify($password, $row[1])) {
                $id = $row[0];
                $retObj->DATA = $id;
                return;
            }
        }
        $retObj->ERROR = "Username/Password could not be authenticated";
    }

    // Update the database to match with a turn that a user made locally.
    function takeTurn($con, $nextTurnNumber, $cellID, $squareID, $gameID, $nextSquare, $playerID, $opponentID, $tookSquare, $wonGame, &$retObj) {
        $nextTurnNumber = filter_var($nextTurnNumber, FILTER_SANITIZE_STRING);
        $cellID = filter_var($cellID, FILTER_SANITIZE_STRING);
        $squareID = filter_var($squareID, FILTER_SANITIZE_STRING);
        $gameID = filter_var($gameID, FILTER_SANITIZE_STRING);
        $nextSquare = filter_var($nextSquare, FILTER_SANITIZE_STRING);
        $playerID = filter_var($playerID, FILTER_SANITIZE_STRING);
        $opponentID = filter_var($opponentID, FILTER_SANITIZE_STRING);
        $query = "UPDATE Cell SET Owner = $playerID, TurnNumber = $nextTurnNumber WHERE ID = $cellID ";
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
        $query = "UPDATE Game SET TurnNumber = $nextTurnNumber, PlayerTurn = $opponentID, NextSquare = $nextSquare, LastUpdate = now()" . ($wonGame ? ", Winner = $playerID" : "") . " WHERE ID = $gameID";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        $retObj->DATA = "success";
    }

    // Retrieve a list games for a user.
    function fetchGames($con, $userID, &$retObj) {
        $userID = filter_var($userID, FILTER_SANITIZE_STRING);
        $query = "SELECT G.ID, G.Player1, G.Player2, A.Username AS Opposer, G.Winner, G.PlayerTurn FROM Game G LEFT JOIN Account A ON (A.ID <> $userID AND A.ID = Player2) OR (A.ID <> $userID AND A.ID = Player1) WHERE (G.Player1 = $userID OR G.Player2 = $userID) ORDER BY LastUpdate DESC";
        $result = mysqli_query($con, $query);
        $err = mysqli_error($con);
        if(strlen($err) > 0) {
            $retObj->ERROR = $err;
            return;
        }
        $retArray = [];
        while($row = mysqli_fetch_assoc($result)){
            $obj = (object)[
                'ID' => $row['ID'],
                'Player1' => $row['Player1'],
                'Player2' => $row['Player2'],
                'Opposer' => $row['Opposer'],
                'Winner' => $row['Winner'],
                'PlayerTurn' => $row['PlayerTurn']
            ];
            array_push($retArray, $obj);
        }
        $retObj->DATA = $retArray;
        return;
    }
?>
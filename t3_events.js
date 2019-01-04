var events = {
    onButtonSelect: function(e) {
        switch(e.id) {
            case 'login':
                t3.hideGroups();
                document.getElementById("loginMenu").style.display = "block";
                break;
            case 'create': 
                t3.hideGroups();
                document.getElementById("createMenu").style.display = "block";
                break;
            case 'local':
                t3.initializeUser();
                t3.initializeLocalGame();
                break;  
            case 'createConfirm':
                this.createUser();
                break;
            case 'loginConfirm':
                this.loginUser();
                break;
            case 'randomChallengeConfirm':
                break;
            case 'challengeConfirm':
                this.challenge();
                break;

            default: 
                console.log("ERROR: button does not have a handler.");
                break;
        }

    },

    onCellSelect: function(e, game) {
        //TODO do not continue if not your turn, or processing turn


        var cellIndex = parseInt(e.dataset.cellOrder);
        var squareIndex = parseInt(e.dataset.squareOrder);
        var player = game.getCurrentPlayer();

        // Update DB With player choice, game's turn ++,
        var square = game.squares[squareIndex];
        var cell = square.cells[cellIndex];
        cell.owner = player.id;
        game.turn++;
        game.nextSquare = game.squares[cellIndex].owner == undefined ? cellIndex : -1;

        // Check if this move won the square for the player
        var wonSquare = false;
        var wonGame = false;

        var colCheck = cellIndex % 3;
        var rowCheck = Math.floor(cellIndex / 3) * 3;
        if((square.cells[colCheck].owner == player && square.cells[colCheck + 3].owner == player && square.cells[colCheck + 6].owner == player) ||
            (square.cells[rowCheck].owner == player && square.cells[rowCheck + 1].owner == player && square.cells[rowCheck + 2].owner == player) ||
            (square.cells[0].owner == player && square.cells[4].owner == player && square.cells[8].owner == player) ||
            (square.cells[2].owner == player && square.cells[4].owner == player && square.cells[6].owner == player)) {
                wonSquare = true;
                square.owner = player.id;
        }
        //square level
        colCheck = squareIndex % 3;
        rowCheck = Math.floor(squareIndex / 3) * 3;
        if(wonSquare && 
            (game.squares[colCheck].owner == player && game.squares[colCheck + 3].owner == player && game.squares[colCheck + 6].owner == player) ||
            (game.squares[rowCheck].owner == player && game.squares[rowCheck + 1].owner == player && game.squares[rowCheck + 2].owner == player) ||
            (game.squares[0].owner == player && game.squares[4].owner == player && game.squares[8].owner == player) ||
            (game.squares[2].owner == player && game.squares[4].owner == player && game.squares[6].owner == player)) {
                wonGame = true;
            game.winner = player;
        }
        var params = [
            "NEXT_TURN", game.turn, 
            "CELL_ID", cell.id, 
            "SQUARE_ID", square.id, 
            "GAME_ID", game.id, 
            "NEXT_SQUARE", game.nextSquare, 
            "PLAYER_ID", t3.User.id, 
            "OPPONENT_ID", game.getNonuserPlayer().id, 
            "TOOK_SQUARE", wonSquare, 
            "WON_GAME", wonGame
        ];
        t3.callServer("TAKE_TURN", function(data) {
            console.log(data);
            // start polling
  
        }, params);
        t3.buildBoard();
    },

    createUser: function() {
        var username = document.getElementById("createUsername").value;
        var password = document.getElementById("createPassword").value;
        t3.callServer("CREATE_USER", function(data) {
            data = JSON.parse(data);
            if(data.ERROR != null) {
                if(data.ERROR == "username") {
                    document.getElementById("usernameUsedErrorText").style.display = "block";
                }
            } else {
                document.getElementById("usernameUsedErrorText").style.display = "none";
                var id = data.DATA;
                var user = new component.Account(id, username);
                t3.User = user;
                t3.hideGroups();
                document.getElementById("challengeMenu").style.display = "block";
            }
        }, ["USERNAME", username, "PASSWORD", password]);
    },

    loginUser: function() {
        var username = document.getElementById("loginUsername").value;
        var password = document.getElementById("loginPassword").value;
        t3.callServer("AUTHENTICATE_USER", function(data) {
            data = JSON.parse(data);
            if(data.ERROR != null) {
                if(data.ERROR == "Username/Password could not be authenticated") {
                    document.getElementById("authenticationCredsErrorText").style.display = "block";
                }
            } else {
                document.getElementById("authenticationCredsErrorText").style.display = "none";
                var id = data.DATA;
                var user = new component.Account(id, username);
                t3.User = user;

                // Display processing menu While loading games
                // Display Challenge menu
                t3.hideGroups();
                document.getElementById("challengeMenu").style.display = "block";
                t3.fetchGames();
            }
        }, ["USERNAME", username, "PASSWORD", password]);
    },

    challenge: function() {
        var user = document.getElementById("challengeUsername").value;
        t3.callServer("CREATE_GAME", function(data) {
            data = JSON.parse(data);
            t3.loadGame(data.DATA);
        }, ["CREATOR_ID", t3.User.id, "CHALLENGED_NAME", user]);
    },

    onGameSelect: function(e) {
        var id = e.dataset.game;
        console.log(id);
        t3.callServer("LOAD_GAME", function(data) {
            console.log(data);
        }, ["GAME_ID", id]);
    }
};
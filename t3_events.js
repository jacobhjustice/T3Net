var events = {
    /**
     * Determine the desired function when clicking an HTML element with class "button"
     * 
     * @param {HTML element} e      The selected element.
     */
    onButtonSelect: function(e) {
        switch(e.id) {
            case 'login':
                this.loginUser();
                break;
            case 'create': 
                this.createUser();
                break;
            case 'local':
                t3.initializeLocalGame();
                document.getElementById("backButton").dataset.back = "entry";
                document.getElementById("backButton").style.display = "block";
                break;  
            case 'help':
                t3.hideGroups();
                document.getElementById("backButton").style.display = "block";
                document.getElementById("backButton").dataset.back = "entry";
                document.getElementById("helpMenu").style.display = "block";
                break;
            case 'challengeConfirm':
                this.challenge();
                break;

            default: 
                console.log("ERROR: button does not have a handler.");
                break;
        }

    },

    /**
     * Process and save the effects of making a move when a cell is selected in game.
     * 
     * @param {HTML element} e      The selected element.
     */
    onCellSelect: function(e) {
        var game = t3.Game;
        var cellIndex = parseInt(e.dataset.cellOrder);
        var squareIndex = parseInt(e.dataset.squareOrder);
        var player = game.getCurrentPlayer();
        if(player.id != t3.User.id) {
            console.log("NOT YoUR TURN");
            return;
        }

        var square = game.squares[squareIndex];
        var cell = square.cells[cellIndex];
        cell.owner = player.id;
        game.turn++;
        game.nextSquare = game.squares[cellIndex].owner == undefined ? cellIndex : -1;

        var wonSquare = false;
        var wonGame = false;
        var pid = player.id;
        var colCheck = cellIndex % 3;
        var rowCheck = Math.floor(cellIndex / 3) * 3;
        if((square.cells[colCheck].owner == pid && square.cells[colCheck + 3].owner == pid && square.cells[colCheck + 6].owner == pid) ||
            (square.cells[rowCheck].owner == pid && square.cells[rowCheck + 1].owner == pid && square.cells[rowCheck + 2].owner == pid) ||
            (square.cells[0].owner == pid && square.cells[4].owner == pid && square.cells[8].owner == pid) ||
            (square.cells[2].owner == pid && square.cells[4].owner == pid && square.cells[6].owner == pid)) {
                wonSquare = true;
                square.owner = pid;
        }

        colCheck = squareIndex % 3;
        rowCheck = Math.floor(squareIndex / 3) * 3;
        if(wonSquare && 
            (game.squares[colCheck].owner == pid && game.squares[colCheck + 3].owner == pid && game.squares[colCheck + 6].owner == pid) ||
            (game.squares[rowCheck].owner == pid && game.squares[rowCheck + 1].owner == pid && game.squares[rowCheck + 2].owner == pid) ||
            (game.squares[0].owner == pid && game.squares[4].owner == pid && game.squares[8].owner == pid) ||
            (game.squares[2].owner == pid && game.squares[4].owner == pid && game.squares[6].owner == pid)) {
                wonGame = true;
            game.winner = pid;
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
        }, params);
        t3.buildBoard();
    },

    /**
     * Create a new account.
     */
    createUser: function() {
        var elements = document.getElementsByClassName("errorText");
        for(var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
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
                t3.fetchGames();
            }
        }, ["USERNAME", username, "PASSWORD", password]);
    },

    /**
     * Attempt to authenticate an account.
     */
    loginUser: function() {
        var elements = document.getElementsByClassName("errorText");
        for(var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
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
                t3.hideGroups();
                document.getElementById("challengeMenu").style.display = "block";
                t3.fetchGames();
            }
        }, ["USERNAME", username, "PASSWORD", password]);
    },

    /**
     * Attempt to create a new game with a player.
     */
    challenge: function() {
        var user = document.getElementById("challengeUsername").value;
        document.getElementById("challengeError").style.display = "none";
        t3.callServer("CREATE_GAME", function(data) {
            data = JSON.parse(data);
            if(data.ERROR != null) {
                if(data.ERROR == "Not found") {
                    document.getElementById("challengeError").style.display = "block";
                }
            } else {
                t3.loadGame(data.DATA);
            }
        }, ["CREATOR_ID", t3.User.id, "CHALLENGED_NAME", user]);
    },

    /**
     * Load a game that was selected in the game list.
     * 
     * @param {HTML element} e      The selected element.
     */
    onGameSelect: function(e) {
        var id = e.dataset.game;
        t3.callServer("LOAD_GAME", function(data) {
            data = JSON.parse(data);
            if(data.ERROR) {
                console.log(error);
            } else {
                t3.loadGame(data.DATA);
            }
        }, ["GAME_ID", id]);
    },

    /**
     * Navigate back to the previous page.
     * 
     * @param {HTML element} e      The selected element.
     */
    onClickBack: function(e) {
        t3.Game = undefined;
        t3.hideGroups();
        var key = e.dataset.back;
        if(key == "menu") {
            document.getElementById("challengeMenu").style.display = "block";
            t3.fetchGames();
        } else if(key == "entry") {
            document.getElementById("entryOptions").style.display = "block";
        } else if(key == "board") {
            document.getElementById("content").style.display = "block";
            document.getElementById("backButton").style.display = "block";
            document.getElementById("backButton").dataset.back = "menu";
            t3.buildBoard()
        }
        
    },

    /**
     * Logout from the active account and return to the entry page.
     */
    onClickLogout: function() {
        t3.User = undefined;
        t3.hideGroups();
        document.getElementById("entryOptions").style.display = "block";
        t3.initializeEntry();
    }
};
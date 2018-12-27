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
                t3.initializeGame();
                break;  
            default: 
                console.log("ERROR: button does not have a handler.");
                break;
        }

    },

    onCellSelect: function(e, game) {
        var cellIndex = parseInt(e.dataset.cellOrder);
        var squareIndex = parseInt(e.dataset.squareOrder);
        var player = game.getCurrentPlayer();

        // Update DB With player choice, game's turn ++,
        var square = game.squares[squareIndex];
        square.cells[cellIndex].owner = player;
        game.turn++;
        game.nextSquare = game.squares[cellIndex].owner == undefined ? cellIndex : -1;
        //check for victory, rewrite?
        // Check if this move won the square for the player
        var wonSquare = false;
        var colCheck = cellIndex % 3;
        var rowCheck = Math.floor(cellIndex / 3) * 3;
        if((square.cells[colCheck].owner == player && square.cells[colCheck + 3].owner == player && square.cells[colCheck + 6].owner == player) ||
            (square.cells[rowCheck].owner == player && square.cells[rowCheck + 1].owner == player && square.cells[rowCheck + 2].owner == player) ||
            (square.cells[0].owner == player && square.cells[4].owner == player && square.cells[8].owner == player) ||
            (square.cells[2].owner == player && square.cells[4].owner == player && square.cells[6].owner == player)) {
                wonSquare = true;
                square.owner = player;
        }
        //square level
        colCheck = squareIndex % 3;
        rowCheck = Math.floor(squareIndex / 3) * 3;
        if(wonSquare && 
            (game.squares[colCheck].owner == player && game.squares[colCheck + 3].owner == player && game.squares[colCheck + 6].owner == player) ||
            (game.squares[rowCheck].owner == player && game.squares[rowCheck + 1].owner == player && game.squares[rowCheck + 2].owner == player) ||
            (game.squares[0].owner == player && game.squares[4].owner == player && game.squares[8].owner == player) ||
            (game.squares[2].owner == player && game.squares[4].owner == player && game.squares[6].owner == player)) {
            game.winner = player;
        }

        t3.buildBoard();
    },

    createUser: function() {
        t3.callServer("CREATE_USER", function(data) {
            console.log(data);
        }, ["USERNAME", "TEST1", "PASSWORD", "PASS"]);
    }
};
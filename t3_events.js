var events = {
    onCellSelect: function(e, game) {
        var cell = parseInt(e.dataset.cellOrder);
        var square = parseInt(e.dataset.squareOrder);
        var player = game.getCurrentPlayer();

        // Update DB With player choice, game's turn ++,
        var square = game.squares[square];
        square.cells[cell].owner = player;
        game.turn++;
        game.nextSquare = game.squares[cell].owner == undefined ? cell : -1;
        //check for victory, rewrite?
        if((square.cells[0].owner == square.cells[3].owner && square.cells[3].owner == square.cells[6].owner && square.cells[6].owner != undefined) ||
            (square.cells[1].owner == square.cells[4].owner && square.cells[4].owner == square.cells[7].owner && square.cells[7].owner != undefined) ||
            (square.cells[2].owner == square.cells[5].owner && square.cells[5].owner == square.cells[8].owner && square.cells[8].owner != undefined) ||
            (square.cells[0].owner == square.cells[1].owner && square.cells[1].owner == square.cells[2].owner && square.cells[2].owner != undefined) ||
            (square.cells[3].owner == square.cells[4].owner && square.cells[4].owner == square.cells[5].owner && square.cells[5].owner != undefined) ||
            (square.cells[6].owner == square.cells[7].owner && square.cells[7].owner == square.cells[8].owner && square.cells[8].owner != undefined) ||
            (square.cells[0].owner == square.cells[4].owner && square.cells[4].owner == square.cells[8].owner && square.cells[8].owner != undefined) ||
            (square.cells[2].owner == square.cells[4].owner && square.cells[4].owner == square.cells[6].owner && square.cells[6].owner != undefined)) {
                square.owner = player;
        }

        t3.buildBoard();
    }
};
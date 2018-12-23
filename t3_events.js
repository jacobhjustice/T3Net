var events = {
    onCellSelect: function(e, game) {
        var cell = parseInt(e.dataset.cellOrder);
        var square = parseInt(e.dataset.squareOrder);
        var player = game.getCurrentPlayer();

        // Update DB With player choice, game's turn ++,
        game.squares[square].cells[cell].owner = player;
        e.className += ' taken';
        e.onclick = undefined;
        e.dataset.owner = player.id;
        e.innerHTML = player.logo;
        game.turn++;
    }
};
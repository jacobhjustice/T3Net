var component = {
    Game: function(ID, Player1, Player2, Turn, Squares, NextSquare) {
        this.id = ID;
        this.player1 = Player1;
        this.player2 = Player2;
        this.turn = Turn;
        this.squares = Squares != undefined ? Squares : [];
        this.nextSquare = NextSquare;
    },

    User: function(ID, Username) {
        this.id = ID;
        this.username = Username;
        // Future fields???
    },

    Square: function(ID, GameID, Order, Owner, Cells) {
        this.id = ID;
        this.gameID = GameID;
        this.order = Order;
        this.owner = Owner;
        this.cells = Cells != undefined ? Cells : []
    },

    Cell: function(ID, SquareID, Order, Owner) {
        this.id = ID;
        this.squareID = SquareID;
        this.order = Order;
        this.owner = Owner;
    },
}
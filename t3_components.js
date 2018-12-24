var component = {
    Game: function(ID, Player1, Player2, Turn, Squares, NextSquare, Winner) {
        this.id = ID;
        this.player1 = Player1;
        this.player2 = Player2;
        this.turn = Turn;
        this.squares = Squares != undefined ? Squares : [];
        this.nextSquare = NextSquare;
        this.winner = Winner;
    },
    
    BindGameFunctions: function() {
        component.Game.prototype.getCurrentPlayer = function() {
            return this.turn % 2 == 0 ? this.player1 : this.player2;
        }
    },

    User: function(ID, Username, Logo) {
        this.id = ID;
        this.username = Username;
        this.logo = Logo;
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
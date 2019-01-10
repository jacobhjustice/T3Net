var component = {
    Game: function(ID, Player1, Player2, Turn, Squares, NextSquare, Winner) {
        this.id = ID;
        this.player1 = Player1;
        this.player2 = Player2;
        this.turn = Turn;
        this.squares = Squares != undefined ? Squares : [];
        this.nextSquare = NextSquare;
        this.winner = Winner;
        this.isOnline = true;
    },
    
    /**
     * Bind member functions for Game
     */
    BindGameFunctions: function() {
        /**
         * Determine and retrieve the current player based on the turn.
         */
        component.Game.prototype.getCurrentPlayer = function() {
            return this.turn % 2 == 0 ? this.player1 : this.player2;
        };

        /**
         * Determine and retrieve the player which is not the current user.
         */
        component.Game.prototype.getNonuserPlayer = function() {
            if(this.player1.id == t3.User.id) {
                return this.player2;
            }
            return this.player1;
        };

        /**
         * Determine and retrieve the current player based on a given ID
         * 
         * @param {int} id      The numeric identifier for the desired player.
         */
        component.Game.prototype.getPlayerByID = function(id) {
            if(this.player1.id == id) {
                return this.player1;
            }
            return this.player2;
        }
    },

    Account: function(ID, Username, Logo) {
        this.id = ID;
        this.username = Username;
        this.logo = Logo;
    },

    Square: function(ID, GameID, LocalOrder, Owner, Cells) {
        this.id = ID;
        this.gameID = GameID;
        this.order = LocalOrder;
        this.owner = Owner;
        this.cells = Cells != undefined ? Cells : []
    },

    Cell: function(ID, SquareID, GameID, LocalOrder, Owner) {
        this.id = ID;
        this.squareID = SquareID;
        this.gameID = GameID;
        this.order = LocalOrder;
        this.owner = Owner;
    },
}
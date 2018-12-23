var t3 = {
    Game: undefined,
    User: undefined,
    // Create new user
    initializeUser: function() {
        var name = "TEST";
        var nextID = 1;
        // Should create on backend and send results
        var user = new component.User(nextID, name, "X");
        this.User = user;
    },

    // Create data for a new game, send to server, set class variables call render
    initializeGame: function() {
        //Gather data for backend, create, send back results, call load part 2


        // Create on backend, return results
        var game_id = 0;
        var dummyUser = new component.User(2, "TEST2", "O");
        this.Game = new component.Game(game_id, t3.User, dummyUser, 0);
        for(var i = 0; i < 9; i++) {
            var square_id = i;
            var square = new component.Square(square_id, game_id, i, 0);
            this.Game.squares.push(square);
            for(var o = 0; o < 9; o++) {
                var cell_id = o;
                var cell = new component.Cell(cell_id, square_id, o, 0);
                this.Game.squares[i].cells.push(cell);
            }
        }
        component.BindGameFunctions();
        this.buildBoard();
    },

    // Retrieve data from server, call render
    loadGame: function() {

    },

    buildBoard: function() {
        var html = "<div id = 't3Table'>";
        for(var i = 0; i < 9; i++) {
            html += i % 3 == 0 ? "<div class = 'row'>" : "";
            html += "<div class = 'square' data-owner = '0' data-order = '" + i + "'><div class = 'innerTable'>"
            for(var o = 0; o < 9; o++) {
                html += o % 3 == 0 ? "<div class = 'row'>" : "";
                html += "<div class = 'cell' data-owner = '0' data-cell-order = '" + o + "'  data-square-order = '" + i + "' onclick = 'events.onCellSelect(this, t3.Game);'></div>";
                html += (o + 1) % 3 == 0 ? "</div>" : "";
            }
            html += "</div></div>"
            html += (i + 1) % 3 == 0 ? "</div>" : "";
        }
        html += "</div>";
        document.getElementById("content").innerHTML = html;
    },

};
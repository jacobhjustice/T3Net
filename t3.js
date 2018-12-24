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
        this.Game = new component.Game(game_id, t3.User, dummyUser, 0, [], -1);
        for(var i = 0; i < 9; i++) {
            var square_id = i;
            var square = new component.Square(square_id, game_id, i);
            this.Game.squares.push(square);
            for(var o = 0; o < 9; o++) {
                var cell_id = o;
                var cell = new component.Cell(cell_id, square_id, o);
                this.Game.squares[i].cells.push(cell);
            }
        }
        component.BindGameFunctions();
        this.buildBoard();
    },

    // Retrieve data from server, call render
    loadGame: function() {

    },

    // selectabeOrder indicates the square index for which selectable class should show up, -1 if any square is selectable
    buildBoard: function() {
        var html = "<div id = 't3Table'>";
        for(var i = 0; i < 9; i++) {
            html += i % 3 == 0 ? "<div class = 'row'>" : "";

            var squareClassList = "square ";
            var isSelectable = this.Game.nextSquare == -1 || i == this.Game.nextSquare;
            var square = this.Game.squares[i];

            // consider just having 2 cases for html += based on square.owner
            if(isSelectable) {
                squareClassList += "selectable ";
                if(this.Game.nextSquare > -1) {
                    squareClassList += "current ";
                }
            }
            if(square.owner != undefined) {
                squareClassList += "taken "
            }

            html += "<div class = '" + squareClassList +"' data-owner = '" + (square.owner != undefined ? square.owner.id : 0) + "' data-order = '" + i + "'><div class = 'innerTable'>"
            if(square.owner != undefined) {
                html += square.owner.logo;
            } else {
                for(var o = 0; o < 9; o++) {
                    var cell = square.cells[o];
                    html += o % 3 == 0 ? "<div class = 'row'>" : "";
                    html += "<div class = 'cell " + (cell.owner != undefined ? "taken" : "") + "' data-owner = '" + (cell.owner != undefined ? cell.owner.id : 0) + "' data-cell-order = '" + o + "'  data-square-order = '" + i + "'" + (isSelectable ? "onclick = 'events.onCellSelect(this, t3.Game);'" : "") + ">" + (cell.owner != undefined ? cell.owner.logo : "") + "</div>";
                    html += (o + 1) % 3 == 0 ? "</div>" : "";
                }
            }
            html += "</div></div>"
            html += (i + 1) % 3 == 0 ? "</div>" : "";
        }
        html += "</div>";
        document.getElementById("content").innerHTML = html;
    },

};
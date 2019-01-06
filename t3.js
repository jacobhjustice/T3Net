var t3 = {
    Game: undefined,
    User: undefined,
    CurrentGames: undefined,

    callServer: function(func, callback, paramArray) {

        http = new XMLHttpRequest();
    
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status < 500) {
                if (typeof callback == "function" && callback != undefined) {
                    callback(this.responseText);
                }
            }
        };
    
        var url = "server_requests.php?FUNCTION=" + func;
        if(paramArray != undefined) {
            for(var i = 0; i < paramArray.length - 1; i += 2) {
                url += "&" + paramArray[i] + "=" + paramArray [i+1];
            }
        }
    
        http.open("GET", url, true); 
        http.send();
    },

    fetchGames: function() {
        t3.callServer("FETCH_GAMES", function(data) {
            // TODO Empty view for no games or error
            data = JSON.parse(data);
            if(data.ERROR != null) {
                console.log(data.ERROR);
            } else {
                data = data.DATA;
                var html = "";
                for(var i = 0; i < data.length; i++) {
                    var isOver = data[i].Winner != null;
                    var isTurn = parseInt(data[i].PlayerTurn) == t3.User.id;
                    var isWinner = parseInt(data[i].Winner) == t3.User.id;
                    var opposer = data[i].Opposer;
                    var id = data[i].ID;
                    html += "<div onclick = 'events.onGameSelect(this)' data-game = '" + id + "' class = 'button gameOption "
                    if(isOver) {
                        html += "finished " 
                        if(isWinner) {
                            html += "winner' > Won Against " + opposer;
                        } else {
                            html += "loser' > Lost Against " + opposer;
                        }
                    } else {
                        html += "notFinished "
                        if(isTurn) {
                            html += "yourTurn' >Your Turn Against " + opposer;
                        } else {
                            html += "awaitingTurn' >Waiting for " + opposer;
                        }
                    }
                    html += "</div>"
                }
            }
            document.getElementById("gameList").innerHTML = html;
            document.getElementById("logoutButton").style.display = "block";
        }, ["USER_ID", t3.User.id]);
    },

    hideGroups: function() {
        var elements = document.getElementsByClassName("elementGroup");
        for(var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
    },

    initializeEntry: function() {
        this.hideGroups();
        component.BindGameFunctions();
        document.getElementById("entryOptions").style.display = "block";
    },

    // Create new user
    initializeUser: function() {
        var name = "Player 1";
        var nextID = 1;
        // Should create on backend and send results
        var user = new component.Account(nextID, name, "X");
        this.User = user;
    },

    initializeLocalGame: function() {
        var dummyUser = new component.Account(1, "Player 1", "X");
        var dummyUser2 = new component.Account(2, "Player 2", "O");
        this.Game = new component.Game(0, dummyUser, dummyUser2, 0, [], -1);
        this.Game.isOnline = false;
        for(var i = 0; i < 9; i++) {
            var square_id = i;
            var square = new component.Square(square_id, 0, i);
            this.Game.squares.push(square);
            for(var o = 0; o < 9; o++) {
                var cell_id = o;
                var cell = new component.Cell(cell_id, square_id, 0, o);
                this.Game.squares[i].cells.push(cell);
            }
        }
        this.hideGroups();
        document.getElementById("content").style.display = "block";
        this.buildBoard();
    },

    // Retrieve data from server, call render
    loadGame: function(data) {
        // Load game/player information from server data. If Player1 is Null, then assume the current user is player1
        var Player1;
        if(data.Player1 != null) {
            Player1 = new component.Account(data.Player1.ID, data.Player1.Username, data.Player1.Logo); 
        } else {
            this.User.logo = "X";
            Player1 = this.User;
        }
        var Player2 = new component.Account(data.Player2.ID, data.Player2.Username, data.Player2.Logo);
        this.Game = new component.Game(data.ID, Player1, Player2, data.TurnNumber, [], data.NextSquare, data.Winner);
        for(var i = 0; i < data.Squares.length; i++) {
            var dataSquare = data.Squares[i];
            var square = new component.Square(dataSquare.ID, dataSquare.GameID, dataSquare.LocalOrder, dataSquare.Owner, []);
            this.Game.squares.push(square);
            for(var o = 0; o < dataSquare.Cells.length; o++) {
                var dataCell = dataSquare.Cells[o];
                var cell = new component.Cell(dataCell.ID, dataCell.SquareID, dataCell.GameID, dataCell.LocalOrder, dataCell.Owner);
                square.cells.push(cell);
            }
        }
        this.hideGroups();
        document.getElementById("content").style.display = "block";
        document.getElementById("backButton").style.display = "block";
        this.buildBoard();
    },

    // selectabeOrder indicates the square index for which selectable class should show up, -1 if any square is selectable
    buildBoard: function() {
        var isOver = this.Game.winner != undefined;
        var isTurn = !this.Game.isOnline || this.Game.getCurrentPlayer().id == this.User.id;
        var html = "";
        if(!isOver) {
            if(this.Game.isOnline) {
                if(isTurn) {
                    html += "<h3 id = 'header'>It's your turn! Select any of the highlighted cells to move!</h3>";
                } else {
                    t3.pollForGameUpdate();
                    html += "<h3 id = 'header'>Waiting on " + this.Game.getCurrentPlayer().username + " to move.</h3>";
                }
            } else {
                html += "<h3 id = 'header'>" + this.Game.getCurrentPlayer().username + "'s Turn! Select any of the highlighted cells to move!</h3>";
            }
        } else {
            html += "<h3 id = 'header'>That's game! The winner is " + this.Game.getPlayerByID(this.Game.winner).username + "!</h3>"
        }
        html += "<div id = 't3Table'>";
        
        for(var i = 0; i < 9; i++) {
            html += i % 3 == 0 ? "<div class = 'row'>" : "";

            var squareClassList = "square ";
            var isSelectable = (this.Game.nextSquare == -1 || i == this.Game.nextSquare) && !isOver && isTurn;
            var square = this.Game.squares[i];

            // consider just having 2 cases for html += based on square.owner
            // may still want to show the underlying cells even on square own?
            if(isSelectable) {
                squareClassList += "selectable current ";
                // if(this.Game.nextSquare > -1) {
                //     squareClassList += "current ";
                // }
            }
            if(square.owner != undefined) {
                squareClassList += "taken "
            }

            html += "<div class = '" + squareClassList +"' data-owner = '" + (square.owner != undefined ? square.owner : 0) + "' data-order = '" + i + "'><div class = 'innerTable'>"
            if(square.owner != undefined) {
                html += t3.Game.getPlayerByID(square.owner).logo;
            } else {
                for(var o = 0; o < 9; o++) {
                    var cell = square.cells[o];
                    html += o % 3 == 0 ? "<div class = 'row'>" : "";
                    html += "<div class = 'cell " + (cell.owner != undefined ? "taken" : "") + "' data-owner = '" + (cell.owner != undefined ? cell.owner : 0) + "' data-cell-order = '" + o + "'  data-square-order = '" + i + "'" + (isSelectable ? "onclick = 'events.onCellSelect(this, t3.Game);'" : "") + ">" + (cell.owner != undefined ? t3.Game.getPlayerByID(cell.owner).logo : "") + "</div>";
                    html += (o + 1) % 3 == 0 ? "</div>" : "";
                }
            }
            html += "</div></div>"
            html += (i + 1) % 3 == 0 ? "</div>" : "";
        }
        html += "</div>";
        html += "<div id = 'key'><b>X:</b> " + t3.Game.player1.username + "<br /><b>O:</b> " + t3.Game.player2.username + " </div>"
        document.getElementById("content").innerHTML = html;
    },

    pollForGameUpdate: function() {
        if(t3.Game != undefined) {
            t3.callServer("POLL_TURN", function(data) {
                data = JSON.parse(data);
                if(data.ERROR != null) {

                } else {
                    if(data.DATA == "turn") {
                        // TODO: Fix to happen within server function
                        t3.callServer("LOAD_GAME", function(data) {
                            data = JSON.parse(data);
                            if(data.ERROR) {
                                console.log(error);
                            } else {
                                t3.loadGame(data.DATA);
                            }
                        }, ["GAME_ID", t3.Game.id]);
                    } else if(data.DATA == "wait") {
                        // Wait 5 seconds and try again
                        setTimeout(t3.pollForGameUpdate, 5000);
                    }
                }
            }, ["USER_ID", t3.User.id, "GAME_ID", t3.Game.id]);
        }
    }
};
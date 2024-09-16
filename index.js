const gameBoard = (function() {
    let board = Array(3).fill().map(() => Array(3).fill(""));

    const cell = (x, y) => board[x]?.[y] ?? "";
    const currentBoard = () => board;
    const clear = () => board = Array(3).fill().map(() => Array(3).fill(""));

    const add = (x, y) => {
        if (board[x] && board[x][y] === "") {
            board[x][y] = player.getActivePlayer().symbol;
        }
    };

    return { cell, currentBoard, add, clear };
})();

const player = (function() {
    function Player(name, symbol, score) {
        this.name = name;
        this.symbol = symbol;
        this.score = score;
    }

    let playerOne = new Player("Player 1", "X", 0);
    let playerTwo = new Player("Player 2", "O", 0);
    let activePlayer = playerOne;

    const getActivePlayer = () => activePlayer;
    const switchActivePlayer = () => activePlayer = (activePlayer === playerOne) ? playerTwo : playerOne;
    const getScores = () => [playerOne.score, playerTwo.score];
    const getName = (person) => person === "playerOne" ? playerOne.name : playerTwo.name;
    const setName = (player, newName) => {
        if (player === "playerOne") playerOne.name = newName;
        if (player === "playerTwo") playerTwo.name = newName;
    };

    return { getActivePlayer, switchActivePlayer, getScores, getName, setName };
})();

const gameController = (function() {
    function makeMove(x, y) {
        if (gameBoard.cell(x, y) !== "") return;
        gameBoard.add(x, y);
        const winHighlight = _checkForWin();
        if (winHighlight) {
            displayController.displayWin(winHighlight);
            player.getActivePlayer().score++;
        } else if (_checkForTie()) {
            displayController.displayTie();
        } else {
            player.switchActivePlayer();
        }
    }

    function _checkForWin() {
        const board = gameBoard.currentBoard();
        for (let i = 0; i < 3; i++) {
            if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][2] !== "") {
                return [[i, 0], [i, 1], [i, 2]];
            }
            if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[2][i] !== "") {
                return [[0, i], [1, i], [2, i]];
            }
        }
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[1][1] !== "") {
            return [[0, 0], [1, 1], [2, 2]];
        }
        if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[1][1] !== "") {
            return [[0, 2], [1, 1], [2, 0]];
        }
        return false;
    }

    function _checkForTie() {
        return gameBoard.currentBoard().flat().every(cell => cell !== "");
    }

    return { makeMove };
})();

const displayController = (function() {
    let board, status, cells, playerOneNameIn, playerTwoNameIn, resetBtn;
    let gameEndMsg = "";

    function start() {
        cacheDOM();
        bindEvents();
        update();
    }

    function cacheDOM() {
        board = document.querySelector(".game-board");
        status = document.querySelector(".status");
        cells = document.querySelectorAll('.game-cell');
        scoreOne = document.querySelector(".score-one");
        scoreTwo = document.querySelector(".score-two");
        playerOneNameIn = document.querySelector("#player-one-name");
        playerTwoNameIn = document.querySelector("#player-two-name");
        resetBtn = document.querySelector("#reset");
    }

    function updatePlayerOneName() {
        const newName = playerOneNameIn.value;
        if (newName) {
            player.setName("playerOne", newName);
            update();
        }
    }

    function updatePlayerTwoName() {
        const newName = playerTwoNameIn.value;
        if (newName) {
            player.setName("playerTwo", newName);
            update();
        }
    }

    function bindEvents() {
        board.addEventListener("click", move);
        playerOneNameIn.addEventListener("change", updatePlayerOneName);
        playerTwoNameIn.addEventListener("change", updatePlayerTwoName);
    }

    function move(e) {
        if (e.target.classList.contains("game-cell")) {
            const x = e.target.getAttribute("data-x");
            const y = e.target.getAttribute("data-y");
            gameController.makeMove(x, y);
            update();
        }
    }

    function update() {
        scoreOne.textContent = `${player.getName("playerOne")} (X): ${player.getScores()[0]}`;
        scoreTwo.textContent = `${player.getName("playerTwo")} (O): ${player.getScores()[1]}`;
        status.textContent = gameEndMsg || `It is ${player.getActivePlayer().name}'s turn to move.`;
        cells.forEach((cell, index) => {
            const x = Math.floor(index / 3);
            const y = index % 3;
            cell.innerHTML = gameBoard.cell(x, y);
        });
    }

    function displayWin(highlight) {
        board.removeEventListener("click", move);
        highlight.forEach(([x, y]) => {
            const index = x * 3 + y;
            cells.item(index).classList.add("win");
        });
        gameEndMsg = `${player.getActivePlayer().name} wins! Click on the reset button to restart.`;
        resetBtn.addEventListener("click", resetBoard);
    }

    function displayTie() {
        board.removeEventListener("click", move);
        gameEndMsg = `Tie! Click on the reset button to restart.`;
        resetBtn.addEventListener("click", resetBoard);
    }

    function resetBoard() {
        gameBoard.clear();
        gameEndMsg = "";
        cells.forEach(cell => cell.classList.remove("win"));
        update();
        bindEvents();
        board.removeEventListener("click", resetBoard);
    }

    return { start, displayTie, displayWin, update };
})();

displayController.start();

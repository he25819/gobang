/**
 * Created by xinweihe on 11/15/2017.
 */
var gameMode = 1;//1=single,2=2players
var gobangElement = document.getElementById('gobang');
var background = new Image();
var context = gobangElement.getContext('2d');
var nextPieceNum = 1;
var isOver = false;

var boardStatus = [];
var winMethods = [];
var winMethodsCount = 0;
var blackWinMethodPiecesCount = [];
var whiteWinMethodPiecesCount = [];

var single = Function;
var oneonone = Function;
var restart = Function;
var withdraw = Function;
var showLabel = Function;
var isShowLabel = false;
(function() {
    window.onload = function() {
        loadPicAndDraw();
        initArrays();

    };

    restart = function() {
        if (!confirm("是否重新开始")) {
            return;
        }
        context.clearRect(0, 0, 450, 450);
        loadPicAndDraw();
        resetVariable();
        resetElements();
    };
    withdraw = function() {
        //if (!confirm("是否悔棋")) {
        //    return;
        //}
        if (gameMode == 1 && nextPieceNum > 2) {
            withdrawByStep(2);
        } else if (gameMode == 2 && nextPieceNum > 1) {
            withdrawByStep(1);
        }
    };
    showLabel = function() {
        var pieces = document.getElementsByClassName("onePiece");
        var i;
        if (isShowLabel) {
            for (i = pieces.length - 1; i >= 0; i--) {
                pieces[i].classList.add("hidden");
            }
            isShowLabel = false;
        } else {
            for (i = pieces.length - 1; i >= 0; i--) {
                pieces[i].classList.remove("hidden");
            }
            isShowLabel = true;
        }

    };
    gobangElement.onclick = function(e) {
        if (isOver) {
            return;
        }
        var x = e.offsetX;
        var y = e.offsetY;
        var i = Math.floor(x / 30);
        var j = Math.floor(y / 30);
        if (destination(x, y, 30 * i + 15, 30 * j + 15) > 14) {
            return;
        }
        if (!checkAvailablePosition(i, j)) {
            return;
        }
        putDownOnePiece(i, j, nextPieceNum % 2 == 1);
        if (isOver) {
            return;
        }
        //single game
        if (gameMode == 1) {
            computerOneStep();
        }
    };

    var withdrawByStep = function(n) {
        if (isOver) {
            isOver = false;
        }
        for (var i = 0; i < n; i++) {
            nextPieceNum--;
            undoDrawPieceByNum(nextPieceNum);
            undoBoardStatus(nextPieceNum);
        }
        //showBoardStatus();
        initWinMethodPiecesCount();
        undoWinMethodPiecesCount();
    };
    var undoDrawPieceByNum = function(n) {
        var node = document.getElementById("i" + n);
        node.remove();
    };

    var undoBoardStatus = function(n) {
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (boardStatus[i][j] == n) {
                    boardStatus[i][j] = 0;
                }
            }
        }
    };
    var undoWinMethodPiecesCount = function() {
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (boardStatus[i][j] != 0) {
                    updateWinMethodPiecesCount(i, j, boardStatus[i][j] % 2 == 1);
                }
            }
        }
    };

    var initArrays = function() {
        initBoardStatus();
        initWinMethods();
        initWinMethodPiecesCount();
    };

    var initWinMethods = function() {
        //init赢法数组
        for (var i = 0; i < 15; i++) {
            winMethods[i] = [];
            for (var j = 0; j < 15; j++) {
                winMethods[i][j] = [];
            }
        }
        for (i = 0; i < 15; i++) {
            for (j = 0; j < 11; j++) {
                for (var times = 0; times < 5; times++) {
                    winMethods[i][j + times][winMethodsCount] = true;
                }
                winMethodsCount++;
            }
        }
        for (j = 0; j < 15; j++) {
            for (i = 0; i < 11; i++) {
                for (times = 0; times < 5; times++) {
                    winMethods[i + times][j][winMethodsCount] = true;
                }
                winMethodsCount++;
            }
        }
        for (i = 0; i < 11; i++) {
            for (j = 0; j < 11; j++) {
                for (times = 0; times < 5; times++) {
                    winMethods[i + times][j + times][winMethodsCount] = true;
                }
                winMethodsCount++;
            }
        }
        for (i = 0; i < 11; i++) {
            for (j = 4; j < 15; j++) {
                for (times = 0; times < 5; times++) {
                    winMethods[i + times][j - times][winMethodsCount] = true;
                }
                winMethodsCount++;
            }
        }
        //console.log(winMethodsCount);
        // 打印赢法数组
        //var temp = '';
        //for (;winMethodsCount >= 0; winMethodsCount--) {
        //    for (i = 0; i < 15; i++) {
        //        for (j = 0; j < 15; j++) {
        //            temp += wins[i][j][winMethodsCount] '=' : '-';
        //        }
        //        temp += '\n';
        //    }
        //    console.log(temp);
        //    temp = '';
        //}
    };
    var initBoardStatus = function() {
        for (var i = 0; i < 15; i++) {
            boardStatus[i] = [];
            for (var j = 0; j < 15; j++) {
                boardStatus[i][j] = 0;
            }
        }
    };
    var initWinMethodPiecesCount = function() {
        for (var i = 0; i < winMethodsCount; i++) {
            blackWinMethodPiecesCount[i] = 0;
            whiteWinMethodPiecesCount[i] = 0;
        }
    };

    var computerOneStep = function() {
        if (isOver) {
            return;
        }
        var blackScore = [];
        var whiteScore = [];
        var maxScore = 0;
        var u = [], v = [];
        var sameScoreCount = 0;
        for (var i = 0;i < 15; i++) {
            blackScore[i] = [];
            whiteScore[i] = [];
            for (var j = 0; j < 15; j++) {
                blackScore[i][j] = 0;
                whiteScore[i][j] = 0;
            }
        }
        for (i = 0; i < 15; i++) {
            for (j = 0; j < 15; j++) {
                if (boardStatus[i][j] == 0) {
                    for (var k = 0; k < winMethodsCount; k++) {
                        if (winMethods[i][j][k]) {
                            if (nextPieceNum % 2 == 0) {
                                //computer is white
                                caculateScore(i, j, k, blackWinMethodPiecesCount, whiteWinMethodPiecesCount, blackScore, whiteScore);
                            } else {
                                //computer is black
                                caculateScore(i, j, k, whiteWinMethodPiecesCount, blackWinMethodPiecesCount, whiteScore, blackScore);
                            }

                        }
                    }
                    if (blackScore[i][j] > maxScore) {
                        sameScoreCount = 0;
                        maxScore = blackScore[i][j];
                        u[sameScoreCount] = i;
                        v[sameScoreCount] = j;
                        sameScoreCount++;
                    }
                    if (whiteScore[i][j] > maxScore) {
                        sameScoreCount = 0;
                        maxScore = whiteScore[i][j];
                        u[sameScoreCount] = i;
                        v[sameScoreCount] = j;
                        sameScoreCount++;
                    }
                    if (blackScore[i][j] == maxScore || whiteScore[i][j] == maxScore) {
                        u[sameScoreCount] = i;
                        v[sameScoreCount] = j;
                        sameScoreCount++;
                    }
                }
            }
        }
        showScore(blackScore, whiteScore);
        var random = Math.floor(Math.random() * sameScoreCount);
        putDownOnePiece(u[random], v[random]);
        //computerOneStep();
    };
    var caculateScore = function (i, j, k, humanWinMethodPiecesCount, computerWinMethodPiecesCount, humanScore, computerScore) {
        if (humanWinMethodPiecesCount[k] == 1) {
            humanScore[i][j] += 20;
        } else if (humanWinMethodPiecesCount[k] == 2) {
            humanScore[i][j] += 40;
        } else if (humanWinMethodPiecesCount[k] == 3) {
            humanScore[i][j] += 200;
        } else if (humanWinMethodPiecesCount[k] == 4) {
            humanScore[i][j] += 2000;
        }
        if (computerWinMethodPiecesCount[k] == 1) {
            computerScore[i][j] += 22;
        } else if (computerWinMethodPiecesCount[k] == 2) {
            computerScore[i][j] += 42;
        } else if (computerWinMethodPiecesCount[k] == 3) {
            computerScore[i][j] += 820;
        } else if (computerWinMethodPiecesCount[k] == 4) {
            computerScore[i][j] += 9900;
        }
    };
    var checkAvailablePosition = function(i, j) {
        return boardStatus[i][j] == 0;
    };
    var putDownOnePiece = function(i, j) {
        console.log("putDownOnePiece() " + i + " " + j + " " + nextPieceNum);
        var isBlack = nextPieceNum % 2 == 1;
        var x = 30 * i + 2;
        var y = 30 * j + 2;
        drawAPiece(x, y, isBlack);
        boardStatus[i][j] = nextPieceNum;
        updateWinMethodPiecesCount(i, j, isBlack);
        checkWin(isBlack);
        nextPieceNum++;
        if (nextPieceNum > 225 && isOver == false) {
            isOver = true;
            alert("a draw in chess");
        }
    };
    var updateWinMethodPiecesCount = function(i, j, isBlack) {
        for (var k = 0; k < winMethodsCount; k++) {
            if (winMethods[i][j][k]) {
                if (isBlack) {
                    blackWinMethodPiecesCount[k]++;
                    whiteWinMethodPiecesCount[k] = 6;
                    if (blackWinMethodPiecesCount[k] == 5) {
                        isOver = true;
                    }
                } else {
                    whiteWinMethodPiecesCount[k]++;
                    blackWinMethodPiecesCount[k] = 6;
                    if (whiteWinMethodPiecesCount[k] == 5) {
                        isOver = true;
                    }
                }
            }
        }
    };
    var drawAPiece = function(x, y, isBlack) {
        var mainBoard = document.getElementById("mainBoard");
        var colorClass = isBlack ? "black" : "white";
        var node = document.createElement("i");
        node.id = "i" + nextPieceNum;
        node.className = "onePiece " + colorClass;
        if (!isShowLabel) {
            node.className += " hidden";
        }
        node.setAttribute("style", "left: " + x + "px; top: " + y + "px;");
        node.innerHTML = nextPieceNum.toString();
        mainBoard.appendChild(node);
    };

    var checkWin = function(isBlack) {
        if (isOver) {
            isBlack ? alert("black win") : alert("white win");
        }
    };
    var loadPicAndDraw = function() {
        background.src = "images/brain.jpg";
        background.onload = drawBaseBoard;
    };
    var drawBaseBoard = function() {
        drawBackgroundPic();
        drawBoardLines();
        drawDots();
    };
    var drawBackgroundPic = function() {
        //console.log("drawBackgroundPic()");
        context.globalAlpha = 0.2;
        context.strokeStyle = "#BFBFBF";
        context.beginPath();
        context.drawImage(background, 120, 120, 210, 210);
        context.closePath();
        context.stroke();
    };
    var drawBoardLines = function() {
        //console.log("drawBoardLines()");
        context.globalAlpha = 1;
        context.strokeStyle = "#BFBFBF";
        for (var i = 0; i < 15; i++) {
            context.moveTo(30 * i + 15, 15);
            context.lineTo(30 * i + 15, 435);
            context.moveTo(15, 30 * i + 15);
            context.lineTo(435, 30 * i + 15);
        }
        context.stroke();
    };
    var drawDots = function() {
        drawDot(225, 225);
        drawDot(105, 105);
        drawDot(345, 345);
        drawDot(105, 345);
        drawDot(345, 105);
    };
    var drawDot = function(x, y) {
        context.globalAlpha = 0.55;
        context.beginPath();
        context.arc(x, y, 3, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    };
    single = function() {
        gameMode = 1;
        document.getElementById('single').disabled = true;
        document.getElementById('oneonone').disabled = false;
    };
    oneonone = function() {
        gameMode = 2;
        document.getElementById('single').disabled = false;
        document.getElementById('oneonone').disabled = true;
    };

    var resetVariable = function() {
        nextPieceNum = 1;
        isOver = false;
        initBoardStatus();
        initWinMethodPiecesCount();
    };
    var resetElements = function() {
        var pieces = document.getElementsByClassName("onePiece");
        for (var i = pieces.length - 1; i >= 0; i--) {
            pieces[i].remove();
        }
    };
    var destination = function(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
    };
    var showBoardStatus = function() {
        var temp = "";
        for (var j = 0; j < 15; j++) {
            for (var i = 0; i < 15; i++) {
                temp += boardStatus[i][j];
            }
            temp += "\n";
        }
        console.log(temp);
    };
    var showScore = function(blackScore, whiteScore) {
        var btemp = "blackScore:\n";
        var wtemp = "whiteScore:\n";
        for (var j = 0; j < 15; j++) {
            for (var i = 0; i < 15; i++) {
                btemp += blackScore[i][j] + "\t";
                wtemp += whiteScore[i][j] + "\t";
            }
            btemp += "\n";
            wtemp += "\n";
        }
        console.log(wtemp);
        console.log(btemp);
    }
})();


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var GAME_AREA_WIDTH = 800;
var GAME_AREA_HEIGHT = 500;
var SQUARE_SIZE = 40;
var SQUARE_COLOR = "#cc0000";
var SQUARE_SPEED_X = 5;
var SQUARE_SPEED_Y = 5;
var OBSTACLE_SPEED = 2;
var OBSTACLE_COLOR = "#187440";
var OBSTACLE_MIN_HEIGHT = 40;
var OBSTACLE_MAX_HEIGHT = 400;
var OBSTACLE_WIDTH = 20;
var OBSTACLE_MIN_GAP = 55;
var OBSTACLE_MAX_GAP = 400;
var PROBABILITY_OBSTACLE = 0.7;
var FRAME_OBSTACLE = 85;
var FPS = 30;
var CHRONO_MSG = "Time goes by...";

function SquaredForm(x, y, width, height, color, img = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.img = img;
    this.speedX = 0;
    this.speedY = 0;
    this.setSpeedX = function (speedX) {
        this.speedX = speedX;
    };
    this.setSpeedY = function (speedY) {
        this.speedY = speedY;
    };
    this.render = function (ctx) {
        if( this.img ){
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }else{
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        
    };
    this.move = function () {
        this.x += this.speedX;
        this.y += this.speedY;
    };
    this.setIntoArea = function (endX, endY) {
        this.x = Math.min(Math.max(0, this.x), (endX - this.width));
        this.y = Math.min(Math.max(0, this.y), (endY - this.height));
    };
    this.crashWith = function (obj) {
        // detect collision with the bounding box algorithm
        var myleft = this.x;
        var myright = this.x + this.width;
        var mytop = this.y;
        var mybottom = this.y + this.height;
        var otherleft = obj.x;
        var otherright = obj.x + obj.width;
        var othertop = obj.y;
        var otherbottom = obj.y + obj.height;
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) ||
                (myleft > otherright)) {
            crash = false;
        }
        return crash;
    };
}

//var theSquare = new SquaredForm(0, GAME_AREA_HEIGHT / 2, SQUARE_SIZE, SQUARE_SIZE, SQUARE_COLOR);

var obstacles = [];
var rightArrowPressed = false, leftArrowPressed = false, upArrowPressed = false, downArrowPressed = false;
var seconds, minutes, timeout, theChrono;
var continueGame = true;
var image = new Image();
image.src = "images/spaceship.png";
var theSquare = new SquaredForm(0, GAME_AREA_HEIGHT / 2, SQUARE_SIZE, SQUARE_SIZE, SQUARE_COLOR, image);

var gameArea = {
    canvas: document.createElement("canvas"),
    init: function () {
        this.canvas.width = GAME_AREA_WIDTH;
        this.canvas.height = GAME_AREA_HEIGHT;
        this.context = this.canvas.getContext("2d");
        var theDiv = document.getElementById("gameplay");
        theDiv.appendChild(this.canvas);
        this.interval = setInterval(updateGame, 1000 / FPS);
        this.frameNumber = 0;
    },
    render: function () {
        for (var i = 0; i < obstacles.length; i++) {
            obstacles[i].render(this.context);
        }
        theSquare.render(this.context);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

var handlerOne = function (event) {
    switch (event.keyCode) {
        case 39:
            if (!rightArrowPressed) {
                rightArrowPressed = true;
                theSquare.setSpeedX(SQUARE_SPEED_X);
            }
            break;
        case 37:
            if (!leftArrowPressed) {
                leftArrowPressed = true;
                theSquare.setSpeedX(-SQUARE_SPEED_X);
            }
            break;
        case 38:
            if (!upArrowPressed) {
                upArrowPressed = true;
                theSquare.setSpeedY(-SQUARE_SPEED_Y);
            }
            break;
        case 40:
            if (!downArrowPressed) {
                downArrowPressed = true;
                theSquare.setSpeedY(SQUARE_SPEED_Y);
            }
            break;
        default:
            break;
    }
};

var handlerTwo = function (event) {
    switch (event.keyCode) {
        case 39:
            rightArrowPressed = false;
            theSquare.setSpeedX(0);
            break;
        case 37:
            leftArrowPressed = false;
            theSquare.setSpeedX(0);
            break;
        case 38:
            upArrowPressed = false;
            theSquare.setSpeedY(0);
            break;
        case 40:
            downArrowPressed = false;
            theSquare.setSpeedY(0);
            break;
        default:
            break;
    }
};

window.onload = startGame;

function startGame() {
    gameArea.init();
    gameArea.render();

    window.document.addEventListener("keydown", handlerOne);
    window.document.addEventListener("keyup", handlerTwo);

    seconds = 0;
    minutes = 0;
    timeout = window.setTimeout(updateChrono, 1000);
    theChrono = document.getElementById("chrono");
}

function updateGame() {
    // Check collision for ending game
    var collision = false;
    for (var i = 0; i < obstacles.length; i++) {
        if (theSquare.crashWith(obstacles[i])) {
            collision = true;
            break;
        }
    }
    if (collision) {
        endGame();
    } else {
        // Increase count of frames
        gameArea.frameNumber += 1;
        // Let's see if new obstacles must be created
        if (gameArea.frameNumber >= FRAME_OBSTACLE)
            gameArea.frameNumber = 1;
        // First: check if the given number of frames has passed
        if (gameArea.frameNumber === 1) {
            var chance = Math.random();
            if (chance < PROBABILITY_OBSTACLE) {
                var height = Math.floor(Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT + 1) +
                        OBSTACLE_MIN_HEIGHT);
                var gap = Math.floor(Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP + 1) + OBSTACLE_MIN_GAP);
                var form = new SquaredForm(gameArea.canvas.width, 0, OBSTACLE_WIDTH, height, OBSTACLE_COLOR);
                form.setSpeedX(-OBSTACLE_SPEED);
                obstacles.push(form);
                // The obstacle at the bottom only is created if there is enough room
                if ((height + gap + OBSTACLE_MIN_HEIGHT) <= gameArea.canvas.height) {
                    form = new SquaredForm(gameArea.canvas.width, height + gap, OBSTACLE_WIDTH,
                            gameArea.canvas.height - height - gap, OBSTACLE_COLOR);
                    form.setSpeedX(-OBSTACLE_SPEED);
                    obstacles.push(form);
                }
            }
        }
        // Move obstacles and delete the ones that goes outside the canvas
        for (var i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].move();
            if (obstacles[i].x + OBSTACLE_WIDTH <= 0) {
                delete(obstacles[i]);
                obstacles.splice(i, 1);
            }
        }
        // Move our hero
        theSquare.move();
        // Our hero can't go outside the canvas
        theSquare.setIntoArea(gameArea.canvas.width, gameArea.canvas.height);
        gameArea.clear();
        gameArea.render();
    }
}

function updateChrono() {
    if (continueGame) {
        seconds++;
        if (seconds > 59) {
            minutes++;
            seconds = 0;
        }
        theChrono.innerHTML = CHRONO_MSG + " " + pad(minutes, 2) + ":" + pad(seconds, 2);
        timeout = window.setTimeout(updateChrono, 1000);
    }
}

function pad(n, width, z) {
    z = z || "0";
    var s = n.toString();
    return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s;
}

function endGame() {
    continueGame = false;
    obstacles = [];
    delete theSquare;
    clearInterval(gameArea.interval);
    window.document.removeEventListener("keydown", handlerOne);
    window.document.removeEventListener("keyup", handlerTwo);
}

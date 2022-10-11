//build canvas
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");



//set initial ball location to be the center of the pitch
// canvas.width = 480
// canvas.height = 720
let x = canvas.width/2;
let y = canvas.height/2;

//set ball radius
let ballRadius = 6;

//set ball speed
let dx = 3;
let dy = -3;

//initialize ball speed
let m = 0;
let j = 0;

let aiSpeed = 1.25;

//set paddle dimensions
let paddleHeight = 10;
let paddleWidth = 30; // same as the player width

let paddleX = (canvas.width-paddleWidth);

//initialize keypress status
let rightPressed = false;
let leftPressed = false;  

//set goalpost dimensions
let goalpostWidth = 150;
let goalpostHeight = 10;

//initialize scorecard
let ownScore = 0;
let opponentScore = 0;

//set player dimensions
let playerHeight = 40;
let playerWidth = 20;


//set flags
let initFlag = true;
let gameOver = false;
let flag1 = 1;
let flag2 = 1;
let drawFlag = true;

//register for keypress events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


//initialize SAT.js letiables
let V = SAT.Vector;
let C = SAT.Circle;
let B = SAT.Box;

let circle;
let box;

//initialize images
let ownPlayer = new Image();
let opponentPlayer = new Image();


//it all starts here
function init() {
    removeStatus();
    ownPlayer.src = `img/${ownTeamSelection.value}.png`;
    opponentPlayer.src = `img/${opponentTeamSelection.value}.png`;
    document.getElementById('startScreen').style['z-index'] = '-1';
    document.getElementById('gameOverScreen').style['z-index'] = '-1';
    document.getElementById('own').innerHTML = '0';
    document.getElementById('opponent').innerHTML = '0';
    opponentScore = 0;
    ownScore = 0;
    gameOver = 0;
    setInitialDelay();
}

function setInitialDelay() {
    setTimeout(function() {
        startTimer(60 * 2);
        drawFlag = true;
        window.requestAnimationFrame(draw);
        updateStatus('You are team <br> in <span style="color:red">RED</span>');
    }, 1500);
}

function setDelay() {
    setTimeout(function() {
        drawFlag = true;
        window.requestAnimationFrame(draw);
    }, 1500);
}

function startTimer(duration) {
    let timer = duration,
        minutes, seconds;
    countdown = setInterval(function() {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('countdown').innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
            document.getElementById('gameOverScreen').style['z-index'] = 3;
            gameOver = true;
            clearInterval(countdown);
            if (ownScore > opponentScore)
                updateStatus('GAME OVER!<br>You Won!');
            else if (opponentScore > ownScore)
                updateStatus('GAME OVER!<br>You Lost!');
            else
                updateStatus('GAME OVER!<br>Draw!')
        }
    }, 1000);
}

// draw the match
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPlayers();
    drawGoalPost();
    x += dx;
    y += dy;
    if (rightPressed && paddleX * 3 / 4 + m < canvas.width - paddleWidth) {
        m += 2;
    } else if (leftPressed && paddleX / 4 + m > 0) {
        m -= 2;
    }
    if (drawFlag && !gameOver)
        window.requestAnimationFrame(draw);
}

// ball picture
const ballImage = new Image();
ballImage.src = 'img/soccorball.svg.png';
ballImage.onload = drawBall;
function drawBall() {
   
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2, true);
    // ctx.clip();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    // ctx.fillStyle = ctx.createPattern(ballImage, 'no-repeat')
    ctx.drawImage(ballImage,x-7.5, y-7.5, 12, 12)
    
    ctx.fill();
    
    ctx.closePath();
    
    circle = new C(new V(x, y), 6);
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
            if(x<0)
                x=0;
            if(x>canvas.width)
                x = canvas.width; 
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

}

function drawPlayers() {
    drawOwnTeam();
    drawOpponentTeam();
    
}

function drawOwnTeam() {
    // own team
    drawGoalkeeper();
    drawDefenders();
    drawMidfielders();
    drawStrikers();
}

function drawOpponentTeam() {
    //opponent
    drawOpponentGoalkeeper();
    drawOpponentDefenders();
    drawOpponentMidfielders();
    drawOpponentStrikers();
}

function drawGoalPost() {

    // own team
    ctx.beginPath();
    let goalpostOwnX = (canvas.width - goalpostWidth) / 2;
    let goalpostOwnY = canvas.height - goalpostHeight;
    ctx.rect(goalpostOwnX, goalpostOwnY, goalpostWidth, goalpostHeight);
    ctx.fillStyle = "#9C9C9C";
    ctx.fill();
    ctx.closePath();
    box = new B(new V(goalpostOwnX, goalpostOwnY), goalpostWidth, goalpostHeight).toPolygon();
    if (goalDetection(box)) {
        updateScore('own');
        updateStatus('GOAL!<br>The Opponent Score!');
        removeStatus();
        resetBall();
        setDelay();
    }
    //opponent
    ctx.beginPath();
    let goalpostOpponentX = (canvas.width - goalpostWidth) / 2;
    let goalpostOpponentY = paddleHeight - goalpostHeight;
    ctx.rect(goalpostOpponentX, goalpostOpponentY, goalpostWidth, goalpostHeight);
    ctx.fillStyle = "#9C9C9C";
    ctx.fill();
    ctx.closePath();

    box = new B(new V(goalpostOpponentX, goalpostOpponentY), goalpostWidth, goalpostHeight).toPolygon();
    if (goalDetection(box)) {
        updateScore('opponent');
        updateStatus('GOAL!<br>Your Team Score!');
        removeStatus();
        resetBall();
        setDelay();
    }
}


function updateScore(goal) {

    if (goal === 'own') {
        opponentScore += 1;
        document.getElementById('opponent').innerHTML = opponentScore;
    } else {
        ownScore += 1;
        document.getElementById('own').innerHTML = ownScore;
    }
}

function resetBall() {
    x = canvas.width / 2;
    y = canvas.height / 2;
    drawBall();
    drawFlag = false;
    window.requestAnimationFrame(draw);

}

function updateStatus(message) {
    document.getElementById('status').innerHTML = message;

}

function removeStatus() {
    setTimeout(function() {
        document.getElementById('status').innerHTML = '';
    }, 1500);
}



function drawGoalkeeper() {

    let goalkeeperX = paddleX / 2 + m;
    let goalkeeperY = canvas.height * 7 / 8 - paddleHeight;
    ctx.drawImage(ownPlayer, goalkeeperX, goalkeeperY - 15, playerWidth, playerHeight);
    // drawRods(goalkeeperY);
    box = new B(new V(goalkeeperX, goalkeeperY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, goalkeeperX);

}


function drawDefenders() {

    let leftCenterBackX = paddleX / 4 + m;
    let leftCenterBackY = canvas.height * 13 / 16 - paddleHeight;
    // drawRods(leftCenterBackY);
    ctx.drawImage(ownPlayer, leftCenterBackX, leftCenterBackY - 15, playerWidth, playerHeight);
    box = new B(new V(leftCenterBackX, leftCenterBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, leftCenterBackX);

    let rightCenterBackX = paddleX * 3 / 4 + m;
    let rightCenterBackY = canvas.height * 13 / 16 - paddleHeight;
    ctx.drawImage(ownPlayer, rightCenterBackX, rightCenterBackY - 15, playerWidth, playerHeight);
    box = new B(new V(rightCenterBackX, rightCenterBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rightCenterBackX);
}

function drawMidfielders() {

    //midfielders
    let leftWingBackX = paddleX * 1 / 8 + m;
    let leftWingBackY = canvas.height * 5 / 8 - paddleHeight;
    // drawRods(leftWingBackY);
    ctx.drawImage(ownPlayer, leftWingBackX, leftWingBackY - 15, playerWidth, playerHeight);
    box = new B(new V(leftWingBackX, leftWingBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, leftWingBackX);

    let leftCenterMiddleX = paddleX * 3 / 8 + m;
    let leftCenterMiddleY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(ownPlayer, leftCenterMiddleX, leftCenterMiddleY - 15, playerWidth, playerHeight);
    box = new B(new V(leftCenterMiddleX, leftCenterMiddleY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, leftCenterMiddleX);

    let rightCenterMiddleX = paddleX * 5 / 8 + m;
    let rightCenterMiddleY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(ownPlayer, rightCenterMiddleX, rightCenterMiddleY - 15, playerWidth, playerHeight);
    box = new B(new V(rightCenterMiddleX, rightCenterMiddleY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rightCenterMiddleX);

    let rightWingBackX = paddleX * 7 / 8 + m;
    let rightWingBackY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(ownPlayer, rightWingBackX, rightWingBackY - 15, playerWidth, playerHeight);
    box = new B(new V(rightWingBackX, rightWingBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rightWingBackX);

}

function drawStrikers() {
    //attackers
    let leftWingForwardX = paddleX / 4 + m;
    let leftWingForwardY = canvas.height * 9 / 32 - paddleHeight;
    // drawRods(leftWingForwardY);
    ctx.drawImage(ownPlayer, leftWingForwardX, leftWingForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(leftWingForwardX, leftWingForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, leftWingForwardX);

    let centerForwardX = paddleX / 2 + m;
    let centerForwardY = canvas.height * 9 / 32 - paddleHeight;
    ctx.drawImage(ownPlayer, centerForwardX, centerForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(centerForwardX, centerForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, centerForwardX);

    let rightWingForwardX = paddleX * 3 / 4 + m;
    let rightWingForwardY = canvas.height * 9 / 32 - paddleHeight;
    ctx.drawImage(ownPlayer, rightWingForwardX, rightWingForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(rightWingForwardX, rightWingForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rightWingForwardX);

}



function drawOpponentGoalkeeper() {

    let goalkeeperX = paddleX / 2 + j;
    let goalkeeperY = canvas.height * 1 / 8 - paddleHeight;
    // drawRods(goalkeeperY);
    ctx.drawImage(opponentPlayer, goalkeeperX, goalkeeperY - 15, playerWidth, playerHeight);
    box = new B(new V(goalkeeperX, goalkeeperY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, goalkeeperX);

    if (x > goalkeeperX && goalkeeperX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (goalkeeperX > paddleX * 1 / 4)
        j -= aiSpeed;

}

function drawOpponentDefenders() {

    let leftCenterBackX = paddleX / 4 + j;
    let leftCenterBackY = canvas.height * 3 / 16 - paddleHeight;
    // drawRods(leftCenterBackY);
    ctx.drawImage(opponentPlayer, leftCenterBackX, leftCenterBackY - 15, playerWidth, playerHeight);
    box = new B(new V(leftCenterBackX, leftCenterBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, leftCenterBackX);

    let rightCenterBackX = paddleX * 3 / 4 + j;
    let rightCenterBackY = canvas.height * 3 / 16 - paddleHeight;
    ctx.drawImage(opponentPlayer, rightCenterBackX, rightCenterBackY - 15, playerWidth, playerHeight);
    box = new B(new V(rightCenterBackX, rightCenterBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, rightCenterBackX);

    if (x > rightCenterBackX && rightCenterBackY < paddleX * 3 / 4)
        j += aiSpeed;
    else if (leftCenterBackX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > rightCenterBackX && rightCenterBackX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (rightCenterBackX > paddleX * 1 / 4)
        j -= aiSpeed;
}

function drawOpponentMidfielders() {

    //midfielders
    let leftWingBackX = paddleX * 1 / 8 + j;
    let leftWingBackY = canvas.height * 3 / 8 - paddleHeight;
    // drawRods(leftWingBackY)
    ctx.drawImage(opponentPlayer, leftWingBackX, leftWingBackY - 15, playerWidth, playerHeight);
    box = new B(new V(leftWingBackX, leftWingBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, leftWingBackX);

    let leftCenterMiddleX = paddleX * 3 / 8 + j;
    let leftCenterMiddleY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(opponentPlayer, leftCenterMiddleX, leftCenterMiddleY - 15, playerWidth, playerHeight);
    box = new B(new V(leftCenterMiddleX, leftCenterMiddleY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, leftCenterMiddleX);

    let rightCenterMiddleX = paddleX * 5 / 8 + j;
    let rightCenterMiddleY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(opponentPlayer, rightCenterMiddleX, rightCenterMiddleY - 15, playerWidth, playerHeight);
    box = new B(new V(rightCenterMiddleX, rightCenterMiddleY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, rightCenterMiddleX);

    let rightWingBackX = paddleX * 7 / 8 + j;
    let rightWingBackY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(opponentPlayer, rightWingBackX, rightWingBackY - 15, playerWidth, playerHeight);
    box = new B(new V(rightWingBackX, rightWingBackY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, rightWingBackX);

    if (x > leftWingBackX && leftWingBackX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (leftWingBackX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > rightWingBackX && rightWingBackX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (rightWingBackX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > rightCenterMiddleX && rightCenterMiddleX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (rightCenterMiddleX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > leftCenterMiddleX && leftCenterMiddleX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (leftCenterMiddleX > paddleX * 1 / 4)
        j -= aiSpeed;
}


function drawOpponentStrikers() {
    //attackers
    ctx.beginPath();
    let leftWingForwardX = paddleX / 4 + j;
    let leftWingForwardY = canvas.height * 23 / 32 - paddleHeight;
    // drawRods(leftWingForwardY);
    ctx.drawImage(opponentPlayer, leftWingForwardX, leftWingForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(leftWingForwardX, leftWingForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, leftWingForwardX);

    ctx.beginPath();
    let centerForwardX = paddleX / 2 + j;
    let centerForwardY = canvas.height * 23 / 32 - paddleHeight;
    ctx.drawImage(opponentPlayer, centerForwardX, centerForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(centerForwardX, centerForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, centerForwardX);

    ctx.beginPath();
    let rightWingForwardX = paddleX * 3 / 4 + j;
    let rightWingForwardY = canvas.height * 23 / 32 - paddleHeight;
    ctx.drawImage(opponentPlayer, rightWingForwardX, rightWingForwardY - 15, playerWidth, playerHeight);
    box = new B(new V(rightWingForwardX, rightWingForwardY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionOpponent(box, rightWingForwardX);


    // if(y + 10 == rwY || y - 10 == rwY) {
    if (x > leftWingForwardX && leftWingForwardX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (leftWingForwardX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > rightWingForwardX && rightWingForwardX < paddleX * 3 / 4)
        j += aiSpeed;
    else if (rightWingForwardX > paddleX * 1 / 4)
        j -= aiSpeed;
    if (x > centerForwardX &&  centerForwardX < paddleX * 3 / 4)
        j += aiSpeed;
    else if ( centerForwardX > paddleX * 1 / 4)
        j -= aiSpeed;
    //}


}


function collisionDetection(box, pX) {
    let response = new SAT.Response();
    if (SAT.testPolygonCircle(box, circle, response)) {
        let speed = (x + (12 / 2) - pX + (20 / 2)) / (20 / 2) * 5;
        if (flag1 == 1) {
            if (dy > 0) {
                dy = -dy;
                y = y - speed;
                if (dx > 0)
                    x = x + speed;
                else
                    x = x - speed;
            } else {
                y = y - speed;
                if (dx > 0)
                    x = x - speed;
                else
                    x = x + speed;
            }
            flag1 = 0;
        }
    } else
        flag1 = 1;
}

function collisionDetectionOpponent(box, pX) {
    let response = new SAT.Response();
    if (SAT.testPolygonCircle(box, circle, response)) {
        let speed = (x + (12 / 2) - pX + (20 / 2)) / (20 / 2) * 5;
        if (flag2 == 1) {
            if (dy < 0) {
                dy = -dy;
                y = y + speed;
                if (dx > 0)
                    x = x + speed;
                else
                    x = x - speed;
            } else {
                y = y + speed;
                if (dx > 0)
                    x = x + speed;
                else
                    x = x - speed;
            }
        }
    } else
        flag2 = 1;
}


function goalDetection(box) {
    let response = new SAT.Response();
    return SAT.testPolygonCircle(box, circle, response);
}

// function drawRods(yAxis) {
//     ctx.beginPath();
//     ctx.rect(0, yAxis + 2, canvas.width, paddleHeight - 5);
//     ctx.fillStyle = 'rgba(0,0,0,0)';
//     // ctx.fillStyle = 'black';
//     ctx.fill();
//     ctx.strokeStyle = 'rgba(0,0,0,0)';
//     ctx.stroke();
//     ctx.closePath();
// }

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

// dropdown list 
document.getElementById("ownTeam").selectedIndex = -1;
document.getElementById("opponentTeam").selectedIndex = -1;
let ownTeamSelection = document.getElementById('ownTeam');
let opponentTeamSelection = document.getElementById('opponentTeam');
let ownTeamToShow = document.getElementById('ownName');
let opponentTeamToShow = document.getElementById('opponentName');
let buttonStart = document.getElementById('play')
ownTeamSelection.onchange = function(){
    // let val = ownTeamSelection.value;
    opponentTeamSelection.remove(ownTeamSelection.selectedIndex)
    ownTeamToShow.innerHTML = ownTeamSelection.value;
    opponentTeamToShow.innerHTML = opponentTeamSelection.value;
    if (ownTeamSelection.value && opponentTeamSelection.value){
        buttonStart.disabled = false;
        
    } 
};

// back to homepage a sneaky way.... hahahahha

function replaceDoc()
{
    location.reload()
}




   
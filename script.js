class Ball {

    constructor(x, y, radius) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.dx = randomDx();
        this.dy = randomDy();
        this.mass = this.radius * this.radius * this.radius;
        this.color = randomColor();
    };

    draw() {
        ctx.beginPath();
        ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
        ctx.closePath();
    };

    speed() {
        return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    };

    angle() {
        return Math.atan2(this.dy, this.dx);
    };

    onGround() {
        return (this.y + this.radius >= canvas.height)
    };
};

function randomColor() {
    let red = Math.floor(Math.random() * 3) * 127;
    let green = Math.floor(Math.random() * 3) * 127;
    let blue = Math.floor(Math.random() * 3) * 127;
    let rc = "rgb(" + red + ", " + green + ", " + blue + ")";
    return rc;
}

function randomX() {
    let x = 0;
    return x;
}

function randomY() {
    let y = 0;
    return y;
}

function randomRadius() {
    if (bigBalls) {
        let r = Math.ceil(Math.random() * 10 + 20);
        return r;
    } else {
        let r = Math.ceil(Math.random() * 2 + 2);
        return r;
    }
}

function randomDx() {
    let r = Math.floor(Math.random() * 10 - 4);
    return r;
}

function randomDy() {
    let r = Math.floor(Math.random() * 10 - 3);
    return r;
}

function distanceNextFrame(a, b) {
    return Math.sqrt((a.x + a.dx - b.x - b.dx) ** 2 + (a.y + a.dy - b.y - b.dy) ** 2) - a.radius - b.radius;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let objArray = [];
let paused = false;
let leftHeld = false;
let upHeld = false;
let rightHeld = false;
let downHeld = false;
let arrowControlSpeed = .25;
let gravityOn = false;
let clearCanv = true;
let bigBalls = false;
let lastTime = (new Date()).getTime();
let currentTime = 0;
let dt = 0;

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function arrowControls() {
    if (leftHeld) { // left arrow
        for (let obj in objArray) {
            objArray[obj].dx -= arrowControlSpeed / objArray[obj].radius;
        }
    }
    if (upHeld) { // up arrow
        for (let obj in objArray) {
            objArray[obj].dy -= arrowControlSpeed / objArray[obj].radius;
        }
    }
    if (rightHeld) { // right arrow
        for (let obj in objArray) {
            objArray[obj].dx += arrowControlSpeed / objArray[obj].radius;
        }
    }
    if (downHeld) { // down arrow
        for (let obj in objArray) {
            objArray[obj].dy += arrowControlSpeed / objArray[obj].radius;
        }
    }
}

function canvasBackground() {
    canvas.style.backgroundColor = "rgb(115, 215, 140)";
}

function wallCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > canvas.height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }
}

function ballCollision() {
    for (let i = 0; i < objArray.length - 1; i++) {
        for (let j = i + 1; j < objArray.length; j++) {
            let ob1 = objArray[i]
            let ob2 = objArray[j]
            let dist = distance(ob1, ob2)
            if (dist < ob1.radius + ob2.radius) {
                let theta1 = ob1.angle();
                let theta2 = ob2.angle();
                let phi = Math.atan2(ob2.y - ob1.y, ob2.x - ob1.x);
                let m1 = ob1.mass;
                let m2 = ob2.mass;
                let v1 = ob1.speed();
                let v2 = ob2.speed();
                let dx1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
                let dy1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.sin(phi) + v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);
                let dx2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.cos(phi) + v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
                let dy2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.sin(phi) + v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);
                ob1.dx = dx1F;
                ob1.dy = dy1F;
                ob2.dx = dx2F;
                ob2.dy = dy2F;
                staticCollision(ob1, ob2)
            }
        }
        wallCollision(objArray[i]);
    }

    if (objArray.length > 0)
        wallCollision(objArray[objArray.length - 1])
}

function staticCollision(ob1, ob2, emergency = false) {
    let overlap = ob1.radius + ob2.radius - distance(ob1, ob2);
    let smallerObject = ob1.radius < ob2.radius ? ob1 : ob2;
    let biggerObject = ob1.radius > ob2.radius ? ob1 : ob2;
    if (emergency) [smallerObject, biggerObject] = [biggerObject, smallerObject];
    let theta = Math.atan2((biggerObject.y - smallerObject.y), (biggerObject.x - smallerObject.x));
    smallerObject.x -= overlap * Math.cos(theta);
    smallerObject.y -= overlap * Math.sin(theta);
    if (distance(ob1, ob2) < ob1.radius + ob2.radius) {
        if (!emergency) staticCollision(ob1, ob2, true)
    }
}

function applyGravity() {
    for (let obj in objArray) {
        let ob = objArray[obj];
        if (ob.onGround() === false) {
            ob.dy += .29;
        }
    }
}

function moveObjects() {
    for (let i = 0; i < objArray.length; i++) {
        let ob = objArray[i];
        ob.x += ob.dx * dt;
        ob.y += ob.dy * dt;
    }
}

function drawObjects() {
    for (let obj in objArray) {
        objArray[obj].draw();
    }
}

function draw() {
    currentTime = (new Date()).getTime();
    dt = (currentTime - lastTime) / 1000; // delta time in seconds
    dt *= 50;
    if (clearCanv) clearCanvas();

    canvasBackground();

    if (!paused) {
        arrowControls();
        if (gravityOn) {
            applyGravity();
        }
        moveObjects();
        ballCollision();
    }

    drawObjects();
    bigBalls = true;
    lastTime = currentTime;
    window.requestAnimationFrame(draw);
}

function printNumbers(from, to) {
    let current = from;

    let timerId = setInterval(function () {
        objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
        if (current === to) {
            clearInterval(timerId);
        }
        current++;
    }, 1100);
}

printNumbers(0, 10);
draw();
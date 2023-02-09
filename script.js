const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');

var WIDTH = window.innerWidth*0.95;
var HEIGHT = window.innerHeight*0.90;
var GLOW = false;
var DEBUG = false;
var BOUNCE = false;
var COHESION_WEIGHT = 50;
var SEPARATION_WEIGHT = 50;
var ALIGNMENT_WEIGHT = 50;
var PERCEPTION_WEIGHT = 100;
const SPEED_LIMIT = 10;
const MAX_FORCE = 0.05;
const WALL_AVOID = 10;
const PERCEPTION = 200*2;
const boids = [];

class Vector2D{
    constructor(x,y){
        this.x = x
        this.y = y
    }
    setMag(new_mag){
        this.x = this.x * new_mag / this.getMag();
        this.y = this.y * new_mag / this.getMag();
    }

    getMag(){
        return Math.sqrt(this.x **2 + this.y ** 2);
    }

    normalise(){
        let x = 0;
        let y = 0;
        if (this.getMag() != 0){
            x = this.x /this.getMag();
            y = this.y /this.getMag();
        }
        this.x = x;
        this.y = y;
    }

    add(vector){
        this.x += vector.x;
        this.y += vector.y;
    }

    div(scalar){
        this.x = this.x/scalar;
        this.y = this.y/scalar;
    }

    sub(vector){
        this.x -= vector.x;
        this.y -= vector.y;
    }
}


class Boid {
    constructor(x, y, radius, colour, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.speed = speed;
        this.ax = 0
        this.ay = 0
        this.vx = this.randomSpeed();
        this.vy = this.randomSpeed();
        this.perception = PERCEPTION;
        console.log(this.vx, this.vy);
    }
    randomSpeed() {
        return (Math.random() * (SPEED_LIMIT * 2)) - SPEED_LIMIT;
    }
    draw(context) {
        this.drawBoid(context);
        if (DEBUG){
            this.drawPerception(context);
            this.drawVelocity(context);
        }
    }

    get_weighted_perception() {
        return (PERCEPTION_WEIGHT/100) * this.perception;
    }

    drawBoid(context) {
        this.drawCircle(context,this.x, this.y, this.radius,this.colour,true);
    }

    drawPerception(context) {
        this.drawCircle(context,this.x, this.y, this.get_weighted_perception() + this.radius, "red",false);
    }
    drawVelocity(context) {
        this.drawLine(context,this.x, this.y, this.x + (this.vx * 5), this.y + (this.vy * 5), "red");
    }
    drawLine(context,x1,y1,x2,y2, colour) {
        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(x1,y1);
        context.lineTo(x2,y2)
        context.strokeStyle = colour;
        context.stroke();
        context.closePath();
    }

    drawCircle(context,x,y,radius,colour,fill) {
        context.strokeStyle = colour;
        context.lineWidth = 1;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);

        if (fill){
            context.fillStyle = colour;
            context.fill();
        }
        if (fill &&GLOW){
            context.stroke();
            context.lineWidth = 0;
            context.shadowColor = colour;
            context.shadowBlur = 100*this.count;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.stroke();
            context.fill();
            context.closePath();
        }
        context.stroke();
        context.closePath();
    }

    distanceFrom(other_boid) {
        return Math.sqrt((this.x - other_boid.x) ** 2 + (this.y - other_boid.y) ** 2)
    }

    limitSpeed() {

    if (this.vx > SPEED_LIMIT) {
        this.vx = SPEED_LIMIT;
    }
    else if (this.vx < -SPEED_LIMIT) {
        this.vx = -SPEED_LIMIT;
    }
    if (this.vy > SPEED_LIMIT) {
        this.vy = SPEED_LIMIT;
    }
    else if (this.vy < -SPEED_LIMIT) {
        this.vy = -SPEED_LIMIT;
    }

    
    // Find source of NaN values
    if (this.vx == NaN || this.vy == NaN){
        this.vx = this.randomSpeed();
        this.vy = this.randomSpeed();
    }
    // console.log(
    //     "vx- ",this.vx,
    //     "\nvy- ",this.vy,
    //     "ax- ",this.ax,
    //     "\nax- ",this.ax
    // );
    this.x += this.vx;
    this.y += this.vy;
    }

    accelerate() {
        this.vx += this.ax;
        this.vy += this.ay;
    }

    wallAvoidance() { 
        if (this.x <= WALL_AVOID){
            this.ax += (((WALL_AVOID - this.x)/WALL_AVOID) * SPEED_LIMIT) * MAX_FORCE;
        }
        if (this.x >= WIDTH - WALL_AVOID){
            this.ax -= ((this.x/(WIDTH - WALL_AVOID)) * SPEED_LIMIT) * MAX_FORCE;
        }

        if (this.y <= WALL_AVOID){
            this.ay += (((WALL_AVOID - this.y)/WALL_AVOID) * SPEED_LIMIT) * MAX_FORCE;
        }
        if (this.y >= HEIGHT - WALL_AVOID){
            this.ax -= ((this.x/(HEIGHT - WALL_AVOID)) * SPEED_LIMIT) * MAX_FORCE ;
        }
    }
    wallBounce(){
        // BOUNCE
        if (this.x <= 0){
            this.vx *= -1;
        }
        if (this.x >= WIDTH){
            this.vx *= -1;
        }
        if (this.y <= 1){
            this.vy *= -1;
        }
        if (this.y >= HEIGHT){
            this.vy *= -1;
        }
        // console.log("ax- ",this.ax,"\n ay- ",this.ay);
    }

    loopMap(){
        // LOOP MAP
        if (this.x > WIDTH -1) {
            this.x = -1
        } else if (this.x < 1) {
            this.x = WIDTH
        } else if (this.y > HEIGHT-1) {
            this.y = -1
        } else if (this.y < 1) {
            this.y = HEIGHT
        }
    }
    flock(){
        let perception_from_center = this.get_weighted_perception() + this.radius;

        let sum_vx = 0;
        let sum_vy = 0;
        
        let sum_x = 0;
        let sum_y = 0;

        let sum_cx = 0;
        let sum_cy = 0;

        let count = 0;
        this.count = 0
        let second_count = 0;
        for (let other_boid of boids) {
            let distance = this.distanceFrom(other_boid);

            if (this != other_boid && distance < perception_from_center) {
                // Cohesion calculations
                sum_vx += other_boid.vx;
                sum_vy += other_boid.vy;

                // alignment calculations
                sum_x += other_boid.x;
                sum_y += other_boid.y;

                // Separation calculations
                let diff_x =  other_boid.x - this.x;
                let diff_y =  other_boid.y - this.y;
                sum_cx += diff_x/distance;
                sum_cy += diff_y/distance;

                count++;
                if (other_boid.colour != "white" || this.colour != other_boid.colour) {
                    // Change colour to match other boid
                    this.colour = other_boid.colour;
                }
    
                
            }
        }
        this.count = count;
        if (count == 0) {
            // No boids in range
            this.colour = "white";
        } else {
            if (this.colour == "white"){
                // Set random colour
                this.colour = " #" + Math.floor(Math.random() * 16777215).toString(16);
            }
            // cohesion calculations
            let avg_vx = sum_vx / count;
            let avg_vy = sum_vy / count;


            let avg_x = sum_x / count;
            let avg_y = sum_y / count;

            let avg_cx = sum_cx / count;
            let avg_cy = sum_cy / count;




            // // Rule 1: Alignment - Steer towards the average heading of local boids
            let alignment_force = 0.1 *(ALIGNMENT_WEIGHT/100);
            this.ax += (avg_vx - this.vx) * alignment_force;
            this.ay += (avg_vy - this.vy) * alignment_force;
            
            // Rule 2: Cohesion - Move towards the average position of local boids
            let cohesion_force = 0.1*(COHESION_WEIGHT/100);
            this.ax += (avg_x - this.x) * cohesion_force;
            this.ay += (avg_y - this.y) * cohesion_force;
            
            // Rule 3: Separation - Avoid crowding
            let separation_force = 10*(SEPARATION_WEIGHT/100);
            this.ax -= avg_cx * separation_force;
            this.ay -= avg_cy * separation_force;


        }
    }

    update() {
        this.ax = 0;
        this.ay = 0;

        this.flock();
        
        // this.wallAvoidance();


        this.accelerate();
        this.limitSpeed();

        if (BOUNCE){
            this.wallBounce();
        }else{
            this.loopMap();
        }
   

        this.draw(context);
    }
}

function init_boids() {
    for (let i = 0; i < 10; i++) {
        let x = Math.random() * WIDTH;
        let y = Math.random() * HEIGHT;
        let boid = new Boid(x, y, 10, "white", 1);
        boid.draw(context);
        boids.push(boid)
    }
}

let updateLoop = function () {
    requestAnimationFrame(updateLoop);
    context.clearRect(0, 0, WIDTH, HEIGHT);
    for (let boid of boids) {
        boid.update();
    }

}

function drawCircle(context,x,y,radius,colour,fill) {
    context.beginPath();
    context.lineWidth = 0;
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.strokeStyle = colour;
    if (fill){
        context.fillStyle = colour;
        context.fill();
    }
    context.stroke();
    context.closePath();
}

function onGlowCheckBox(){
    if (document.getElementById("glowChekcBox").checked){
        GLOW = true;
    } else {
        GLOW = false;
    }
}

function onBounceCheckBox(){
    if (document.getElementById("bounceCheckBox").checked){
        BOUNCE = true;
    } else {
        BOUNCE = false;
    }
}

function onDebugCheckBox(){
    if (document.getElementById("debugCheckBox").checked){
        DEBUG = true;
    } else {
        DEBUG = false;
    }
}
canvas.style.background = "black";
canvas.height = HEIGHT;
canvas.width = WIDTH;

var cohesion_slider = document.getElementById("cohesionSlider");
var alignment_slider = document.getElementById("alignmentSlider");
var separation_slider = document.getElementById("separationSlider");
var perception_slider = document.getElementById("perceptionSlider");


cohesion_slider.oninput = function() {
    COHESION_WEIGHT = cohesion_slider.value;
}

alignment_slider.oninput = function() {
    ALIGNMENT_WEIGHT = alignment_slider.value;
}

separation_slider.oninput = function() {
    SEPARATION_WEIGHT = separation_slider.value;
}

perception_slider.oninput = function() {
    PERCEPTION_WEIGHT = perception_slider.value;
}
window.onresize = function(){ location.reload(); }

init_boids();
updateLoop();

document.addEventListener('click', (e) => {
    console.log(e.clientX,e.clientY);
    let boid = new Boid(e.clientX, e.clientY, 10, "white", 1);
    boid.draw(context);
    boids.push(boid);
});
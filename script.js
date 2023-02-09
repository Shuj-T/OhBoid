// Constants
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
const SPEED_LIMIT = 10;
const MAX_FORCE = 0.05;
const WALL_AVOID = 10;
const PERCEPTION = 200*2;
const NUMBER_OF_BOIDS = 10;
const boids = [];

// Canvas variables
var WIDTH = window.innerWidth*0.95;
var HEIGHT = window.innerHeight*0.90;

// Checkbox variables
var glow_checkbox = false;
var debug_check_box = false;
var bounce_check_box = false;

// Slider variables
var COHESION_WEIGHT = 50;
var SEPARATION_WEIGHT = 50;
var ALIGNMENT_WEIGHT = 50;
var PERCEPTION_WEIGHT = 50;

// Checkbox handlers

function onGlowCheckBox(){
    if (document.getElementById("glowCheckBox").checked){
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
        debug_check_box = true;
    } else {
        debug_check_box = false;
    }
}

// Creates boid objects
function init_boids() {
    for (let i = 0; i < NUMBER_OF_BOIDS; i++) {
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

function init_slider_listeners(){
    var cohesion_slider = document.getElementById("cohesionSlider");
    
    cohesion_slider.oninput = function() {
        COHESION_WEIGHT = cohesion_slider.value;
    }
    
    var alignment_slider = document.getElementById("alignmentSlider");
    
    alignment_slider.oninput = function() {
        ALIGNMENT_WEIGHT = alignment_slider.value;
    }
    
    var separation_slider = document.getElementById("separationSlider");
    
    separation_slider.oninput = function() {
        SEPARATION_WEIGHT = separation_slider.value;
    }
    
    var perception_slider = document.getElementById("perceptionSlider");
    
    perception_slider.oninput = function() {
        PERCEPTION_WEIGHT = perception_slider.value;
    }
}

/**
 * Creates the canvas and adds event listeners
 */
function init(){
    // Set canvas size and background
    canvas.style.background = "black";
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    // Create Slider listeners
    init_slider_listeners();

    // Reload page on window resize
    window.onresize = function(){ location.reload(); }
    
    // Create click listener
    document.addEventListener('click', (e) => {
        console.log(e.clientX,e.clientY);
        let boid = new Boid(e.clientX, e.clientY, 10, "white", 1);
        boid.draw(context);
        boids.push(boid);
    });
    init_boids();
updateLoop();
}


init();
// Constants
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
const SPEED_LIMIT = 10;
const MAX_FORCE = 0.05;
const WALL_AVOID = 10;
const PERCEPTION = 200 * 2;
const NUMBER_OF_BOIDS = 10;
const BOID_SIZE = 10;
const boids = [];

// Canvas variables
var WIDTH = window.innerWidth * 0.95;
var HEIGHT = window.innerHeight * 0.90;

// Checkbox variables
var glow_checkbox = false;
var debug_checkbox = false;
var bounce_checkbox = false;
var trail_checkbox = false;

// Slider variables
var COHESION_WEIGHT = 50;
var SEPARATION_WEIGHT = 50;
var ALIGNMENT_WEIGHT = 50;
var PERCEPTION_WEIGHT = 50;

// Checkbox handlers

function onGlowCheckBox() {
    if (document.getElementById("glowCheckBox").checked) {
        glow_checkbox = true;
    } else {
        glow_checkbox = false;
    }
}

function onBounceCheckBox() {
    if (document.getElementById("bounceCheckBox").checked) {
        bounce_checkbox = true;
    } else {
        bounce_checkbox = false;
    }
}

function onDebugCheckBox() {
    if (document.getElementById("debugCheckBox").checked) {
        debug_checkbox = true;
    } else {
        debug_checkbox = false;
    }
}

function onTrailCheckBox() {
    if (document.getElementById("trailCheckBox").checked) {
        trail_checkbox = true;
    } else {
        trail_checkbox = false;
    }
}

// Creates boid objects
function init_boids() {
    for (let i = 0; i < NUMBER_OF_BOIDS; i++) {
        let x = Math.random() * WIDTH;
        let y = Math.random() * HEIGHT;
        let boid = new Boid(x, y, BOID_SIZE, "white", 1);
        boid.draw(context);
        boids.push(boid)
    }
}

let updateLoop = function () {
    requestAnimationFrame(updateLoop);
    if (trail_checkbox) { 
        context.fillStyle = 'rgba(0, 0, 0, .2)';
        context.fillRect(0, 0, WIDTH, HEIGHT);
    }
    else{ 
        context.clearRect(0, 0, WIDTH, HEIGHT);
    }
    for (let boid of boids) {
        boid.update();
    }
}

function init_slider_listeners() {
    var cohesion_slider = document.getElementById("cohesionSlider");

    cohesion_slider.oninput = function () {
        COHESION_WEIGHT = cohesion_slider.value;
    }

    var alignment_slider = document.getElementById("alignmentSlider");

    alignment_slider.oninput = function () {
        ALIGNMENT_WEIGHT = alignment_slider.value;
    }

    var separation_slider = document.getElementById("separationSlider");

    separation_slider.oninput = function () {
        SEPARATION_WEIGHT = separation_slider.value;
    }

    var perception_slider = document.getElementById("perceptionSlider");

    perception_slider.oninput = function () {
        PERCEPTION_WEIGHT = perception_slider.value;
    }
}

/**
 * Creates the canvas and adds event listeners
 */
function init() {
    // Set canvas size and background
    canvas.style.background = "black";
    canvas.height = HEIGHT;
    canvas.width = WIDTH;

    // Create Slider listeners
    init_slider_listeners();

    // Reload page on window resize
    window.onresize = function () { location.reload(); }

    // Create click listener
    document.addEventListener('click', (event) => {
        console.log(event.clientX, event.clientY);
        var rect = canvas.getBoundingClientRect();
        canvas_mouse_x = event.clientX - rect.left;
        canvas_mouse_y = event.clientY - rect.top;

        let boid = new Boid(canvas_mouse_x, canvas_mouse_y, BOID_SIZE, "white", 1);
        boid.draw(context);
        boids.push(boid);
    });
    init_boids();
    updateLoop();
}


init();
class Boid {
    /**
     * @description Creates a boid object
     * @param {float} x 
     * @param {float} y 
     * @param {int} radius 
     * @param {string} colour 
     * @param {int} speed 
     */
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

    /**
     * @description Generates random speed between -SPEED_LIMIT and SPEED_LIMIT
     * @returns {float} random speed between -SPEED_LIMIT and SPEED_LIMIT
     */
    randomSpeed() {
        return (Math.random() * (SPEED_LIMIT * 2)) - SPEED_LIMIT;
    }

    /**
     * @description Draws all elements of the boid on the canvas
     * @param {context} context 
     */
    draw(context) {
        this.drawBoid(context);
        if (debug_checkbox) {
            this.drawPerception(context);
            this.drawVelocity(context);
        }
    }

    get_weighted_perception() {
        return (PERCEPTION_WEIGHT / 100) * this.perception;
    }
    /**
     * @description Draws the boid on the canvas
     * @param {context} context 
     */
    drawBoid(context) {
        this.drawCircle(context, this.x, this.y, this.radius, this.colour, true);
    }

    /**
     * @description Draws the perception circle of the boid
     * @param {context} context 
     */
    drawPerception(context) {
        this.drawCircle(context, this.x, this.y, this.get_weighted_perception() + this.radius, "red", false);
    }
    /**
     * @description Draws the velocity vector of the boid
     * @param {context} context 
     */
    drawVelocity(context) {
        this.drawLine(context, this.x, this.y, this.x + (this.vx * 5), this.y + (this.vy * 5), "red");
    }

    drawLine(context, x1, y1, x2, y2, colour) {
        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2)
        context.strokeStyle = colour;
        context.stroke();
        context.closePath();
    }

    /**
     * @description draws a circle on the canvas
     * @param {context} context 
     * @param {float} x 
     * @param {float} y 
     * @param {int} radius 
     * @param {*} colour 
     * @param {boolean} fill 
     */
    drawCircle(context, x, y, radius, colour, fill) {
        context.strokeStyle = colour;
        context.lineWidth = 1;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.stroke();
        
        if (fill) {
            context.fillStyle = colour;
            context.fill();
        }
        if (fill && glow_checkbox) {
            context.lineWidth = 0;
            context.shadowColor = colour;
            context.shadowBlur = this.count;
            context.stroke();
            context.fill();
        }else{
            context.lineWidth = 0;
            context.shadowColor = 0;
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }
        context.closePath();
    }

    /**
     * 
     * @param {Boid} other_boid 
     * @returns {float} distance between this boid and the other boid
     */
    distanceFrom(other_boid) {
        return Math.sqrt((this.x - other_boid.x) ** 2 + (this.y - other_boid.y) ** 2)
    }

    /**
     * @description limits speed to the speed limit
     */
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

        // console.log(
        //     "vx- ",this.vx,
        //     "\nvy- ",this.vy,
        //     "ax- ",this.ax,
        //     "\nax- ",this.ax
        // );

    }
    /**
     * @description applies the acceleration to the velocity
     */
    accelerate() {
        this.vx += this.ax;
        this.vy += this.ay;
    }
    /**
     * @description boids avoid the walls
     */
    wallAvoidance() {
        if (this.x <= WALL_AVOID) {
            this.ax += (((WALL_AVOID - this.x) / WALL_AVOID) * SPEED_LIMIT) * MAX_FORCE;
        }
        if (this.x >= WIDTH - WALL_AVOID) {
            this.ax -= ((this.x / (WIDTH - WALL_AVOID)) * SPEED_LIMIT) * MAX_FORCE;
        }

        if (this.y <= WALL_AVOID) {
            this.ay += (((WALL_AVOID - this.y) / WALL_AVOID) * SPEED_LIMIT) * MAX_FORCE;
        }
        if (this.y >= HEIGHT - WALL_AVOID) {
            this.ax -= ((this.x / (HEIGHT - WALL_AVOID)) * SPEED_LIMIT) * MAX_FORCE;
        }
    }
    /**
     * @description boids bounce off the walls
     */
    wallBounce() {
        // BOUNCE
        if (this.x <= 0) {
            this.vx *= -1;
            this.x += this.vx;

        }
        if (this.x >= WIDTH) {
            this.vx *= -1;
            this.x += this.vx;
        }
        if (this.y <= 1) {
            this.vy *= -1;
            this.y += this.vy;

        }
        if (this.y >= HEIGHT) {
            this.vy *= -1;
            this.y += this.vy;

        }
        // console.log("ax- ",this.ax,"\n ay- ",this.ay);
    }

    /**
     * @description loop the boid around the screen
     */
    loopMap() {
        // loop if boid goes of the edge of the screen
        if (this.x > WIDTH - 1) {
            this.x = -1
        } else if (this.x < 1) {
            this.x = WIDTH
        } else if (this.y > HEIGHT - 1) {
            this.y = -1
        } else if (this.y < 1) {
            this.y = HEIGHT
        }
    }

    /**
     * @description flocking algorithm
     */
    flock() {
        let perception_from_center = this.get_weighted_perception() + this.radius;

        let sum_vx = 0;
        let sum_vy = 0;

        let sum_x = 0;
        let sum_y = 0;

        let sum_cx = 0;
        let sum_cy = 0;

        let count = 0;
        this.count = 0

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
                let diff_x = other_boid.x - this.x;
                let diff_y = other_boid.y - this.y;
                sum_cx += diff_x / distance;
                sum_cy += diff_y / distance;

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
            if (this.colour == "white") {
                // Set random colour
                this.colour = " #" + Math.floor(Math.random() * 16777215).toString(16);
            }
            // calculate average velocity
            let avg_vx = sum_vx / count;
            let avg_vy = sum_vy / count;

            // Calculate average position
            let avg_x = sum_x / count;
            let avg_y = sum_y / count;


            let avg_cx = sum_cx / count;
            let avg_cy = sum_cy / count;

            // // Rule 1: Alignment - Steer towards the average heading of local boids
            let alignment_force = 0.1 * (ALIGNMENT_WEIGHT / 100);
            this.ax += (avg_vx - this.vx) * alignment_force;
            this.ay += (avg_vy - this.vy) * alignment_force;

            // Rule 2: Cohesion - Move towards the average position of local boids
            let cohesion_force = 0.1 * (COHESION_WEIGHT / 100);
            this.ax += (avg_x - this.x) * cohesion_force;
            this.ay += (avg_y - this.y) * cohesion_force;

            // Rule 3: Separation - Avoid crowding
            let separation_force = 10 * (SEPARATION_WEIGHT / 100);
            this.ax -= avg_cx * separation_force;
            this.ay -= avg_cy * separation_force;
        }
    }
    /**
     * @description Updates the boid position, velocity and acceleration
     */
    update() {
        this.ax = 0;
        this.ay = 0;

        this.flock();
        this.accelerate();
        this.limitSpeed();

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        if (bounce_checkbox) {
            this.wallBounce();
        } else {
            this.loopMap();
        }

        this.draw(context);
    }
}

const settings = {
    WIN_WIDTH: 500,
    WIN_HEIGHT: 550,

    BIRD_WIDTH: 20,
    BIRD_HEIGHT: 20,
    BIRD_INIT_X: 200,
    BIRD_INIT_y: 350,

    BIRD_VELOCITY: -2,

    GRAVITY: 1,

    PIPE_WIDTH: 30,
    PIPE_GAP: 100,
    PIPE_VELOCITY: 4,

    POP_SIZE: 100,
    MAX_GEN: 100,
    MAX_FITNESS: 1000,

    FPS: 30,

    MAX_SCORE: 20,

    BG_IMG_PATH: "./assets/background-day.png",
    BASE_IMG_PATH: "./assets/base.png",

    PIPE_TOP_IMG_PATH: "./assets/pipe-top-green.png",
    PIPE_BOTTOM_IMG_PATH: "./assets/pipe-bottom-green.png",

    BIRD_UPFLAP_IMG_PATH: "./assets/bluebird-upflap.png",
    BIRD_MIDFLAP_IMG_PATH: "./assets/bluebird-midflap.png",
    BIRD_DOWN_IMG_PATH: "./assets/bluebird-downflap.png"
}


class Util {

    static images = {}

    static async loadAssets() {

        const bg_image = new Image()
        bg_image.src=settings.BG_IMG_PATH
        Util.images["bg"] = bg_image

        
        const base_image = new Image()
        base_image.src=settings.BASE_IMG_PATH
        Util.images["base"] = base_image
        
        const pipe_top_image = new Image()
        pipe_top_image.src=settings.PIPE_TOP_IMG_PATH
        Util.images["pipe_top"] = pipe_top_image
        
        
        const pipe_btm_image = new Image()
        pipe_btm_image.src=settings.PIPE_BOTTOM_IMG_PATH
        Util.images["pipe_btm"] = pipe_btm_image

        Util.images["bird"] = []

        const bird_up_image = new Image()
        bird_up_image.src=settings.BIRD_UPFLAP_IMG_PATH
        Util.images.bird.push(bird_up_image)

        
        const bird_mid_image = new Image()
        bird_mid_image.src=settings.BIRD_MIDFLAP_IMG_PATH
        Util.images.bird.push(bird_mid_image)
        
        const bird_down_image = new Image()
        bird_down_image.src=settings.BIRD_DOWN_IMG_PATH
        Util.images.bird.push(bird_down_image)
    }

    static draw_window(ctx, birds, pipes, score, highest_score, gen, fromWatcher) {

        //background
        ctx.drawImage(Util.images.bg, 0, 0, settings.WIN_WIDTH, settings.WIN_HEIGHT)

        //base
        ctx.drawImage(Util.images.base, 0, settings.WIN_HEIGHT * 0.85, settings.WIN_WIDTH, settings.WIN_HEIGHT * 0.15)

        birds.map(bird => bird.draw(ctx))

        pipes.map(pipe => pipe.draw(ctx))

        ctx.fillStyle = "#fff"
        ctx.font = "24px Arial"
        ctx.fillText(`Score: ${score}`, 350, 30)
        if(!fromWatcher) {
            ctx.fillText(`Highest Score: ${highest_score}`, 10, 30)
            ctx.fillText(`Gen: ${gen}`, 10, 50)
            ctx.fillText(`Birds Alive: ${birds.length}`, 10, 70)
        }
    }

    static async tick(fps) {
        return new Promise(resolve => setTimeout(resolve, 1000/fps))
    }

    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

}


class Bird {
    constructor(x, y) {
        this.x = x
        this.y = y

        this.tick = 0
        this.img_ind = 0
    }

    draw(ctx) {
        ctx.drawImage(Util.images.bird[this.img_ind], this.x, this.y, settings.BIRD_WIDTH, settings.BIRD_HEIGHT)
    }

    jump() {
        this.tick = 0
        this.img_ind = (this.img_ind + 1) % 3

    }

    move() {

        this.tick += 1

        let disp = settings.BIRD_VELOCITY * this.tick + 0.5 * settings.GRAVITY * this.tick*this.tick

        if(disp > 10) {
            disp = 10
        }

        if(disp < 0) {
            disp = -2
        }

        this.y += disp

    }
}

class Pipe{
    constructor(x) {
        this.x = x
        this.y = Util.getRandomNumber(50, settings.WIN_HEIGHT * 0.85 - settings.PIPE_GAP - 50)

        this.passed = false
    }


    draw(ctx) {
        //top pipe
        ctx.drawImage(Util.images.pipe_top, this.x, 0, settings.PIPE_WIDTH, this.y)

        //bottom pipe
        ctx.drawImage(Util.images.pipe_btm, this.x, this.y + settings.PIPE_GAP, settings.PIPE_WIDTH, settings.WIN_HEIGHT * 0.85 - this.y - settings.PIPE_GAP)
    }

    move() {
        this.x -= settings.PIPE_VELOCITY
    }

    collide(bird) {
        if(bird.x + settings.BIRD_WIDTH > this.x && bird.x < this.x + settings.PIPE_WIDTH && (bird.y < this.y || (bird.y + settings.BIRD_HEIGHT) > (this.y + settings.PIPE_GAP)))  {
            return true
        }
        return false
    }
}




let gen = 0
let highest_score = 0

async function run_neat(ctx) {

    const config = new NEATJavaScript.Config({
        inputSize: 3,
        outputSize: 1,
        populationSize: settings.POP_SIZE,
        generations: settings.MAX_GEN,
        targetFitness: settings.MAX_FITNESS
    })

    const population = new NEATJavaScript.Population(config)

    const best_genome = await eval_genome(population, ctx)

    localStorage.setItem("best_genome", best_genome.toJSON())
    alert("AI trained and best genome saved, You can run with ai now")
    
}

async function eval_genome(population, ctx) {
    const genomes = population.genomes
    gen++

    let birds = []
    let ges = []

    let pipes = []
    pipes.push(new Pipe(settings.WIN_WIDTH))

    for(let i = 0; i<genomes.length; i++) {
        birds.push(new Bird(settings.BIRD_INIT_X, settings.BIRD_INIT_y))
        genomes[i].fitness = 0
        ges.push(genomes[i])
    }

    let run = true
    let score = 0

    while(run && birds.length > 0) {
        let pipe_ind = 0

        if(pipes.length > 1 && birds[0].x > pipes[0].x + settings.PIPE_WIDTH) {
            pipe_ind = 1
        }

        for(let i=0; i<birds.length; i++) {
            const inputs = [
                birds[i].y,
                Math.abs(pipes[pipe_ind].y - birds[i].y),
                Math.abs(pipes[pipe_ind].y + settings.PIPE_GAP - birds[i].y)
            ]

            const output = ges[i].propagate(inputs)[0]

            if(output > 0.5) {
                birds[i].jump()
            }

            birds[i].move()
            ges[i].fitness += 0.1
        }

        let add_pipe = false
        let rem_pipes = []

        let rem_birds = []
        let rem_ges = []

        for(let i = 0; i<pipes.length; i++) {
            for(let j = 0; j<birds.length; j++) {
                if(!pipes[i].passed && pipes[i].x < birds[j].x) {
                    add_pipe = true
                    pipes[i].passed = true

                    score += 1
                    if(score > highest_score) {
                        highest_score = score
                    }

                    for(let b = 0; b<birds.length; b++) {
                        ges[b].fitness += 5
                    }

                    if(score >= settings.MAX_SCORE) {
                        run = false
                        ges[j].fitness += settings.MAX_FITNESS
                    }
                }

                if(pipes[i].collide(birds[j])) {
                    ges[j].fitness -= 1
                    rem_birds.push(birds[j])
                    rem_ges.push(ges[j])
                }
            }
            pipes[i].move()

            if(pipes[i].x <0) {
                rem_pipes.push(pipes[i])
            }
        }

        if(add_pipe) {
            pipes.push(new Pipe(settings.WIN_WIDTH))
        }

        for(let i = 0; i < rem_pipes.length; i++) {
            const pipe_idx = pipes.indexOf(rem_pipes[i])
            if(pipe_idx > -1) {
                pipes.splice(pipe_idx, 1)
            }
        }

        for(let i = 0; i<birds.length; i++) {
            if(birds[i].y  < 0 || birds[i].y > settings.WIN_HEIGHT * 0.85) {
                rem_birds.push(birds[i])
                rem_ges.push(ges[i])
            }
        }

        for(let i = 0; i < rem_birds.length; i++) {
            const bird_idx = birds.indexOf(rem_birds[i])
            if(bird_idx > -1) {
                birds.splice(bird_idx, 1)
            }
        }

        for(let i = 0; i < rem_ges.length; i++) {
            const ge_idx = ges.indexOf(rem_ges[i])
            if(ge_idx > -1) {
                ges.splice(ge_idx, 1)
            }
        }

        Util.draw_window(ctx, birds, pipes, score, highest_score, gen, false)
        await Util.tick(settings.FPS)

    }

    if(gen > settings.MAX_GEN || max_fitness_reached(ges)) {
        return population.getBestGenome()
    }


    population.evolve()
    return eval_genome(population, ctx)

    
}

function max_fitness_reached(ges) {
    for(let i = 0; i< ges.length; i++) {
        if(ges[i].fitness > settings.MAX_FITNESS) {
            return true
        }
    }
    return false
}


async function play_with_ai(ctx) {

    const best_genome = localStorage.getItem("best_genome")

    if(best_genome) {
        const config = new NEATJavaScript.Config({
            inputSize: 3,
            outputSize: 1,
            populationSize: settings.POP_SIZE,
            generations: settings.MAX_GEN,
            targetFitness: settings.MAX_FITNESS
        })

        await play(config, best_genome, ctx)
    }
    else {
        alert("No genome found, please train the ai")
    }
}

async function play(config, best_genome, ctx) {
    let aiGenome = NEATJavaScript.GenomeBuilder.loadGenome(best_genome, config)

    let pipes = []
    pipes.push(new Pipe(settings.WIN_WIDTH))

    let birds = []
    let bird = new Bird(settings.BIRD_INIT_X, settings.BIRD_INIT_y)
    birds.push(bird)

    let run = true
    let score = 0

    while (run) {
        aiGenome.fitness += 0.1

        let pipe_ind = 0

        if(pipes.length > 1 && bird.x > pipes[0].x + settings.PIPE_WIDTH) {
            pipe_ind = 1
        }

        const inputs = [
            bird.y,
            Math.abs(pipes[pipe_ind].y - bird.y),
            Math.abs(pipes[pipe_ind].y + settings.PIPE_GAP - bird.y)
        ]

        const output = aiGenome.propagate(inputs)[0]

        if(output > 0.5) {
            bird.jump()
        }

        bird.move()

        let add_pipe = false
        let rem_pipes = []

        for(let i = 0; i<pipes.length; i++) {
            if(!pipes[i].passed && pipes[i].x < bird.x) {
                add_pipe = true
                pipes[i].passed = true

                score += 1
                aiGenome.fitness += 5
            }

            if(pipes[i].collide(bird)) {
               run = false
            }
        
            pipes[i].move()

            if(pipes[i].x <0) {
                rem_pipes.push(pipes[i])
            }
        }

        if(add_pipe) {
            pipes.push(new Pipe(settings.WIN_WIDTH))
        }

        for(let i = 0; i < rem_pipes.length; i++) {
            const pipe_idx = pipes.indexOf(rem_pipes[i])
            if(pipe_idx > -1) {
                pipes.splice(pipe_idx, 1)
            }
        }

        if(bird.y  < 0 || bird.y > settings.WIN_HEIGHT * 0.85) {
            run = false
        }

        
        Util.draw_window(ctx, birds, pipes, score, 0, 0, true)
        await Util.tick(settings.FPS)

    }
}

async function play_game(ctx) {

	console.log("play"  + " - " + jump_bird)
	let pipes = []
    pipes.push(new Pipe(settings.WIN_WIDTH))

    let birds = []
    let bird = new Bird(settings.BIRD_INIT_X, settings.BIRD_INIT_y)
    birds.push(bird)

    let run = true
    let score = 0

    while (run) {
		console.log(jump_bird)
		

        let pipe_ind = 0

        if(pipes.length > 1 && bird.x > pipes[0].x + settings.PIPE_WIDTH) {
            pipe_ind = 1
        }

        if(jump_bird) {
            bird.jump()
        }

        bird.move()

        let add_pipe = false
        let rem_pipes = []

        for(let i = 0; i<pipes.length; i++) {
            if(!pipes[i].passed && pipes[i].x < bird.x) {
                add_pipe = true
                pipes[i].passed = true

                score += 1
            }

            if(pipes[i].collide(bird)) {
               run = false
            }
        
            pipes[i].move()

            if(pipes[i].x <0) {
                rem_pipes.push(pipes[i])
            }
        }

        if(add_pipe) {
            pipes.push(new Pipe(settings.WIN_WIDTH))
        }

        for(let i = 0; i < rem_pipes.length; i++) {
            const pipe_idx = pipes.indexOf(rem_pipes[i])
            if(pipe_idx > -1) {
                pipes.splice(pipe_idx, 1)
            }
        }

        if(bird.y  < 0 || bird.y > settings.WIN_HEIGHT * 0.85) {
            run = false
        }

        
        Util.draw_window(ctx, birds, pipes, score, 0, 0, true)
        await Util.tick(settings.FPS)

    }
}


let	jump_bird = false

window.onload = async function() {
	document.getElementById("play-urself").addEventListener("click", play_yourself, { once: true })
	document.getElementById("train-ai-btn").addEventListener("click", train_ai)
	document.getElementById("run-ai-btn").addEventListener("click", run_with_ai)

	await Util.loadAssets()
	
	document.addEventListener("keydown", function(event) {
		if(event.code === "Space") {
			jump_bird = true			
		}
	})

	document.addEventListener("keyup", function(event) {
		if(event.code === "Space") {
			jump_bird = false
		}
	})


	document.addEventListener("touchstart", function(event) {
		jump_bird = true		
	})

	document.addEventListener("touchend", function(event) {
		jump_bird = false
	})
	

	const canvas = document.getElementById("canvas")
	canvas.width = settings.WIN_WIDTH
	canvas.height = settings.WIN_HEIGHT
	const ctx = canvas.getContext("2d")

}

function play_yourself() {
	console.log("play urself")
	canvas.width = settings.WIN_WIDTH
	canvas.height = settings.WIN_HEIGHT
	const ctx = canvas.getContext("2d")
	
	play_game(ctx, jump_bird)
}

function train_ai() {
const canvas = document.getElementById("canvas")
canvas.width = settings.WIN_WIDTH
canvas.height = settings.WIN_HEIGHT
const ctx = canvas.getContext("2d")

    run_neat(ctx)
}


function run_with_ai() {
const canvas = document.getElementById("canvas")
canvas.width = settings.WIN_WIDTH
canvas.height = settings.WIN_HEIGHT
const ctx = canvas.getContext("2d")

    play_with_ai(ctx)
}
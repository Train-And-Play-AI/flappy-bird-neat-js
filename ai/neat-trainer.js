import { Bird } from "../game/bird.js"
import { Pipe } from "../game/pipe.js"
import { settings } from "../settings.js"
import { Util } from "../utils.js"


const canvas = document.getElementById("canvas")
canvas.width = settings.WIN_WIDTH
canvas.height = settings.WIN_HEIGHT
const ctx = canvas.getContext("2d")

let gen = 0
let highest_score = 0

export async function run_neat() {

    const config = new NEATJavaScript.Config({
        inputSize: 3,
        outputSize: 1,
        populationSize: settings.POP_SIZE,
        generations: settings.MAX_GEN,
        targetFitness: settings.MAX_FITNESS
    })

    const population = new NEATJavaScript.Population(config)

    const best_genome = await eval_genome(population)

    localStorage.setItem("best_genome", best_genome.toJSON())
    
}

async function eval_genome(population) {
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

                    if(score > settings.MAX_SCORE) {
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
    return eval_genome(population)

    
}

function max_fitness_reached(ges) {
    for(let i = 0; i< ges.length; i++) {
        if(ges[i].fitness > settings.MAX_FITNESS) {
            return true
        }
    }
    return false
}
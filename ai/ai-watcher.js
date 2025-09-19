import { Bird } from "../game/bird.js"
import { Pipe } from "../game/pipe.js"
import { settings } from "../settings.js"
import { Util } from "../utils.js"

const canvas = document.getElementById("canvas")
canvas.width = settings.WIN_WIDTH
canvas.height = settings.WIN_HEIGHT
const ctx = canvas.getContext("2d")

export async function play_with_ai() {

    const best_genome = localStorage.getItem("best_genome")

    if(best_genome) {
        const config = new NEATJavaScript.Config({
            inputSize: 3,
            outputSize: 1,
            populationSize: settings.POP_SIZE,
            generations: settings.MAX_GEN,
            targetFitness: settings.MAX_FITNESS
        })

        await play(config, best_genome)
    }
    else {
        alert("No genome found, please train the ai")
    }
}

async function play(config, best_genome) {
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

                if(score > settings.MAX_SCORE) {
                    run = false
                    aiGenome.fitness += settings.MAX_FITNESS
                }
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
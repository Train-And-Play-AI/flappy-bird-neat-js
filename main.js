import { play_with_ai } from "./ai/ai-watcher.js"
import { run_neat } from "./ai/neat-trainer.js"
import { Bird } from "./game/bird.js"
import { Pipe } from "./game/pipe.js"
import {settings} from "./settings.js"
import { Util } from "./utils.js"

document.getElementById("train-ai-btn").addEventListener("click", train_ai)
document.getElementById("run-ai-btn").addEventListener("click", run_with_ai)

await Util.loadAssets()

function train_ai() {
    run_neat()
}


function run_with_ai() {
    play_with_ai()
}
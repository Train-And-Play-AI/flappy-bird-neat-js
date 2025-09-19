import { settings } from "../settings.js"
import { Util } from "../utils.js"

export class Pipe{
    constructor(x) {
        this.x = x
        this.y = Util.getRandomNumber(100, settings.WIN_HEIGHT * 0.85 - settings.PIPE_GAP - 100)

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
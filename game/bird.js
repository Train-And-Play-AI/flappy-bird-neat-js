import { settings } from "../settings.js"
import { Util } from "../utils.js"

export class Bird {
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

        console.log("disp=" + disp)
        this.y += disp

    }
}
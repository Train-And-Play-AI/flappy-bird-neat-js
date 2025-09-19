import { settings } from "./settings.js"

export class Util {

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
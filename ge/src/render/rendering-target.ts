import { RenderingCore } from "./core.js"

export interface IRenderingTarget {
    get width(): number
    get height(): number
    activate(): void
    clear(color:[number,number,number,number], depth: number): void
}

export class DefaultRenderingTarget implements IRenderingTarget {
    
    /** @internal */ _core: RenderingCore
    /** @internal */ _canvas: HTMLCanvasElement

    constructor(core: RenderingCore) {
        this._core = core
        this._canvas = this._core._canvas
    }

    get width(): number { return this._canvas.width }

    get height(): number { return this._canvas.height }

    activate(): void {
        const ctx = this._core._context
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
        this._core._current_target = this
    }

    clear(color:[number,number,number,number], depth: number) {
        const ctx = this._core._context
        ctx.clearColor(...color)
        ctx.clearDepth(depth)
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT)
    }
}
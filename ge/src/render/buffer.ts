import { RenderingCore } from './core.js'
import { RenderingResource } from './resource.js'

export class RenderingBuffer extends RenderingResource {
    /** @internal */ _buffer: WebGLBuffer | null
    /** @internal */ _symbol: symbol

    constructor(core: RenderingCore) {
        super(core)
        this._buffer = null
        this._symbol = Symbol()
    }
}
import { RenderingDevice } from "./device.js"
import { RenderBuffer } from "./buffer.js"

/**
 * 渲染索引缓冲对象
 */
export class IndexBuffer extends RenderBuffer {
    constructor(device: RenderingDevice, data: ArrayBuffer) {
        super(device, WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW)
    }

    // 激活索引缓冲对象
    activate(){
        const ctx = this._device._ctx
        ctx.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this._buffer)
    }

    get count() { return typeof this._data === 'number' ? this._data : this._data.byteLength / 2 }
}

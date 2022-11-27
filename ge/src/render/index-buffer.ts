import { RenderDevice } from "./device.js"
import { RenderBuffer } from "./buffer.js"

/**
 * 渲染索引缓冲对象
 */
export class IndexBuffer extends RenderBuffer {
    constructor(device: RenderDevice, data: ArrayBuffer) {
        super(device, WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW)
    }

    // 激活索引缓冲对象
    activate(){
        const ctx = this.___device.___ctx
        ctx.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.___buffer)
    }
}

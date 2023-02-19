import { RenderingCore } from "./core.js"
import { RenderingBuffer } from "./buffer.js"

class StaticBuffer extends RenderingBuffer {
    
    /** @internal */ _data: ArrayBuffer
    /** @internal */ _type: number
    
    constructor(core: RenderingCore, type:number, data: ArrayBuffer) {
        super(core)
        this._data = data
        this._type = type
        this._onDeviceRestored()
    }

    // 内部方法，设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        this._buffer = this._core._context.createBuffer()
        this._core._context.bindBuffer(this._type, this._buffer)
        this._core._context.bufferData(this._type, this._data, this._core._context.STATIC_DRAW)
    }

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {
        this._core._context.deleteBuffer(this._buffer)
        this._buffer = null
    }
}

export { StaticBuffer }
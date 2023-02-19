import { RenderingDevice } from "./device.js"
import { RenderingResource } from "./resource.js"

/**
 * 渲染缓冲对象，用于存储渲染数据。
 * 渲染缓冲对象负责存储并维护设备相关的缓冲对象，具体的使用由子类实现。
 */
export class RenderBuffer extends RenderingResource {
    /** @internal */ _buffer: WebGLBuffer | null          // WebGL 缓冲对象
    /** @internal */ _target: number                      // 缓冲对象类型
    /** @internal */ _data: number | ArrayBuffer          // 缓冲对象数据或大小
    /** @internal */ _usage: number                       // 缓冲对象使用方式

    constructor(device: RenderingDevice, target: number, data: number | ArrayBuffer, usage: number) {
        super(device)
        this._buffer = null
        this._target = target
        this._data = data
        this._usage = usage
        this._onDeviceRestored()
    }

    // 获取 Buffer 是否就绪
    get ready(): boolean { return this._buffer != null }

    // 绑定
    bind() {
        if (this._buffer != null) {
            this.device.context.bindBuffer(this._target, this._buffer)
        }
    }

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {
        if(this._buffer){
            const ctx = this._device._ctx
            ctx.deleteBuffer(this._buffer)
            this._buffer = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        if(!this._buffer){
            const ctx = this._device._ctx
            this._buffer = ctx.createBuffer()
            if(this._buffer){
                ctx.bindBuffer(this._target, this._buffer)
                if(typeof this._data === 'number'){
                    ctx.bufferData(this._target, this._data as number, this._usage)
                }else{
                    ctx.bufferData(this._target, this._data as ArrayBuffer, this._usage)
                }
                ctx.bindBuffer(this._target, null)
            }
        }
    }
}
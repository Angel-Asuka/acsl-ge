import { RenderDevice } from "./device.js"
import { RenderResource } from "./resource.js"

/**
 * 渲染缓冲对象，用于存储渲染数据。
 * 渲染缓冲对象负责存储并维护设备相关的缓冲对象，具体的使用由子类实现。
 */
export class RenderBuffer extends RenderResource {
    /** @internal */ ___buffer: WebGLBuffer | null          // WebGL 缓冲对象
    /** @internal */ ___target: number                      // 缓冲对象类型
    /** @internal */ ___data: number | ArrayBuffer          // 缓冲对象数据或大小
    /** @internal */ ___usage: number                       // 缓冲对象使用方式

    constructor(device: RenderDevice, target: number, data: number | ArrayBuffer, usage: number) {
        super(device)
        this.___buffer = null
        this.___target = target
        this.___data = data
        this.___usage = usage
        this.___onDeviceRestored()
    }

    // 获取 Buffer 是否就绪
    get ready(): boolean { return this.___buffer != null }

    // 绑定
    bind() {
        if (this.___buffer != null) {
            this.device.context.bindBuffer(this.___target, this.___buffer)
        }
    }

    // 内部方法，设备丢失时调用
    /** @internal */ ___onDeviceLost() {
        if(this.___buffer){
            const ctx = this.___device.___ctx
            ctx.deleteBuffer(this.___buffer)
            this.___buffer = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ ___onDeviceRestored() {
        if(!this.___buffer){
            const ctx = this.___device.___ctx
            this.___buffer = ctx.createBuffer()
            if(this.___buffer){
                ctx.bindBuffer(this.___target, this.___buffer)
                if(typeof this.___data === 'number'){
                    ctx.bufferData(this.___target, this.___data as number, this.___usage)
                }else{
                    ctx.bufferData(this.___target, this.___data as ArrayBuffer, this.___usage)
                }
                ctx.bindBuffer(this.___target, null)
            }
        }
    }
}
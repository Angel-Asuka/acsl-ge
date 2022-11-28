import { RenderingResource } from "./resource.js"
import { RenderingDevice } from "./device.js"

export class Shader extends RenderingResource {

    /** @internal */ _shader: WebGLShader | null       // WebGL 着色器对象
    /** @internal */ _type: number                     // 着色器类型
    /** @internal */ _source: string                   // 着色器源码
    /** @internal */ _last_err: string                 // 最后一次编译错误信息

    constructor(device: RenderingDevice, type: number, source: string) {
        super(device)
        this._shader = null
        this._type = type
        this._source = source
        this._last_err = ''
        this._onDeviceRestored()
    }

    // 获取 Shader 是否就绪
    get ready(): boolean { return this._shader != null }

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {
        if(this._shader){
            const ctx = this._device._ctx
            ctx.deleteShader(this._shader)
            this._shader = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        if(!this._shader){
            const ctx = this._device._ctx
            this._shader = ctx.createShader(this._type)
            if(this._shader){
                ctx.shaderSource(this._shader, this._source)
                ctx.compileShader(this._shader)
                if (!ctx.getShaderParameter(this._shader, ctx.COMPILE_STATUS)) {
                    this._last_err = ctx.getShaderInfoLog(this._shader) || ''
                    ctx.deleteShader(this._shader)
                    this._shader = null
                }
            }
        }
    }
}
import { RenderResource } from "./resource.js"
import { RenderDevice } from "./device.js"

export class Shader extends RenderResource {

    /** @internal */ ___shader: WebGLShader | null       // WebGL 着色器对象
    /** @internal */ ___type: number                     // 着色器类型
    /** @internal */ ___source: string                   // 着色器源码
    /** @internal */ ___last_err: string                 // 最后一次编译错误信息

    constructor(device: RenderDevice, type: number, source: string) {
        super(device)
        this.___shader = null
        this.___type = type
        this.___source = source
        this.___last_err = ''
        this.___onDeviceRestored()
    }

    // 获取 Shader 是否就绪
    get ready(): boolean { return this.___shader != null }

    // 内部方法，设备丢失时调用
    /** @internal */ ___onDeviceLost() {
        if(this.___shader){
            const ctx = this.___device.___ctx
            ctx.deleteShader(this.___shader)
            this.___shader = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ ___onDeviceRestored() {
        if(!this.___shader){
            const ctx = this.___device.___ctx
            this.___shader = ctx.createShader(this.___type)
            if(this.___shader){
                ctx.shaderSource(this.___shader, this.___source)
                ctx.compileShader(this.___shader)
                if (!ctx.getShaderParameter(this.___shader, ctx.COMPILE_STATUS)) {
                    this.___last_err = ctx.getShaderInfoLog(this.___shader) || ''
                    ctx.deleteShader(this.___shader)
                    this.___shader = null
                }
            }
        }
    }
}
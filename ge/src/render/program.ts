import { RenderDevice } from './device.js'
import { RenderResource } from './resource.js'
import { VertexAttributeUsage } from './vertex-buffer.js'

const DefaultAttributeUsageMap = {
    a_pos: VertexAttributeUsage.POSITION,
    a_normal: VertexAttributeUsage.NORMAL,
    a_tangent: VertexAttributeUsage.TANGENT,
    a_color: VertexAttributeUsage.COLOR,
    a_uv0: VertexAttributeUsage.TEXCOORD_0,
    a_uv1: VertexAttributeUsage.TEXCOORD_1,
    a_uv2: VertexAttributeUsage.TEXCOORD_2,
    a_uv3: VertexAttributeUsage.TEXCOORD_3,
    a_uv4: VertexAttributeUsage.TEXCOORD_4,
    a_uv5: VertexAttributeUsage.TEXCOORD_5,
    a_uv6: VertexAttributeUsage.TEXCOORD_6,
    a_uv7: VertexAttributeUsage.TEXCOORD_7,
    a_joints0: VertexAttributeUsage.JOINTS_0,
    a_weights0: VertexAttributeUsage.WEIGHTS_0,
    a_joints1: VertexAttributeUsage.JOINTS_1,
    a_weights1: VertexAttributeUsage.WEIGHTS_1
}

/**
 * 渲染程序对象
 */
export class Program extends RenderResource {

    /** @internal */ ___program: WebGLProgram | null                                    // 渲染程序
    /** @internal */ ___vertex_shader: WebGLShader | null                               // 顶点着色器
    /** @internal */ ___fragment_shader: WebGLShader | null                             // 片段着色器
    /** @internal */ ___last_err: string                                                // 最后一次编译错误
    /** @internal */ ___uniforms: { [key: string]: WebGLUniformLocation | null }        // uniform 变量表
    /** @internal */ ___attributes: { [key: string]: number }                           // attribute 变量表
    /** @internal */ ___vertex_shader_source: string                                    // 顶点着色器源码
    /** @internal */ ___fragment_shader_source: string                                  // 片段着色器源码

    // attribute 映射表，下标对应 VertexAttributeUsage
    /** @internal */ ___attribute_usage: number[] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]

    // attribute 变量映射表, 键名为 attribute 变量名，值为 VertexAttributeUsage
    /** @internal */ ___attribute_usage_map: { [key: string]: VertexAttributeUsage } = DefaultAttributeUsageMap

    constructor(device: RenderDevice, vertex_shader: string, fragment_shader: string, attribute_usage_map?: { [key: string]: VertexAttributeUsage }) {
        super(device)
        this.___program = null
        this.___vertex_shader = null
        this.___fragment_shader = null
        this.___last_err = ''
        this.___uniforms = {}
        this.___attributes = {}
        this.___vertex_shader_source = vertex_shader
        this.___fragment_shader_source = fragment_shader
        if(attribute_usage_map){
            this.___attribute_usage_map = attribute_usage_map
        }
        this.___onDeviceRestored()
    }

    // 获取资源是否就绪，子类重写
    get ready(): boolean { return false }

    // 激活渲染程序
    activate() {
        const ctx = this.___device.___ctx
        ctx.useProgram(this.___program)
        this.___device.___current_program = this
    }

    // 获取uniform变量的位置
    getUniformLocation(name: string): WebGLUniformLocation | null {
        return this.___uniforms[name]
    }

    // 获取attribute变量的位置
    getAttributeLocation(name: string): number {
        return this.___attributes[name]
    }

    // 内部方法，编译着色器
    /** @internal */ ___compileShader(type: number, source: string): WebGLShader | null {
        const ctx = this.___device.___ctx
        const shader = ctx.createShader(type)
        if(shader){
            ctx.shaderSource(shader, source)
            ctx.compileShader(shader)
            if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
                this.___last_err = ctx.getShaderInfoLog(shader) || ''
                ctx.deleteShader(shader)
                return null
            }
        }
        return shader
    }

    // 内部方法，设备丢失时调用
    /** @internal */ ___onDeviceLost() {
        if(this.___program){
            this.___device.___ctx.deleteProgram(this.___program)
            this.___program = null
        }
        if(this.___vertex_shader){
            this.___device.___ctx.deleteShader(this.___vertex_shader)
            this.___vertex_shader = null
        }
        if(this.___fragment_shader){
            this.___device.___ctx.deleteShader(this.___fragment_shader)
            this.___fragment_shader = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ ___onDeviceRestored() {
        if(!this.___program){
            const ctx = this.___device.___ctx
            this.___program = ctx.createProgram()
            if(this.___program){
                this.___vertex_shader = this.___compileShader(ctx.VERTEX_SHADER, this.___vertex_shader_source)
                this.___fragment_shader = this.___compileShader(ctx.FRAGMENT_SHADER, this.___fragment_shader_source)
                if(this.___vertex_shader && this.___fragment_shader){
                    ctx.attachShader(this.___program, this.___vertex_shader)
                    ctx.attachShader(this.___program, this.___fragment_shader)
                    ctx.linkProgram(this.___program)
                    if(ctx.getProgramParameter(this.___program, ctx.LINK_STATUS))
                    {
                        const count = ctx.getProgramParameter(this.___program, ctx.ACTIVE_UNIFORMS)
                        for(let i = 0; i < count; i++){
                            const info = ctx.getActiveUniform(this.___program, i)
                            if(info){
                                this.___uniforms[info.name] = ctx.getUniformLocation(this.___program, info.name)
                            }
                        }
                        const count2 = ctx.getProgramParameter(this.___program, ctx.ACTIVE_ATTRIBUTES)
                        for(let i = 0; i < count2; i++){
                            const info = ctx.getActiveAttrib(this.___program, i)
                            if(info){
                                this.___attributes[info.name] = ctx.getAttribLocation(this.___program, info.name)
                                if(this.___attribute_usage_map[info.name] !== undefined){
                                    this.___attribute_usage[this.___attribute_usage_map[info.name]] = this.___attributes[info.name]
                                }
                            }
                        }
                        return
                    }
                    this.___last_err = ctx.getProgramInfoLog(this.___program) || ''
                }
            }
            this.___onDeviceLost()
        }
    }
}
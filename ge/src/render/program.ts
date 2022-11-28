import { RenderingDevice } from './device.js'
import { RenderingResource } from './resource.js'
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
export class Program extends RenderingResource {

    /** @internal */ _program: WebGLProgram | null                                    // 渲染程序
    /** @internal */ _vertex_shader: WebGLShader | null                               // 顶点着色器
    /** @internal */ _fragment_shader: WebGLShader | null                             // 片段着色器
    /** @internal */ _last_err: string                                                // 最后一次编译错误
    /** @internal */ _uniforms: { [key: string]: WebGLUniformLocation | null }        // uniform 变量表
    /** @internal */ _attributes: { [key: string]: number }                           // attribute 变量表
    /** @internal */ _vertex_shader_source: string                                    // 顶点着色器源码
    /** @internal */ _fragment_shader_source: string                                  // 片段着色器源码

    // attribute 映射表，下标对应 VertexAttributeUsage
    /** @internal */ _attribute_usage: number[] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]

    // attribute 变量映射表, 键名为 attribute 变量名，值为 VertexAttributeUsage
    /** @internal */ _attribute_usage_map: { [key: string]: VertexAttributeUsage } = DefaultAttributeUsageMap

    constructor(device: RenderingDevice, vertex_shader: string, fragment_shader: string, attribute_usage_map?: { [key: string]: VertexAttributeUsage }) {
        super(device)
        this._program = null
        this._vertex_shader = null
        this._fragment_shader = null
        this._last_err = ''
        this._uniforms = {}
        this._attributes = {}
        this._vertex_shader_source = vertex_shader
        this._fragment_shader_source = fragment_shader
        if(attribute_usage_map){
            this._attribute_usage_map = attribute_usage_map
        }
        this._onDeviceRestored()
    }

    // 获取资源是否就绪，子类重写
    get ready(): boolean { return false }

    // 激活渲染程序
    activate() {
        const ctx = this._device._ctx
        ctx.useProgram(this._program)
        this._device._current_program = this
    }

    // 获取uniform变量的位置
    getUniformLocation(name: string): WebGLUniformLocation | null {
        return this._uniforms[name]
    }

    // 获取attribute变量的位置
    getAttributeLocation(name: string): number {
        return this._attributes[name]
    }

    // 内部方法，编译着色器
    /** @internal */ _compileShader(type: number, source: string): WebGLShader | null {
        const ctx = this._device._ctx
        const shader = ctx.createShader(type)
        if(shader){
            ctx.shaderSource(shader, source)
            ctx.compileShader(shader)
            if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
                this._last_err = ctx.getShaderInfoLog(shader) || ''
                ctx.deleteShader(shader)
                return null
            }
        }
        return shader
    }

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {
        if(this._program){
            this._device._ctx.deleteProgram(this._program)
            this._program = null
        }
        if(this._vertex_shader){
            this._device._ctx.deleteShader(this._vertex_shader)
            this._vertex_shader = null
        }
        if(this._fragment_shader){
            this._device._ctx.deleteShader(this._fragment_shader)
            this._fragment_shader = null
        }
    }

    // 内部方法，设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        if(!this._program){
            const ctx = this._device._ctx
            this._program = ctx.createProgram()
            if(this._program){
                this._vertex_shader = this._compileShader(ctx.VERTEX_SHADER, this._vertex_shader_source)
                this._fragment_shader = this._compileShader(ctx.FRAGMENT_SHADER, this._fragment_shader_source)
                if(this._vertex_shader && this._fragment_shader){
                    ctx.attachShader(this._program, this._vertex_shader)
                    ctx.attachShader(this._program, this._fragment_shader)
                    ctx.linkProgram(this._program)
                    if(ctx.getProgramParameter(this._program, ctx.LINK_STATUS))
                    {
                        const count = ctx.getProgramParameter(this._program, ctx.ACTIVE_UNIFORMS)
                        for(let i = 0; i < count; i++){
                            const info = ctx.getActiveUniform(this._program, i)
                            if(info){
                                this._uniforms[info.name] = ctx.getUniformLocation(this._program, info.name)
                            }
                        }
                        const count2 = ctx.getProgramParameter(this._program, ctx.ACTIVE_ATTRIBUTES)
                        for(let i = 0; i < count2; i++){
                            const info = ctx.getActiveAttrib(this._program, i)
                            if(info){
                                this._attributes[info.name] = ctx.getAttribLocation(this._program, info.name)
                                if(this._attribute_usage_map[info.name] !== undefined){
                                    this._attribute_usage[this._attribute_usage_map[info.name]] = this._attributes[info.name]
                                }
                            }
                        }
                        return
                    }
                    this._last_err = ctx.getProgramInfoLog(this._program) || ''
                }
            }
            this._onDeviceLost()
        }
    }
}
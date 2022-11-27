import { Shader } from './shader.js'
import { Program } from './program.js'
import { ImageTexture } from './image-texture.js'
import { RenderResource } from './resource.js'
import { VertexAttribute, VertexAttributeUsage, VertexBuffer } from './vertex-buffer.js'
import { IndexBuffer } from './index-buffer.js'

/** 渲染设备 */
export class RenderDevice {
    /** @internal */ ___ctx: WebGL2RenderingContext
    /** @internal */ ___resource_list: RenderResource[]
    /** @internal */ ___current_program: Program | null = null
    
    constructor(ctx: WebGL2RenderingContext){
        this.___ctx = ctx
        this.___resource_list = []
    }

    /**
     * 释放所有资源
     */
    destroy(){
        for(const res of this.___resource_list)
            res.___onResourceDestroyed()
        this.___resource_list.length = 0
        this.___current_program = null
    }

    /**
     * 构造一个着色器
     * @param source 着色器代码
     * @param type 着色器类型
     * @returns 返回一个新的着色器对象，成功与否应当检查返回值的 status 属性
     */
    createShader(source:string, type:GLenum): Shader {
        return new Shader(this, type, source)
    }

    /**
     * 构造一个顶点着色器
     * @param source 着色器代码
     * @returns 成功返回一个新的着色器对象，失败返回 null
     */
    createVertexShader(source:string){ return this.createShader(source, this.___ctx.VERTEX_SHADER) }

    /**
     * 构造一个片段着色器
     * @param source 着色器代码
     * @returns 成功返回一个新的着色器对象，失败返回 null
     */
    createFragmentShader(source:string){ return this.createShader(source, this.___ctx.FRAGMENT_SHADER) }

    /**
     * 构造一个着色程序
     * @param vs 顶点着色器代码
     * @param fs 片段着色器代码
     * @returns 成功返回一个新的着色程序，失败返回 null
     */
    createProgram(vs:string, fs:string, attribute_usage_map?: { [key: string]: VertexAttributeUsage }): Program {
        return new Program(this, vs, fs, attribute_usage_map)
    }

    /**
     * 从图像构造一个纹理
     * @param img Image 对象
     * @returns 新构造的 ImageTexture 对象
     */
    createTextureFromImage(img: HTMLImageElement): ImageTexture {
        const tex = new ImageTexture(this, img)
        return tex
    }

    /**
     * 构造一个顶点缓冲区
     * @param data 顶点数据
     * @param usage 顶点缓冲区用途
     * @param attributes 顶点属性
     * @returns 新的顶点缓冲区
     */
    createVertexBuffer(data: ArrayBuffer, stride: number, attributes: VertexAttribute[]): VertexBuffer {
        return new VertexBuffer(this, data, stride, attributes)
    }

    /**
     * 构造一个索引缓冲区
     * @param data 顶点索引数据
     * @returns 新的顶点索引缓冲区
     */
    createIndexBuffer(data: ArrayBuffer): IndexBuffer {
        return new IndexBuffer(this, data)
    }

    /**
     * (只读) WebGL2RenderingContext 对象
     */
    get context(): WebGL2RenderingContext { return this.___ctx }

    /**
     * (只读) 当前使用的着色程序
     */
    get currentProgram(): Program | null { return this.___current_program }

    /**
     * 从 Canvas 对象构造一个渲染器
     * @param canvas Canvas 对象
     * @returns 新的渲染器
     */
    static fromCanvas(canvas:HTMLCanvasElement):RenderDevice | null{
        const ctx2 = canvas.getContext('webgl2');
        if(ctx2) return new RenderDevice(ctx2)
        return null
    }


    // 内部方法，添加资源
    /** @internal */ ___addResource(res: RenderResource){
        res.___index_of_device_resources = this.___resource_list.length
        this.___resource_list.push(res)
    }

    // 内部方法，移除资源
    /** @internal */ ___dropResource(res: RenderResource){
        const lst = this.___resource_list
        if(res.___index_of_device_resources < lst.length - 1){
            const last_obj = lst[lst.length - 1]
            lst[res.___index_of_device_resources] = last_obj
            last_obj.___index_of_device_resources = res.___index_of_device_resources
        }
        lst.pop()
        res.___index_of_device_resources = -1
    }

    // 内部事件，设备丢失
    /** @internal */ ___onDeviceLost(){
        for(const res of this.___resource_list)
            res.___onDeviceLost()
    }

    // 内部事件，设备恢复
    /** @internal */ ___onDeviceRestored(){
        for(const res of this.___resource_list)
            res.___onDeviceRestored()
    }
}

import { Shader } from './shader.js'
import { Program } from './program.js'
import { ImageTexture } from './image-texture.js'
import { SlicedTexture, SliceManifest } from './sliced-texture.js'
import { RenderingResource } from './resource.js'
import { VertexAttribute, VertexAttributeUsage, VertexBuffer } from './vertex-buffer.js'
import { IndexBuffer } from './index-buffer.js'
import * as StdPrimitive from './std-geometry.js'
import { StdShaders } from './std-program.js'
import { Texture } from './texture.js'

/** 渲染设备 */
export class RenderingDevice {
    /** @internal */ _ctx: WebGL2RenderingContext
    /** @internal */ _resource_list: RenderingResource[]
    /** @internal */ _current_program: Program | null = null
    
    constructor(ctx: WebGL2RenderingContext){
        this._ctx = ctx
        this._resource_list = []
    }

    /**
     * 释放所有资源
     */
    destroy(){
        for(const res of this._resource_list)
            res._onResourceDestroyed()
        this._resource_list.length = 0
        this._current_program = null
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
    createVertexShader(source:string){ return this.createShader(source, this._ctx.VERTEX_SHADER) }

    /**
     * 构造一个片段着色器
     * @param source 着色器代码
     * @returns 成功返回一个新的着色器对象，失败返回 null
     */
    createFragmentShader(source:string){ return this.createShader(source, this._ctx.FRAGMENT_SHADER) }

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
     * 构造一个切片纹理对象
     * @param texture 纹理对象
     * @param manifest 切片信息
     * @returns 切片纹理对象
     */
    createSlicedTexture(texture:Texture, manifest:SliceManifest): SlicedTexture {
        return new SlicedTexture(this, texture, manifest)
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
    get context(): WebGL2RenderingContext { return this._ctx }

    /**
     * (只读) 当前使用的着色程序
     */
    get currentProgram(): Program | null { return this._current_program }

    /**
     * 从 Canvas 对象构造一个渲染器
     * @param canvas Canvas 对象
     * @returns 新的渲染器
     */
    static fromCanvas(canvas:HTMLCanvasElement):RenderingDevice | null{
        const ctx2 = canvas.getContext('webgl2');
        if(ctx2) return new RenderingDevice(ctx2)
        return null
    }

    /** @internal */ _std_geo_triangles: StdPrimitive.StdTriangle | null = null
    get stdTriangle(){ return this._std_geo_triangles || (this._std_geo_triangles = new StdPrimitive.StdTriangle(this)) }

    /** @internal */ _std_geo_rectangles: StdPrimitive.StdRectangle | null = null
    get stdRectangle(){ return this._std_geo_rectangles || (this._std_geo_rectangles = new StdPrimitive.StdRectangle(this)) }

    /** @internal */ _std_geo_circles: StdPrimitive.StdCircle | null = null
    get stdCircle(){ return this._std_geo_circles || (this._std_geo_circles = new StdPrimitive.StdCircle(this, 1)) }

    /** @internal */ _std_geo_cube: StdPrimitive.StdCube | null = null
    get stdCube(){ return this._std_geo_cube || (this._std_geo_cube = new StdPrimitive.StdCube(this)) }

    /** @internal */ _std_geo_cylinder: StdPrimitive.StdCylinder | null = null
    get stdCylinder(){ return this._std_geo_cylinder || (this._std_geo_cylinder = new StdPrimitive.StdCylinder(this, 1, 1)) }

    /** @internal */ _std_geo_cone: StdPrimitive.StdCone | null = null
    get stdCone(){ return this._std_geo_cone || (this._std_geo_cone = new StdPrimitive.StdCone(this, 1, 1)) }

    /** @internal */ _std_geo_sphere: StdPrimitive.StdSphere | null = null
    get stdSphere(){ return this._std_geo_sphere || (this._std_geo_sphere = new StdPrimitive.StdSphere(this, 1)) }

    /** @internal */ _std_geo_plane: StdPrimitive.StdPlane | null = null
    get stdPlane(){ return this._std_geo_plane || (this._std_geo_plane = new StdPrimitive.StdPlane(this, 1, 1)) }

    createTriangle(): StdPrimitive.StdTriangle { return new StdPrimitive.StdTriangle(this) }
    createRectangle(): StdPrimitive.StdRectangle { return new StdPrimitive.StdRectangle(this) }
    createCircle(radius:number, segments:number = 16): StdPrimitive.StdCircle { return new StdPrimitive.StdCircle(this, radius, segments) }
    createCube(): StdPrimitive.StdCube { return new StdPrimitive.StdCube(this) }
    createSphere(radius:number, segments:number = 16): StdPrimitive.StdSphere { return new StdPrimitive.StdSphere(this, radius, segments) }
    createCylinder(radius:number, height:number, segments:number = 16): StdPrimitive.StdCylinder { return new StdPrimitive.StdCylinder(this, radius, height, segments) }
    createCone(radius:number, height:number, segments:number = 16): StdPrimitive.StdCone { return new StdPrimitive.StdCone(this, radius, height, segments) }
    createPlane(width:number, height:number, segments:number = 16): StdPrimitive.StdPlane { return new StdPrimitive.StdPlane(this, width, height, segments) }

    createMeshFromOBJ(obj: string): StdPrimitive.StdMesh {
        return StdPrimitive.StdMesh.fromOBJ(this, obj)
    }

    /** @internal */ _std_pro_slice: Program | null = null
    get stdProgramSlice(){ return this._std_pro_slice || (this._std_pro_slice = new Program(this, StdShaders.vs.slice, StdShaders.fs.std)) }

    /** @internal */ _std_pro_colored_slice: Program | null = null
    get stdProgramColoredSlice(){ return this._std_pro_colored_slice || (this._std_pro_colored_slice = new Program(this, StdShaders.vs.slice, StdShaders.fs.stdc)) }

    // 内部方法，添加资源
    /** @internal */ _addResource(res: RenderingResource){
        res._index_of_device_resources = this._resource_list.length
        this._resource_list.push(res)
    }

    // 内部方法，移除资源
    /** @internal */ _dropResource(res: RenderingResource){
        const lst = this._resource_list
        if(res._index_of_device_resources < lst.length - 1){
            const last_obj = lst[lst.length - 1]
            lst[res._index_of_device_resources] = last_obj
            last_obj._index_of_device_resources = res._index_of_device_resources
        }
        lst.pop()
        res._index_of_device_resources = -1
    }

    // 内部事件，设备丢失
    /** @internal */ _onDeviceLost(){
        for(const res of this._resource_list)
            res._onDeviceLost()
    }

    // 内部事件，设备恢复
    /** @internal */ _onDeviceRestored(){
        for(const res of this._resource_list)
            res._onDeviceRestored()
    }
}

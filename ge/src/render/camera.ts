import { RenderingCore } from "./core.js"
import { Matrix4 } from "../math/matrix4.js"
import { Vector3 } from "../math/vector3.js"
import { IView } from "./view.js"

/**
 * 相机定义
 */
export type CameraDeclaration = {
    name?: string                               // 摄像机名
    position?: [number,number,number]           // 摄像机位置
    target?: [number,number,number]             // 摄像机目标
    up?: [number,number,number]                 // 摄像机上向量
    fov?: number                                // 摄像机视野角度
    near?: number                               // 摄像机近裁剪面
    far?: number                                // 摄像机远裁剪面
}


// 3D 视口（摄影机）
export class Camera implements IView {

    /** @internal */ _core: RenderingCore       // 核心
    /** @internal */ _name: string              // 名称
    /** @internal */ _position: Vector3         // 位置
    /** @internal */ _upvector: Vector3         // 上向量
    /** @internal */ _target: Vector3           // 目标点
    /** @internal */ _viewMatrix: Matrix4       // 视图矩阵
    /** @internal */ _fov: number               // 视角
    /** @internal */ _near: number              // 近裁剪面
    /** @internal */ _far: number               // 远裁剪面
    /** @internal */ _projMatrix: Matrix4       // 透视矩阵
    /** @internal */ _pvMatrix: Matrix4         // 透视投影矩阵

    constructor(core:RenderingCore, decl: CameraDeclaration = {}){
        this._core = core
        this._position = new Vector3(decl.position ?? [0,-5,-10])
        this._upvector = new Vector3(decl.up ?? [0,1,0])
        this._target = new Vector3(decl.target ?? [0,0,0])
        this._name = decl.name ?? 'camera'
        this._fov = decl.fov ?? 60
        this._near = decl.near ?? 0.1
        this._far = decl.far ?? 1000
        this._viewMatrix = new Matrix4()
        this._projMatrix = new Matrix4()
        this._pvMatrix = new Matrix4()
    }

    /**
     * 设置相机
     * @param decl 定义
     */
    setup(decl:CameraDeclaration){
        if(decl.position) this._position.fromArray(decl.position)
        if(decl.target) this._target.fromArray(decl.target)
        if(decl.up) this._upvector.fromArray(decl.up)
        if(decl.name) this._name = decl.name
        if(decl.fov) this._fov = decl.fov
        if(decl.near) this._near = decl.near
        if(decl.far) this._far = decl.far
        this.update()
    }

    /**
     * 获取视图矩阵
     */
    get viewMatrix(): Matrix4 { return this._viewMatrix }

    /**
     * 获取投影矩阵
     */
    get projMatrix(): Matrix4 { return this._projMatrix }

    /**
     * 读写名字属性
     */
    get name(): string { return this._name }
    set name(v: string) { this._name = v }

    /**
     * 读写位置属性
     */
    get position(): Vector3 { return this._position }
    set position(v: Vector3) { this._position = v; }

    /**
     * 读写上向量属性
     */
    get up(): Vector3 { return this._upvector }
    set up(v: Vector3) { this._upvector = v; }

    /**
     * 读写目标属性
     */
    get target(): Vector3 { return this._target }
    set target(v: Vector3) { this._target = v; }

    /**
     * 读写视角属性
     */
    get fov(): number { return this._fov }
    set fov(v: number) { this._fov = v }

    /**
     * 读写近剪裁面属性
     */
    get near(): number { return this._near }
    set near(v: number) { this._near = v }

    /**
     * 读写远剪裁面属性
     */
    get far(): number { return this._far }
    set far(v: number) { this._far = v }

    /**
     * 设置相机
     * @param eye 相机位置
     * @param target 相机目标
     * @param up 相机上向量
     */
    lookAt(eye: [number,number,number], target: [number,number,number], up: [number,number,number]){
        this._position.fromArray(eye)
        this._target.fromArray(target)
        this._upvector.fromArray(up)
    }

    /**
     * 更新矩阵
     * @param target 渲染目标，如果设置将会更新透视矩阵
     */
    update(){
        const tgt = this._core._current_target
        if(tgt){
            this._projMatrix.perspective(this._fov, tgt.width/tgt.height, this._near, this._far)
            this._viewMatrix.lookAt(this._position.data, this._target.data, this._upvector.data)
            this._pvMatrix.multiplyFrom(this._projMatrix, this._viewMatrix)
        }
    }

    /**
     * 获取视图投影矩阵数据
     * @returns 试图投影矩阵数据
     */
    getViewProjMatrix(): Float32Array {
        return this._pvMatrix.data
    }

    /**
     * 获取视图矩阵数据
     * @returns 视图举证数据
     */
    getViewMatrix(): Float32Array {
        return this._viewMatrix.data
    }

    /**
     * 激活相机
     */
    activate(){
        this.update()
        this._core._current_view = this
    }
}
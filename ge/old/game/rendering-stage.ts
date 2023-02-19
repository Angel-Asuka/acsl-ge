import { Core } from '../core.js'
import { Layer } from "./layer.js"
import { IView } from "./view.js"
import { DefaultRenderingTarget, IRenderingTarget } from '../render/rendering-target.js'
import { RenderingProgram, UniformUsage } from "../render/program.js"
import { Matrix4 } from "../math/matrix4.js"
import { StandardMaterialData } from '../render/std-material.js'

// 渲染步骤
export interface IRenderingStage {
    get name(): string
    set name(s:string)
    execute():void  // 执行渲染步骤
}


// 阴影贴图渲染阶段
export class ShadowMapStage implements IRenderingStage {
    /** @internal */ _name:string
    constructor(){
        this._name = 'smstage'
    }

    get name(): string { return this._name }
    set name(s: string) { this._name = s }

    execute(): void {
        throw new Error("Method not implemented.")
    }
}

export type RenderingStageOptions = {
    name?: string                                       // 渲染阶段名称
    view?: IView                                        // 视口
    layers?: Layer[]                                    // 渲染层
    target?: IRenderingTarget                           // 渲染目标
    shader?: Program                                    // 渲染着色器
    clear_color?: [number,number,number,number]         // 清除颜色
    clear_depth?: number                                // 清除深度
    clear_stencil?: number                              // 清除模板
    enable_depth?: boolean                              // 是否启用深度测试
    depth_func?: number                                 // 深度测试函数
}

// 常规渲染阶段
export class RenderingStage implements IRenderingStage {

    /** @internal */ _core: Core
    /** @internal */ _name:string
    /** @internal */ _layers: Layer[] = []                          // 层列表
    /** @internal */ _view: IView | null = null                     // 视口
    /** @internal */ _target: IRenderingTarget | null = null        // 渲染目标
    /** @internal */ _clear_color: [number,number,number,number]    // 清除颜色
    /** @internal */ _clear_depth:number                            // 清除深度
    /** @internal */ _clear_stencil:number                          // 清除模板
    /** @internal */ _clear_mask:number                             // 清除掩码
    /** @internal */ _enable_depth:boolean                          // 开启深度测试
    /** @internal */ _depth_func:number                             // 深度测试方法

    ___mat : StandardMaterialData

    constructor(core: Core, options:RenderingStageOptions = {}){
        this._name = 'stage'
        this._core = core
        this._view = options.view || null
        this._target = options.target || null
        this._clear_mask = 0

        this.___mat = core.device.stdMaterial.createData()

        if(options.clear_color){
            this._clear_mask |= WebGL2RenderingContext.COLOR_BUFFER_BIT
            this._clear_color = options.clear_color
        } else {
            this._clear_color = [0,0,0,0]
        }

        if(options.clear_depth){
            this._clear_mask |= WebGL2RenderingContext.DEPTH_BUFFER_BIT
            this._clear_depth = options.clear_depth
        } else {
            this._clear_depth = 1
        }

        if(options.clear_stencil){
            this._clear_mask |= WebGL2RenderingContext.STENCIL_BUFFER_BIT
            this._clear_stencil = options.clear_stencil
        } else {
            this._clear_stencil = 0
        }

        this._enable_depth = options.enable_depth || false
        this._depth_func = options.depth_func || WebGL2RenderingContext.LESS

    }

    /**
     * 添加层
     * @param layer 层对象
     */
    addLayer(layer: Layer){
        this._layers.push(layer)
    }

    get name(): string { return this._name }
    set name(s: string) { this._name = s }

    setView(view: IView){
        this._view = view
    }

    setTarget(target: IRenderingTarget){
        this._target = target
    }

    execute(){
        if(this._view && this._target){
            this._target.activate()
            this._view.activate(this._target)

            const ctx = this._core.device.context
            if(this._clear_mask){
                ctx.clearColor(...this._clear_color)
                ctx.clearDepth(this._clear_depth)
                ctx.clearStencil(this._clear_stencil)
                ctx.clear(this._clear_mask)
            }

            if(this._enable_depth){
                ctx.enable(WebGL2RenderingContext.DEPTH_TEST)
                ctx.depthFunc(this._depth_func)
            } else {
                ctx.disable(WebGL2RenderingContext.DEPTH_TEST)
            }


            this.___mat.activate()

            const pp = this._core.device.currentProgram!
            const mw = new Matrix4()
            pp.setUniformMat4(UniformUsage.MAT_WORLD, mw.data)

            ;(this._target as DefaultRenderingTarget)._device.stdSphere.draw()
        }
    }
}

// 2D 渲染阶段
export class FlatStage implements IRenderingStage {
    /** @internal */ _name:string
    constructor(){
        this._name = 'flatstage'
    }

    get name(): string { return this._name }
    set name(s: string) { this._name = s }

    execute(): void {
        throw new Error("Method not implemented.")
    }
}
import { RenderingCore } from './core.js'
import { IRenderingTarget } from './rendering-target.js'
import { IView } from './view.js'

export interface IRenderingLayer{
    render(): void
}

export interface IRenderingStage {
    render(): void
}

export type StandardStageOptions = {
    name?: string                                       // 渲染阶段名称
    view?: IView                                        // 视口
    layers?: IRenderingLayer[]                          // 渲染层
    target?: IRenderingTarget                           // 渲染目标
    clear_color?: [number,number,number,number]         // 清除颜色
    clear_depth?: number                                // 清除深度
    clear_stencil?: number                              // 清除模板
    enable_depth?: boolean                              // 是否启用深度测试
    depth_func?: number                                 // 深度测试函数
}

export class StandardStage implements IRenderingStage {
    /** @internal */ _name: string
    /** @internal */ _core: RenderingCore
    /** @internal */ _layers: IRenderingLayer[]
    /** @internal */ _target: IRenderingTarget
    /** @internal */ _view: IView | null = null
    /** @internal */ _clear_color: [number,number,number,number]    // 清除颜色
    /** @internal */ _clear_depth:number                            // 清除深度
    /** @internal */ _clear_stencil:number                          // 清除模板
    /** @internal */ _clear_mask:number                             // 清除掩码
    /** @internal */ _enable_depth:boolean                          // 开启深度测试
    /** @internal */ _depth_func:number                             // 深度测试方法

    constructor(core: RenderingCore, options: StandardStageOptions) {
        this._core = core
        this._name = options.name || 'StandardStage'
        this._layers = options.layers || []
        this._target = options.target || core.defaultTarget
        this._view = options.view || null
        this._clear_mask = 0
        this._enable_depth = options.enable_depth || false
        this._depth_func = options.depth_func || core._context.LESS

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
    }

    render(): void {
        if(this._view){
            this._target.activate()
            this._view.activate()
            
            const ctx = this._core._context
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
            
            for (const layer of this._layers) {
                layer.render()
            }
        }
    }
}

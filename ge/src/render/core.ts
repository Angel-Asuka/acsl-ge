import { RenderingResource } from './resource.js';
import { RenderingProgram } from './program.js';
import { IRenderingStage } from './stage.js';
import { IView } from './view.js';
import { DefaultRenderingTarget, IRenderingTarget } from './rendering-target.js';
import { StandardMaterial } from './material/std-material.js'

export class RenderingCore {
    /** @internal */    _canvas: HTMLCanvasElement
    /** @internal */    _context: WebGL2RenderingContext
    /** @internal */    _resources: RenderingResource[]

    /** @internal */    _current_program: RenderingProgram | null = null
    /** @internal */    _current_target: IRenderingTarget | null = null
    /** @internal */    _current_view: IView | null = null
    /** @internal */    _current_world_matrix: Float32Array | null = null

    /** @internal */    _stagets: IRenderingStage[] = []

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas
        this._context = canvas.getContext("webgl2", {
            alpha: true,
            antialias: true,
            depth: true,
            desynchronized: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            stencil: false
        }) as WebGL2RenderingContext
        this._resources = []
        this._canvas.addEventListener("webglcontextlost", this._onDeviceLost.bind(this), false)
        this._canvas.addEventListener("webglcontextrestored", this._onDeviceRestored.bind(this), false)
    }

    setStages(stages: IRenderingStage[]){
        this._stagets = stages
    }

    /**
     * 渲染
     */
    render(){
        for(let stage of this._stagets){
            stage.render()
        }
    }

    setWorldMatrix(matrix: Float32Array) {
        this._current_world_matrix = matrix
        this._current_program?.setWorldMatrix(matrix)
    }

    get context(): WebGL2RenderingContext { return this._context }

    get currentProgram(): RenderingProgram | null { return this._current_program }

    /**
     * 默认渲染目标
     */
    /** @internal */ _default_target: DefaultRenderingTarget | null = null
    get defaultTarget(): DefaultRenderingTarget { this._default_target = this._default_target || new DefaultRenderingTarget(this); return this._default_target; }

    /** @internal */ _standard_material: StandardMaterial | null = null
    get standardMaterial(): StandardMaterial { this._standard_material = this._standard_material || new StandardMaterial(this); return this._standard_material; }

    /** @internal */
    _addResource(resource: RenderingResource): number {
        return this._resources.push(resource) - 1
    }

    /** @internal */
    _removeResource(idx: number) {
        if(idx < this._resources.length - 1){
            this._resources[idx] = this._resources[this._resources.length - 1]
            this._resources[idx]._resourceIdx = idx
        }
        this._resources.pop()
    }

    /** @internal */
    _onDeviceLost() {
        for(let resource of this._resources){
            resource._onDeviceLost()
        }
    }

    /** @internal */
    _onDeviceRestored() {
        for(let resource of this._resources){
            resource._onDeviceRestored()
        }
    }

}

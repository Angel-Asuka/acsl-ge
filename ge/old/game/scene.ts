import { Core } from "../core.js"
import { RenderingDevice } from "../render/device.js"
import { Layer } from "./layer.js"
import { IRenderingStage } from "./rendering-stage.js"


// 渲染目标
export class RenderingTarget {
    constructor() {
    }
}

// 多重渲染目标 应对多个渲染目标的情况，如分级阴影贴图
export class MultiTarget extends RenderingTarget {
}

// 场景对象
export class Scene {

    /** @internal */ _core: Core                            // 核心
    /** @internal */ _layers: Layer[] = []                  // 层列表
    /** @internal */ _stages: IRenderingStage[] = []        // 渲染步骤

    constructor(core:Core){
        this._core = core
    }

    /**
     * 添加层
     * @param layer 层
     */
    addLayer(layer:Layer){
        this._layers.push(layer)
    }

    /**
     * 获取层对象
     * @param idx 层索引
     * @returns 层对象
     */
    getLayer(idx:number){ return this._layers[idx] }

    /**
     * 通过层名获取层对象
     * @param name 层名
     * @returns 层对象
     */
    getLayerByName(name:string){ return this._layers.find(l => l._name === name) }


    /**
     * 添加渲染步骤
     * @param stage 渲染步骤
     */
    addStage(stage:IRenderingStage){
        this._stages.push(stage)
    }

    /**
     * 获取渲染步骤
     * @param idx 渲染步骤索引
     * @returns 渲染步骤
     */
    getStage(idx:number){ return this._stages[idx] }

    /**
     * 通过渲染步骤名获取渲染步骤
     * @param name 渲染步骤名
     * @returns 渲染步骤
     */
    getStageByName(name:string){ return this._stages.find(s => s.name === name) }

    /**
     * 更新场景
     */
    update(ts:number) {

    }

    /**
     * 渲染场景
     * @param device 渲染设备
     */
    draw() {
        for(let stage of this._stages){
            stage.execute()
        }
    }
}
import { IView } from './view.js'
import { IRenderingTarget } from '../render/rendering-target.js'


// 由光源作为视口渲染出来的总是阴影贴图

// 点光源
export class OmniLight implements IView{
    constructor(){}
    update(target?:IRenderingTarget){}
    getViewProjMatrix(subview: number): Float32Array {
        throw new Error("Method not implemented.")
    }
    activate(target:IRenderingTarget){}
}

// 聚光灯
export class SpotLight implements IView{
    constructor(){}
    update(target?:IRenderingTarget){}
    getViewProjMatrix(subview: number): Float32Array {
        throw new Error("Method not implemented.")
    }
    activate(target:IRenderingTarget){}
}

// 平行光
export class DirectionallLight implements IView{
    constructor(){}
    update(target?:IRenderingTarget){}
    getViewProjMatrix(subview: number): Float32Array {
        throw new Error("Method not implemented.")
    }
    activate(target:IRenderingTarget){}
}
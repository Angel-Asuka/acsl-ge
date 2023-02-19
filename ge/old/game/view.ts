import { IRenderingTarget } from "../render/rendering-target.js"

export interface IView {
    update(target?:IRenderingTarget):void               // 更新视口
    getViewProjMatrix(subview:number): Float32Array     // 获取视图投影矩阵，对于存在多个子视口的情况（如点光源），需要传入子视口索引
    activate(target:IRenderingTarget):void              // 激活视口
}

// 2D 视口
export class FlatView implements IView{
    constructor(){}
    update(target?:IRenderingTarget){}
    getViewProjMatrix(subview: number): Float32Array {
        throw new Error("Method not implemented.")
    }
    activate(target:IRenderingTarget){}
}
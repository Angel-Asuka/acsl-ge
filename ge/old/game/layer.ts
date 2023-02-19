import { GameObject } from "./game-object.js"

// 层用于控制渲染顺序，层的渲染顺序由层的索引决定，索引越小，越先渲染
export class Layer {

    /** @internal */ _name:string                   // 层名
    /** @internal */ _root:GameObject               // 渲染层的根节点
    /** @internal */ _queued:GameObject[]           // 渲染队列，由 RenderingStage 在 execute 中调用，调用该方法时，已经设置好了渲染设备的视口和投影矩阵

    constructor(name?: string){
        this._root = new GameObject()
        this._root._name = 'root'
        this._queued = []
        this._name = name || 'layer'
    }

    draw(){}        // 执行绘制，由 RenderingStage 在 execute 中调用，调用该方法时，已经设置好了渲染设备的视口和投影矩阵
}
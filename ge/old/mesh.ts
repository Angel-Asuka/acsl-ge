import { RenderingDevice } from "./device.js"
import { RenderingResource } from "./resource.js"
import { VertexBuffer } from "./vertex-buffer.js"
import { IndexBuffer } from "./index-buffer.js"
import { Skeleton } from "./skeleton.js"
import { Drawable } from "./drawable.js"


export class Mesh extends Drawable {

    /** @internal */ _vertexBuffer: VertexBuffer        // 顶点缓冲
    /** @internal */ _indexBuffer: IndexBuffer          // 索引缓冲
    /** @internal */ _firstIndex: number = 0            // 第一个索引
    /** @internal */ _triangleCount: number = 0         // 三角形数量

    constructor(dev: RenderingDevice, vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer, first?:number, count?:number) {
        super(dev)
        this._vertexBuffer = vertexBuffer
        this._indexBuffer = indexBuffer
        if(first !== undefined && count !== undefined){
            this._firstIndex = first
            this._triangleCount = count
        }else{
            this._firstIndex = 0
            this._triangleCount = this._indexBuffer.count
        }
    }

    draw(): void {
        const p = this._device.currentProgram
        if (p) {
            this._vertexBuffer.activate()
            this._indexBuffer.activate()
        }
        this._device.context.drawArrays(this._device.context.TRIANGLES, this._firstIndex, this._triangleCount)
    }
}
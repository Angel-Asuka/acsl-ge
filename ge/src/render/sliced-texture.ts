import { Drawable } from "./drawable.js"
import { Texture } from "./texture.js"
import { RenderingDevice } from "./device.js"
import { UniformUsage } from "./program.js"

export type SliceInfo = {
    name: string                    // 切片名称
    width:number                    // 切片尺寸 W
    height:number                   // 切片尺寸 H
    mat: number[]                   // 切片矩阵
}

export type SliceManifest = {
    name: string
    width: number
    height: number
    slices: SliceInfo[]
}

// 切片对象维护了与一个纹理对应的切片信息
export class SlicedTexture extends Drawable {

    /** @internal */ _texture: Texture              // 纹理
    /** @internal */ _manifest: SliceManifest       // 切片信息
    /** @internal */ _slice_map: Map<string, SliceInfo>
    /** @internal */ _frame_matrix: Float32Array[]  // 各切片的绘制矩阵

    constructor(device: RenderingDevice, texture: Texture, manifest: SliceManifest) {
        super(device)
        this._texture = texture
        this._manifest = manifest
        this._slice_map = new Map()
        this._frame_matrix = []
        for (let slice of manifest.slices) {
            this._slice_map.set(slice.name, slice)
            this._frame_matrix.push(new Float32Array(slice.mat))
        }
    }

    get texture() { return this._texture }
    get manifest() { return this._manifest }
    get count() { return this._manifest.slices.length }

    getSliceMatrix(id:number){
        return this._frame_matrix[id]
    }

    drawSlice(id:number){
        this._device.currentProgram?.setUniformMat4(UniformUsage.MAT_SLICE, this._frame_matrix[id])
        this._device.stdPlane.draw()
    }
}



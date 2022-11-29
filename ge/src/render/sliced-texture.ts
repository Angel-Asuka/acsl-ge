import { Drawable } from "./drawable.js"
import { Texture } from "./texture.js"
import { RenderingDevice } from "./device.js"
import { UniformUsage } from "./program.js"

export type SliceInfo = {
    name: string                    // 切片名称
    x: number                       // 切片X
    y: number                       // 切片Y
    width: number                   // 切片宽度
    height: number                  // 切片高度
    frameX: number                  // 切片帧X
    frameY: number                  // 切片帧Y
    frameWidth: number              // 切片帧宽度
    frameHeight: number             // 切片帧高度
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
            // 切片的绘制矩阵是压缩后的矩阵， 对应关系如下：
            //      m00  m11  m03  m13
            //      t00  t11  t03  t13
            //      0    0    0    0
            //      0    0    0    0
            // 其中， m 是顶点坐标变换矩阵， t 是纹理坐标变换矩阵
            this._frame_matrix.push(new Float32Array([
                slice.frameWidth / slice.width, slice.frameHeight / slice.height,
                -slice.frameX / slice.width, -slice.frameY / slice.height,
                slice.width / manifest.width, slice.height / manifest.height,
                slice.x / manifest.width , slice.y / manifest.height,
                0, 0, 0, 0, 0, 0, 0, 0
            ]))
        }
    }

    get texture() { return this._texture }
    get manifest() { return this._manifest }

    getSliceMatrix(id:number){
        return this._frame_matrix[id]
    }

    drawSlice(id:number){
        this._device.currentProgram?.setUniformMat4(UniformUsage.MAT_SLICE, this._frame_matrix[id])
        this._device.stdPlane.draw()
    }
}



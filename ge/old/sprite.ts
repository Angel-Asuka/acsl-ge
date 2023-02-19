import { RenderingDevice } from "./device.js"
import { Drawable } from "./drawable.js"
import { SlicedTexture } from "./sliced-texture.js"

export type SpriteFrame = {
    slice_id: number    // 切片索引
    duration: number    // 持续时间
    mat: Float32Array   // 切片矩阵
}

export type SpriteAnimation = {
    name: string            // 动画名称
    frames: SpriteFrame[]   // 动画帧
}

export type SpriteManifest = {
    name: string                    // 精灵名称
    sliced: string                  // 切片贴图名称
    animations: SpriteAnimation[]   // 动画列表
}

export type SpriteAnimationObject = {
    animation: SpriteAnimation      // 动画
    frames: SpriteFrame[]           // 动画帧
    frame_ts_map: number[]          // 帧时间戳
    total_duration: number          // 总时长
}

export class Sprite extends Drawable {
    /** @internal */ _sliced: SlicedTexture
    /** @internal */ _manifest: SpriteManifest
    /** @internal */ _animations: SpriteAnimationObject[]
    /** @internal */ _animation_map: Map<string, SpriteAnimationObject>

    constructor(device: RenderingDevice, sliced: SlicedTexture, manifest: SpriteManifest) {
        super(device)
        this._sliced = sliced
        this._manifest = manifest
        this._animation_map = new Map()
        this._animations = []
        for (let i=0; i < manifest.animations.length; i++) {
            let animation = manifest.animations[i]
            let ts = []
            let t = 0
            for (let frame of animation.frames) {
                t += frame.duration
                ts.push(t)
            }
            const obj = {
                animation: animation,
                frames: animation.frames,
                frame_ts_map: ts,
                total_duration: t
            }
            this._animations.push(obj)
            this._animation_map.set(animation.name, obj)
        }
    }

    get sliced() { return this._sliced }

    get manifest() { return this._manifest }

    getAnimation(k: string | number) {
        if (typeof k === 'string') {
            return this._animation_map.get(k)
        } else {
            return this._manifest.animations[k]
        }
    }

    /**
     * 获取动画在指定时间的帧
     * @param ani 动画编号
     * @param ori 查找的起始帧号
     * @param t 时间戳
     */
    getFrame(ani: SpriteAnimationObject, ori: number, t: number) {
        const ts_map = ani.frame_ts_map
        const dt = t % ani.total_duration
        let i = ori
        if(dt < ts_map[i]) {
            while(i >= 0 && dt < ts_map[i]) i--
            ++i
        } else {
            while(i < ts_map.length - 1 && dt >= ts_map[i]) i++
        }
        return i
    }

    drawFrame(frame: SpriteFrame) {
        this._sliced.drawSlice(frame.slice_id)
    }

}
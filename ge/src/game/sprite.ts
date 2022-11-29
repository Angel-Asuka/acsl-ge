import { GameObject, GameObjectType } from "./game-object.js"
import { Sprite, SpriteAnimationObject, SpriteFrame } from '../render/sprite.js'

export class SpriteObject extends GameObject {
    /** @internal */ _sprite: Sprite                                // 精灵对象
    /** @internal */ _current_animation: SpriteAnimationObject      // 当前动画
    /** @internal */ _ts_begin: number = 0                          // 动画开始时间
    /** @internal */ _speed: number = 1                             // 动画速度
    /** @internal */ _current_frame: SpriteFrame                    // 当前帧
    /** @internal */ _current_frame_idx: number                     // 当前帧索引

    constructor(sprite: Sprite) {
        super()
        this._type = GameObjectType.Sprite
        this._sprite = sprite
        this._current_animation = this._sprite.getAnimation(0) as SpriteAnimationObject
        this._current_frame_idx = 0
        this._current_frame = this._current_animation.frames[0]
    }

    get sprite() { return this._sprite }

    /** @internal */ _onDraw(){
        this._sprite.drawFrame(this._current_frame)
    }

    /** @internal */ _onUpdate(time: number):boolean {
        const dt = time - this._ts_begin
        this._current_frame_idx = this._sprite.getFrame(this._current_animation, this._current_frame_idx, dt * this._speed)
        this._current_frame = this._current_animation.frames[this._current_frame_idx]
        return this._matrix_updated
    }

}
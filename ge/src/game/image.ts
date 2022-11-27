import { GameObject, GameObjectType } from "./game-object"

export class Image extends GameObject {
    constructor() {
        super()
        this.type = GameObjectType.Image
    }

    // drawable 属性，子类重写，返回是否可绘制
    get drawable(): boolean { return true }
}
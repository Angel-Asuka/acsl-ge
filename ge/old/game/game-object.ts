import { Matrix4 } from "../math/matrix4.js"
import { RenderingDevice } from "../render/device.js"

export enum GameObjectType {
    Unknown             = 0,        // 未知
    Dumy                = 1,        // 虚拟对象
    Camera              = 2,        // 摄像机
    Bone                = 3,        // 骨骼
    Mesh                = 4,        // 网格

    Image               = 100,      // 图片
    Sprite              = 101,      // 精灵
    Text                = 102,      // 文本
}

/**
 * 游戏对象接口
 */
export interface IGameObject {
    /** @internal */ _name: string                        // 游戏对象名称
    /** @internal */ _type: GameObjectType                // 游戏对象类型
    /** @internal */ _world_matrix: Matrix4               // 游戏对象的世界变换矩阵
    /** @internal */ _final_matrix: Matrix4               // 最终矩阵，提供给渲染使用
    /** @internal */ _matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新
}

class IdentityGameObject implements IGameObject {
    /** @internal */ _name: string                        // 游戏对象名称
    /** @internal */ _type: GameObjectType                // 游戏对象类型
    /** @internal */ _world_matrix: Matrix4               // 世界矩阵, 提供给子元素使用
    /** @internal */ _final_matrix: Matrix4               // 最终矩阵，提供给渲染使用
    /** @internal */ _matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新

    constructor() {
        this._name = "IdentityGameObject"
        this._type = GameObjectType.Unknown
        this._world_matrix = new Matrix4()
        this._final_matrix = new Matrix4()
        this._matrix_updated = false
    }
}

const _g_identity_game_object = new IdentityGameObject()

/**
 * 游戏对象
 */
export class GameObject implements IGameObject {

    /** @internal */ _name: string                        // 游戏对象名称
    /** @internal */ _type: GameObjectType                // 游戏对象类型
    /** @internal */ _parent: IGameObject                 // 游戏对象的父对象
    /** @internal */ _first_child: GameObject|null        // 游戏对象的第一个子对象
    /** @internal */ _last_child: GameObject|null         // 游戏对象的最后一个子对象
    /** @internal */ _previous_sibling: GameObject|null   // 游戏对象的上一个兄弟对象
    /** @internal */ _next_sibling: GameObject|null       // 游戏对象的下一个兄弟对象
    /** @internal */ _transform: Matrix4                  // 游戏对象的变换矩阵
    /** @internal */ _world_matrix: Matrix4               // 游戏对象的世界变换矩阵
    /** @internal */ _final_matrix: Matrix4               // 最终矩阵，提供给渲染使用
    /** @internal */ _visible: boolean                    // 游戏对象是否可见,设置为 false 时，该节点及其子节点都不会被渲染
    /** @internal */ _matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新

    constructor() {
        this._name = 'object'
        this._type = GameObjectType.Unknown
        this._parent = _g_identity_game_object
        this._first_child = null
        this._last_child = null
        this._previous_sibling = null
        this._next_sibling = null
        this._transform = new Matrix4()
        this._world_matrix = new Matrix4()
        this._final_matrix = this._world_matrix
        this._visible = true
        this._matrix_updated = false
    }

    // drawable 属性，子类重写，返回是否可绘制
    get drawable(): boolean { return false }

    // 绘制方法，子类重写
    /** @internal */ _onDraw(dev: RenderingDevice){}

    // _onUpdate 方法，子类重写，如果没有更新变换矩阵，也应当返回 this.matrix_updated 以保证世界变换矩阵能够被正确更新
    /** @internal */ _onUpdate(time: number):boolean { return this._matrix_updated }

    // _onDestroy 方法，子类重写，当游戏对象被销毁时，会调用该方法
    /** @internal */ _onDestroy() {}

    // _onUpdateMatrix 方法，子类重写，当世界矩阵被更新时，会调用该方法，子对象需要自行更新最终矩阵
    // 如果子对象需要对最终矩阵进行更新，应当自行维护一个 Matrix4 对象，并在该方法中更新并返回该对象
    // 系统将使用该对象作为最终矩阵，如果不需要最终矩阵，则不应当重写该方法
    /** @internal */ _onUpdateMatrix():Matrix4 { return this._world_matrix }

    /** matrix 属性，返回游戏对象的变换矩阵，当获取该属性时，会自动将世界变换矩阵标记为未更新 */
    get matrix(): Matrix4 {
        this._matrix_updated = false
        return this._transform
    }

    /** 递归更新游戏对象，传入当前毫秒级时间戳，调用 onUpdate 方法完成更新，然后根据需要更新世界变换矩阵 */
    update(time: number) {
        this._matrix_updated = this._onUpdate(time) || this._matrix_updated || this._parent._matrix_updated
        if(this._matrix_updated){
            this._world_matrix.multiplyFrom(this._parent._world_matrix, this._transform)
        }
        if(this._first_child)
            this._first_child.update(time)
        if(this._next_sibling)
            this._next_sibling.update(time)
    }

    /** 递归绘制所有游戏对象 */
    draw(dev: RenderingDevice) {
        if(this._visible){
            if(this.drawable)
                this._onDraw(dev)
            if(this._first_child)
                this._first_child.draw(dev)
        }
        if(this._next_sibling)
            this._next_sibling.draw(dev)
    }

    /** 递归销毁游戏对象，调用 onDestroy 方法完成销毁，然后递归销毁子对象 */
    destroy() {
        this._onDestroy()
        if(this._first_child)
            this._first_child.destroy()
        if(this._next_sibling)
            this._next_sibling.destroy()
    }

    attachFirst(child: GameObject) {
        if(child._parent !== _g_identity_game_object)
            child.detach()
        child._parent = this
        child._previous_sibling = null
        child._next_sibling = this._first_child
        if(this._first_child)
            this._first_child._previous_sibling = child
        this._first_child = child
        if(!this._last_child)
            this._last_child = child
    }

    attachLast(child: GameObject) {
        if(child._parent !== _g_identity_game_object)
            child.detach()
        child._parent = this
        child._previous_sibling = this._last_child
        child._next_sibling = null
        if(this._last_child)
            this._last_child._next_sibling = child
        this._last_child = child
        if(!this._first_child)
            this._first_child = child
    }

    /** 将当前对象从父对象的树中断开 */
    detach() {
        if(this._parent === _g_identity_game_object) return
        const p = this._parent as GameObject
        if(this._previous_sibling)
            this._previous_sibling._next_sibling = this._next_sibling
        else
            p._first_child = this._next_sibling
        if(this._next_sibling)
            this._next_sibling._previous_sibling = this._previous_sibling
        else
            p._last_child = this._previous_sibling
        this._parent = _g_identity_game_object
        this._previous_sibling = null
        this._next_sibling = null
    }

    /** 将当前对象从父对象的树中断开，并将其作为父对象的第一个子对象 */
    attachFirstTo(parent: GameObject) {
        parent.attachFirst(this)
    }

    /** 将当前对象从父对象的树中断开，并将其作为父对象的最后一个子对象 */
    attachLastTo(parent: GameObject) {
        parent.attachLast(this)
    }

    /** 将当前对象从父对象的树中断开，并将其作为兄弟对象的前一个兄弟对象 */
    attachBefore(sibling: GameObject) {
        if(sibling._parent === _g_identity_game_object) return
        if(this._parent !== _g_identity_game_object) this.detach()
        const p = sibling._parent as GameObject
        this._parent = p
        this._previous_sibling = sibling._previous_sibling
        this._next_sibling = sibling
        if(sibling._previous_sibling)
            sibling._previous_sibling._next_sibling = this
        else
            p._first_child = this
        sibling._previous_sibling = this
    }

    /** 将当前对象从父对象的树中断开，并将其作为兄弟对象的后一个兄弟对象 */
    attachAfter(sibling: GameObject) {
        if(sibling._parent === _g_identity_game_object) return
        if(this._parent !== _g_identity_game_object) this.detach()
        const p = sibling._parent as GameObject
        this._parent = p
        this._previous_sibling = sibling
        this._next_sibling = sibling._next_sibling
        if(sibling._next_sibling)
            sibling._next_sibling._previous_sibling = this
        else
            p._last_child = this
        sibling._next_sibling = this
    }

    moveFirst(){
        if(this._parent === _g_identity_game_object) return
        if(!this._previous_sibling) return
        const p = this._parent as GameObject
        this._previous_sibling._next_sibling = this._next_sibling
        if(this._next_sibling)
            this._next_sibling._previous_sibling = this._previous_sibling
        else
            p._last_child = this._previous_sibling
        this._previous_sibling = null
        this._next_sibling = p._first_child
        if(p._first_child)
            p._first_child._previous_sibling = this
        p._first_child = this
    }

    moveLast(){
        if(this._parent === _g_identity_game_object) return
        if(!this._next_sibling) return
        const p = this._parent as GameObject
        this._next_sibling._previous_sibling = this._previous_sibling
        if(this._previous_sibling)
            this._previous_sibling._next_sibling = this._next_sibling
        else
            p._first_child = this._next_sibling
        this._next_sibling = null
        this._previous_sibling = p._last_child
        if(p._last_child)
            p._last_child._next_sibling = this
        p._last_child = this
    }
}
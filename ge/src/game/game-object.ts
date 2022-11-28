import { Matrix4 } from "../math/matrix4.js"

export enum GameObjectType {
    Unknown             = 0,        // 未知
    Dumy                = 1,        // 虚拟对象
    Camera              = 2,        // 摄像机
    Bone                = 3,        // 骨骼
    Mesh                = 4,        // 网格

    Image               = 100,      // 图片
    Spirte              = 101,      // 精灵
    Text                = 102,      // 文本
}

/**
 * 游戏对象接口
 */
export interface IGameObject {
    name: string                        // 游戏对象名称
    type: GameObjectType                // 游戏对象类型
    world_matrix: Matrix4               // 游戏对象的世界变换矩阵
    matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新
}

class IdentityGameObject implements IGameObject {
    name: string                        // 游戏对象名称
    type: GameObjectType                // 游戏对象类型
    world_matrix: Matrix4               // 游戏对象的世界变换矩阵
    matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新

    constructor() {
        this.name = "IdentityGameObject"
        this.type = GameObjectType.Unknown
        this.world_matrix = new Matrix4()
        this.matrix_updated = false
    }
}

const _g_identity_game_object = new IdentityGameObject()

/**
 * 游戏对象
 */
export class GameObject implements IGameObject {

    name: string                        // 游戏对象名称
    type: GameObjectType                // 游戏对象类型
    parent: IGameObject                 // 游戏对象的父对象
    first_child: GameObject|null        // 游戏对象的第一个子对象
    last_child: GameObject|null         // 游戏对象的最后一个子对象
    previous_sibling: GameObject|null   // 游戏对象的上一个兄弟对象
    next_sibling: GameObject|null       // 游戏对象的下一个兄弟对象
    transform: Matrix4                  // 游戏对象的变换矩阵
    world_matrix: Matrix4               // 游戏对象的世界变换矩阵
    visible: boolean                    // 游戏对象是否可见,设置为 false 时，该节点及其子节点都不会被渲染
    matrix_updated: boolean             // 游戏对象的世界变换矩阵是否已更新

    constructor() {
        this.name = 'object'
        this.type = GameObjectType.Unknown
        this.parent = _g_identity_game_object
        this.first_child = null
        this.last_child = null
        this.previous_sibling = null
        this.next_sibling = null
        this.transform = new Matrix4()
        this.world_matrix = new Matrix4()
        this.visible = true
        this.matrix_updated = false
    }

    // drawable 属性，子类重写，返回是否可绘制
    get drawable(): boolean { return false }

    // onUpdate 方法，子类重写，如果没有更新变换矩阵，也应当返回 this.matrix_updated 以保证世界变换矩阵能够被正确更新
    onUpdate(time: number):boolean { return this.matrix_updated }

    // onDestroy 方法，子类重写，当游戏对象被销毁时，会调用该方法
    onDestroy() {}

    /** matrix 属性，返回游戏对象的变换矩阵，当获取该属性时，会自动将世界变换矩阵标记为未更新 */
    get matrix(): Matrix4 {
        this.matrix_updated = false
        return this.transform
    }

    /** 递归更新游戏对象，传入当前毫秒级时间戳，调用 onUpdate 方法完成更新，然后根据需要更新世界变换矩阵 */
    update(time: number) {
        this.matrix_updated = this.onUpdate(time) || this.matrix_updated || this.parent.matrix_updated
        if(this.matrix_updated){
            this.world_matrix.multiplyFrom(this.parent.world_matrix, this.transform)
        }
        if(this.first_child)
            this.first_child.update(time)
        if(this.next_sibling)
            this.next_sibling.update(time)
    }

    /** 递归销毁游戏对象，调用 onDestroy 方法完成销毁，然后递归销毁子对象 */
    destroy() {
        this.onDestroy()
        if(this.first_child)
            this.first_child.destroy()
        if(this.next_sibling)
            this.next_sibling.destroy()
    }

    attachFirst(child: GameObject) {
        if(child.parent !== _g_identity_game_object)
            child.detach()
        child.parent = this
        child.previous_sibling = null
        child.next_sibling = this.first_child
        if(this.first_child)
            this.first_child.previous_sibling = child
        this.first_child = child
        if(!this.last_child)
            this.last_child = child
    }

    attachLast(child: GameObject) {
        if(child.parent !== _g_identity_game_object)
            child.detach()
        child.parent = this
        child.previous_sibling = this.last_child
        child.next_sibling = null
        if(this.last_child)
            this.last_child.next_sibling = child
        this.last_child = child
        if(!this.first_child)
            this.first_child = child
    }

    /** 将当前对象从父对象的树中断开 */
    detach() {
        if(this.parent === _g_identity_game_object) return
        const p = this.parent as GameObject
        if(this.previous_sibling)
            this.previous_sibling.next_sibling = this.next_sibling
        else
            p.first_child = this.next_sibling
        if(this.next_sibling)
            this.next_sibling.previous_sibling = this.previous_sibling
        else
            p.last_child = this.previous_sibling
        this.parent = _g_identity_game_object
        this.previous_sibling = null
        this.next_sibling = null
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
        if(sibling.parent === _g_identity_game_object) return
        if(this.parent !== _g_identity_game_object) this.detach()
        const p = sibling.parent as GameObject
        this.parent = p
        this.previous_sibling = sibling.previous_sibling
        this.next_sibling = sibling
        if(sibling.previous_sibling)
            sibling.previous_sibling.next_sibling = this
        else
            p.first_child = this
        sibling.previous_sibling = this
    }

    /** 将当前对象从父对象的树中断开，并将其作为兄弟对象的后一个兄弟对象 */
    attachAfter(sibling: GameObject) {
        if(sibling.parent === _g_identity_game_object) return
        if(this.parent !== _g_identity_game_object) this.detach()
        const p = sibling.parent as GameObject
        this.parent = p
        this.previous_sibling = sibling
        this.next_sibling = sibling.next_sibling
        if(sibling.next_sibling)
            sibling.next_sibling.previous_sibling = this
        else
            p.last_child = this
        sibling.next_sibling = this
    }

    moveFirst(){
        if(this.parent === _g_identity_game_object) return
        if(!this.previous_sibling) return
        const p = this.parent as GameObject
        this.previous_sibling.next_sibling = this.next_sibling
        if(this.next_sibling)
            this.next_sibling.previous_sibling = this.previous_sibling
        else
            p.last_child = this.previous_sibling
        this.previous_sibling = null
        this.next_sibling = p.first_child
        if(p.first_child)
            p.first_child.previous_sibling = this
        p.first_child = this
    }

    moveLast(){
        if(this.parent === _g_identity_game_object) return
        if(!this.next_sibling) return
        const p = this.parent as GameObject
        this.next_sibling.previous_sibling = this.previous_sibling
        if(this.previous_sibling)
            this.previous_sibling.next_sibling = this.next_sibling
        else
            p.first_child = this.next_sibling
        this.next_sibling = null
        this.previous_sibling = p.last_child
        if(p.last_child)
            p.last_child.next_sibling = this
        p.last_child = this
    }
}
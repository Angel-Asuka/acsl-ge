import { FloatDataTexture } from "./data-texture.js"
import { Matrix4 } from "../math/matrix4.js"
import { RenderingDevice } from "./device.js"

export type BondDeclaration = {
    name: string,               // 绑定名称
    parent: string,             // 父骨骼名称
    firstChild: string,         // 第一个子骨骼名称
    transform: number[],        // 该骨骼相对于父骨骼的变换矩阵
    length: number              // 该骨骼的长度
}

export class Bone {
    /** @internal */ _idx: number                     // 骨骼索引
    /** @internal */ _decl: BondDeclaration           // 骨骼声明

    /** @internal */ _parent: Bone | null             // 父骨骼
    /** @internal */ _first_child: Bone | null        // 第一个子骨骼
    /** @internal */ _next_sibling: Bone | null       // 下一个兄弟骨骼

    constructor(idx: number, decl: BondDeclaration) {
        this._idx = idx
        this._decl = decl
        this._parent = null
        this._first_child = null
        this._next_sibling = null
    }

    /**
     * 递归更新骨骼及子骨骼的世界变换矩阵
     * @param matWorld 父对象的世界矩阵
     * @param matBones 世界矩阵数组
     * @param matLocal 本地矩阵数组
     */
    update(matWorld:Matrix4, matBones:Matrix4[], matLocal:Matrix4[]) {
        matBones[this._idx].multiplyFrom(matWorld, matLocal[this._idx])
        if (this._first_child) {
            this._first_child.update(matBones[this._idx], matBones, matLocal)
        }
        if (this._next_sibling) {
            this._next_sibling.update(matWorld, matBones, matLocal)
        }
    }
}

export class SkeletonInstance {
    /** @internal */ _skeleton: Skeleton
    /** @internal */ _transform_data: Float32Array
    /** @internal */ _mat_bones: Matrix4[]
    /** @internal */ _mat_local: Matrix4[]
    /** @internal */ _data_texture: FloatDataTexture

    constructor(skeleton: Skeleton, dev: RenderingDevice) {
        this._skeleton = skeleton
        this._transform_data = new Float32Array(skeleton._bones.length * 16)
        this._mat_bones = [] as Matrix4[]
        this._mat_local = [] as Matrix4[]
        for(let b of skeleton._bones){
            this._mat_local[b._idx] = new Matrix4(b._decl.transform)
            this._mat_bones[b._idx] = new Matrix4(this._transform_data.subarray(b._idx * 16, (b._idx + 1) * 16))
        }
        this._data_texture = new FloatDataTexture(dev, 4, this._skeleton.count, this._transform_data)
    }

    /**
     * 更新骨骼的世界变换矩阵
     */
    update(matWorld:Matrix4){
        for(let b of this._skeleton._root_bones){
            b.update(matWorld, this._mat_bones, this._mat_local)
        }
        this._data_texture.update()
    }

    /**
     * 将本地变换矩阵更新到初始状态
     */
    resetAll(){
        for(let b of this._skeleton._bones){
            this._mat_local[b._idx].copy(this._skeleton._origin_mat[b._idx])
        }
    }

    /**
     * 获取骨骼变换矩阵
     * @param idx 骨骼索引
     * @returns 骨骼变换矩阵
     */
    getMatrix(idx:number){
        return this._mat_local[idx]
    }

    /**
     * 重设骨骼的初始状态
     * @param idx 骨骼索引
     */
    reset(idx:number){
        this._mat_local[idx].copy(this._skeleton._origin_mat[idx])
    }

    /**
     * 对指定骨骼进行变换
     * @param idx 骨骼索引
     * @param mat 变换矩阵
     */
    transfrom(idx:number, mat:Matrix4){
        this._mat_local[idx].multiply(mat)
    }

    /**
     * 设置指定骨骼的变换矩阵
     * @param idx 骨骼索引
     * @param mat 变换矩阵
     */
    setTransform(idx:number, mat:Matrix4){
        this._mat_local[idx].multiplyFrom(mat, this._skeleton._origin_mat[idx])
    }

    /**
     * 平移指定骨骼
     * @param idx 骨骼索引
     * @param x X
     * @param y Y
     * @param z Z
     */
    translate(idx:number, x:number, y:number, z:number){
        this._mat_local[idx].translate([x, y, z])
    }

    /**
     * 重设后平移指定骨骼
     * @param idx 骨骼索引
     * @param x X
     * @param y Y
     * @param z Z
     */
    setTranslate(idx:number, x:number, y:number, z:number){
        this._mat_local[idx].copy(this._skeleton._origin_mat[idx])
        this._mat_local[idx].translate([x, y, z])
    }

    /**
     * 旋转指定骨骼
     * @param idx 骨骼索引
     * @param x 旋转轴X
     * @param y 旋转轴Y
     * @param z 旋转轴Z
     * @param rad 旋转弧度
     */
    rotate(idx:number, x:number, y:number, z:number, rad:number){
        this._mat_local[idx].rotate(rad, [x, y, z])
    }

    /**
     * 重设后旋转指定骨骼
     * @param idx 骨骼索引
     * @param x 旋转轴X
     * @param y 旋转轴Y
     * @param z 旋转轴Z
     * @param rad 旋转弧度
     */
    setRotate(idx:number, x:number, y:number, z:number, rad:number){
        this._mat_local[idx].copy(this._skeleton._origin_mat[idx])
        this._mat_local[idx].rotate(rad, [x, y, z])
    }

    /**
     * 缩放指定骨骼
     * @param idx 骨骼索引
     * @param x X轴缩放比例
     * @param y Y轴缩放比例
     * @param z Z轴缩放比例
     */
    scale(idx:number, x:number, y:number, z:number){
        this._mat_local[idx].scale([x, y, z])
    }

    /**
     * 重设后缩放指定骨骼
     * @param idx 骨骼索引
     * @param x X轴缩放比例
     * @param y Y轴缩放比例
     * @param z Z轴缩放比例
     */
    setScale(idx:number, x:number, y:number, z:number){
        this._mat_local[idx].copy(this._skeleton._origin_mat[idx])
        this._mat_local[idx].scale([x, y, z])
    }

    /**
     * 获取骨骼的世界变换数据，可直接传入shader
     */
    getTransformData(){
        return this._transform_data
    }
}

export class Skeleton {
    /** @internal */ _bones: Bone[]                  // 骨骼列表
    /** @internal */ _root_bones: Bone[]             // 根骨骼列表
    /** @internal */ _origin_mat: Matrix4[]          // 原始变换矩阵

    constructor(bone_decls: BondDeclaration[]) {
        this._bones = []
        this._root_bones = []
        this._origin_mat = []
        for (let i = 0; i < bone_decls.length; i++) {
            const bone = new Bone(i, bone_decls[i])
            this._bones.push(bone)
            this._origin_mat.push(new Matrix4(bone._decl.transform))
        }
        for (let i = 0; i < this._bones.length; i++) {
            const bone = this._bones[i]
            const decl = bone._decl
            if (decl.parent) {
                const parent = this._bones.find(b => b._decl.name == decl.parent)
                if (parent) {
                    bone._parent = parent
                    bone._next_sibling = parent._first_child
                    parent._first_child = bone
                }
            } else {
                this._root_bones.push(bone)
            }
        }
    }

    /**
     * 获取骨骼数量
     */
    get count() {
        return this._bones.length
    }

    /**
     * 获取骨骼对象
     * @pragma idx 骨骼索引
     */
    getBone(idx: number) {
        return this._bones[idx]
    }

    /**
     * 通过名字获取骨骼
     * @param name 骨骼名称
     * @returns 骨骼对象
     */
    getBoneByName(name: string) {
        return this._bones.find(b => b._decl.name == name)
    }

    /**
     * 通过名字获取骨骼索引
     * @param name 骨骼名称
     * @returns 骨骼索引
     */
    getBoneIndexByName(name: string) {
        const bone = this._bones.find(b => b._decl.name == name)
        return bone ? bone._idx : -1
    }

    /**
     * 访问骨骼
     * @param visitor 访问器
     */
    visit(visitor: (bone: Bone) => void) {
        for (let b of this._bones) {
            visitor(b)
        }
    }

    /**
     * 构造骨骼实例
     */
    createInstance(dev: RenderingDevice) {
        return new SkeletonInstance(this, dev)
    }
}
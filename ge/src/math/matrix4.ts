import {mat4} from 'gl-matrix'

declare type TypeVector3 = [number, number, number]|Float32Array
declare type TypeVector4 = [number, number, number, number]|Float32Array

export class Matrix4{

    data: Float32Array

    constructor(){
        this.data = new Float32Array(16)
        this.data[0] = 1
        this.data[5] = 1
        this.data[10] = 1
        this.data[15] = 1
    }

    /** 从 mat 中复制数据 */
    copyFrom(mat:Matrix4){
        mat4.copy(this.data, mat.data)
    }

    /** 设置为单位矩阵 */
    identity(){ mat4.identity(this.data) }

    /** 转置 */
    transpose(){ mat4.transpose(this.data, this.data) }

    /** 求src的转置矩阵 */
    transposeFrom(src: Matrix4){ mat4.transpose(this.data, src.data) }

    /** 求逆矩阵 */
    invert(){ mat4.invert(this.data, this.data) }

    /** 求src的逆矩阵 */
    invertFrom(src: Matrix4){ mat4.invert(this.data, this.data) }

    /** 构造透视投影矩阵 */
    perspective(fov:number, aspect:number, znear:number, zfar:number){
        mat4.perspective(this.data, fov, aspect, znear, zfar)
    }

    /** 构造正交投影矩阵 */
    ortho(left:number, right:number, bottom:number, top:number, near:number, far:number){
        mat4.ortho(this.data, left, right, bottom, top, near, far)
    }

    /** 构造摄影机矩阵 */
    lookAt(eye:TypeVector3, center:TypeVector3, up:TypeVector3){
        mat4.lookAt(this.data, eye, center, up)
    }

    /** 用 vec 平移当前矩阵 */
    translate(vec: TypeVector3){
        mat4.translate(this.data, this.data, vec)
    }

    /** 将当前矩阵围绕 axis 轴旋转 rad */
    rotate(rad:number, axis:TypeVector3){
        mat4.rotate(this.data, this.data, rad, axis)
    }

    // 将当前矩阵围绕 X 轴旋转 rad
    rotateX(rad:number){
        mat4.rotateX(this.data, this.data, rad)
    }

    // 将当前矩阵围绕 Y 轴旋转 rad
    rotateY(rad:number){
        mat4.rotateY(this.data, this.data, rad)
    }
    
    // 将当前矩阵围绕 Z 轴旋转 rad
    rotateZ(rad:number){
        mat4.rotateZ(this.data, this.data, rad)
    }

    // 使用 vec 缩放当前矩阵
    scale(vec:TypeVector3){
        mat4.scale(this.data, this.data, vec)
    }

    // 将当前矩阵乘以 mat
    multiply(mat:Matrix4){
        mat4.multiply(this.data, this.data, mat.data)
    }

    // 计算 a mul b
    multiplyFrom(a:Matrix4, b:Matrix4){
        mat4.multiply(this.data, a.data, b.data)
    }

    // 通过四元数构造矩阵
    fromQuat(quat:TypeVector4){
        mat4.fromQuat(this.data, quat)
    }

    // 构造平移矩阵
    fromTranslation(vec:TypeVector3){
        mat4.fromTranslation(this.data, vec)
    }

    // 构造缩放矩阵
    fromScaling(vec:TypeVector3){
        mat4.fromScaling(this.data, vec)
    }

    // 构造 X 轴旋转矩阵
    fromXRotation(rad:number){
        mat4.fromXRotation(this.data, rad)
    }

    // 构造 Y 轴旋转矩阵
    fromYRotation(rad:number){
        mat4.fromYRotation(this.data, rad)
    }

    // 构造 Z 轴旋转矩阵
    fromZRotation(rad:number){
        mat4.fromZRotation(this.data, rad)
    }

    // 构造围绕 axis 轴的旋转矩阵
    fromRotation(rad:number, axis:TypeVector3){
        mat4.fromRotation(this.data, rad, axis)
    }

    // 通过旋转、平移构造矩阵
    fromRotationTranslation(quat:TypeVector4, vec:TypeVector3){
        mat4.fromRotationTranslation(this.data, quat, vec)
    }

    // 通过旋转、平移、缩放构造矩阵
    fromRotationTranslationScale(quat:TypeVector4, vec:TypeVector3, scale:TypeVector3){
        mat4.fromRotationTranslationScale(this.data, quat, vec, scale)
    }

    // 通过旋转、平移、缩放、偏移构造矩阵
    fromRotationTranslationScaleOrigin(quat:TypeVector4, vec:TypeVector3, scale:TypeVector3, origin:TypeVector3){
        mat4.fromRotationTranslationScaleOrigin(this.data, quat, vec, scale, origin)
    }

}
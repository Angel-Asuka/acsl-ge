import { vec3 } from "gl-matrix"

export class Vector3{

    data: Float32Array

    constructor(vec:[number, number, number]|Float32Array){
        this.data = new Float32Array(vec)
    }

    set(x:number, y:number, z:number){
        this.data[0] = x
        this.data[1] = y
        this.data[2] = z
    }

    fromArray(arr:[number, number, number]|Float32Array){
        this.data[0] = arr[0]
        this.data[1] = arr[1]
        this.data[2] = arr[2]
    }

    toArray():[number, number, number]{
        return [this.data[0], this.data[1], this.data[2]]
    }

    add(vec:Vector3){
        vec3.add(this.data, this.data, vec.data)
    }

    sub(vec:Vector3){
        vec3.sub(this.data, this.data, vec.data)
    }

    mul(vec:Vector3){
        vec3.mul(this.data, this.data, vec.data)
    }

    div(vec:Vector3){
        vec3.div(this.data, this.data, vec.data)
    }

    scale(s:number){
        vec3.scale(this.data, this.data, s)
    }

    length(){
        return vec3.length(this.data)
    }

    normalize(){
        vec3.normalize(this.data, this.data)
    }

    dot(vec:Vector3){
        return vec3.dot(this.data, vec.data)
    }

    cross(vec:Vector3){
        vec3.cross(this.data, this.data, vec.data)
    }

    transformMat4(mat:Float32Array){
        vec3.transformMat4(this.data, this.data, mat)
    }

    transformQuat(quat:Float32Array){
        vec3.transformQuat(this.data, this.data, quat)
    }

    translate(x:number, y:number, z:number){
        const data = this.data
        data[0] += x
        data[1] += y
        data[2] += z
    }

    rotateX(rad:number){
        const data = this.data
        const y = data[1]
        const z = data[2]
        data[1] = y * Math.cos(rad) - z * Math.sin(rad)
        data[2] = y * Math.sin(rad) + z * Math.cos(rad)
    }

    rotateY(rad:number){
        const data = this.data
        const x = data[0]
        const z = data[2]
        data[0] = x * Math.cos(rad) + z * Math.sin(rad)
        data[2] = -x * Math.sin(rad) + z * Math.cos(rad)
    }

    rotateZ(rad:number){
        const data = this.data
        const x = data[0]
        const y = data[1]
        data[0] = x * Math.cos(rad) - y * Math.sin(rad)
        data[1] = x * Math.sin(rad) + y * Math.cos(rad)
    }

    scale3(x:number, y:number, z:number){
        const data = this.data
        data[0] *= x
        data[1] *= y
        data[2] *= z
    }
}
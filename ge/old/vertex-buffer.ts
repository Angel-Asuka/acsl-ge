import { RenderingDevice } from "./device.js"
import { RenderBuffer } from "./buffer.js"
import { Program } from "./program.js"

// 顶点属性数据类型
export enum VertexAttributeType {
    BYTE = WebGL2RenderingContext.BYTE,                         // 8 位整数
    UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,       // 8 位无符号整数 
    SHORT = WebGL2RenderingContext.SHORT,                       // 16 位整数
    UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,     // 16 位无符号整数
    INT = WebGL2RenderingContext.INT,                           // 32 位整数
    UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT,         // 32 位无符号整数
    FLOAT = WebGL2RenderingContext.FLOAT                        // 32 位浮点数
}

export const VertexAttributeTypeSize = {
    [VertexAttributeType.BYTE]: 1,
    [VertexAttributeType.UNSIGNED_BYTE]: 1,
    [VertexAttributeType.SHORT]: 2,
    [VertexAttributeType.UNSIGNED_SHORT]: 2,
    [VertexAttributeType.INT]: 4,
    [VertexAttributeType.UNSIGNED_INT]: 4,
    [VertexAttributeType.FLOAT]: 4
}

// 顶点属性对应的用途插槽
export enum VertexAttributeUsage {
    POSITION = 0,           // 顶点位置
    NORMAL = 1,             // 顶点法线
    TANGENT = 2,            // 顶点切线
    COLOR = 3,              // 顶点颜色
    TEXCOORD_0 = 4,         // 顶点纹理坐标 0
    TEXCOORD_1 = 5,         // 顶点纹理坐标 1
    TEXCOORD_2 = 6,         // 顶点纹理坐标 2
    TEXCOORD_3 = 7,         // 顶点纹理坐标 3
    TEXCOORD_4 = 8,         // 顶点纹理坐标 4
    TEXCOORD_5 = 9,         // 顶点纹理坐标 5
    TEXCOORD_6 = 10,        // 顶点纹理坐标 6
    TEXCOORD_7 = 11,        // 顶点纹理坐标 7
    JOINTS_0 = 12,          // 顶点关节索引 0
    WEIGHTS_0 = 13,         // 顶点关节权重 0
    JOINTS_1 = 14,          // 顶点关节索引 1
    WEIGHTS_1 = 15,         // 顶点关节权重 1
}

// 顶点属性
export type VertexAttribute = {
    usage: VertexAttributeUsage     // 顶点属性用途
    size: number                    // 顶点属性大小
    type: VertexAttributeType       // 顶点属性数据类型
    normalized: boolean             // 顶点属性是否归一化
    offset: number                  // 顶点属性偏移
}

export type VertexDataComponent = {
    usage: VertexAttributeUsage     // 用途
    buffer: ArrayBuffer             // 数据
    type: VertexAttributeType       // 数据类型
    size: number                    // 数据大小 (按照数据类型计算)
    normalized: boolean             // 是否归一化
}

/**
 * 渲染顶点缓冲对象，用于存储顶点数据。
 */
export class VertexBuffer extends RenderBuffer {
    /** @internal */ _stride: number                      // 顶点缓冲对象的步长
    /** @internal */ _attributes: VertexAttribute[]       // 顶点缓冲对象的属性

    constructor(device: RenderingDevice, data: ArrayBuffer, stride: number, attributes: VertexAttribute[]) {
        super(device, WebGL2RenderingContext.ARRAY_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW)
        this._stride = stride
        this._attributes = [...attributes]
    }

    // 获取顶点缓冲对象的步长
    get stride(): number { return this._stride }

    // 激活顶点缓冲对象
    activate(){
        const ctx = this._device._ctx
        const program = this._device._current_program
        if(program){
            ctx.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._buffer)
            for(const attr of this._attributes){
                const location = program._attribute_usage[attr.usage]
                if(location >= 0){
                    ctx.enableVertexAttribArray(location)
                    ctx.vertexAttribPointer(location, attr.size, attr.type, attr.normalized, this._stride, attr.offset)
                }
            }
        }
    }   

    // 静态方法，将不同的顶点数据合并在一起构造成一个套顶点缓冲数据
    // 输出的数据格式为：[顶点数据, 数据步长, 顶点属性表]
    static mergeComponents(components: VertexDataComponent[]): [ArrayBuffer, number, VertexAttribute[]] {
        const attributes: VertexAttribute[] = []
        let stride = 0
        let total_size = 0
        const vertex_count = components[0].buffer.byteLength / components[0].size / VertexAttributeTypeSize[components[0].type]
        for (const component of components) {
            attributes.push({
                usage: component.usage,
                size: component.size,
                type: component.type,
                normalized: component.normalized,
                offset: stride
            })
            if(component.buffer.byteLength / component.size / VertexAttributeTypeSize[component.type] !== vertex_count){
                throw new Error('Vertex data component size mismatch.')
            }
            stride += component.size * VertexAttributeTypeSize[component.type]
            total_size += component.buffer.byteLength
        }
        const data = new ArrayBuffer(total_size)
        const view = new Uint8Array(data)
        for (let i=0; i < components.length; i++) {
            const component = components[i]
            const attribute = attributes[i]
            const size = component.size * VertexAttributeTypeSize[component.type]
            const reader = new Uint8Array(component.buffer)
            for (let j=0; j < vertex_count; j++) {
                const k = j * size
                view.set(reader.subarray(k, k + size), j * stride + attribute.offset)
            }
        }
        return [data, stride, attributes]
    }
}
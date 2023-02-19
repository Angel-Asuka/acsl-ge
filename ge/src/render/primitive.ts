import { RenderingBuffer } from "./buffer.js";
import { RenderingCore } from "./core.js";
import { IMaterialData } from "./material/material.js";

export enum VertexAttributeUsage{
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

// always be ARRAY_BUFFER
declare type VertexAttribute = {
    usage: VertexAttributeUsage
    location: number
    byteOffset: number
    byteStride: number
    byteLength: number
    type: number
    size: number
    normalized: boolean
    buffer: RenderingBuffer
};

declare type Indices = {
    type: number,
    count: number,
    byteOffset: number,
    byteLength: number,
    buffer: RenderingBuffer,
}

class Primitive {

    /** @internal */ _core: RenderingCore;
    /** @internal */ _mode: number;
    /** @internal */ _attributes: VertexAttribute[];
    /** @internal */ _indices: Indices | null;
    /** @internal */ _vertex_buffers: Array<VertexAttribute[]> = [];
    /** @internal */ _material: IMaterialData;

    constructor(core:RenderingCore, mode: number, attributes: VertexAttribute[], indices: Indices | null, material: IMaterialData | null) {
        this._core = core;
        this._mode = mode;
        this._attributes = attributes;
        this._indices = indices ? indices : null;
        this._material = material ? material : core.standardMaterial.createData();
        for(let attr of this._attributes) {
            let append = false;
            attr.location = this._material.getProgram().getAttributeLocationByUsage(attr.usage);
            for(let a of this._vertex_buffers) {
                if(a[0].buffer === attr.buffer) {
                    a.push(attr)
                    append = true;
                    break
                }
            }
            if(!append) {
                this._vertex_buffers.push([attr])
            }
        }
    }

    draw() {
        const ctx = this._core._context;
        const attributes = this._attributes;
        const indices = this._indices;

        this._material.activate();

        for(let b of this._vertex_buffers) {
            ctx.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, b[0].buffer._buffer);
            for(let attr of b) {
                if(attr.location >= 0) {
                    ctx.enableVertexAttribArray(attr.location);
                    ctx.vertexAttribPointer(attr.location, attr.size, attr.type, attr.normalized, attr.byteStride, attr.byteOffset);
                }
            }
        }

        if (indices) {
            ctx.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices.buffer._buffer);
            ctx.drawElements(this._mode, indices.count, indices.type, indices.byteOffset);
        } else {
            ctx.drawArrays(this._mode, 0, attributes[0].byteLength / attributes[0].byteStride);
        }
    }
}

export { Indices, VertexAttribute, Primitive };
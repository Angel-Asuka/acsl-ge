import { RenderingDevice } from "./device.js";
import { Drawable } from "./drawable.js";
import { IndexBuffer } from "./index-buffer.js";
import { VertexAttributeType, VertexAttributeUsage, VertexBuffer, VertexAttribute} from "./vertex-buffer.js";

const thickness = 0.3;      // 线宽

// 标准几何体 - 三角形
export class StdTriangle extends Drawable {

    /** @internal */ _vertex_buffer: VertexBuffer

    constructor(device: RenderingDevice) {
        super(device)
        this._vertex_buffer = device.createVertexBuffer(new Float32Array([
            // 在这里按照逆时针顺序在(-1,-1,0)到(1,1,0)空间内定义三角形的顶点数据，依次是 位置、法向量、纹理坐标
            -1, -1, 0, 0, 0, 1, 0,   0,
             1, -1, 0, 0, 0, 1, 1,   0,
             0,  1, 0, 0, 0, 1, 0.5, 1
        ]).buffer, 32, [
            {usage: VertexAttributeUsage.POSITION,      size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 0},
            {usage: VertexAttributeUsage.NORMAL,        size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 12},
            {usage: VertexAttributeUsage.TEXCOORD_0,    size: 2, type: VertexAttributeType.FLOAT, normalized: false, offset: 24},
        ])
    }

    // 绘制
    draw() {
        this._vertex_buffer.activate()
        this._device.context.drawArrays(this._device.context.TRIANGLES, 0, 3)
    }
}

// 标准几何体 - 四边形
export class StdRectangle extends Drawable {

    /** @internal */ _vertex_buffer: VertexBuffer

    constructor(device: RenderingDevice) {
        super(device)
        this._vertex_buffer = device.createVertexBuffer(new Float32Array([
            // 在这里按照逆时针顺序在(-1,-1,0)到(1,1,0)空间内定义矩形的顶点数据，依次是 位置、法向量、纹理坐标
            -1, -1, 0, 0, 0, 1, 0,   0,
             1, -1, 0, 0, 0, 1, 1,   0,
             1,  1, 0, 0, 0, 1, 1,   1,
            -1,  1, 0, 0, 0, 1, 0,   1
        ]).buffer, 32, [
            {usage: VertexAttributeUsage.POSITION,      size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 0},
            {usage: VertexAttributeUsage.NORMAL,        size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 12},
            {usage: VertexAttributeUsage.TEXCOORD_0,    size: 2, type: VertexAttributeType.FLOAT, normalized: false, offset: 24},
        ])
    }

    // 绘制
    draw() {
        this._vertex_buffer.activate()
        this._device.context.drawArrays(this._device.context.TRIANGLE_FAN, 0, 4)
    }
}

// 标准网格模型
// 标准网格模型要求的顶点格式为： 位置(3)、法向量(3)、纹理坐标(2)
export class StdMesh extends Drawable {
    /** @internal */ _vertex_buffer: VertexBuffer | null = null
    /** @internal */ _index_buffer: IndexBuffer | null = null
    /** @internal */ _count: number = 0

    constructor(device: RenderingDevice) {
        super(device)
    }

    assemble(vertices: Float32Array,indices: Uint16Array) {
        this._vertex_buffer = this._device.createVertexBuffer(vertices.buffer, 32, [
            {usage: VertexAttributeUsage.POSITION,      size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 0},
            {usage: VertexAttributeUsage.NORMAL,        size: 3, type: VertexAttributeType.FLOAT, normalized: false, offset: 12},
            {usage: VertexAttributeUsage.TEXCOORD_0,    size: 2, type: VertexAttributeType.FLOAT, normalized: false, offset: 24},
        ])
        this._index_buffer = this._device.createIndexBuffer(indices.buffer)
        this._count = indices.length
    }

    // 绘制
    draw() {
        if(this._vertex_buffer && this._index_buffer) {
            this._vertex_buffer.activate()
            this._index_buffer.activate()
            this._device.context.drawElements(this._device.context.TRIANGLES, this._count, this._device.context.UNSIGNED_SHORT, 0)
        }
    }

    // 从OBJ文件中加载网格模型
    static async fromOBJ(device: RenderingDevice, text: string) {
        let mesh = new StdMesh(device)
        let lines = text.split("\r").join("").split("\n")
        let vertices: Float32Array = new Float32Array(lines.length * 3)
        let normals: Float32Array = new Float32Array(lines.length * 3)
        let texcoords: Float32Array = new Float32Array(lines.length * 2)
        let indices: Uint16Array = new Uint16Array(lines.length * 3)
        let vertex_count = 0
        let normal_count = 0
        let texcoord_count = 0
        let index_count = 0
        for (let line of lines) {
            let tokens = line.split(" ")
            if (tokens[0] == "v") {
                vertices[vertex_count * 3 + 0] = parseFloat(tokens[1])
                vertices[vertex_count * 3 + 1] = parseFloat(tokens[2])
                vertices[vertex_count * 3 + 2] = parseFloat(tokens[3])
                vertex_count++
            } else if (tokens[0] == "vn") {
                normals[normal_count * 3 + 0] = parseFloat(tokens[1])
                normals[normal_count * 3 + 1] = parseFloat(tokens[2])
                normals[normal_count * 3 + 2] = parseFloat(tokens[3])
                normal_count++
            } else if (tokens[0] == "vt") {
                texcoords[texcoord_count * 2 + 0] = parseFloat(tokens[1])
                texcoords[texcoord_count * 2 + 1] = parseFloat(tokens[2])
                texcoord_count++
            } else if (tokens[0] == "f") {
                let v1 = tokens[1].split("/")
                let v2 = tokens[2].split("/")
                let v3 = tokens[3].split("/")
                indices[index_count * 3 + 0] = parseInt(v1[0]) - 1
                indices[index_count * 3 + 1] = parseInt(v2[0]) - 1
                indices[index_count * 3 + 2] = parseInt(v3[0]) - 1
                index_count++
            }
        }
        mesh.assemble(vertices, indices)
        return mesh
    }
}

// 标准几何体 - 圆
export class StdCircle extends StdMesh {
    constructor(device: RenderingDevice, radius: number, segments: number = 16) {
        super(device)
        const vertices = new Float32Array((segments + 1) * 8)
        const indices = new Uint16Array(segments * 3)
        let index = 0
        for (let i = 0; i <= segments; i++) {
            const angle = i / segments * Math.PI * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            vertices[index++] = x
            vertices[index++] = 0
            vertices[index++] = z
            vertices[index++] = 0
            vertices[index++] = 1
            vertices[index++] = 0
            vertices[index++] = i / segments
            vertices[index++] = 0
        }
        index = 0
        for (let i = 0; i < segments; i++) {
            indices[index++] = 0
            indices[index++] = i + 1
            indices[index++] = i + 2
        }
        this.assemble(vertices, indices)
    }
}

// 标准几何体 - 立方体
export class StdCube extends StdMesh {
    constructor(device: RenderingDevice) {
        super(device)
        this.assemble(new Float32Array([
            // 在这里按照逆时针顺序在(-1,-1,-1)到(1,1,1)空间内定义立方体的顶点数据，依次是 位置、法向量、纹理坐标
            // Front
            -1, -1,  1,  0,  0,  1,  0,  0,
            1, -1,  1,  0,  0,  1,  1,  0,
            1,  1,  1,  0,  0,  1,  1,  1,
            -1,  1,  1,  0,  0,  1,  0,  1,
            // Back
            -1, -1, -1,  0,  0, -1,  1,  0,
            -1,  1, -1,  0,  0, -1,  1,  1,
            1, -1, -1,  0,  0, -1,  0,  0,
            1,  1, -1,  0,  0, -1,  0,  1,
            // Left
            -1, -1, -1, -1,  0,  0,  0,  0,
            -1,  1, -1, -1,  0,  0,  0,  1,
            -1,  1,  1, -1,  0,  0,  1,  1,
            -1, -1,  1, -1,  0,  0,  1,  0,
            // Right
            1, -1, -1,  1,  0,  0,  1,  0,
            1,  1, -1,  1,  0,  0,  1,  1,
            1,  1,  1,  1,  0,  0,  0,  1,
            1, -1,  1,  1,  0,  0,  0,  0,
            // Top  
            -1,  1, -1,  0,  1,  0,  0,  1,
            -1,  1,  1,  0,  1,  0,  0,  0,
            1,  1,  1,  0,  1,  0,  1,  0,
            1,  1, -1,  0,  1,  0,  1,  1,
            // Bottom
            -1, -1, -1,  0, -1,  0,  1,  1,
            1, -1, -1,  0, -1,  0,  0,  1,
            1, -1,  1,  0, -1,  0,  0,  0,
            -1, -1,  1,  0, -1,  0,  1,  0,
        ]), new Uint16Array([
            // 在这里按照逆时针顺序定义立方体的三角形索引
            0,  1,  2,  0,  2,  3,    // Front
            4,  5,  6,  5,  6,  7,    // Back
            8,  9,  10, 8,  10, 11,   // Left
            12, 13, 14, 12, 14, 15,   // Right
            16, 17, 18, 16, 18, 19,   // Top
            20, 21, 22, 20, 22, 23,   // Bottom
        ]))
    }
}

// 标准几何体 - 圆柱体
export class StdCylinder extends StdMesh {
    constructor(device: RenderingDevice, radius: number, height: number, segments: number = 16) {
        super(device)
        const vertices = new Float32Array((segments + 1) * 16)
        const indices = new Uint16Array(segments * 6)
        let index = 0
        for (let i = 0; i <= segments; i++) {
            const angle = i / segments * Math.PI * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            vertices[index++] = x                   // 位置 X
            vertices[index++] = -height / 2         // 位置 Y
            vertices[index++] = z                   // 位置 Z
            vertices[index++] = 0                   // 法向量 X
            vertices[index++] = -1                  // 法向量 Y
            vertices[index++] = 0                   // 法向量 Z
            vertices[index++] = i / segments        // 纹理坐标 U
            vertices[index++] = 0                   // 纹理坐标 V
            vertices[index++] = x                   // 位置 X 
            vertices[index++] = height / 2          // 位置 Y
            vertices[index++] = z                   // 位置 Z
            vertices[index++] = 0                   // 法向量 X
            vertices[index++] = 1                   // 法向量 Y
            vertices[index++] = 0                   // 法向量 Z
            vertices[index++] = i / segments        // 纹理坐标 U
            vertices[index++] = 1                   // 纹理坐标 V
        }
        index = 0
        for (let i = 0; i < segments; i++) {
            indices[index++] = i * 2
            indices[index++] = i * 2 + 1
            indices[index++] = i * 2 + 2
            indices[index++] = i * 2 + 1
            indices[index++] = i * 2 + 3
            indices[index++] = i * 2 + 2
        }
        this.assemble(vertices, indices)
    }
}

// 标准几何体 - 圆锥体
export class StdCone extends StdMesh {
    constructor(device: RenderingDevice, radius: number, height: number, segments: number = 16) {
        super(device)
        const vertices = new Float32Array((segments + 1) * 16)
        const indices = new Uint16Array(segments * 6)
        let index = 0
        for (let i = 0; i <= segments; i++) {
            const angle = i / segments * Math.PI * 2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            vertices[index++] = x
            vertices[index++] = -height / 2
            vertices[index++] = z
            vertices[index++] = 0
            vertices[index++] = -1
            vertices[index++] = 0
            vertices[index++] = i / segments
            vertices[index++] = 0
            vertices[index++] = 0
            vertices[index++] = height / 2
            vertices[index++] = 0
            vertices[index++] = 0
            vertices[index++] = 1
            vertices[index++] = 0
            vertices[index++] = 0.5
            vertices[index++] = 1
        }
        index = 0
        for (let i = 0; i < segments; i++) {
            indices[index++] = i * 2
            indices[index++] = i * 2 + 1
            indices[index++] = i * 2 + 2
            indices[index++] = i * 2 + 1
            indices[index++] = i * 2 + 3
            indices[index++] = i * 2 + 2
        }
        this.assemble(vertices, indices)
    }
}

// 标准几何体 - 球体
export class StdSphere extends StdMesh {
    constructor(device: RenderingDevice, radius: number, segments: number = 16) {
        super(device)
        const vertices = new Float32Array((segments + 1) * (segments + 1) * 8)
        const indices = new Uint16Array(segments * segments * 6)
        let index = 0
        for (let i = 0; i <= segments; i++) {
            const angle = i / segments * Math.PI
            const y = Math.cos(angle) * radius
            const r = Math.sin(angle) * radius
            for (let j = 0; j <= segments; j++) {
                const angle = j / segments * Math.PI * 2
                const x = Math.cos(angle) * r
                const z = Math.sin(angle) * r
                vertices[index++] = x
                vertices[index++] = y
                vertices[index++] = z
                vertices[index++] = x
                vertices[index++] = y
                vertices[index++] = z
                vertices[index++] = j / segments
                vertices[index++] = i / segments
            }
        }
        index = 0
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                indices[index++] = i * (segments + 1) + j
                indices[index++] = i * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j
                indices[index++] = i * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j
            }
        }
        this.assemble(vertices, indices)
    }
}

// 标准几何体 - 平面
export class StdPlane extends StdMesh {
    constructor(device: RenderingDevice, width: number, height: number, segments: number = 16) {
        super(device)
        const vertices = new Float32Array((segments + 1) * (segments + 1) * 8)
        const indices = new Uint16Array(segments * segments * 6)
        let index = 0
        for (let i = 0; i <= segments; i++) {
            const x = i / segments * width
            for (let j = 0; j <= segments; j++) {
                const y = j / segments * height
                vertices[index++] = x
                vertices[index++] = y
                vertices[index++] = 0
                vertices[index++] = 0
                vertices[index++] = 0
                vertices[index++] = 1
                vertices[index++] = i / segments
                vertices[index++] = j / segments
            }
        }
        index = 0
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                indices[index++] = i * (segments + 1) + j
                indices[index++] = i * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j
                indices[index++] = i * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j + 1
                indices[index++] = (i + 1) * (segments + 1) + j
            }
        }
        this.assemble(vertices, indices)
    }
}
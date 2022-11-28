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
    static fromOBJ(device: RenderingDevice, text: string) {
        let mesh = new StdMesh(device)

        // 下面的代码参考自 https://github.com/KhronosGroup/WebGL/blob/main/sdk/demos/webkit/resources/J3DI.js
        // ---------------------------- begin of code from J3DI.js -----------------------------------
        // Copyright (C) 2009 Apple Inc. All Rights Reserved.

        const vertexArray = [ ] as any;
        const normalArray = [ ] as any;
        const textureArray = [ ] as any;
        const indexArray = [ ] as any;

        var vertex = [ ] as any;
        var normal = [ ] as any;
        var texture = [ ] as any;
        var facemap = { } as any;
        var index = 0;

        // This is a map which associates a range of indices with a name
        // The name comes from the 'g' tag (of the form "g NAME"). Indices
        // are part of one group until another 'g' tag is seen. If any indices
        // come before a 'g' tag, it is given the group name "_unnamed"
        // 'group' is an object whose property names are the group name and
        // whose value is a 2 element array with [<first index>, <num indices>]
        var groups = { } as any;
        var currentGroup = [-1, 0];
        groups["_unnamed"] = currentGroup;

        var lines = text.split("\n");
        for (var lineIndex in lines) {
            var line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");

            // ignore comments
            if (line[0] == "#")
                continue;

            var array = line.split(" ");
            if (array[0] == "g") {
                // new group
                currentGroup = [indexArray.length, 0];
                groups[array[1]] = currentGroup;
            }
            else if (array[0] == "v") {
                // vertex
                vertex.push(parseFloat(array[1]));
                vertex.push(parseFloat(array[2]));
                vertex.push(parseFloat(array[3]));
            }
            else if (array[0] == "vt") {
                // normal
                texture.push(parseFloat(array[1]));
                texture.push(parseFloat(array[2]));
            }
            else if (array[0] == "vn") {
                // normal
                normal.push(parseFloat(array[1]));
                normal.push(parseFloat(array[2]));
                normal.push(parseFloat(array[3]));
            }
            else if (array[0] == "f") {
                // face
                if (array.length != 4) {
                    console.log("*** Error: face '"+line+"' not handled");
                    continue;
                }

                for (var i = 1; i < 4; ++i) {
                    if (!(array[i] in facemap)) {
                        // add a new entry to the map and arrays
                        var f = array[i].split("/");
                        var vtx, nor, tex;

                        if (f.length == 1) {
                            vtx = parseInt(f[0]) - 1;
                            nor = vtx;
                            tex = vtx;
                        }
                        else if (f.length = 3) {
                            vtx = parseInt(f[0]) - 1;
                            tex = parseInt(f[1]) - 1;
                            nor = parseInt(f[2]) - 1;
                        }
                        else {
                            console.log("*** Error: did not understand face '"+array[i]+"'");
                            return mesh;
                        }

                        // do the vertices
                        var x = 0;
                        var y = 0;
                        var z = 0;
                        if (vtx * 3 + 2 < vertex.length) {
                            x = vertex[vtx*3];
                            y = vertex[vtx*3+1];
                            z = vertex[vtx*3+2];
                        }
                        vertexArray.push(x);
                        vertexArray.push(y);
                        vertexArray.push(z);

                        // do the textures
                        x = 0;
                        y = 0;
                        if (tex * 2 + 1 < texture.length) {
                            x = texture[tex*2];
                            y = texture[tex*2+1];
                        }
                        textureArray.push(x);
                        textureArray.push(y);

                        // do the normals
                        x = 0;
                        y = 0;
                        z = 1;
                        if (nor * 3 + 2 < normal.length) {
                            x = normal[nor*3];
                            y = normal[nor*3+1];
                            z = normal[nor*3+2];
                        }
                        normalArray.push(x);
                        normalArray.push(y);
                        normalArray.push(z);

                        facemap[array[i]] = index++;
                    }

                    indexArray.push(facemap[array[i]]);
                    currentGroup[1]++;
                }
            }
        }
        // ---------------------------- end of code from J3DI.js ----------------------------
        // 上面的代码参考自 https://github.com/KhronosGroup/WebGL/blob/main/sdk/demos/webkit/resources/J3DI.js
        

        // create the final arrays
        if(vertexArray.length == normalArray.length && vertexArray.length / 3 == textureArray.length / 2) {
            const vertex_count = vertexArray.length / 3
            const vertex_buffer = new Float32Array(vertex_count * 8)
            for(let i = 0; i < vertex_count; ++i){
                vertex_buffer[i * 8 + 0] = vertexArray[i * 3 + 0]
                vertex_buffer[i * 8 + 1] = vertexArray[i * 3 + 1]
                vertex_buffer[i * 8 + 2] = vertexArray[i * 3 + 2]
                vertex_buffer[i * 8 + 3] = normalArray[i * 3 + 0]
                vertex_buffer[i * 8 + 4] = normalArray[i * 3 + 1]
                vertex_buffer[i * 8 + 5] = normalArray[i * 3 + 2]
                vertex_buffer[i * 8 + 6] = textureArray[i * 2 + 0]
                vertex_buffer[i * 8 + 7] = textureArray[i * 2 + 1]
            }
            mesh.assemble(vertex_buffer, new Uint16Array(indexArray))
        }else
            console.log('Vertex count mismatch')
        
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
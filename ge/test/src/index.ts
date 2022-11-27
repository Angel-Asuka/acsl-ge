import './index.css'
import './thor.jpg'

import {Core, RenderDevice, Program, Matrix4} from '../../dist'
import { VertexAttributeUsage, VertexAttributeType, VertexBuffer } from '../../dist/render/vertex-buffer'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.appendChild(canvas)

const g = RenderDevice.fromCanvas(canvas)
if(g){
    const c = new Core(g)

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec2 aTexCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        vTexCoord = aTexCoord;
    }`

    const fsSource = `
    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = vColor * 0.2 + texture2D(uSampler, vTexCoord);
    }`

    const p = g.createProgram(vsSource, fsSource, {
        aVertexPosition: VertexAttributeUsage.POSITION,
        aVertexColor: VertexAttributeUsage.COLOR,
        aTexCoord: VertexAttributeUsage.TEXCOORD_0
    })

    const vertex_position = p.getAttributeLocation('aVertexPosition')
    const color_position = p.getAttributeLocation('aVertexColor')
    const uv_position = p.getAttributeLocation('aTexCoord')
    const p_matrix = p.getUniformLocation('uProjectionMatrix')
    const mv_matrix = p.getUniformLocation('uModelViewMatrix')

    const gl = g.context

    const positions = [
        // Front face
        -1.0, -1.0,  1.0, 
        1.0, -1.0,  1.0, 
        1.0,  1.0,  1.0, 
        -1.0,  1.0,  1.0, 

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ]

    const colors_src = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ]
    const colors = [] as number[]
    for (let j=0; j<6; j++) {
        let c = colors_src[j];
        for (var i=0; i<4; i++) {
            colors.push(...c);
        }
    }

    const uv = [  // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Back
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Top
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Bottom
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Right
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Left
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ]

    const cubeIndices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ]

    const vertex_data = VertexBuffer.mergeComponents([
        {usage: VertexAttributeUsage.POSITION, buffer:new Float32Array(positions).buffer, type: VertexAttributeType.FLOAT, size: 3, normalized: false},
        {usage: VertexAttributeUsage.COLOR, buffer:new Float32Array(colors).buffer, type: VertexAttributeType.FLOAT, size: 4, normalized: false},
        {usage: VertexAttributeUsage.TEXCOORD_0, buffer:new Float32Array(uv).buffer, type: VertexAttributeType.FLOAT, size: 2, normalized: false}
    ])

    const vertex_buffer = g.createVertexBuffer(...vertex_data)
    const index_buffer = g.createIndexBuffer(new Uint16Array(cubeIndices).buffer)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise(r=>{img.onload = r; img.src = './thor.jpg'})

    const texture = g.createTextureFromImage(img)

    const mat_proj = new Matrix4()
    mat_proj.perspective(45 * Math.PI / 180, 640/ 480, 0.1, 100)
    console.log(mat_proj)

    const mat_mv = new Matrix4()
    mat_mv.translate([0, 0, -6])
    console.log(mat_mv)

    const ts0 = Date.now()

    c.onFrame = ()=>{

        const dt = Date.now() - ts0
        
        mat_mv.identity()
        mat_mv.translate([0, 0, -6])
        mat_mv.rotate( Math.PI * (dt % 20000)/10000.0, [0,1,0.3] )


        gl.clearColor(0.3, 0, 0, 1)
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        p.activate()

        texture.bind(0)
        vertex_buffer.activate()
        index_buffer.activate()
        
        
        gl.uniformMatrix4fv(p_matrix, false, mat_proj.data)
        gl.uniformMatrix4fv(mv_matrix, false, mat_mv.data)

        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    }
    c.activate()
}
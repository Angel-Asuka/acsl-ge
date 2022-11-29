import './index.css'
import './thor.jpg'
import './teapot.obj'

import * as Ge from '../../dist'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.appendChild(canvas)

const mat1 = new Ge.Matrix4()
mat1.scale([0.5, 0.5, 1])
mat1.translate([0.2,0.3,0])
console.log(mat1)

const g = Ge.RenderingDevice.fromCanvas(canvas)
if(g){
    const c = new Ge.Core(g)

    //#region RES
    const objTeapot=``
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
    //#endregion

    const p = g.createProgram(vsSource, fsSource, {
        aVertexPosition: Ge.VertexAttributeUsage.POSITION,
        aVertexColor: Ge.VertexAttributeUsage.COLOR,
        aTexCoord: Ge.VertexAttributeUsage.TEXCOORD_0
    })


    const p_matrix = p.getUniformLocation('uProjectionMatrix')
    const mv_matrix = p.getUniformLocation('uModelViewMatrix')

    const gl = g.context

    //#region RES
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

    //#endregion

    const vertex_data = Ge.VertexBuffer.mergeComponents([
        {usage: Ge.VertexAttributeUsage.POSITION, buffer:new Float32Array(positions).buffer, type: Ge.VertexAttributeType.FLOAT, size: 3, normalized: false},
        {usage: Ge.VertexAttributeUsage.COLOR, buffer:new Float32Array(colors).buffer, type: Ge.VertexAttributeType.FLOAT, size: 4, normalized: false},
        {usage: Ge.VertexAttributeUsage.TEXCOORD_0, buffer:new Float32Array(uv).buffer, type: Ge.VertexAttributeType.FLOAT, size: 2, normalized: false}
    ])

    const vertex_buffer = g.createVertexBuffer(...vertex_data)
    const index_buffer = g.createIndexBuffer(new Uint16Array(cubeIndices).buffer)

    console.log(vertex_data)
    

    console.log('createing res')
    const res = new Ge.ResourceManager([
        {name: 'texture', type: Ge.ResourceType.Image, uri: './thor.jpg'},
        {name: 'test', type:Ge.ResourceType.Image, uri: '../test/test_tex.png'}
    ])

    res.onComplete = () => {console.log('Complete')}
    res.onError = (idx:number, res:Ge.Resource) => {console.log('Error', idx, res); return 'ignore'}
    res.onProgress = (pg:number, total:number) => {console.log('Progress', pg, total)}

    console.log('befor --- load')
    res.load()
    console.log('after --- load')
    await res.wait()
    console.log('load --- finished')


    const txdata:string = await (await fetch('./test/test_tex.json')).text()

    const tx = Ge.Utils.Dragonbone.loadSlice(g, txdata, (res.indexOf(1) as Ge.ImageResource).getTexture(g))

    console.log(tx)

    const r = await fetch('./teapot.obj')
    const teapot = await r.text()
    const teapot_obj = g.createMeshFromOBJ(teapot)

    const mat_proj = new Ge.Matrix4()
    const mat_view = new Ge.Matrix4()
    mat_proj.perspective(45 * Math.PI / 180, 640/ 480, 0.1, 100)
    mat_view.lookAt([0, 2, 3], [0, 0, 0], [0, 1, 0])
    mat_proj.multiply(mat_view)

    const mat_mv = new Ge.Matrix4()
    mat_mv.translate([0, 0, -6])
    console.log(mat_mv)

    const ts0 = Date.now()

    c.onFrame = ()=>{

        const dt = Date.now() - ts0
        
        mat_mv.identity()
        //mat_mv.translate([0, 0, -6])
        mat_mv.rotate( Math.PI * (dt % 20000)/10000.0, [0,1,0] )


        gl.clearColor(0.3, 0, 0, 1)
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        //p.activate()

        g.stdProgramSlice.activate()

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        tx!.texture.bind(0)
        mat_proj.identity() 
        mat_proj.from2D(10, 10, 200, 100, 640, 480)
        g.stdProgramSlice.setUniformByName('mf', tx!.getSliceMatrix(0))
        g.stdProgramSlice.setUniformByName('mw', mat_proj.data)
        
        g.stdPlane.draw()

        //vertex_buffer.activate()
        //index_buffer.activate()

        
        
        //gl.uniformMatrix4fv(p_matrix, false, mat_proj.data)
        //gl.uniformMatrix4fv(mv_matrix, false, mat_mv.data)

        //teapot_obj.draw()
        //g.stdCone.draw()




        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        //gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    }
    c.activate()
}
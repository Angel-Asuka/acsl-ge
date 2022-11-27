import './index.css'

import {Core, Render, Program, Matrix4} from '../../dist'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.appendChild(canvas)

const g = Render.fromCanvas(canvas)
if(g){
    const c = new Core(g)

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }`

    const fsSource = `
    varying lowp vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }`

    const p = g.createProgram(vsSource, fsSource) as Program
    const vertex_position = p.getAttribLocation('aVertexPosition')
    const color_position = p.getAttribLocation('aVertexColor')
    const p_matrix = p.getUniformLocation('uProjectionMatrix')
    const mv_matrix = p.getUniformLocation('uModelViewMatrix')
    const gl = g.context

    const pos_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer)
    const positions = [
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const color_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
    const colors = [
        1, 1, 1, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)


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
        mat_mv.rotate( Math.PI * (dt % 2000)/1000.0, [0,0,1] )


        gl.clearColor(0.3, 0, 0, 1)
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer)
        gl.vertexAttribPointer(vertex_position, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertex_position)

        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
        gl.vertexAttribPointer(color_position, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(color_position)

        p.activate()
        
        gl.uniformMatrix4fv(p_matrix, false, mat_proj.data)
        gl.uniformMatrix4fv(mv_matrix, false, mat_mv.data)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    }
    c.activate()
}